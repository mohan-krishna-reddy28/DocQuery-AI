import express from "express";
import upload from "../config/multer.js";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import Document from "../models/Documents.js";
import File from "../models/File.js";
import Chat from "../models/Chat.js";

import XLSX from "xlsx";
import mammoth from "mammoth";
import { parse as csvParse } from "csv-parse/sync";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const router = express.Router();

/* ================= AI LAZY LOAD (ADDED – REQUIRED) ================= */
let embeddings = null;
let llm = null;

async function getAI() {
  if (!embeddings || !llm) {
    const { HuggingFaceInferenceEmbeddings } =
      await import("@langchain/community/embeddings/hf");
    const { ChatGroq } = await import("@langchain/groq");

    embeddings = new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
    });

    llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });
  }

  return { embeddings, llm };
}

/* ---------- UPLOAD ---------- */
router.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { embeddings } = await getAI();

    const userId = "demo-user";
    const savedFiles = [];

    for (const file of req.files) {
      const savedFile = await File.create({
        userId,
        originalName: file.originalname,
        storedName: file.filename,
        filePath: file.path,
      });

      savedFiles.push(savedFile);

      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();
      let text = "";

      if (ext === ".pdf") {
        const buffer = fs.readFileSync(filePath);
        const data = await pdf(buffer);
        text = data.text;
      } else if (ext === ".txt") {
        text = fs.readFileSync(filePath, "utf-8");
      } else if (ext === ".json") {
        const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        text = JSON.stringify(json, null, 2);
      } else if (ext === ".csv") {
        const csv = fs.readFileSync(filePath, "utf-8");
        const records = csvParse(csv, { columns: true });
        text = records.map((row) => JSON.stringify(row)).join("\n");
      } else if (ext === ".xlsx") {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        text = XLSX.utils.sheet_to_csv(sheet);
      } else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else {
        return res.status(400).json({
          message:
            "Unsupported file type. Allowed types: PDF, TXT, JSON, CSV, XLSX, DOCX",
        });
      }

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const documents = await splitter.createDocuments([text]);

      for (const doc of documents) {
        const embedding = await embeddings.embedQuery(doc.pageContent);

        await Document.create({
          userId,
          fileId: savedFile._id,
          chunkText: doc.pageContent,
          embedding,
        });
      }
    }

    res.status(200).json({
      message: "All files uploaded and processed successfully",
      totalFiles: savedFiles.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

/* ---------- FETCH FILES ---------- */
router.get("/files", async (req, res) => {
  try {
    const userId = "demo-user";
    const files = await File.find({ userId }).select(
      "_id originalName createdAt"
    );
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

/* ---------- QUERY ---------- */
router.post("/query", async (req, res) => {
  try {
    const { question, fileId } = req.body;

    if (!question || !fileId) {
      return res.status(400).json({
        message: "Both question and fileId are required",
      });
    }

    const { embeddings, llm } = await getAI();
    const fileObjectId = new mongoose.Types.ObjectId(fileId);
    const userId = "demo-user";

    await Chat.create({
      userId,
      fileId,
      role: "user",
      content: question,
    });

    const queryVector = await embeddings.embedQuery(question);

    const results = await Document.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 200,
          limit: 5,
          filter: { fileId: fileObjectId },
        },
      },
    ]);

    if (!results || results.length === 0) {
      const fallback = "I don't know based on the provided document.";

      await Chat.create({
        userId,
        fileId,
        role: "ai",
        isFound: false,
        content: fallback,
      });

      return res.json({ found: false, answer: fallback });
    }

    const context = results
      .map((doc, i) => `Chunk ${i + 1}:\n${doc.chunkText}`)
      .join("\n\n");

    const prompt = `
You are a strict Retrieval-Augmented Generation (RAG) assistant.

RULES:
- Answer using ONLY the information in the CONTEXT.
- You may paraphrase or summarize.
- If the context partially answers the question, respond with the closest possible answer.
- If completely unrelated, say:
  "I don't know based on the provided document."

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
`;

    const response = await llm.invoke(prompt);
    const aiAnswer = response.content;

    const isFallback = aiAnswer
      .toLowerCase()
      .includes("i don't know based on the provided document");

    await Chat.create({
      userId,
      fileId,
      role: "ai",
      isFound: !isFallback,
      content: aiAnswer,
    });

    res.json({
      found: !isFallback,
      question,
      answer: aiAnswer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "RAG query failed",
      error: err.message,
    });
  }
});

/* ---------- LOAD CHAT ---------- */
router.get("/chat/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = "demo-user";

    const chats = await Chat.find({ userId, fileId })
      .sort({ createdAt: 1 })
      .select("role content isFound");

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to load chat",
      error: err.message,
    });
  }
});

export default router;

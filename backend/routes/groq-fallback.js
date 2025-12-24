import express from "express";
import dotenv from "dotenv";
import Chat from "../models/Chat.js";
import { ChatGroq } from "@langchain/groq";

dotenv.config();
const router = express.Router();

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
});

router.post("/groq-fallback", async (req, res) => {
  try {
    const { question, fileId } = req.body;

    if (!question || !fileId) {
      return res.status(400).json({
        answer: "Question and fileId are required",
        saved: false,
      });
    }

    const userId = "demo-user";

    const prompt = `
You are a helpful AI assistant.

Answer the question using your general knowledge.
Do NOT mention any document or file.
Keep the answer clear and concise.

QUESTION:
${question}

ANSWER:
`;

    const response = await llm.invoke(prompt);
    const answer = response?.content;

    if (!answer) {
      return res.json({
        answer: "No response from AI.",
        saved: false,
      });
    }

    // ✅ SAVE ONLY REAL ANSWERS
    await Chat.create({
      userId,
      fileId,
      role: "ai",
      isFound: true,
      content: answer,
    });

    res.json({
      answer,
      saved: true,
    });
  } catch (err) {
    console.error("Groq fallback error:", err);
    res.status(500).json({
      answer: "Groq AI error occurred.",
      saved: false,
    });
  }
});

export default router;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import groqAI from "./routes/groq-fallback.js";

import fs from "fs";
import path from "path"; // optional but recommended


import User from "./models/User.js";
import File from "./models/File.js";
import Chat from "./models/Chat.js";
import Document from "./models/Documents.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.delete("/files/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find file first
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 2️⃣ Delete physical file from uploads folder
    const filePath = file.filePath; // stored during upload

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3️⃣ Delete DB records
    await File.findByIdAndDelete(id);
    await Chat.deleteMany({ fileId: id });
    await Document.deleteMany({ fileId: id }); // ✅ VERY IMPORTANT

    res.json({ message: "File, chats, and uploads deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ================= EXISTING ROUTES ================= */
app.use("/", chatRoutes);
app.use("/", groqAI);

app.get("/", (req, res) => {
  res.status(200).send("✅ DocQuery-AI backend is running");
});


/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

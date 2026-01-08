# 📄 DocQuery AI – RAG-Based Document Question Answering System

DocQuery AI is a **Retrieval-Augmented Generation (RAG)** based web application that allows users to upload documents and ask questions based on their content.  
The system retrieves relevant information from uploaded documents and generates accurate answers using **Groq LLM**, with an **AI fallback mechanism** when answers are not found in the documents.

---

## 🚀 Features

- 🔐 User Authentication (JWT-based)
- 📂 Upload documents (PDF, TXT, CSV, JSON, XLSX, DOCX)
- 🔎 Ask questions based on uploaded documents
- 🧠 Retrieval-Augmented Generation (RAG)
- 🤖 AI Fallback when answer is not found in documents
- ⚡ Ultra-fast inference using Groq LLM
- ☁️ Cloud-deployed backend (Render)
- 📊 MongoDB Atlas Vector Search

---

## 🏗️ System Architecture (High Level)

1. User uploads a document
2. Backend extracts and chunks document text
3. Chunks are converted into embeddings
4. Embeddings are stored in MongoDB Atlas (Vector Search)
5. User asks a question
6. Vector search retrieves relevant context
7. Context + question sent to Groq LLM
8. If no context found → AI fallback is triggered
9. Final answer returned to the user

---

## 🧠 AI Fallback Mechanism

If the system does not find relevant information in the uploaded documents:
- It **automatically falls back to a general AI response**
- Uses the **same Groq LLM**
- Ensures the user always receives a meaningful answer

This makes the system **robust and production-ready**.

---

## ☁️ Deployment Details

### Backend
- **Platform:** Render (Free Tier)
- **Tech:** Node.js, Express
- **Database:** MongoDB Atlas (Vector Search)
- **LLM:** Groq (API-based)

### Frontend
- **Tech:** React.js
- **Hosting:** Netlify / Local development

---

## ⏳ Important Note About Render Free Tier (Sleep Behavior)

This project is deployed on **Render Free Web Service**.

### ⚠️ Server Sleep Behavior
- The backend **automatically goes to sleep after inactivity**
- First request after sleep may take **30–50 seconds**
- This is expected behavior on the free tier

### ✅ After Wake-Up
- API responses are fast
- Groq inference remains ultra-fast
- No data loss (MongoDB persists data)

> If the app feels slow on the first request, please wait a few seconds and try again.

---

## 📂 Uploads Folder Note

- The `uploads/` directory is **intentionally excluded from Git**
- Uploaded files are stored **temporarily** on the server
- After processing, document content is stored as embeddings in MongoDB
- The system does **not depend on permanent file storage**

This design makes the application **cloud-friendly and scalable**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | React.js |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Vector Search | MongoDB Atlas Vector Search |
| LLM | Groq |
| Hosting | Render (Backend), Netlify (Frontend) |

---


## 📄 License

This project is created for **learning, interviews, and academic purposes**.

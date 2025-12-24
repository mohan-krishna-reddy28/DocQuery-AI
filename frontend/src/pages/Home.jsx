import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { MdDeleteOutline } from "react-icons/md";
import { FaUserTie, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import ConfirmModal from "../components/ConfirmModal";
import Notification from "../components/Notification";

import "./styles.css";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [question, setQuestion] = useState("");
  const [chatMap, setChatMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [showAskAI, setShowAskAI] = useState(false);

  const [noFilesMsg, setNoFilesMsg] = useState(false);
  const [noChatMsg, setNoChatMsg] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const API = "https://docquery-ai-y2p9.onrender.com";

  /* ---------------- AUTH + FILES ---------------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    setIsLoggedIn(true);
    fetchFiles();
  }, []);
  useEffect(() => {
    document.title = "Home | DocQuery AI";
  }, []);

  /* ---------------- CURRENT CHAT ---------------- */
  const currentMessages = selectedFile ? chatMap[selectedFile._id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, loading]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    showNotification("Logged out successfully", "info");
    navigate("/login", { replace: true });
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const res = await fetch(`${API}/files/${fileToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json(); // ✅ FIX

      setFiles((prev) => prev.filter((f) => f._id !== fileToDelete._id));

      if (selectedFile?._id === fileToDelete._id) {
        setSelectedFile(null);
      }

      setFileToDelete(null);
      showNotification(data.message || "File deleted", "danger");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete file", "danger");
    }
  };

  /* ---------------- FETCH FILES ---------------- */
  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
      setNoFilesMsg(!data || data.length === 0);
    } catch {
      setFiles([]);
      setNoFilesMsg(true);
    }
  };

  /* ---------------- FETCH CHAT BY FILE ---------------- */
  const fetchChatsForFile = async (file, force = false) => {
    setSelectedFile(file);

    if (!force && chatMap[file._id]) {
      setNoChatMsg(chatMap[file._id].length === 0);
      return;
    }

    const res = await fetch(`${API}/chat/${file._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const formatted = data.map((c) => ({
      role: c.role,
      text: c.content,
      isFound: c.isFound,
    }));

    setChatMap((prev) => ({
      ...prev,
      [file._id]: formatted,
    }));

    setNoChatMsg(formatted.length === 0);
  };

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFilesUpload = (files) => {
    if (!files.length) return;

    const formData = new FormData();
    [...files].forEach((f) => formData.append("files", f));

    setUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      setUploadProgress(0);
      if (xhr.status === 200) {
        fetchFiles();
        showNotification("File uploaded successfully", "success");
      } else {
        showNotification(
          "Unsupported file type. Allowed types: PDF, TXT, JSON, CSV, XLSX, DOCX",
          "warning"
        );
      }
    };

    xhr.onerror = () => setUploading(false);

    xhr.send(formData);
  };

  /* ---------------- TYPEWRITER EFFECT ---------------- */
  const typeWriterEffect = (fileId, text = "") => {
    if (!text) {
      setLoading(false);
      return;
    }

    let i = 0;
    setNoChatMsg(false);

    setChatMap((prev) => ({
      ...prev,
      [fileId]: [
        ...(prev[fileId] || []),
        { role: "ai", text: "", isFound: true },
      ],
    }));

    const interval = setInterval(() => {
      setChatMap((prev) => {
        const msgs = [...prev[fileId]];
        msgs[msgs.length - 1].text = text.slice(0, i + 1);
        return { ...prev, [fileId]: msgs };
      });

      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 20);
  };

  const askGroqFallback = async (question) => {
    if (!question || loading) return;

    setLoading(true);

    const res = await fetch(`${API}/groq-fallback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        fileId: selectedFile._id,
      }),
    });

    const data = await res.json();

    // ✅ SHOW ANSWER IMMEDIATELY
    typeWriterEffect(selectedFile._id, data.answer);
  };

  /* ---------------- ASK QUESTION ---------------- */
  const askQuestion = async () => {
    if (!question || !selectedFile || loading) return;

    const fileId = selectedFile._id;
    const q = question;

    setQuestion("");
    setLoading(true);
    setShowAskAI(false);

    setChatMap((prev) => ({
      ...prev,
      [fileId]: [...(prev[fileId] || []), { role: "user", text: q }],
    }));

    const res = await fetch(`${API}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question: q, fileId }),
    });

    const data = await res.json();

    if (!data.found) {
      setChatMap((prev) => ({
        ...prev,
        [fileId]: [
          ...(prev[fileId] || []),
          {
            role: "ai",
            text: "❌ Answer not found in document.",
            isFound: false,
            originalQuestion: q,
            askedAI: false,
          },
        ],
      }));
      setLoading(false);
      return;
    }

    setLoading(false);

    typeWriterEffect(fileId, data.answer);
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={() => setShowLogoutModal(true)}
      />

      <Notification notification={notification} />

      <div className="container-fluid mt-5 pt-3">
        <div className="row" style={{ height: "calc(100vh - 65px)" }}>
          {/* SIDEBAR */}
          <div className="col-md-3 bg-dark text-white p-3">
            <div
              className={`border rounded p-3 text-center mb-3 ${
                dragActive ? "border-info bg-secondary" : "border-secondary"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFilesUpload(e.dataTransfer.files);
              }}
            >
              <p>📂 Drag & Drop Files</p>
              <label className="btn btn-sm btn-outline-info">
                Browse
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => handleFilesUpload(e.target.files)}
                />
              </label>

              {uploading && (
                <div className="progress mt-3">
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>

            {/* FILE LIST */}
            <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
              {files.map((file) => (
                <div
                  key={file._id}
                  className={`p-2 rounded mb-2 d-flex justify-content-between align-items-center ${
                    selectedFile?._id === file._id
                      ? "bg-info text-dark"
                      : "bg-secondary"
                  }`}
                  onClick={() => fetchChatsForFile(file)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="text-truncate">📄 {file.originalName}</span>
                  <MdDeleteOutline
                    className="text-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteFileModal"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent selecting file
                      setFileToDelete(file);
                    }}
                  />
                </div>
              ))}

              {noFilesMsg && (
                <p className="text-center text-secondary mt-4">
                  📂 Upload files to start
                </p>
              )}
            </div>
          </div>

          {/* CHAT */}
          <div className="col-md-9 d-flex flex-column h-100">
            {selectedFile && (
              <div className="chat-navbar">
                📄 Selected file:{" "}
                <span className="text-info">{selectedFile.originalName}</span>
              </div>
            )}

            <div className="flex-grow-1 p-3 overflow-auto">
              {/* 1️⃣ No files at all */}
              {noFilesMsg && (
                <p className="text-center text-secondary mt-5">
                  📂 No files uploaded yet. Please upload a document.
                </p>
              )}

              {/* 2️⃣ Files exist but no file selected */}
              {!noFilesMsg && !selectedFile && (
                <p className="text-center text-secondary mt-5">
                  📄 Select a document to start chatting
                </p>
              )}

              {/* 3️⃣ File selected but no chat */}
              {!noFilesMsg && selectedFile && noChatMsg && (
                <p className="text-center text-secondary mt-5">
                  💬 No chat yet. Ask something!
                </p>
              )}

              {currentMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`d-flex mb-3 align-items-end ${
                    msg.role === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  {/* AI ICON */}
                  {msg.role === "ai" && (
                    <div className="chat-avatar me-2">
                      <FaRobot size={20} />
                    </div>
                  )}

                  {/* MESSAGE */}
                  <div
                    className={`p-3 rounded chat-bubble ${
                      msg.role === "user"
                        ? "user-text-bg text-white"
                        : "user-ai-bg text-white"
                    }`}
                    style={{ maxWidth: "70%" }}
                  >
                    {msg.text}
                    {msg.role === "ai" &&
                      msg.isFound === false &&
                      !msg.askedAI && (
                        <div className="text-end">
                          <button
                            className="btn btn-sm btn-outline-info"
                            disabled={loading}
                            onClick={() =>
                              askGroqFallback(msg.originalQuestion)
                            }
                          >
                            🤖 Ask AI
                          </button>
                        </div>
                      )}
                  </div>

                  {/* USER ICON */}
                  {msg.role === "user" && (
                    <div className="chat-avatar ms-2">
                      <FaUserTie size={20} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="chat-avatar me-2">
                  <FaRobot size={20} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3">
              <div className="input-group">
                <input
                  className="form-control bg-secondary text-white"
                  value={question}
                  disabled={!selectedFile || loading}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                  placeholder="Ask something about the document..."
                />
                <button
                  className="btn btn-info"
                  disabled={!question || loading}
                  onClick={askQuestion}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        modalId="logoutModal"
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        onConfirm={handleLogout}
      />
      <ConfirmModal
        modalId="deleteFileModal"
        title="Delete File"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-info">{fileToDelete?.originalName}</strong>?
            <br />
            <span className="text-warning">
              This will also delete all related chats.
            </span>
          </>
        }
        confirmText="Delete"
        onConfirm={handleDeleteFile}
      />
    </>
  );
}

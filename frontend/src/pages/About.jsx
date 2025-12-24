import { motion } from "framer-motion";
import { FaRobot, FaFileAlt, FaSearch, FaShieldAlt } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./styles.css";

export default function About() {
  return (
    <div className="about-page">
      <Navbar isLoggedIn={true} />
      {/* HERO SECTION */}
      <motion.section
        className="about-hero text-center mt-5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>
          About <span>DocQuery AI</span>
        </h1>
        <p>
          An intelligent document-based AI assistant that helps you upload,
          search, and query documents securely using modern AI technologies.
        </p>
      </motion.section>

      {/* FEATURES */}
      <section className="about-features container">
        <motion.div
          className="row"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2 }}
        >
          {features.map((item, index) => (
            <motion.div
              className="col-md-6 col-lg-3"
              key={index}
              variants={cardVariant}
            >
              <div className="feature-card">
                <item.icon className="feature-icon" />
                <h5>{item.title}</h5>
                <p>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TECH STACK */}
      <motion.section
        className="about-tech text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>Technology Stack</h2>
        <p>
          Built using MERN Stack, MongoDB Vector Search, HuggingFace embeddings,
          and secure authentication for production-ready performance.
        </p>

        <div className="tech-badges">
          <span>React</span>
          <span>Node.js</span>
          <span>Express</span>
          <span>MongoDB</span>
          <span>LangChain</span>
          <span>AI / RAG</span>
        </div>
      </motion.section>

      <motion.section
        className="about-workflow container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-center">How DocQuery AI Works</h2>

        <div className="workflow-grid">
          <div className="workflow-card">
            <span>1</span>
            <h5>Upload Documents</h5>
            <p>
              Users upload PDFs, DOCX, CSV, or TXT files which are securely
              stored and processed.
            </p>
          </div>

          <div className="workflow-card">
            <span>2</span>
            <h5>Vector Embeddings</h5>
            <p>
              Documents are converted into embeddings using HuggingFace models
              and stored in MongoDB Vector Search.
            </p>
          </div>

          <div className="workflow-card">
            <span>3</span>
            <h5>AI-Powered Query</h5>
            <p>
              User questions are matched with relevant document chunks using
              semantic search.
            </p>
          </div>

          <div className="workflow-card">
            <span>4</span>
            <h5>Accurate Answers</h5>
            <p>
              A Retrieval-Augmented Generation (RAG) pipeline generates
              reliable, document-based answers.
            </p>
          </div>
        </div>
      </motion.section>
      <motion.section
        className="about-section text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>Who Is This For?</h2>
        <p>
          DocQuery AI is designed for students, professionals, researchers, and
          organizations who work with large documents and need quick, accurate
          insights without manual searching.
        </p>
      </motion.section>

      {/* FOOTER NOTE */}
      <footer className="app-footer">
        <div className="footer-content">
          <h4>DocQuery AI</h4>

          <p className="footer-desc">
            An AI-powered document query system built using modern web
            technologies and Retrieval-Augmented Generation (RAG).
          </p>

          <div className="footer-contact d-flex justify-content-between">
            <p className="fw-bold">
              Source Code:
              <a className="text-warning text-decoration-none" href="">
                {" "}
                github
              </a>
            </p>
            <p className="fw-bold">
              Email:
              <a className="text-warning text-decoration-none">
                {" "}
                mohankrishna28803@gmail.com
              </a>
            </p>
            <p className="fw-bold">
              About Me :
              <a
                className="text-info text-decoration-none"
                href="https://www.linkedin.com/in/mohankrishna280823/"
              >
                {" "}
                LinkedIn
              </a>
            </p>
          </div>

          <p className="footer-copy">
            © {new Date().getFullYear()} DocQuery AI ·
            <span className="footer-dev">
              {" "}
              Developed by Mohan Krishna Reddy
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* DATA */
const features = [
  {
    title: "AI-Powered Search",
    desc: "Ask questions directly from uploaded documents using RAG-based AI.",
    icon: FaRobot,
  },
  {
    title: "Multi-File Upload",
    desc: "Upload PDFs, DOCX, CSV, TXT files and manage them easily.",
    icon: FaFileAlt,
  },
  {
    title: "Fast Query Results",
    desc: "Vector search ensures accurate and quick responses.",
    icon: FaSearch,
  },
  {
    title: "Secure Access",
    desc: "JWT-based authentication protects your documents.",
    icon: FaShieldAlt,
  },
];

/* ANIMATION */
const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

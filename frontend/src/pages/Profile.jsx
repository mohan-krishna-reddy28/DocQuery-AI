import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  FaUserCircle,
  FaEnvelope,
  FaUserShield,
  FaClock,
  FaIdBadge,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "../components/Navbar.jsx";
import "./styles.css";

export default function Profile() {
  useEffect(() => {
    document.title = "Profile | DocQuery AI";
  }, []);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let decoded = {};
  if (token) {
    try {
      decoded = jwtDecode(token);
    } catch {
      console.error("Invalid token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <Navbar />

      <motion.div
        className="profile-container container pt-2 mt-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* HEADER */}
        <div className="profile-header mt-3">
          <FaUserCircle className="profile-avatar" />
          <h3>User Profile</h3>
          <p className="profile-sub">Account & security details</p>
        </div>

        {/* PROFILE CARD */}
        <div className="profile-info-card">
          <ProfileRow
            icon={<FaEnvelope />}
            label="Email"
            value={decoded.email || "Not available"}
          />

          <ProfileRow
            icon={<FaUserShield />}
            label="Role"
            value={decoded.role || "User"}
          />

          <ProfileRow
            icon={<FaIdBadge />}
            label="User ID"
            value={decoded.id || "—"}
          />

          <ProfileRow
            icon={<FaClock />}
            label="Last Login"
            value={
              decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : "—"
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="profile-actions">
          <button onClick={() => navigate("/")}>Go to Dashboard</button>
          <button className="danger" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* REUSABLE ROW */
function ProfileRow({ icon, label, value, badge }) {
  return (
    <div className="profile-row">
      {icon}
      <div>
        <span>{label}</span>
        <p className={badge ? "role-badge" : ""}>{value}</p>
      </div>
    </div>
  );
}

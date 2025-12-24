import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const API_URL = "http://localhost:5000";

  const isStrongPassword = (pwd) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessageType("danger");
      setMessage("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      setMessageType("danger");
      setMessage("Password must be 8+ chars, include 1 uppercase & 1 number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage("Account created. Redirecting to login...");
        setTimeout(() => (window.location.href = "/login"), 1200);
      } else {
        setMessageType("danger");
        setMessage(data.message || "Signup failed");
      }
    } catch {
      setMessageType("danger");
      setMessage("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container-fluid auth-bg">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-11 col-sm-8 col-md-5 col-lg-4">
          <div className="auth-card animate-slide">
            <h3 className="text-center text-white mb-4">Sign Up</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control auth-input"
                  placeholder="Email address"
                  value={email}
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control auth-input"
                  placeholder="Password"
                  value={password}
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control auth-input"
                  placeholder="Confirm password"
                  id="newPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-check mb-3">
                <input
                  id="showPassword"
                  className="form-check-input"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label className="form-check-label text-light" htmlFor="showPassword  ">
                  Show password
                </label>
              </div>

              {message && (
                <div className={`alert alert-${messageType} py-2`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 auth-btn"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center mt-3 text-light">
              Already have an account?{" "}
              <a href="/login" className="auth-link">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

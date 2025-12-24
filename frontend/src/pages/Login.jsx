import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function Login() {
  const navigate = useNavigate(); // ✅ INSIDE component

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const API_URL = "https://docquery-ai-y2p9.onrender.com";

  /* ✅ Redirect if already logged in */
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);
  
  useEffect(() => {
    document.title = "Login | DocQuery AI";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setMessageType("success");
        setMessage("Login successful. Redirecting...");
        setTimeout(() => navigate("/home", { replace: true }), 1000);
      } else {
        setMessageType("danger");
        setMessage(data.message || "Login failed");
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
            <h3 className="text-center text-white mb-4">Login</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control auth-input"
                  placeholder="Email address"
                  value={email}
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showPassword}
                  id="showPassword"
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label
                  className="form-check-label text-light"
                  htmlFor="showPassword"
                >
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
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center mt-3 text-light">
              Don’t have an account?{" "}
              <a href="/signup" className="auth-link">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

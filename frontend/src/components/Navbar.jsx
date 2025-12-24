import { Link, NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { HiOutlineUserCircle } from "react-icons/hi";
import "./Navbar.css";

export default function Navbar({ isLoggedIn, onLogout }) {
  let userEmail = "";

  if (isLoggedIn) {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        userEmail = decoded.email;
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 fixed-top">
      {/* LOGO */}
      <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
        <img src="/fevicon.png" width={40} height={40} alt="logo" />
        DocQuery <span className="text-info">AI</span>
      </Link>

      <div className="ms-auto d-flex align-items-center gap-3">
        {isLoggedIn && (
          <>
            {/* HOME */}
            <NavLink
              to="/home"
              end
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "fw-bold text-white" : "text-secondary"
                }`
              }
            >
              Home
            </NavLink>

            {/* ABOUT */}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "fw-bold text-white" : "text-secondary"
                }`
              }
            >
              About
            </NavLink>

            {/* PROFILE DROPDOWN */}
            <div className="dropdown">
              <button
                type="button"
                className="profile-button"
                data-bs-toggle="dropdown"
              >
                <HiOutlineUserCircle size={28} />
              </button>

              <ul className="dropdown-menu dropdown-menu-end profile-dropdown">
                <li className="dropdown-header fs-6 text-break">
                  {userEmail}
                </li>

                <li>
                  <hr className="dropdown-divider" />
                </li>

                <li>
                  <Link to="/profile" className="dropdown-item">
                    My Profile
                  </Link>
                </li>

                <li>
                  <button
                    className="dropdown-item text-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#logoutModal"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

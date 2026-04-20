import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../styles/layout.css";
export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const initial = user?.name?.charAt(0)?.toUpperCase() || "P";

  const handleToggle = () => {
    setShowMenu((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <div className="navbar">
      {/* Search */}
      <input type="text" placeholder="Search..." className="search" hidden />

      {/* Right side */}
      <div className="nav-right">
        <div className="profile" onClick={handleToggle}>
          <span>{initial}</span>
        </div>
        {showMenu && (
          <div className="profile-dropdown">
            <p onClick={() => navigate("/profile")}>My Profile</p>
            <p className="logout" onClick={handleLogout}>
              Logout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

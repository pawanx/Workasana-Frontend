import Layout from "../components/Layout";
import "../styles/settings.css";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    // clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirect to login
    navigate("/login");
  };

  return (
    <Layout>
      <div className="settings-container">
        <h2 className="settings-title">Settings</h2>

        <div className="settings-card">
          <h3>Account</h3>
          <br />

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
}

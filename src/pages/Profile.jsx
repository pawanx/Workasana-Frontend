import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
    } catch {
      setUser(null);
    }
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "P";

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar">{initial}</div>

          {/* Info */}
          <h2>{user?.name || "User Name"}</h2>
          <p>{user?.email || "user@email.com"}</p>
        </div>
      </div>
    </Layout>
  );
}

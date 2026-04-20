import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "../styles/teamDetails.css";

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = "https://workasana-backend-khaki.vercel.app";

  const [team, setTeam] = useState(null);
  const [users, setUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(res.data);
      } catch (error) {
        console.log("Error fetching users", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/teams/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTeam(res.data);
        setError("");
      } catch (error) {
        console.log("Error fetching team", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id]);

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `${BASE_URL}/teams/${id}/add-member`,
        { userId: selectedUser },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTeam(res.data); // updated team from backend
      setSelectedUser("");
      setShowAddMember(false);
      setMessage("Member added successfully");
      setTimeout(() => {
        setMessage("");
      }, 1500);
    } catch (error) {
      console.log("Error adding member", error);
      setMessage("Failed to add member");
    }
  };

  // delete team member
  const handleRemoveMember = async (userId) => {
    const confirmDelete = window.confirm("Remove this member?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `${BASE_URL}/teams/${id}/remove-member`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTeam(res.data); // update UI
      setMessage("Member removed successfully");

      setTimeout(() => setMessage(""), 1500);
    } catch (error) {
      console.log("Remove member error", error);
      setMessage("Failed to remove member");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="state-center">
          <div className="loader"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="state-center">
          <p className="error-msg">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="team-details-container">
        {/* Back */}
        <p className="back-link" onClick={() => navigate("/teams")}>
          ← Back to Teams
        </p>

        {/* Title */}
        <h2>{team.name}</h2>

        {team.description && (
          <p className="team-description">{team.description}</p>
        )}

        {message && <p className="success-msg">{message}</p>}

        {/* Members */}
        <div className="members-section">
          <p className="section-title">MEMBERS</p>

          {team.members?.map((member) => (
            <div key={member._id} className="member-item">
              <div className="member-left">
                <div className="avatar">
                  {member.name?.charAt(0).toUpperCase()}
                </div>

                <span>{member.name}</span>
              </div>

              {/*delete button */}
              <button
                className="remove-btn"
                onClick={() => handleRemoveMember(member._id)}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            className="primary-btn add-member-btn"
            onClick={() => setShowAddMember(true)}
          >
            + Member
          </button>

          {showAddMember && (
            <div className="add-member-box">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select User</option>

                {users
                  .filter(
                    (user) => !team.members?.some((m) => m._id === user._id),
                  )
                  .map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                      disabled={team.members.some((m) => m._id === user._id)}
                    >
                      {user.name}
                    </option>
                  ))}
              </select>

              <div className="add-actions">
                <button onClick={handleAddMember} className="primary-btn">
                  Add
                </button>

                <button
                  onClick={() => setShowAddMember(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

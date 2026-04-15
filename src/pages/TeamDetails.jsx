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
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/teams/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTeam(res.data);
      } catch (error) {
        console.log("Error fetching team", error);
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
    } catch (error) {
      console.log("Error adding member", error);
    }
  };

  if (!team) return <p>Loading...</p>;

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

        {/* Members */}
        <div className="members-section">
          <p className="section-title">MEMBERS</p>

          {team.members?.map((member) => (
            <div key={member._id} className="member-item">
              <div className="avatar">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              <span>{member.name}</span>
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

                {users.map((user) => (
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

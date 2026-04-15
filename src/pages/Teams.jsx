// pages/Teams.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../styles/teams.css";

export default function Teams() {
  const BASE_URL = "https://workasana-backend-khaki.vercel.app";
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    members: [],
  });

  const handleChange = (e) => {
    setNewTeam({ ...newTeam, [e.target.name]: e.target.value });
  };

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
        console.log("Error getting users", error);
      }
    };
    fetchUsers();
  }, []);
  const handleCreateTeam = async () => {
    if (!newTeam.name) {
      console.log("Team name required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const cleanedTeam = {
        ...newTeam,
        members: newTeam.members,
      };

      const res = await axios.post(`${BASE_URL}/teams`, cleanedTeam, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // update UI instantly
      setTeams((prev) => [...prev, res.data]);

      // reset
      setNewTeam({
        name: "",
        description: "",
        members: [],
      });

      setShowModal(false);
    } catch (error) {
      console.log("Create team error", error);
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/teams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTeams(res.data);
      } catch (error) {
        console.log("Error getting teams", error);
      }
    };
    fetchTeams();
  }, []);
  return (
    <Layout>
      <div className="teams-container">
        {/* Header */}
        <div className="teams-header">
          <h2>Teams</h2>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + Add Team
          </button>
        </div>

        {/* Teams List */}
        <div className="teams-list">
          {teams.map((team) => (
            <div
              className="team-card"
              key={team._id}
              onClick={() => navigate(`/teams/${team._id}`)}
              style={{ cursor: "pointer" }}
            >
              <h3>{team.name}</h3>
              <p>{team.description}</p>
              <p className="member-para">
                Members: {team.members?.length || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Team</h3>

            <input
              type="text"
              name="name"
              placeholder="Team Name"
              value={newTeam.name}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Description"
              value={newTeam.description}
              onChange={handleChange}
            />
            <label>Add Members</label>

            <select
              value=""
              onChange={(e) => {
                const selectedId = e.target.value;

                if (!selectedId) return;

                if (newTeam.members.includes(selectedId)) return;

                setNewTeam({
                  ...newTeam,
                  members: [...newTeam.members, selectedId],
                });
              }}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                  disabled={newTeam.members.includes(user._id)}
                >
                  {user.name}
                </option>
              ))}
            </select>

            {/* Selected Members (Chips) */}
            <div className="selected-members">
              {newTeam.members.map((memberId) => {
                const user = users.find((u) => u._id === memberId);

                return (
                  <div key={memberId} className="member-chip">
                    {user?.name}

                    <span
                      className="remove-chip"
                      onClick={() =>
                        setNewTeam({
                          ...newTeam,
                          members: newTeam.members.filter(
                            (id) => id !== memberId,
                          ),
                        })
                      }
                    >
                      ×
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>

              <button className="primary-btn" onClick={handleCreateTeam}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

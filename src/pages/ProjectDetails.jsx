// pages/Projects.jsx
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/projects.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectDetails() {
  const BASE_URL = "https://workasana-backend-khaki.vercel.app";
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [owner, setOwner] = useState("");
  //for add task
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("");

  // task modal and form
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    team: "",
    owners: [],
    timeToComplete: "",
    status: "To Do",
  });

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "") || "";
  };

  const filteredTasks = owner
    ? tasks.filter((task) => task.owners?.some((o) => o._id === owner))
    : tasks;

  const processedTasks = [...filteredTasks];

  if (sortBy === "time") {
    processedTasks.sort(
      (a, b) => (a.timeToComplete || 0) - (b.timeToComplete || 0),
    );
  }

  if (sortBy === "status") {
    const statusOrder = {
      "To Do": 1,
      "In Progress": 2,
      Completed: 3,
      Blocked: 4,
    };

    processedTasks.sort(
      (a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5),
    );
  }

  //handle for owner change
  const handleOwnerChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setNewTask({ ...newTask, owners: selected });
  };

  //handle for create new task
  const handleCreateTask = async () => {
    if (!newTask.name || !newTask.team) {
      return alert("Please fill required fields");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/tasks`,
        {
          ...newTask,
          project: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTasks((prev) => [...prev, res.data]);

      setNewTask({
        name: "",
        team: "",
        owners: [],
        timeToComplete: "",
        status: "To Do",
      });

      setShowTaskModal(false);
    } catch (error) {
      console.log("Create task error", error);
    }
  };

  //fetching users
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (error) {
        console.log("Error while fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  //fetching teams
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTeams(res.data))
      .catch((err) => console.log("Team fetch error", err));
  }, []);

  // fetching tasks and project
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        setLoading(true);

        const projectRes = await axios.get(`${BASE_URL}/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProject(projectRes.data);

        const taskRes = await axios.get(`${BASE_URL}/tasks?project=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(taskRes.data);
        setError("");
      } catch (error) {
        console.log("Error fetching project data", error);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  return (
    <Layout>
      <div className="projects-container">
        {/* Header */}
        <div className="projects-header">
          <h2>
            Project: {loading ? "Loading..." : project?.name || "Not found"}
          </h2>
          <button className="primary-btn">+ Add Task</button>
        </div>

        {/* Filters */}
        <div className="filters">
          <label htmlFor="filters">Filter by Owner:</label>
          <select
            name="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">All Owners</option>
            {users.map((user) => (
              <option value={user._id} key={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <label htmlFor="filters">Filter by Time/Priority:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Default</option>
            <option value="time">Time to complete</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Task List */}
        <div className="task-list">
          {loading && (
            <div className="state-center">
              <div className="loader"></div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="state-center">
              <p className="error-msg">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredTasks.length === 0 && (
            <div className="state-center">
              <p className="empty-msg">No tasks in this project 📭</p>
            </div>
          )}

          {!loading &&
            !error &&
            processedTasks.map((task) => (
              <div className="task-item" key={task._id}>
                <div>
                  <h4>{task.name}</h4>
                  <p>Time to complete: {`${task.timeToComplete} days`}</p>
                  {task.owners?.map((o) => o.name).join(", ") || "Unassigned"}
                </div>

                <div className="task-right">
                  <span className="owner"></span>
                  <span className={`badge ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Task</h3>

            <input
              placeholder="Task Name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />

            <select
              value={newTask.team}
              onChange={(e) => setNewTask({ ...newTask, team: e.target.value })}
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>

            <label>Owners</label>
            <select
              multiple
              value={newTask.owners}
              onChange={handleOwnerChange}
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Days"
              value={newTask.timeToComplete}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  timeToComplete: e.target.value,
                })
              }
            />

            <select
              value={newTask.status}
              onChange={(e) =>
                setNewTask({ ...newTask, status: e.target.value })
              }
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Blocked</option>
            </select>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </button>

              <button className="primary-btn" onClick={handleCreateTask}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

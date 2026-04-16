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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "");
  };

  const filteredTasks = owner
    ? tasks.filter((task) => task.owners?.some((o) => o._id === owner))
    : tasks;
  console.log(filteredTasks);

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
          Project: {loading ? "Loading..." : project?.name || "Not found"}
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
          <label htmlFor="filters">Filter by Due date/Priority:</label>
          <select>
            <option>Sort by Due Date</option>
            <option>Priority</option>
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
            filteredTasks.map((task) => (
              <div className="task-item" key={task._id}>
                <div>
                  <h4>{task.name}</h4>
                  <p>Time to complete: {`${task.timeToComplete} days`}</p>
                  {task.owners?.map((o) => o.name).join(", ") || "Unassigned"}
                </div>

                <div className="task-right">
                  <span className="owner"></span>
                  <span className={`badge ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}

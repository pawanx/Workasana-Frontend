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
  const [users, SetUsers] = useState([]);
  const [owner, setOwner] = useState("");

  const filteredTasks = owner
    ? tasks.filter((task) => task.owners.some((o) => o._id === owner))
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
        SetUsers(res.data);
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
      } catch (error) {
        console.log("Error fetching project data", error);
      }
    };
    fetchData();
  }, [id]);
  return (
    <Layout>
      <div className="projects-container">
        {/* Header */}
        <div className="projects-header">
          <h2>Project: {project?.name}</h2>

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
          {filteredTasks.map((task) => (
            <div className="task-item" key={task._id}>
              <div>
                <h4>{task.name}</h4>
                <p>Due: 25 Dec</p>
                {task.owners?.map((o) => o.name).join(", ") || "Unassigned"}
              </div>

              <div className="task-right">
                <span className="owner"></span>
                <span className="badge inprogress">{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

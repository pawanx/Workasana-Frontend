import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/dashboard.css";
import axios from "axios";

export default function Dashboard() {
  const BASE_URL = "https://workasana-backend-khaki.vercel.app";

  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [deletingID, setDeletingID] = useState(null);

  // messages
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");
  const [taskError, setTaskError] = useState(false);

  // loading + error states
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [tasksError, setTasksError] = useState("");

  // modals
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "To Do",
  });

  const [taskData, setTaskData] = useState({
    name: "",
    project: "",
    team: "",
    owners: [],
    timeToComplete: "",
    status: "To Do",
  });

  const handleDeleteTask = async (taskId) => {
    setDeletingID(taskId);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingID(null);
    }
  };

  const handleOwnerChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setTaskData({ ...taskData, owners: selected });
  };

  const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, "");

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(`${BASE_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects((prev) => [...prev, res.data]);
      setMessage("Project Created Successfully.");
      setIsError(false);

      setNewProject({ name: "", description: "", status: "To Do" });
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Failed to create project");
    }

    setTimeout(() => setShowModal(false), 1500);
  };

  const handleCreateTask = async () => {
    if (!taskData.name || !taskData.project || !taskData.team) {
      setTaskError(true);
      setTaskMessage("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${BASE_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // refetch tasks
      const res = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data);
      setTaskError(false);
      setTaskMessage("Task created successfully");

      setTaskData({
        name: "",
        project: "",
        team: "",
        owners: [],
        timeToComplete: "",
        status: "To Do",
      });

      setTimeout(() => {
        setShowTaskModal(false);
        setTaskMessage("");
      }, 1500);
    } catch (error) {
      setTaskError(true);
      setTaskMessage(error.response?.data?.message || "Failed to create task");
    }
  };

  // fetch users
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  }, []);

  // fetch teams
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTeams(res.data))
      .catch((err) => console.log(err));
  }, []);

  // auto clear message
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // fetch projects + tasks
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const res = await axios.get(`${BASE_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
        setProjectsError("");
      } catch {
        setProjectsError("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const res = await axios.get(`${BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
        setTasksError("");
      } catch {
        setTasksError("Failed to load tasks");
      } finally {
        setTasksLoading(false);
      }
    };

    fetchProjects();
    fetchTasks();
  }, []);

  return (
    <Layout>
      {/* ===== Projects ===== */}
      <div className="section">
        <div className="section-header">
          <h2>Projects</h2>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        <div className="projects-grid">
          {projectsLoading && <p>Loading projects...</p>}

          {!projectsLoading && projectsError && (
            <p className="error-msg">{projectsError}</p>
          )}

          {!projectsLoading && !projectsError && projects.length === 0 && (
            <p>No projects found 🚀</p>
          )}

          {!projectsLoading &&
            !projectsError &&
            projects.map((project) => (
              <Link
                to={`/project/${project._id}`}
                key={project._id}
                className="project-link"
              >
                <div className="project-card">
                  <span className={`badge ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                  <h4>{project.name}</h4>
                  <p>{project.description}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* ===== Tasks ===== */}
      <div className="section">
        <div className="section-header">
          <h2>My Tasks</h2>
          <button
            className="primary-btn"
            onClick={() => setShowTaskModal(true)}
          >
            + New Task
          </button>
        </div>

        <div className="tasks-list">
          {tasksLoading && <p>Loading tasks...</p>}

          {!tasksLoading && tasksError && (
            <p className="error-msg">{tasksError}</p>
          )}

          {!tasksLoading && !tasksError && tasks.length === 0 && (
            <p>No tasks assigned 📭</p>
          )}

          {!tasksLoading &&
            !tasksError &&
            tasks.map((task) => (
              <div className="task-card" key={task._id}>
                <span className={`badge ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>
                <h4>{task.name}</h4>
                <span className="owner">
                  {task.owners?.map((o) => o.name).join(", ") || "No Owner"}
                </span>
                <p>Days: {task.timeToComplete}</p>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  {deletingID === task._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* ===== Project Modal ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Project</h3>
            <input
              name="name"
              placeholder="Name"
              value={newProject.name}
              onChange={handleInputChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newProject.description}
              onChange={handleInputChange}
            />
            <select
              name="status"
              value={newProject.status}
              onChange={handleInputChange}
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleCreateProject}>Create</button>
            </div>

            {message && (
              <p className={isError ? "error-msg" : "success-msg"}>{message}</p>
            )}
          </div>
        </div>
      )}

      {/* ===== Task Modal ===== */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Task</h3>

            <input
              placeholder="Task Name"
              value={taskData.name}
              onChange={(e) =>
                setTaskData({ ...taskData, name: e.target.value })
              }
            />

            <select
              value={taskData.project}
              onChange={(e) =>
                setTaskData({ ...taskData, project: e.target.value })
              }
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              multiple
              value={taskData.owners}
              onChange={handleOwnerChange}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={taskData.team}
              onChange={(e) =>
                setTaskData({ ...taskData, team: e.target.value })
              }
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Days"
              value={taskData.timeToComplete}
              onChange={(e) =>
                setTaskData({
                  ...taskData,
                  timeToComplete: e.target.value,
                })
              }
            />

            <button onClick={handleCreateTask}>Create Task</button>

            {taskMessage && (
              <p className={taskError ? "error-msg" : "success-msg"}>
                {taskMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

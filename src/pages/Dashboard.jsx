// pages/Dashboard.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/dashboard.css";
import axios from "axios";

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deletingID, setDeletingID] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");
  const [taskError, setTaskError] = useState(false);
  const [projects, setProjects] = useState([]);
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

  // loading
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  // error
  const [projectsError, setProjectsError] = useState("");
  const [tasksError, setTasksError] = useState("");

  const handleDeleteTask = async (taskId) => {
    setDeletingID(taskId);

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingID(null);
    }
  };

  const BASE_URL = "https://workasana-backend-khaki.vercel.app";

  const handleOwnerChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);

    setTaskData({ ...taskData, owners: selected });
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "");
  };

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(`${BASE_URL}/projects`, newProject, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Project Created Successfully.");
      setIsError(false);
      setProjects((prev) => [...prev, res.data]);
      setNewProject({ name: "", description: "", status: "To Do" });
    } catch (error) {
      setIsError(true);
      console.log("Error creating new Project", error);
      setMessage(error.response?.data?.message || "Failed to create project");
    }

    setTimeout(() => {
      setShowModal(false);
    }, 4000);
  };

  const handleCreateTask = async () => {
    if (!taskData.name || !taskData.project || !taskData.team) {
      setTaskError(true);
      setTaskMessage("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(`${BASE_URL}/tasks`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // update UI instantly this is not working
      //setTasks((prev) => [...prev, res.data]);
      const fetchTasks = async () => {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTasks(res.data);
      };

      await fetchTasks();

      setTaskError(false);
      setTaskMessage("Task created successfully");
      // reset form
      setTaskData({
        name: "",
        project: "",
        team: "",
        owners: [],
        timeToComplete: "",
        status: "To Do",
      });

      // Close modal after short delay
      setTimeout(() => {
        setShowTaskModal(false);
        setTaskMessage("");
      }, 1500);
    } catch (error) {
      console.log("Task create error", error);
      setTaskError(true);
      setTaskMessage(error.response?.data?.message || "Failed to create task");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.log("User fetch error", err));

    console.log(users);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTeams(res.data))
      .catch((err) => console.log("Team fetch error", err));
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProjectsError("");
        setProjects(res.data);
      } catch (error) {
        setProjectsError("Failed to load projects");
        console.log("Unable to fetch projects error");
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTasks(res.data);
        setTasksError("");
      } catch (error) {
        console.log("Error fetching tasks", error);
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
      {/* ===== Projects Section ===== */}
      <div className="section">
        <div className="section-header">
          <h2>Projects</h2>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        <div className="projects-grid">
          {projectsLoading && (
            <div className="state-center">
              <div className="loader"></div>
            </div>
          )}

          {!projectsLoading && projectsError && (
            <div className="state-center">
              <p className="error-msg">{projectsError}</p>
            </div>
          )}

          {!projectsLoading && !projectsError && projects.length === 0 && (
            <div className="state-center">
              <p className="empty-msg">No projects yet .</p>
            </div>
          )}
          {!projectsLoading &&
            !projectsError &&
            projects.map((project) => (
              <Link
                to={`/project/${project._id}`}
                className="project-link"
                key={project._id}
              >
                <div className="project-card">
                  <span className={`badge ${getStatusClass(project.status)}`}>
                    {project.status || "active"}
                  </span>
                  <h4>{project.name}</h4>
                  <p>
                    {project.description ||
                      "This is the beginning of the project"}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* ===== Tasks Section ===== */}
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
          {tasksLoading && (
            <div className="state-center">
              <div className="loader"></div>
            </div>
          )}

          {!tasksLoading && tasksError && (
            <div className="state-center">
              <p className="error-msg">{tasksError}</p>
            </div>
          )}

          {!tasksLoading && !tasksError && tasks.length === 0 && (
            <div className="state-center">
              <p className="empty-msg">No tasks assigned.</p>
            </div>
          )}

          {!tasksLoading &&
            !tasksError &&
            tasks.map((task) => (
              <div className="task-card" key={task._id}>
                <button
                className="delete-icon"
              onClick={() => handleDeleteTask(task._id)}
  >
              {deletingID === task._id ? "..." : "🗑"}
               </button>
                <span className={`badge ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>

                <h4>{task.name}</h4>

                <span className="owner">
                  {task.owners?.map((o) => o.name).join(", ") || "No Owner"}
                </span>
                <p className="task-meta">
                  Days to complete: {task.timeToComplete}
                </p>
                {/* <button
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  {deletingID === task._id ? "Deleting..." : "Delete"}
                </button> */}
              </div>
            ))}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Project</h3>
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={handleInputChange}
              name="name"
            />
            <textarea
              name="description"
              id="description"
              placeholder="Enter the description"
              value={newProject.description}
              onChange={handleInputChange}
            ></textarea>
            <select
              name="status"
              id="status"
              value={newProject.status}
              onChange={handleInputChange}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button className="primary-btn" onClick={handleCreateProject}>
                Create
              </button>
            </div>
            {message && (
              <p className={isError ? "error-msg" : "success-msg"}>{message}</p>
            )}
          </div>
        </div>
      )}

      {/* Show task modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Task</h3>

            <input
              type="text"
              placeholder="Task Name"
              name="name"
              value={taskData.name}
              onChange={(e) =>
                setTaskData({ ...taskData, name: e.target.value })
              }
            />

            <select
              name="project"
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

            <label>Select Owners</label>

            <select
              multiple
              onChange={handleOwnerChange}
              value={taskData.owners}
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>

            <select
              name="team"
              value={taskData.team}
              onChange={(e) =>
                setTaskData({ ...taskData, team: e.target.value })
              }
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
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

            <select
              value={taskData.status}
              onChange={(e) =>
                setTaskData({ ...taskData, status: e.target.value })
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

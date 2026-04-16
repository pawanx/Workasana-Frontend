import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import "../styles/projects.css";
import axios from "axios";

const Projects = () => {
  const BASE_URL = "https://workasana-backend-khaki.vercel.app";
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  //added loading state and error message
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "To Do",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "");
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${BASE_URL}/projects`);

        setProjects(res.data);

        setError("");
      } catch (error) {
        console.log("Error while getting projects", error);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  return (
    <Layout>
      <div className="projects-container">
        <div className="projects-header">
          <h2>Projects</h2>
          <p>Track all your projects at one place</p>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>
      </div>

      <div className="project-grid">
        {/* Loading */}
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
        {!loading && !error && projects.length === 0 && (
          <div className="state-center">
            <p className="empty-msg">No projects yet.</p>
          </div>
        )}

        {!loading &&
          !error &&
          projects.map((project) => (
            <div
              className="project-card"
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <div className="card-top">
                <span
                  className={`badge ${getStatusClass(project.status)}`}
                ></span>
              </div>

              <h3>{project.name}</h3>
              <p>{project.description || "No description provided."}</p>

              <div className="card-footer">
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                <span className="arrow">→</span>
              </div>
            </div>
          ))}
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
    </Layout>
  );
};

export default Projects;

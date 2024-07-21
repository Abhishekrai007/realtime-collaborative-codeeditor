import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Project {
  _id: string;
  name: string;
  description: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting project", error);
    }
  };

  return (
    <div className="projectlist-container">
      <div className="list-heading">
        <h2>Available Projects</h2>
      </div>
      <div className="create-new-link">
        <Link className="link" to="/create-project">
          &#10144; Create New Project
        </Link>
      </div>
      <div className="list-container">
        {projects.length === 0 ? (
          <p>No projects available. Create a new one!</p>
        ) : (
          <div className="lists">
            {projects.map((project) => (
              <div className="list" key={project._id}>
                <Link to={`/project/${project._id}`}>{project.name}</Link>
                <p>{project.description}</p>
                <Link className="edit-link" to={`/edit-project/${project._id}`}>
                  Edit
                </Link>
                <button onClick={() => handleDelete(project._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;

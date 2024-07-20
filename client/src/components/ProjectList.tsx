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

  return (
    <div className="projectlist-container">
      <div className="list-heading">
        <h2>Available Projects</h2>
      </div>
      <div className="lists">
        {projects.length === 0 ? (
          <p>No projects available. Create a new one!</p>
        ) : (
          <div className="list">
            {projects.map((project) => (
              <li key={project._id}>
                <Link to={`/project/${project._id}`}>{project.name}</Link>
                <p>{project.description}</p>
              </li>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;

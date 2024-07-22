// EditProject.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const EditProject: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const languageOptions = ["javascript", "python", "java"];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/projects/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { name, description, language } = response.data;
        setName(name);
        setDescription(description);
        setLanguage(language);
      } catch (error) {
        console.error("Error fetching project", error);
      }
    };

    fetchProject();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${id}`,
        { name, description, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/"); // Redirect to project list
    } catch (error) {
      console.error("Error updating project", error);
    }
  };

  return (
    <div className="home-container">
      <div className="auth-box">
        <h2 className="form-heading">Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="change project name">Project Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="change project name">Project Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="language">Language:</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button className="auth-button" type="submit">
            Update Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProject;

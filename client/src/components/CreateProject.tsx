// CreateProject.tsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateProject: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("javascript");
  const { token } = useAuth();
  const navigate = useNavigate();

  const languageOptions = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c",
    "cpp",
    "csharp",
    "go",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "rust",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/projects",
        { name, description, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/"); // Redirect to project list
    } catch (error) {
      console.error("Error creating project", error);
    }
  };

  return (
    <div className="home-container">
      <div className="auth-box">
        <h2 className="form-heading">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              placeholder="Project Name"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <textarea
              placeholder="Description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="input-group">
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
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;

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
    <form onSubmit={handleSubmit}>
      <h2>Edit Project</h2>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="language">Language:</label>
        <input
          type="text"
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          required
        />
      </div>
      <button type="submit">Update Project</button>
    </form>
  );
};

export default EditProject;

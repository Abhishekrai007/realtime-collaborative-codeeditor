import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import CodeEditor from "../components/CodeEditor";
import AddCollaborator from "../components/AddCollaborator";

interface Project {
  _id: string;
  name: string;
  content: string;
  language: string;
}

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProject(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching project", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError("Project not found or you don't have access");
      } else {
        setError("An error occurred while fetching the project");
      }
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, token]);

  useEffect(() => {
    if (!project || !token) return;
    console.log("Attempting to connect with token:", token);

    const newSocket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      newSocket.emit("join_project", id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave_project", id);
      newSocket.disconnect();
    };
  }, [id, token, project]);

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Projects</button>
      </div>
    );
  }

  if (!project || !socket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="projectpage-container">
      <h2>{project.name}</h2>
      <CodeEditor
        projectId={project._id}
        socket={socket}
        initialContent={project.content}
        initialLanguage={project.language}
      />
    </div>
  );
};

export default ProjectPage;

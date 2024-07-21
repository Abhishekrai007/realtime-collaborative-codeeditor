import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/java/java.contribution";
import "monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution";
import { useParams } from "react-router-dom";
import AddCollaborator from "./AddCollaborator";

interface CodeEditorProps {
  projectId: string;
  socket: Socket;
  initialContent: string;
  initialLanguage: string;
}

interface Project {
  _id: string;
  name: string;
  content: string;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  projectId,
  socket,
  initialContent,
  initialLanguage,
}) => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState(initialLanguage);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const { token } = useAuth();

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

  useEffect(() => {
    socket.on("code_updated", (updatedContent: string) => {
      setContent(updatedContent);
    });

    socket.on("language_updated", (updatedLanguage: string) => {
      setLanguage(updatedLanguage);
    });

    return () => {
      socket.off("code_updated");
      socket.off("language_updated");
    };
  }, [socket]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      socket.emit("code_change", projectId, value);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("language_change", projectId, newLanguage);
    updateProjectLanguage(newLanguage);
  };

  const updateProjectLanguage = async (newLanguage: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}`,
        { language: newLanguage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating project language", error);
    }
  };

  const handleRunCode = async () => {
    console.log("Sending code:", content);
    console.log("Language:", language);
    setIsExecuting(true);
    setOutput("Executing code...");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/projects/execute",
        { code: content, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Server response:", response.data);
      const { result, consoleOutput } = response.data;
      setOutput(`Result: ${result}\n\nConsole Output:\n${consoleOutput}`);
    } catch (error) {
      console.error("Error executing code", error);
      if (axios.isAxiosError(error) && error.response) {
        setOutput(`Error executing code: ${error.response.data.message}`);
      } else {
        setOutput(
          `Error executing code: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`
        );
      }
    } finally {
      setIsExecuting(false);
    }
  };

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
  return (
    <div className="code-editor-container">
      <div className="top-bar">
        <span className="file-name">index.{language}</span>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="language-select"
        >
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="editor-main">
        <div className="editor-wrapper">
          <Editor
            height="100vh"
            width="70vw"
            language={language.toLowerCase()}
            value={content}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              lineNumbers: "on",
              folding: true,
              minimap: {
                enabled: true,
                scale: 0.75,
                renderCharacters: false,
              },
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 14,
                horizontalScrollbarSize: 14,
              },
              lineHeight: 20,
              padding: {
                top: 5,
                bottom: 5,
              },
              renderLineHighlight: "all",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              suggest: {
                snippetsPreventQuickSuggestions: false,
              },
              quickSuggestions: true,
              bracketPairColorization: { enabled: true },
            }}
            style={{
              width: "100%",
              border: "1px solid #252526",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          />
        </div>
        <div className="output-panel">
          <div className="output-container">
            <h3>Output:</h3>
            <pre style={{ color: "white", textWrap: "wrap" }}>{output}</pre>
            <button
              className="run-button"
              onClick={handleRunCode}
              disabled={isExecuting}
            >
              {isExecuting ? "Executing..." : "Run Code"}
            </button>
          </div>
          <div className="addcollaborator-container">
            <AddCollaborator
              projectId={projectId}
              onCollaboratorAdded={fetchProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

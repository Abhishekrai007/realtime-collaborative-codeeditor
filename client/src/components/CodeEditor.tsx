import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/java/java.contribution";
import "monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution";

interface CodeEditorProps {
  projectId: string;
  socket: Socket;
  initialContent: string;
  initialLanguage: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  projectId,
  socket,
  initialContent,
  initialLanguage,
}) => {
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
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
        <div className="icons">{/* Add VS Code-like icons here */}</div>
      </div>
      <div className="editor-main">
        <div className="sidebar">{/* Add file navigation here */}</div>
        <div className="editor-wrapper">
          <Editor
            height="calc(60vh - 80px)"
            language={language.toLowerCase()} // Ensure language is lowercase
            value={content}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              lineNumbers: "on",
              folding: true,
              minimap: { enabled: true },
            }}
          />
        </div>
      </div>
      <div className="status-bar">{/* Add status information here */}</div>
      <div className="output-panel">
        <h3>Output:</h3>
        <pre style={{ color: "white", textWrap: "wrap" }}>{output}</pre>
      </div>
      <button
        className="run-button"
        onClick={handleRunCode}
        disabled={isExecuting}
      >
        {isExecuting ? "Executing..." : "Run Code"}
      </button>
    </div>
  );
};

export default CodeEditor;

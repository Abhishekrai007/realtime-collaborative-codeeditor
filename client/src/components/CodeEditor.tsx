import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface CodeEditorProps {
  projectId: string;
  socket: Socket;
  initialContent: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  projectId,
  socket,
  initialContent,
}) => {
  const [content, setContent] = useState(initialContent);
  const [output, setOutput] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    socket.on("code_updated", (updatedContent: string) => {
      setContent(updatedContent);
    });

    return () => {
      socket.off("code_updated");
    };
  }, [socket]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      socket.emit("code_change", projectId, value);
    }
  };

  const handleRunCode = async () => {
    try {
      console.log("Executing code with token:", token);
      const response = await axios.post(
        "http://localhost:5000/api/projects/execute",
        { code: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { result, consoleOutput } = response.data;
      setOutput(`Result: ${result}\n\nConsole Output:\n${consoleOutput}`);
    } catch (error) {
      console.error("Error executing code", error);
      if (axios.isAxiosError(error) && error.response) {
        setOutput(`Error executing code: ${error.response.data.message}`);
      } else {
        setOutput("Error executing code: Unknown error occurred");
      }
    }
  };

  return (
    <div>
      <Editor
        height="70vh"
        defaultLanguage="javascript"
        value={content}
        onChange={handleEditorChange}
      />
      <button onClick={handleRunCode}>Run Code</button>
      <div>
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;

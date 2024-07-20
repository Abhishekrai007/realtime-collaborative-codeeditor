// AddCollaborator.tsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface AddCollaboratorProps {
  projectId: string;
  onCollaboratorAdded: () => void;
}

const AddCollaborator: React.FC<AddCollaboratorProps> = ({
  projectId,
  onCollaboratorAdded,
}) => {
  const [email, setEmail] = useState("");
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/projects/${projectId}/collaborators`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmail("");
      onCollaboratorAdded();
    } catch (error) {
      console.error("Error adding collaborator", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Collaborator's email"
        required
      />
      <button type="submit">Add Collaborator</button>
    </form>
  );
};

export default AddCollaborator;

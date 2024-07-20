import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLogin, toggleForm } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        { username, email, password }
      );
      login(response.data.token);
      navigate("/"); // Redirect to home page after successful registration
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    // <form onSubmit={handleSubmit}>
    //   <input
    //     type="text"
    //     value={username}
    //     onChange={(e) => setUsername(e.target.value)}
    //     placeholder="Username"
    //     required
    //   />
    //   <input
    //     type="email"
    //     value={email}
    //     onChange={(e) => setEmail(e.target.value)}
    //     placeholder="Email"
    //     required
    //   />
    //   <input
    //     type="password"
    //     value={password}
    //     onChange={(e) => setPassword(e.target.value)}
    //     placeholder="Password"
    //     required
    //   />
    //   <button type="submit">Register</button>
    // </form>
    <div className="home-container">
      <div className="auth-box">
        <h1 className="form-heading">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="auth-button">
            Sign up
          </button>
        </form>
        <div className="auth-links">
          <button onClick={toggleForm}>
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;

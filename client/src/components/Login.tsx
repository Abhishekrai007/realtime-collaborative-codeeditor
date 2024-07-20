import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [isLogin, setIsLogin] = useState(true);

  const { login, isLogin, setIsLogin, toggleForm } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      login(response.data.token);
      navigate("/"); // Redirect to home page after successful login
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    // <form onSubmit={handleSubmit}>
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
    //   <button type="submit">Login</button>
    // </form>
    <div className="home-container">
      <div className="auth-box">
        <h1 className="form-heading">Login</h1>
        <form onSubmit={handleSubmit}>
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
            Log in
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

export default Login;

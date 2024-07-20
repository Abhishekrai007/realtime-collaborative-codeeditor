// Home.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import ProjectList from "../components/ProjectList";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const { token, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <h1>CodeCollab</h1>
      {token ? (
        <>
          <ProjectList />
          <Link to="/create-project">Create New Project</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <div>
          {isLogin ? <Login /> : <Register />}
          <button onClick={toggleForm}>
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;

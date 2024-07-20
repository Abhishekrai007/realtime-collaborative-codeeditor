// Home.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import ProjectList from "../components/ProjectList";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const { token, logout, isLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      {token ? (
        <>
          <ProjectList />
          <Link to="/create-project">Create New Project</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <div>{isLogin ? <Login /> : <Register />}</div>
      )}
    </div>
  );
};

export default Home;

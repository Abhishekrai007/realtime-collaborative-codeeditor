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

  return (
    <div>
      {token ? (
        <>
          <ProjectList />
        </>
      ) : (
        <div>{isLogin ? <Login /> : <Register />}</div>
      )}
    </div>
  );
};

export default Home;

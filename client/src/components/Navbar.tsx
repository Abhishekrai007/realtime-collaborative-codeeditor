import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { token, logout, isLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="navbar-container">
      <h1 onClick={() => navigate("/")}>
        <span>Code</span>
        <span>Collab</span>
      </h1>

      {token && <button onClick={handleLogout}>Logout</button>}
    </div>
  );
};

export default Navbar;

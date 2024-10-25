import React from "react";
import { useNavigate } from "react-router-dom";
import "./Zarzadzaj.css";

function Zarzadzaj({ user }) {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <div className="zarzadzaj-container">
      <button className="back-button" onClick={handleBackToHome}>
        <img
          src="https://img.icons8.com/ios-filled/50/000000/home.png"
          alt="Home"
          className="home-icon"
        />
      </button>
      <h1>Zarządzaj kontem</h1>
      <div className="profile-info">
        <p><strong>Imię:</strong> {user?.firstName}</p>
        <p><strong>Nazwisko:</strong> {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Typ konta:</strong> {user?.role === "student" ? "Uczeń" : "Nauczyciel"}</p>
      </div>
    </div>
  );
}

export default Zarzadzaj;

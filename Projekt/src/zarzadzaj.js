import React from "react";
import { useNavigate } from "react-router-dom";
import "./Zarzadzaj.css"; // Importuj style

function Zarzadzaj() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/home"); // Przekierowanie do strony głównej
  };

  return (
    <div className="zarzadzaj-container">
      {/* Przycisk powrotu do strony głównej */}
      <button className="back-button" onClick={handleBackToHome}>
        <img
          src="https://img.icons8.com/ios-filled/50/000000/home.png" // Ikona domku
          alt="Home"
          className="home-icon"
        />
      </button>
      <h1>Zarządzaj kontem</h1>
      {/* Możesz dodać tutaj więcej treści związanych z zarządzaniem kontem */}
    </div>
  );
}

export default Zarzadzaj;

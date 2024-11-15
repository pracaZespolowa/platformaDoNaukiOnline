import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Importuj stylizację

function Home({ user }) {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };
//
  const handleManageAccount = () => {
    navigate("/zarzadzaj"); // Przekierowanie do strony Zarządzaj kontem
  };

  return (
    <div className="home-container">
      <header>
        <div className="profile" onClick={toggleOptions} role="button" aria-label="Pokaż opcje">
          {/* Kółko z szarym awatarem */}
          <div className="avatar-placeholder"></div>
          {/* Menu z emailem i opcją zarządzania kontem */}
          {showOptions && (
            <div className="profile-options">
              <p className="user-email">{user}</p>
              <button onClick={handleManageAccount} className="manage-account-button">
                Zarządzaj kontem
              </button>
            </div>
          )}
        </div>
      </header>
      <h1>Witaj w aplikacji, {user?.split("@")[0]}!</h1>
    </div>
  );
}

export default Home;

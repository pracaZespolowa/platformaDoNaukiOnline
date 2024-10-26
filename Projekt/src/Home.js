import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ user, setUser }) { // Dodajemy setUser do propsów
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleManageAccount = () => {
    navigate("/zarzadzaj");
  };

  const handleLogout = () => {
    setUser(null); // Wylogowanie: ustawienie user na null
    navigate("/"); // Przekierowanie na stronę główną
  };

  return (
    <div className="home-container">
      <header>
        <div className="profile" onClick={toggleOptions} role="button" aria-label="Pokaż opcje">
          <div className="avatar-placeholder"></div>
          {showOptions && (
            <div className="profile-options">
              <p className="user-email">{user?.email}</p>
              <button onClick={handleManageAccount} className="manage-account-button">
                Zarządzaj kontem
              </button>
              <button onClick={handleLogout} className="logout-button">
                Wyloguj się
              </button>
            </div>
          )}
        </div>
      </header>
      <h1>Witaj w aplikacji, {user?.firstName}!</h1>
    </div>
  );
}

export default Home;

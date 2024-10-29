import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ user, setUser }) { // Dodajemy setUser do propsów
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  // Sprawdź, czy użytkownik jest już zalogowany
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      navigate("/home"); // Przekieruj do strony głównej, jeśli użytkownik jest już zalogowany
    }
  }, [navigate, setUser]);

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleManageAccount = () => {
    navigate("/zarzadzaj");
  };

  const handleLogout = () => {
    setUser(null); // Wylogowanie: ustawienie user na null
    localStorage.removeItem("user"); // Wyczyść localStorage
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

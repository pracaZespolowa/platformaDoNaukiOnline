import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Zarzadzaj.css";

function Zarzadzaj({ user, setUser }) {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("dane"); // Ustawienie domyślnego formularza na "dane"

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleFormChange = (form) => {
    setActiveForm(form)
  }

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
      <div className="main-content">
        <div className="sidebar">
          <button onClick={() => handleFormChange("dane")} className="sidebar-button">
            Zarządzaj danymi
          </button>
          <button onClick={() => handleFormChange("haslo")} className="sidebar-button">
            Zmień hasło
          </button>
        </div>
        <div className="form-section">
          {activeForm === "dane" ? (
            <form className="form">
              <h2>Zmień dane</h2>
              <p>{user?.email}</p>
              <p>{user?.firstName} {user?.lastName}</p>
              <p>{user?.role}</p>
              <label>
                Imię:
                <input type="text" defaultValue={user?.firstName}></input>
              </label>
              <label>
                Nazwisko:
                <input type="text" defaultValue={user?.lastName}></input>
              </label>
              <button type="submit" className="confirm-button">
                Potwierdź
              </button>
            </form>
          ) : (
            <form className="form">
              <h2>Zmień hasło</h2>
              <label>
                Stare hasło
                <input type="password"></input>
              </label>
              <label>
                Nowe hasło
                <input type="password"></input>
              </label>
              <button type="submit" className="confirm-button">
                Potwierdź
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Zarzadzaj;

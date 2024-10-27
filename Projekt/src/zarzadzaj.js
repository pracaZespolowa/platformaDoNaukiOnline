import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Zarzadzaj.css";

function Zarzadzaj({ user, setUser }) {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("dane"); // Ustawienie domyślnego formularza na "dane"
  const email = user?.email;
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleFormChange = (form) => {
    setActiveForm(form)
  }

  const handlePassChange = async (e) => {
    e.preventDefault();

    if (newPassword.length >= 6) {          // Wymagania złożoności hasła
      if (newPassword === confPassword) {
        try {
          const response = await fetch("/changePassword", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({email, password, newPassword, confPassword}),
          });

          const data = await response.json();

          if (response.ok) {
            setSuccess("Pomyślnie zmieniono hasło");
          } else {
            setError(data.error || "Zmiana hasła nie powiodła się");
          }
        } catch (err) {
          console.error("Błąd:", err);
          setError("Nie udało się zmienić hasła. Spróbuj ponownie");
        }
      } else {
        setError("Hasła nie są takie same");
      }
    } else {
      setError("Hasło musi mieć przynajmniej 6 znaków");
    }
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
            <form className="form" onSubmit={handlePassChange}>
              <h2>Zmień hasło</h2>
              {success && <p className="success-message">{success}</p>}
              <label>
                Stare hasło
                <input 
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                ></input>
              </label>
              <label>
                Nowe hasło
                <input 
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                ></input>
              </label>
              <label>
                Potwierdź hasło
                <input 
                  type="password"
                  id="confPasword"
                  value={confPassword}
                  onChange={(e) => setConfPassword(e.target.value)}
                  required
                ></input>
              </label>
              <button type="submit" className="confirm-button">
                Potwierdź
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Zarzadzaj;

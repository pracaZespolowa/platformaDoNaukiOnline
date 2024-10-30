import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Zarzadzaj.css";

function Zarzadzaj({ user, setUser }) {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("dane"); // Ustawienie domyślnego formularza na "dane"
  const email = user?.email;
  const [role, setRole] = useState(user?.role || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleFormChange = (form) => {
    setActiveForm(form);
    setError("");
    setSuccess("");
  };

  const handlePassChange = async (e) => {
    e.preventDefault();

    if (newPassword.length >= 6) {
      // Wymagania złożoności hasła
      if (newPassword === confPassword) {
        try {
          const response = await fetch("http://localhost:4000/changePassword", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
              newPassword,
              confPassword,
            }),
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

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName) {
      setError("Imię i nazwisko są wymagane.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/updateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstName, lastName, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, firstName, lastName, role });
        setSuccess("Pomyślnie zaktualizowano dane.");
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Błąd:", err);
      setError("Nie udało się zaktualizować danych. Spróbuj ponownie.");
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
          <button
            onClick={() => handleFormChange("dane")}
            className="sidebar-button"
          >
            Zarządzaj danymi
          </button>
          <button
            onClick={() => handleFormChange("haslo")}
            className="sidebar-button"
          >
            Zmień hasło
          </button>
        </div>
        <div className="form-section">
          {activeForm === "dane" ? (
            <form className="form" onSubmit={handleUpdateUser}>
              <h2>Zmień dane</h2>
              <p>{email}</p>
              <p>
                {user?.firstName} {user?.lastName}
              </p>
              <p>{user?.role}</p>
              <label>
                Imię:
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              <label>
                Nazwisko:
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
              <div className="role-selection">
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={() => setRole("student")}
                  />
                  Uczeń
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={() => setRole("teacher")}
                  />
                  Nauczyciel
                </label>
              </div>
              <button type="submit" className="confirm-button">
                Potwierdź
              </button>
              {success && <p className="success-message">{success}</p>}
              {error && <p className="error-message">{error}</p>}
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
                  id="confPassword"
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

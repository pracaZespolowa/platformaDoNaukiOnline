import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Importuj style CSS

function Register({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s\d@]+$/;
    if (email && password.length >= 6 && password === confirmPassword && emailRegex.test(email)) {
      try {
        const response = await fetch("http://localhost:3000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, confirmPassword }),
        });

        const data = await response.json();
        console.log(data); // Sprawdzanie odpowiedzi serwera

        if (response.ok) {
          setUser(email);
          navigate("/home");
        } else {
          setError(data.error || "Rejestracja nie powiodła się.");
        }
      } catch (err) {
        console.error("Błąd podczas rejestracji:", err.message);
        setError(`Nie udało się zarejestrować. Powód: ${err.message}`);
      }
    } else {
      setError("Wszystkie pola są wymagane, hasło musi mieć co najmniej 6 znaków, a hasła muszą się zgadzać.");
    }
  };

  return (
    <div className="register-container">
      <h2>Rejestracja</h2>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Hasło</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword">Potwierdź hasło</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="button" onClick={handleRegister}>Zarejestruj</button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Register;


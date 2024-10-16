// Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Importuj style CSS

function Register({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s\d@]+$/;
    // Sprawdzenie, czy hasło ma co najmniej 6 znaków i czy hasła się zgadzają
    if (email && password.length >= 6 && password === confirmPassword && emailRegex.test(email)) {
      setUser(email); // Przechowuj adres e-mail w stanie App.js
      navigate("/home"); // Przekierowanie na stronę "Home"
    } else {
      setError(
        "Email is required, password must be at least 6 characters long, and passwords must match."
      ); //komentarz
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email" // Używamy typu email dla walidacji
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
        {error && <p>{error}</p>} {/* Wyświetl błąd */}
      </form>
    </div>
  );
}

export default Register;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState(""); // Nowe pole roli
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const apiUrl = "http://localhost:4000";

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s\d@]+$/;
    if (
      email &&
      password.length >= 6 &&
      password === confirmPassword &&
      emailRegex.test(email) &&
      firstName &&
      lastName &&
      role
    ) {
      try {
        const response = await fetch(`${apiUrl}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            role,
          }),
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          // Ustaw użytkownika z odpowiedzi
          setUser({
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: data.user.role,
          });
          navigate("/home");
        } else {
          setError(data.error || "Rejestracja nie powiodła się.");
        }
      } catch (err) {
        console.error("Błąd podczas rejestracji:", err.message);
        setError(`Nie udało się zarejestrować. Powód: ${err.message}`);
      }
    } else {
      setError(
        "Wszystkie pola są wymagane, hasło musi mieć co najmniej 6 znaków, a hasła muszą się zgadzać."
      );
    }
  };

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="register-container">
      <h2>Rejestracja</h2>
      <div>
        <label htmlFor="firstName">Imię</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="lastName">Nazwisko</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
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
      <button type="button" onClick={handleRegister}>
        Zarejestruj
      </button>
      <button type="button" onClick={handleLogin}>
        Logowanie
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Register;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Importuj style CSS

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s\d@]+$/;

    if (email && password.length >= 6 && emailRegex.test(email)) {
      try {
        // Tutaj używamy samego endpointu, bo backend działa na tej samej domenie i porcie.
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          setUser(email); // Przechowuj email w stanie App.js
          navigate("/home"); // Przekierowanie na stronę główną
        } else {
          setError(data.error || "Logowanie nie powiodło się.");
        }
      } catch (err) {
        console.error("Błąd:", err);
        setError("Nie udało się zalogować. Spróbuj ponownie.");
      }
    } else {
      setError("Email jest wymagany, a hasło musi mieć co najmniej 6 znaków.");
    }
  };

  return (
    <div className="login-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Zaloguj</button>
        {error && <p className="error-message">{error}</p>}
        <button type="button" onClick={() => navigate("/register")}>
          Zarejestruj się
        </button>
      </form>
    </div>
  );
}

export default Login;

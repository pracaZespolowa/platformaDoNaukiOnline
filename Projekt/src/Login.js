
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Importuj style CSS

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s\d@]+$/;
    // Sprawdzenie, czy hasło ma co najmniej 6 znaków
    if (email && password.length >= 6 && emailRegex.test(email)) {
      setUser(email); // Przechowuj adres e-mail w stanie App.js
      navigate('/home');
    } else {
      setError('Email is required and password must be at least 6 characters long');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
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
        <button type="submit">Log In</button>
        {error && <p>{error}</p>} {/* Wyświetl błąd */}
        <button onClick="SingIn" >Sign in</button>
      </form>
    </div>
  );
}

export default Login;

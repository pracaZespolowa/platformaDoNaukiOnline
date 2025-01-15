import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router, // Zmieniono na HashRouter
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Zarzadzaj from "./zarzadzaj"; // Importuj nowy komponent
import Reservations from "./reservations";
import Chat from "./Chat";
import Reviews from "./Reviews";

function App() {
  const [user, setUser] = useState(() => {
    // Sprawdź localStorage i załaduj użytkownika, jeśli istnieje
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // Ustawienie lokalnego użytkownika w localStorage, jeśli istnieje
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Login setUser={setUser} />} // Przekazujemy funkcję do ustawiania użytkownika
        />
        <Route
          path="/register"
          element={<Register setUser={setUser} />} // Dodaj trasę do rejestracji
        />
        <Route
          path="/home"
          element={
            user ? <Home user={user} setUser={setUser} /> : <Navigate to="/" />
          } // Przekazujemy setUser do Home
        />
        <Route
          path="/zarzadzaj"
          element={
            user ? (
              <Zarzadzaj user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" />
            )
          } // Nowa trasa do zarządzania kontem z przekazanym user
        />
        <Route
          path="/reservations"
          element={
            user ? (
              <Reservations user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" />
            )
          } // Trasa do zarządzania rezerwacjami z przekazanym user
        />
        <Route path="/chat" element={<Chat user={user} />} />
        <Route path="/reviews/:teacherId" element={<Reviews />} />
      </Routes>
    </Router>
  );
}

export default App;

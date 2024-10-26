import React, { useState } from "react";
import {
  HashRouter as Router, // Zmieniono na HashRouter
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Zarzadzaj from "./zarzadzaj"; // Importuj nowy komponent

function App() {
  const [user, setUser] = useState(null); // Przechowujemy zalogowanego użytkownika

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
          element={user ? <Home user={user} setUser={setUser} /> : <Navigate to="/" />} // Przekazujemy setUser do Home
        />
        <Route
          path="/zarzadzaj"
          element={user ? <Zarzadzaj user={user} setUser={setUser} /> : <Navigate to="/" />} // Nowa trasa do zarządzania kontem z przekazanym user
        />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register"; // Importuj komponent rejestracji
import Home from "./Home";

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
          element={user ? <Home user={user} /> : <Navigate to="/" />} // Sprawdzamy, czy użytkownik jest zalogowany
        />
      </Routes>
    </Router>
  );
}

export default App;

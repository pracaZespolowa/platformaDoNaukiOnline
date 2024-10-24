import React, { useState } from "react";
import {
  BrowserRouter as Router,
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
          element={user ? <Home user={user} /> : <Navigate to="/" />} // Sprawdzamy, czy użytkownik jest zalogowany
        />
        <Route
          path="/zarzadzaj"
          element={user ? <Zarzadzaj /> : <Navigate to="/" />} // Nowa trasa do zarządzania kontem
        />
      </Routes>
    </Router>
  );
}

export default App;

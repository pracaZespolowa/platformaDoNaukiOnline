
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import axios from 'axios';
import Login from './Login';
import Home from './Home';

// const App = () => {
//   const [users, setUsers] = useState([]);
//   // 
//   useEffect(() => {
//       // Zapytanie do serwera
//       axios.get('http://localhost:5000/api/users')
//           .then(response => {
//               setUsers(response.data); // Zapisujemy dane do stanu
//           })
//           .catch(error => {
//               console.error('Błąd podczas pobierania danych: ', error);
//           });
//   }, []);

//   return (
//       <div>
//           <h1>Lista użytkowników</h1>
//           <ul>
//               {users.map(user => (
//                   <li key={user.id}>{user.name} - {user.email}</li>
//               ))}
//           </ul>
//       </div>
//   );
// }


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
          path="/home"
          element={user ? <Home user={user} /> : <Navigate to="/" />} // Sprawdzamy, czy użytkownik jest zalogowany
        />
      </Routes>
    </Router>
  );
  
}

export default App;

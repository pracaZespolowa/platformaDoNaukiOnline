//server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
const PORT = 3000;


// Middleware
app.use(cors());
app.use(express.json()); // Do obsługi danych w formacie JSON

// Połączenie z bazą MySQL
const db = mysql.createConnection({
    host: 'MaciekMojsa',    // lub adres serwera MySQL
    user: 'Projekt1',         // użytkownik bazy danych MySQL
    password: 'admin', // hasło do bazy danych
    database: 'projekt',// nazwa bazy danych
    
});

db.connect((err) => {
    if (err) {
        console.error('Błąd połączenia z MySQL: ', err);
        return;
    }
    console.log('Połączono z bazą MySQL');
});


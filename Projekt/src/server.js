const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "/../projekt"))); // Ścieżka do statycznych plików

const uri = "mongodb+srv://tomekczyz001:PSKFTfk8sYUWYBva@cluster0.b98di.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/";
const dbName = "userAuthDB";
const collectionName = "users";
const port = 3000;

// Funkcja do połączenia z bazą danych
async function connectToDb() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Połączono z bazą danych");
    return client.db(dbName);
  } catch (err) {
    console.error("Błąd połączenia z bazą danych:", err);
  }
}

// Endpoint do rejestracji
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  console.log("Rejestracja:", { email, password, confirmPassword });

  // Sprawdzenie, czy pola są wypełnione
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  // Sprawdzenie, czy hasła się zgadzają
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Hasła nie pasują." });
  }

  try {
    const db = await connectToDb();
    const usersCollection = db.collection(collectionName);

    // Sprawdzenie, czy użytkownik już istnieje
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Użytkownik już istnieje." });
    }

    // Haszowanie hasła i zapis do bazy
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword };

    await usersCollection.insertOne(newUser);
    console.log("Użytkownik zarejestrowany:", newUser);
    res.status(201).json({ message: "Użytkownik zarejestrowany pomyślnie." });
  } catch (err) {
    console.error("Błąd podczas rejestracji:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do logowania
// Endpoint do logowania
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane." });
  }

  try {
    const db = await connectToDb();
    const usersCollection = db.collection(collectionName);

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Nieprawidłowe hasło." });
    }

    res.status(200).json({ message: "Użytkownik zalogowany pomyślnie." });
  } catch (err) {
    console.error("Błąd podczas logowania:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
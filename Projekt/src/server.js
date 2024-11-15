const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const path = require("path");
const { error } = require("console");



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
  const { email, password, confirmPassword, firstName, lastName, role } = req.body;

  console.log("Rejestracja:", { email, password, confirmPassword, firstName, lastName, role });

  // Sprawdzenie, czy pola są wypełnione
  if (!email || !password || !confirmPassword || !firstName || !lastName || !role) {
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
    const newUser = { email, password: hashedPassword, firstName, lastName, role };

    await usersCollection.insertOne(newUser);
    console.log("Użytkownik zarejestrowany:", newUser);
    
    // Zwróć dane użytkownika
    res.status(201).json({ 
      message: "Użytkownik zarejestrowany pomyślnie.",
      user: { email: email, firstName: firstName, lastName: lastName, role: role } // Przekazujemy potrzebne dane
     });
  } catch (err) {
    console.error("Błąd podczas rejestracji:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});


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

    // Zwróć dane użytkownika
    res.status(200).json({ 
      message: "Użytkownik zalogowany pomyślnie.", 
      user: { email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } // Przekazujemy potrzebne dane
    });
  } catch (err) {
    console.error("Błąd podczas logowania:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do zmiany hasła
app.post("/changePassword", async (req, res) => {
  const { email, password, newPassword, confPassword } = req.body;

  // Sprawdzenie czy email został pomyślnie przesłany
  if (!email) {
    return res.status(400).json({error: "Błąd podczas pobierania emaila."});
  }

  // Sprawdzenie czy wszstkie pola są wypełnione
  if(!password || !newPassword || !confPassword) {
    return res.status(400).json({error: "Wszystkie pola muszą być wypełnione."});
  }

  // Sprawdzenie czy oba hasła są takie same
  if(newPassword != confPassword) {
    return res.status(400).json({error: "Hasła sie są takie same."});
  }

  try {
    const db = await connectToDb();
    const usersCollection = db.collection(collectionName);

    // Szukanie użytkownika
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony." });
    }

    // Sprawdzanie poprawności hasła
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Nieprawidłowe hasło." });
    }

    // Haszowanie nowego hasła i aktualizacja bazy
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const filter = { email: email };
    const update = { $set: { password: hashedNewPassword } };
    usersCollection.updateOne(filter, update);

    res.status(200).json({ 
      message: "Pomyślnie zmieniono hasło."
    });
  } catch (err) {
    console.error("Błąd podczas zmiany hasła:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});


// Endpoint do pobierania ogłoszeń
app.get("/announcements", cors(corsOptions), async (req, res) => {
  try {
    const db = await connectToDb();
    const announcementsCollection = db.collection(announcementsCollectionName);

    // Pobierz wszystkie ogłoszenia z kolekcji
    const announcements = await announcementsCollection.find({}).toArray();

    res.status(200).json({ announcements });
  } catch (err) {
    console.error("Błąd podczas pobierania ogłoszeń:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do dodawania nowego ogłoszenia
app.post("/announcements", cors(corsOptions), async (req, res) => {
  const { title, content, date, teacher_name, subject } = req.body;

  // Walidacja danych
  if (!title || !content || !date || !teacher_name || !subject) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  try {
    const db = await connectToDb();
    const announcementsCollection = db.collection("announcements");

    const newAnnouncement = {
      title,
      content,
      date,
      teacher_name,
      subject,
    };

    await announcementsCollection.insertOne(newAnnouncement);
    res.status(201).json({ message: "Ogłoszenie dodane pomyślnie." });
  } catch (err) {
    console.error("Błąd podczas dodawania ogłoszenia:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});


// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
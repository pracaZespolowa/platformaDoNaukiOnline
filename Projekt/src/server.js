const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const path = require("path");
const { error } = require("console");
const cors = require("cors");
const { ObjectId } = require("mongodb");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "/../projekt")));

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Czy zezwalać na przesyłanie ciasteczek
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

const uri =
  "mongodb+srv://tomekczyz001:PSKFTfk8sYUWYBva@cluster0.b98di.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/";
const dbName = "userAuthDB";
const collectionName = "users";
const announcementsCollectionName = "announcements";
const reservationsCollectionName = "reservations";
const port = 4000;

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
app.post("/register", cors(corsOptions), async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, role } =
    req.body;

  console.log("Rejestracja:", {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    role,
  });

  // Sprawdzenie, czy pola są wypełnione
  if (
    !email ||
    !password ||
    !confirmPassword ||
    !firstName ||
    !lastName ||
    !role
  ) {
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
    const newUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    };

    await usersCollection.insertOne(newUser);
    console.log("Użytkownik zarejestrowany:", newUser);

    // Zwróć dane użytkownika
    res.status(201).json({
      message: "Użytkownik zarejestrowany pomyślnie.",
      user: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role,
      }, // Przekazujemy potrzebne dane
    });
  } catch (err) {
    console.error("Błąd podczas rejestracji:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do logowania
app.post("/login", cors(corsOptions), async (req, res) => {
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
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }, // Przekazujemy potrzebne dane
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
    return res.status(400).json({ error: "Błąd podczas pobierania emaila." });
  }

  // Sprawdzenie czy wszstkie pola są wypełnione
  if (!password || !newPassword || !confPassword) {
    return res
      .status(400)
      .json({ error: "Wszystkie pola muszą być wypełnione." });
  }

  // Sprawdzenie czy oba hasła są takie same
  if (newPassword != confPassword) {
    return res.status(400).json({ error: "Hasła sie są takie same." });
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
      message: "Pomyślnie zmieniono hasło.",
    });
  } catch (err) {
    console.error("Błąd podczas zmiany hasła:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do aktualizacji danych użytkownika
app.post("/updateUser", cors(corsOptions), async (req, res) => {
  const { email, firstName, lastName, role } = req.body;

  if (!email || !firstName || !lastName || !role) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  try {
    const db = await connectToDb();
    const usersCollection = db.collection(collectionName);

    // Znajdź użytkownika po emailu
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony." });
    }

    // Aktualizacja danych w bazie
    const filter = { email: email };
    const update = { $set: { firstName, lastName, role } };
    await usersCollection.updateOne(filter, update);

    res.status(200).json({
      message: "Pomyślnie zaktualizowano dane użytkownika.",
    });
  } catch (err) {
    console.error("Błąd podczas aktualizacji danych:", err);
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
    const announcementsCollection = db.collection(announcementsCollectionName);

    // Tworzenie nowego ogłoszenia
    const newAnnouncement = {
      title,
      content,
      date,
      teacher_name,
      subject,
    };

    const result = await announcementsCollection.insertOne(newAnnouncement);
    const addedAnnouncement = await announcementsCollection.findOne({
      _id: result.insertedId,
    });

    console.log("Dodano nowe ogłoszenie:", addedAnnouncement);

    res.status(201).json({
      message: "Ogłoszenie dodane pomyślnie.",
      announcement: addedAnnouncement,
    });
  } catch (err) {
    console.error("Błąd podczas dodawania ogłoszenia:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

app.post("/reservations", cors(corsOptions), async (req, res) => {
  const { announcementId, email, date, subject, time } = req.body;

  if (!announcementId || !email || !date || !subject || !time) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane!" });
  }

  try {
    const db = await connectToDb();
    const reservationsCollection = db.collection(reservationsCollectionName);
    //łaczenie daty i godziny
    const fullDateTime = `${date}T${time}:00`;

    // Tworzenie nowej rezerwacji
    const newReservation = {
      announcementId,
      email,
      date: fullDateTime,
      subject,
    };

    const result = await reservationsCollection.insertOne(newReservation);
    const addedReservation = await reservationsCollection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      message: "Rezerwacje dodano pomyślnie.",
      reservation: addedReservation,
    });
  } catch (err) {
    console.log("Błąd podczas dodawania ogłoszenia", err);
    res.status(505).json({ error: "Wewnętrzny błąd serwera" });
  }
});

// Endpoint do pobierania rezerwacji dla użytkownika
app.get("/reservations/user", cors(corsOptions), async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email jest wymagany." });
  }

  try {
    const db = await connectToDb();
    const reservationsCollection = db.collection(reservationsCollectionName);

    // Szukamy wszystkich rezerwacji dla danego użytkownika
    const reservations = await reservationsCollection.find({ email }).toArray();

    if (reservations.length === 0) {
      return res
        .status(404)
        .json({ error: "Brak rezerwacji dla tego użytkownika." });
    }

    // Zwracamy znalezione rezerwacje
    res.status(200).json({ reservations });
  } catch (err) {
    console.error("Błąd podczas pobierania rezerwacji:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});

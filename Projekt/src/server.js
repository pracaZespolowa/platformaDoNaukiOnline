const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const path = require("path");
const { error } = require("console");
const cors = require("cors");
const { ObjectId } = require("mongodb");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "/../projekt"))); // Ścieżka do statycznych plików

const corsOptions = {
  origin: "http://localhost:3000", // Zmień na URL swojej aplikacji front-end
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

// Endpoint do rezerwacji ogłoszenia
app.post("/reserve", cors(corsOptions), async (req, res) => {
  // Definicja endpointu POST "/reserve". Funkcja asynchroniczna, która przyjmuje request i response.
  console.log("Odebrane dane:", req.body); // Zalogowanie otrzymanych danych w żądaniu (request body), które będą zawierały dane do rezerwacji.

  // Destrukturyzacja danych z request body: announcementId, studentId, date
  const { announcementId, studentId, date } = req.body;
  console.log(req.body);

  // Sprawdzenie, czy wszystkie wymagane dane są przesłane
  if (!announcementId || !studentId || !date) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." }); // Jeśli brak jakiegokolwiek z wymaganych pól, zwróć błąd 400 (Bad Request).
  }

  // Sprawdzenie, czy announcementId jest poprawne (czy jest prawidłowym ObjectId)
  if (!ObjectId.isValid(announcementId)) {
    return res
      .status(400) // Zwróć błąd 400 (Bad Request)
      .json({ error: "Nieprawidłowy identyfikator ogłoszenia." }); // Informacja, że podany identyfikator ogłoszenia jest niepoprawny.
  }

  try {
    // Połączenie z bazą danych
    const db = await connectToDb(); // Asynchroniczne połączenie z bazą danych
    const announcementsCollection = db.collection(announcementsCollectionName); // Uzyskanie dostępu do kolekcji ogłoszeń w bazie danych

    // Sprawdzenie dostępności ogłoszenia po ID
    const announcement = await announcementsCollection.findOne({
      _id: new ObjectId(announcementId), // Przekonwertowanie stringa announcementId na obiekt ObjectId, ponieważ MongoDB przechowuje identyfikatory w tym formacie.
    });

    if (!announcement) {
      return res.status(404).json({ error: "Ogłoszenie nie znaleziono." }); // Jeśli ogłoszenie o podanym ID nie istnieje, zwróć błąd 404 (Not Found)
    }

    // Sprawdzenie, czy termin rezerwacji jest już zajęty
    const isDateTaken =
      announcement.reservations && // Sprawdź, czy istnieją rezerwacje w ogłoszeniu
      announcement.reservations.some(
        // Przejdź przez wszystkie rezerwacje
        (reservation) => reservation.date === date // Sprawdź, czy data rezerwacji już istnieje
      );

    if (isDateTaken) {
      return res.status(409).json({ error: "Termin jest już zajęty." }); // Jeśli termin już jest zajęty, zwróć błąd 409 (Conflict)
    }

    // Dodanie nowej rezerwacji
    const newReservation = { studentId, date }; // Tworzenie obiektu nowej rezerwacji

    await announcementsCollection.updateOne(
      // Asynchroniczne zaktualizowanie ogłoszenia w bazie danych
      { _id: new ObjectId(announcementId) }, // Wyszukiwanie ogłoszenia po ID
      { $push: { reservations: newReservation } } // Dodanie nowej rezerwacji do tablicy reservations w dokumencie ogłoszenia
    );

    // Powiadomienie o dokonanej rezerwacji
    console.log("Rezerwacja dokonana:", newReservation); // Zalogowanie nowej rezerwacji w konsoli

    // Zwrócenie odpowiedzi o pomyślnym dokonaniu rezerwacji
    res.status(201).json({
      message: "Rezerwacja dokonana pomyślnie.", // Informacja o sukcesie
      reservation: newReservation, // Zwrócenie obiektu rezerwacji
    });
  } catch (err) {
    // Obsługa błędów, jeśli coś poszło nie tak
    console.error("Błąd podczas rezerwacji ogłoszenia:", err); // Zalogowanie błędu w konsoli
    res.status(500).json({ error: "Wewnętrzny błąd serwera." }); // Zwrócenie błędu 500 (Internal Server Error) w przypadku problemu z serwerem
  }
});

// Endpoint do pobierania rezerwacji użytkownika
app.get("/reservations/:userId", cors(corsOptions), async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Brak ID użytkownika." });
  }

  try {
    // Połączenie z bazą danych
    const db = await connectToDb();
    const announcementsCollection = db.collection(announcementsCollectionName);

    // Pobranie rezerwacji, w których studentId odpowiada userId
    const reservations = await announcementsCollection
      .aggregate([
        { $unwind: "$reservations" }, // Rozdzielenie tablicy reservations
        { $match: { "reservations.studentId": userId } }, // Dopasowanie do użytkownika
        {
          $project: {
            _id: 0,
            title: 1,
            date: "$reservations.date",
          },
        },
      ])
      .toArray();

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

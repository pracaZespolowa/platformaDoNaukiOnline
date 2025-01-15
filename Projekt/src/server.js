const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const path = require("path");
const { error } = require("console");
const cors = require("cors");

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
const notificationsCollectionName = "notifications";
const reservationsCollectionName = "reservations";
const reviewsCollectionName = "reviews";
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
  const {
    title,
    content,
    date,
    teacher_name,
    teacher_email,
    subject,
    terms = [],
  } = req.body;

  // Dodanie pustej tablicy, jeśli `terms` jest undefined
  const validTerms = Array.isArray(terms) ? terms : [];

  // Walidacja danych - teraz sprawdza, czy nie ma dodanych terminów
  if (!terms || terms.length === 0) {
    return res
      .status(400)
      .json({ error: "Przynajmniej jeden termin jest wymagany." });
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
      teacher_email,
      subject,
      terms: validTerms, // Użycie domyślnej wartości
    };
    console.log("Dodawane ogłoszenie:", newAnnouncement);

    const result = await announcementsCollection.insertOne(newAnnouncement);
    const addedAnnouncement = await announcementsCollection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      message: "Ogłoszenie dodane pomyślnie.",
      announcement: addedAnnouncement,
    });
  } catch (err) {
    console.error("Błąd podczas dodawania ogłoszenia:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

const { ObjectId } = require("mongodb");
const { create } = require("domain");

app.post("/announcements/:id/reserve", async (req, res) => {
  const { id } = req.params; // ID ogłoszenia z URL
  const { termIndex, email } = req.body; // Indeks rezerwowanego terminu z treści żądania

  // Sprawdzenie, czy termIndex został przekazany
  if (typeof termIndex === "undefined") {
    return res.status(400).json({ error: "Brakuje termIndex w żądaniu" });
  }

  try {
    const db = await connectToDb();
    const announcementsCollection = db.collection(announcementsCollectionName);
    const reservationsCollection = db.collection(reservationsCollectionName);

    // Konwersja id na ObjectId
    const objectId = new ObjectId(id);

    // Znajdź ogłoszenie
    const announcement = await announcementsCollection.findOne({
      _id: objectId,
    });

    // Sprawdź, czy ogłoszenie istnieje
    if (!announcement) {
      return res.status(404).json({ error: "Ogłoszenie nie znalezione" });
    }

    // Sprawdź, czy podany indeks terminu jest prawidłowy
    if (!announcement.terms || !announcement.terms[termIndex]) {
      return res.status(400).json({ error: "Nieprawidłowy indeks terminu" });
    }

    const reservedTerm = announcement.terms[termIndex];

    // Usuń rezerwowany termin
    const updatedTerms = announcement.terms.filter(
      (_, index) => index !== termIndex
    );

    // Zaktualizuj ogłoszenie w bazie danych
    await announcementsCollection.updateOne(
      { _id: objectId },
      { $set: { terms: updatedTerms } }
    );

    const teacher_email = announcement.teacher_email;

    // Utwórz nowy rekord w kolekcji "reservations"
    const reservation = {
      announcementId: id,
      email: email,
      subject: announcement.subject,
      teacher_name: announcement.teacher_name,
      teacher_email: teacher_email,
      date: reservedTerm,
      accepted: false,
      createdAt: new Date(),
    };

    await reservationsCollection.insertOne(reservation);

    const data = { updatedTerms, reservation, teacher_email };

    console.log("teacher email", teacher_email);

    // Zwróć odpowiedź z sukcesem i zaktualizowaną listą terminów
    res.status(200).json({
      message: "Rezerwacja zakończona sukcesem",
      updatedTerms,
      reservation,
      teacher_email,
    });
  } catch (error) {
    console.error("Błąd podczas rezerwacji:", error);
    // Obsłuż błąd wewnętrzny serwera
    res.status(500).json({ error: "Wewnętrzny błąd serwera" });
  }
});

// Endpoint do pobierania powiadomień dla danego użytkownika
app.get(
  "/notifications/user/:userEmail",
  cors(corsOptions),
  async (req, res) => {
    const { userEmail } = req.params;

    if (!userEmail) {
      return res
        .status(400)
        .json({ error: "Brak identyfikatora użytkownika." });
    }

    try {
      const db = await connectToDb();
      const notificationsCollection = db.collection(
        notificationsCollectionName
      );

      const notifications = await notificationsCollection
        .find({ userEmail: userEmail })
        .toArray();

      if (notifications.length === 0) {
        return res
          .status(404)
          .json({ error: "Brak powiadomień dla tego użytkownika." });
      }

      res.status(200).json({ notifications });
    } catch (err) {
      console.error("Błąd podczas pobierania powiadomień:", err);
      res.status(500).json({ error: "Wewnętrzny błąd serwera" });
    }
  }
);

// Endpoint do dodawania nowego powiadomienia
app.post("/notifications", cors(corsOptions), async (req, res) => {
  const { title, message, date, userEmail } = req.body;

  if (!title || !message || !date || !userEmail) {
    return res.status(400).json({
      error: "Wszystkie pola (title, message, date, userEmail) są wymagane.",
    });
  }

  try {
    const db = await connectToDb();
    const notificationsCollection = db.collection(notificationsCollectionName);

    const newNotification = {
      title,
      message,
      date,
      userEmail,
    };

    await notificationsCollection.insertOne(newNotification);

    console.log("Dodawane powiadomienie:", newNotification);

    res.status(201).json({
      message: "Powiadomienie dodane pomyślnie.",
      newNotification,
    });
  } catch (err) {
    console.error("Błąd podczas dodawania powiadomienia:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera" });
  }
});

// Endpoint do usuwania powiadomienia po ID
app.delete(
  "/notifications/delete/:notificationId",
  cors(corsOptions),
  async (req, res) => {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res
        .status(400)
        .json({ error: "Brak identyfikatora powiadomienia." });
    }

    try {
      const db = await connectToDb();
      const notificationsCollection = db.collection(
        notificationsCollectionName
      );

      const result = await notificationsCollection.deleteOne({
        _id: new ObjectId(notificationId),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Powiadomienie nie znalezione" });
      }

      res.status(200).json({ message: "Powiadomienie usunięte pomyślnie" });
    } catch (err) {
      console.error("Błąd podczas usuwania powiadomienia:", err);
      res.status(500).json({ error: "Wewnętrzny błąd serwera" });
    }
  }
);

// Endpoint do pobierania rezerwacji dla danego użytkownika
app.get(
  "/reservations/user/:userEmail",
  cors(corsOptions),
  async (req, res) => {
    const { userEmail } = req.params;

    if (!userEmail) {
      return res
        .status(400)
        .json({ error: "Brak identyfikatora użytkownika." });
    }

    try {
      const db = await connectToDb();
      const reservationsCollection = db.collection(reservationsCollectionName);

      const reservations = await reservationsCollection
        .find({ email: userEmail })
        .toArray();

      if (reservations.length === 0) {
        return res
          .status(404)
          .json({ error: "Brak rezerwacji dla tego użytkownika." });
      }

      res.status(200).json({ reservations });
    } catch (err) {
      console.error("Błąd podczas pobierania rezerwacji:", err);
      res.status(500).json({ error: "Wewnętrzny błąd serwera" });
    }
  }
);

// Endpoint do pobierania rezerwacji dla danego nauczyciela
app.get("/teachers", cors(corsOptions), async (req, res) => {
  try {
    const db = await connectToDb();
    const teachersCollection = db.collection("reservations");

    //pobierz wszytkich nauczycieli
    const teachers = await teachersCollection.find({}).toArray();

    console.log(teachers, "nauczyciele");

    res.status(200).json({ teachers });
  } catch (err) {
    console.error("Błąd podczas pobierania nauczycieli:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do akceptacji rezerwacji
app.get(
  "/reservation/accept/:reservationId",
  cors(corsOptions),
  async (req, res) => {
    const { reservationId } = req.params;

    if (!reservationId) {
      return res.status(400).json({ error: "Brak id rezerwacji." });
    }

    try {
      const db = await connectToDb();
      const reservationsCollection = db.collection(reservationsCollectionName);

      // Konwersja id na ObjectId
      const objectId = new ObjectId(reservationId);

      // Sprawdź, czy rezerwacja istnieje
      const reservation = await reservationsCollection.findOne({
        _id: objectId,
      });
      if (!reservation) {
        return res.status(404).json({ error: "Rezerwacja nie znaleziona" });
      }

      // Sprawdzenie, czy rezerwacja nie została już zaakceptowana
      if (reservation.accepted) {
        return res.status(200).json({
          message: "Rezerwacja została już zaakceptowana.",
          reservation,
        });
      }

      // Zaktualizuj rezerwacje w bazie danych
      const result = await reservationsCollection.updateOne(
        { _id: objectId },
        { $set: { accepted: true } }
      );

      if (result.matchedCount === 0) {
        return res
          .status(500)
          .json({ error: "Nie udało się zaktualizować rezerwacji." });
      }

      // Sprawdzenie, czy aktualizacja się powiodła
      if (result.matchedCount === 0) {
        return res
          .status(500)
          .json({ error: "Nie udało się zaktualizować rezerwacji." });
      }

      // Pobranie zaktualizowanej rezerwacji
      const updatedReservation = await reservationsCollection.findOne({
        _id: objectId,
      });

      const userEmail = reservation.email;
      const data = { updatedReservation, userEmail };

      res.status(200).json({
        message: "Rezerwacja została zaakceptowana.",
        userEmail,
        updatedReservation,
      });
    } catch (err) {
      console.error("Błąd podczas pobierania rezerwacji:", err);
      res.status(500).json({ error: "Wewnętrzny błąd serwera" });
    }
  }
);

// Endpoint do odrzucania rezerwacji
app.delete(
  "/reservation/decline/:reservationId",
  cors(corsOptions),
  async (req, res) => {
    const { reservationId } = req.params;

    // Sprawdzenie, czy ID zostało podane
    if (!reservationId) {
      return res.status(400).json({ error: "Brak id rezerwacji." });
    }

    try {
      const db = await connectToDb();
      const reservationsCollection = db.collection(reservationsCollectionName);
      const announcementsCollection = db.collection(
        announcementsCollectionName
      );

      // Walidacja ObjectId
      let objectId;
      try {
        objectId = new ObjectId(reservationId);
      } catch (error) {
        return res.status(400).json({ error: "Nieprawidłowe ID rezerwacji." });
      }

      // Sprawdzenie, czy rezerwacja istnieje
      const reservation = await reservationsCollection.findOne({
        _id: objectId,
      });
      if (!reservation) {
        return res.status(404).json({ error: "Rezerwacja nie znaleziona." });
      }

      // Usunięcie rezerwacji z bazy danych
      const result = await reservationsCollection.deleteOne({ _id: objectId });

      // Sprawdzenie, czy usunięcie się powiodło
      if (result.deletedCount === 0) {
        return res
          .status(500)
          .json({ error: "Nie udało się usunąć rezerwacji." });
      }

      // Ponowne dodawanie terminu do ogłoszenia
      if (reservation.date) {
        const objectIdAnnouncement = new ObjectId(reservation.announcementId);
        const term = new Object(reservation.date);
        const pushResult = await announcementsCollection.updateOne(
          { _id: objectIdAnnouncement }, // Zakładając, że ogłoszenie ma ID rezerwacji
          { $push: { terms: term } } // Dodanie daty rezerwacji do tablicy terms
        );
        console.log("push result", pushResult);
      }

      const userEmail = reservation.email;

      res.status(200).json({
        message: "Rezerwacja została odrzucona i usunięta z bazy danych.",
        userEmail,
        reservation,
      });
    } catch (err) {
      console.error("Błąd podczas odrzucania rezerwacji:", err);
      res.status(500).json({ error: "Wewnętrzny błąd serwera." });
    }
  }
);

app.get("/chat/teacher", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    console.log("Brakuje email w zapytaniu.");
    return res.status(400).json({ error: "Email użytkownika jest wymagany." });
  }

  try {
    const db = await connectToDb();
    const reservationsCollection = db.collection(reservationsCollectionName);

    const reservations = await reservationsCollection
      .find({ email: email.trim(), accepted: true })
      .toArray();

    console.log("Znalezione rezerwacje:", reservations);

    if (!reservations || reservations.length === 0) {
      return res
        .status(404)
        .json({ error: "Brak zaakceptowanych rezerwacji." });
    }

    const teachers = reservations.map((reservation) => ({
      name: reservation.teacher_name,
      email: reservation.teacher_email,
      subject: reservation.subject,
    }));

    res.status(200).json({ teachers });
  } catch (err) {
    console.error("Błąd podczas pobierania nauczycieli:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

app.get("/chat/students", async (req, res) => {
  const { teacherEmail } = req.query;
  if (!teacherEmail) {
    console.log("Brakuje teacheEmail w zapytaniu");
    return res.status(400).json({ error: "Email nauczyciela jest wymagany" });
  }

  try {
    const db = await connectToDb();
    const reservationsCollection = db.collection(reservationsCollectionName);

    //szukamy zaakceptowanych rezerwacji
    const reservations = await reservationsCollection
      .find({ teacher_email: teacherEmail.trim(), accepted: true })
      .toArray();

    console.log("znalezione rezerwacje przez nauczycieli", reservations);

    if (!reservations || reservations.length == 0) {
      return res.status(404).json({
        error: "Brak zaakceptowanych rezerwacji dla tego nauczyciela",
      });
    }

    const students = reservations.map((reservation) => ({
      email: reservation.email, // Email studenta
      subject: reservation.subject, // Przedmiot zarezerwowany przez studenta
    }));

    res.status(200).json({ students });
  } catch (err) {
    console.error("błąd catch", err);
  }
});

app.get("/chat/messages", async (req, res) => {
  const { teacherEmail, userEmail } = req.query;

  try {
    const db = await connectToDb();
    const messagesCollection = db.collection("messages");

    const messages = await messagesCollection
      .find({
        $or: [
          { senderEmail: userEmail, receiverEmail: teacherEmail },
          { senderEmail: teacherEmail, receiverEmail: userEmail },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Błąd pobierania wiadomości:", err);
    res.status(500).json({ error: "Nie udało się pobrać wiadomości." });
  }
});

app.post("/chat/send", async (req, res) => {
  const { senderEmail, receiverEmail, content } = req.body;

  try {
    const db = await connectToDb();
    const messagesCollection = db.collection("messages");

    const newMessage = {
      senderEmail,
      receiverEmail,
      content,
      timestamp: new Date(),
    };

    await messagesCollection.insertOne(newMessage);

    res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error("Błąd wysyłania wiadomości:", err);
    res.status(500).json({ error: "Nie udało się wysłać wiadomości." });
  }
});

// Endpoint do pobierania opinii
app.get("/reviews/:teacherId", async (req, res) => {
  const { teacherId } = req.params;

  try {
    const db = await connectToDb();
    const reviewsCollection = db.collection(reviewsCollectionName);
    const reviews = await reviewsCollection.find({ teacherId }).toArray();

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Błąd podczas pobierania opinii:", err);
    res.status(500).json({ error: "Nie udało się pobrać opinii." });
  }
});

// Endpoint do dodawania opinii
app.post("/reviews/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  const { review, studentEmail, rating } = req.body;
  console.log("Otrzymane dane:", { review, studentEmail, rating });

  try {
    const db = await connectToDb();
    const reviewsCollection = db.collection(reviewsCollectionName);

    const newReview = {
      teacherId,
      review,
      studentEmail,
      timestamp: new Date(),
      rating,
    };

    await reviewsCollection.insertOne(newReview);

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Błąd podczas dodawania opinii:", err);
    res.status(500).json({ error: "Nie udało się dodać opinii." });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});

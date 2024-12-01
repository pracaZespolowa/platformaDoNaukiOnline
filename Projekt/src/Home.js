import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ user, setUser }) {
  const [showOptions, setShowOptions] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("wszystkie");
  const [showNotifications, setShowNotifications] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    date: "",
    teacher_name: user?.firstName + " " + user?.lastName,
    subject: "",
  });
  const subjects = [...new Set(announcements.map((item) => item.subject))];

  const filteredAnnouncements =
    selectedSubject === "wszystkie"
      ? announcements
      : announcements.filter(
          (announcement) => announcement.subject === selectedSubject
        );
  const navigate = useNavigate();

  const [reservation, setReservation] = useState({
    announcementId: "",
    email: user?.id || "",
    date: "",
    time: "",
    subject: "",
  });

  function formatDateToCustom(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Miesiące są liczone od 0, więc dodajemy 1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  const formattedDate = formatDateToCustom("2024-12-01 16:44:00");
  console.log(formattedDate); // "2024-12-01 16:44"

  const [showReservationForm, setShowReservationForm] = useState(false);

  const openReservationForm = (announcementId) => {
    if (!user) {
      alert("Musisz być zalogowany, aby dokonać rezerwacji.");
      return;
    }

    setReservation((prev) => ({
      ...prev,
      announcementId,
      email: user.email,
    }));

    setShowReservationForm(true);
  };

  const closeReservationForm = () => {
    setShowReservationForm(false);
    setReservation({
      announcementId: "",
      email: user?.email || "",
      date: "",
      time: "",
    });
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/reservations/user?email=${user.email}`
      );
      if (response.ok) {
        const data = await response.json();
        setReservation(data.reservations || []);
      } else {
        console.error("Błąd podczas pobierania rezerwacji");
      }
    } catch (err) {
      console.error("Błąd:", err);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications) {
      fetchReservations(); // Pobierz rezerwacje tylko przy otwarciu
    }
  };

  const handleAddReservation = async (e) => {
    e.preventDefault();

    // Dodanie przedmiotu do rezerwacji
    const announcement = announcements.find(
      (ann) => ann.id === reservation.announcementId
    );

    const reservationWithSubject = {
      ...reservation,
      subject: announcement?.subject || "", // Dodajemy przedmiot do rezerwacji
    };

    try {
      const response = await fetch("http://localhost:4000/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationWithSubject),
      });

      if (response.ok) {
        await fetchReservations(); // Aktualizuj rezerwacje
        alert("Rezerwację dodano pomyślnie!");
        closeReservationForm();
      } else {
        const errorData = await response.json();
        console.error("Błąd podczas dodawania rezerwacji:", errorData.error);
        alert("Błąd podczas dodawania rezerwacji: " + errorData.error);
      }
    } catch (err) {
      console.error("Błąd:", err);
      alert("Błąd podczas wysyłania danych: " + err.message);
    }
  };

  useEffect(() => {
    console.log("User data in effect:", user);
  }, [user]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setReservation((prev) => ({
        ...prev,
        email: parsedUser.email,
      }));
      navigate("/home");
    }
  }, [navigate, setUser]);

  // Funkcja do pobierania ogłoszeń z API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("http://localhost:4000/announcements", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements);
        } else {
          console.error("Błąd podczas pobierania ogłoszeń");
        }
      } catch (err) {
        console.error("Błąd:", err);
      }
    };

    fetchAnnouncements(); // Wywołanie na początku do załadowania ogłoszeń
  }, []);

  // Funkcja do przełączania widoczności opcji profilu
  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  // Funkcja do przejścia do zarządzania kontem
  const handleManageAccount = () => {
    navigate("/zarzadzaj");
  };

  // Funkcja do wylogowywania użytkownika
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  // Funkcja do wyświetlania szczegółów ogłoszenia
  const showDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  // Funkcja do zamykania modalnego okna
  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  // Funkcja do otwierania formularza dodawania ogłoszenia
  const openAddForm = () => {
    setShowAddForm(true);
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  // Funkcja do zamykania formularza dodawania ogłoszenia
  const closeAddForm = () => {
    setShowAddForm(false);
    setNewAnnouncement({
      title: "",
      content: "",
      date: "",
      teacher_name: user?.firstName + " " + user?.lastName,
      subject: "",
    });
  };

  // Funkcja do obsługi wysyłania nowego ogłoszenia
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAnnouncement),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Dodano ogłoszenie:", data.announcement);
        const updatedAnnouncementsResponse = await fetch(
          "http://localhost:4000/announcements"
        );
        if (updatedAnnouncementsResponse.ok) {
          const updatedData = await updatedAnnouncementsResponse.json();
          setAnnouncements(updatedData.announcements); // Aktualizacja stanu ogłoszeń

          alert("Ogłoszenie dodano pomyślnie!");
        } else {
          console.error(
            "Błąd podczas pobierania zaktualizowanej listy ogłoszeń"
          );
        }
        closeAddForm();
      } else {
        const errorData = await response.json();
        console.error("Błąd podczas dodawania ogłoszenia:", errorData.error);
        alert("Błąd podczas dodawania ogłoszenia: " + errorData.error);
      }
    } catch (err) {
      console.error("Błąd:", err);
      alert("Błąd podczas wysyłania danych: " + err.message);
    }
  };

  return (
    <div className="home-container">
      <header>
        <div className="profile-options-container">
          <div
            className="profile"
            onClick={toggleOptions}
            role="button"
            aria-label="Pokaż opcje"
          >
            <div className="avatar-placeholder"></div>
            {showOptions && (
              <div className="profile-options">
                <p className="user-email">{user?.email}</p>
                <button
                  onClick={handleManageAccount}
                  className="manage-account-button"
                >
                  Zarządzaj kontem
                </button>
                <button onClick={handleLogout} className="logout-button">
                  Wyloguj się
                </button>
              </div>
            )}
          </div>

          <div className="notification-bell" onClick={toggleNotifications}>
            <span role="img" aria-label="Dzwonek">
              🔔
            </span>
            {reservation.length > 0 && (
              <span className="notification-count">{reservation.length}</span>
            )}
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="close-notifications" onClick={toggleNotifications}>
            ❌
          </div>
          <h3>Twoje Rezerwacje</h3>
          {reservation.length > 0 ? (
            <ul className="reservation-list">
              {reservation.map((reservation, index) => {
                const date = formatDateToCustom(reservation.date);
                return (
                  <li key={index}>
                    <p>Przedmiot: {reservation.subject}</p>
                    <p>Data: {date}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Brak rezerwacji</p>
          )}
        </div>
      )}

      <h1>Witaj w aplikacji, {user?.firstName}!</h1>

      <section className="sekcja-filtrów">
        <h2>Filtry</h2>
        <label className="label-filtr">
          Przedmiot{" "}
          <select className="lista-przedmiotow" onChange={handleSubjectChange}>
            <option value="wszystkie">Wszystkie</option>
            {subjects.length ? (
              subjects.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))
            ) : (
              <option disabled>Brak filtrów</option>
            )}
          </select>
        </label>
      </section>

      <section className="sekcja-ogloszen">
        <div className="ogloszenia-header">
          <h2>Ogłoszenia</h2>
          {user?.role === "teacher" && (
            <button onClick={openAddForm} className="add-announcement-button">
              Dodaj ogłoszenie
            </button>
          )}
        </div>
        {filteredAnnouncements.length ? (
          <ul className="lista-ogloszen">
            {filteredAnnouncements.map((announcement) => (
              <li key={announcement.id} className="ogloszenie-element">
                <h3>{announcement.title}</h3>
                <h4>{announcement.teacher_name}</h4>
                <p className="data-ogloszenia">{announcement.date}</p>
                <button onClick={() => showDetails(announcement)}>
                  Szczegóły
                </button>
                {user?.role === "student" && (
                  <button onClick={() => openReservationForm(announcement.id)}>
                    Rezerwuj
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak dostępnych ogłoszeń.</p>
        )}
      </section>

      {/* Modalne okno ze szczegółami ogłoszenia */}
      {selectedAnnouncement && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={closeModal}>
              X
            </button>
            <h2>{selectedAnnouncement.title}</h2>
            <h3>{selectedAnnouncement.teacher_name}</h3>
            <p>{selectedAnnouncement.content}</p>
            <p className="data-ogloszenia">{selectedAnnouncement.date}</p>
            <p>{selectedAnnouncement.subject}</p>
          </div>
        </div>
      )}

      {/* Formularz dodawania ogłoszenia */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={closeAddForm}>
              X
            </button>
            <h2>Dodaj ogłoszenie</h2>
            <form onSubmit={handleAddAnnouncement}>
              <label>Nauczyciel: {newAnnouncement.teacher_name}</label>

              <label>
                Tytuł:
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                Treść:
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  required
                ></textarea>
              </label>
              <label>
                Data:
                <input
                  type="date"
                  value={newAnnouncement.date}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                Przedmiot:
                <input
                  type="text"
                  value={newAnnouncement.subject}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      subject: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <button type="submit" className="confirm-button">
                Dodaj ogłoszenie
              </button>
            </form>
          </div>
        </div>
      )}

      {showReservationForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={closeReservationForm}>
              X
            </button>
            <h2>Rezerwuj ogłoszenie</h2>
            <form onSubmit={handleAddReservation}>
              <label>
                Data:
                <input
                  type="date"
                  value={reservation.date}
                  onChange={(e) =>
                    setReservation({
                      ...reservation,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                Godzina:
                <input
                  type="time"
                  value={reservation.time}
                  onChange={(e) =>
                    setReservation({
                      ...reservation,
                      time: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <button type="submit" className="confirm-button">
                Rezerwuj
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

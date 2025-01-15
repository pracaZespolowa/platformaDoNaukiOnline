import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ user, setUser }) {
  const [showOptions, setShowOptions] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("wszystkie");

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    teacher_name: user?.firstName + " " + user?.lastName,
    teacher_email: user?.email,
    subject: "",
    terms: [],
    tempDate: "",
    tempHour: "",
    tempMinutes: "",
  });

  const handleViewReviews = (teacherId) => {
    navigate(`/reviews/${teacherId}`, { state: { user } });
  };

  const [notifications, setNotifications] = useState([]); // Stan powiadomień
  const [showNotifications, setShowNotifications] = useState(false); // Czy lista powiadomień jest widoczna

  const [selectedDate, setSelectedDate] = useState(""); // Wybrana data

  // Wygenerowanie unikalnych dat z `terms`
  const uniqueDates =
    selectedAnnouncement?.terms?.length > 0
      ? [...new Set(selectedAnnouncement.terms.map((term) => term.date))]
      : [];

  // Filtrowanie terminów na podstawie wybranej daty
  const filteredTerms =
    selectedAnnouncement?.terms?.filter((term) => term.date === selectedDate) ||
    [];

  const subjects = [...new Set(announcements.map((item) => item.subject))];
  const filteredAnnouncements =
    selectedSubject === "wszystkie"
      ? announcements
      : announcements.filter(
          (announcement) => announcement.subject === selectedSubject
        );
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      navigate("/home");
    }
  }, [navigate, setUser]);

  // Funkcja asynchroniczna handleReservation przyjmuje dwa argumenty:
  // announcementId - identyfikator ogłoszenia
  // termIndex - indeks wybranego terminu do rezerwacji
  const handleReservation = async (announcementId, termIndex) => {
    // Tworzymy nową tablicę aktualnych terminów bez tego o indeksie termIndex
    // Dzięki temu, jeśli rezerwacja się powiedzie, od razu zaktualizujemy UI,
    // usuwając zarezerwowany termin z listy.
    const updatedTerms = selectedAnnouncement.terms.filter(
      (_, index) => index !== termIndex
    );

    const email = user?.email;

    try {
      const response = await fetch(
        `http://localhost:4000/announcements/${announcementId}/reserve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ termIndex, email }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const { teacher_email } = data;
        setSelectedAnnouncement((prev) => ({
          ...prev,
          terms: updatedTerms,
        }));

        setAnnouncements((prev) =>
          prev.map((announcement) =>
            announcement.id === announcementId
              ? { ...announcement, terms: updatedTerms }
              : announcement
          )
        );

        // Tworzymy powiadomienie po rezerwacji do użytkownika
        const newNotification = {
          title: "Rezerwacja",
          message: "Zarezerwowano termin, poczekaj na akceptację!",
          date: new Date().toISOString(),
          userEmail: user.email,
        };

        // Wysyłanie powiadomienia do serwera
        await fetch("http://localhost:4000/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newNotification),
        });

        // Tworzymy powiadomienie po rezerwacji do nauczyciela
        const newNotificationteacher = {
          title: "Rezerwacja",
          message: "Nowa rezerwacja czeka na akceptację!",
          date: new Date().toISOString(),
          userEmail: teacher_email,
        };

        // Wysyłanie powiadomienia do serwera
        await fetch("http://localhost:4000/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newNotificationteacher),
        });
      } else {
        console.error("Rezerwacja nie powiodła się");
      }
    } catch (error) {
      console.error("Błąd:", error);
    }
  };

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

    fetchAnnouncements();
  }, []);

  // pobieranie powiadomien dla bieżącego użytkownika
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userEmail = user?.email;
        const response = await fetch(
          `http://localhost:4000/notifications/user/${userEmail}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
        } else {
          console.error("Błąd podczas pobierania powiadomień");
        }
      } catch (error) {
        console.error("Błąd serwera:", error);
      }
    };

    if (user?.email) {
      fetchNotifications();
    }
  }, [user]);

  // usuwanie powiadomienia
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/notifications/delete/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        //Zaktualizowanie stanu po usunięciu powiadomienia
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification._id !== notificationId
          )
        );
      } else {
        console.error("Błąd podczas usuwania powiadomienia");
      }
    } catch (error) {
      console.error("Błąd serwera:", error);
    }
  };

  const [selectedTermIndex, setSelectedTermIndex] = useState(null);

  const handleTermClick = (index) => {
    setSelectedTermIndex(index);
  };

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleManageReservations = () => {
    navigate("/reservations");
  };

  const handleManageAccount = () => {
    navigate("/zarzadzaj");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };
  const showDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  const openAddForm = () => {
    setShowAddForm(true);
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setNewAnnouncement({
      title: "",
      content: "",
      teacher_name: user?.firstName + " " + user?.lastName,
      teacher_email: user?.email,
      subject: "",
      terms: [],
      tempDate: "",
      tempHour: "",
      tempMinutes: "",
    });
  };

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
        const updatedAnnouncementsResponse = await fetch(
          "http://localhost:4000/announcements"
        );
        if (updatedAnnouncementsResponse.ok) {
          const updatedData = await updatedAnnouncementsResponse.json();
          setAnnouncements(updatedData.announcements);
          // Możesz dodać tu komunikat wewnątrz aplikacji, np. setMessage("Dodano pomyślnie!")
        } else {
          console.error(
            "Błąd podczas pobierania zaktualizowanej listy ogłoszeń"
          );
        }
        closeAddForm();
      } else {
        const errorData = await response.json();
        console.error("Błąd podczas dodawania ogłoszenia:", errorData.error);
        // Usuń alert, pozostaw console.error
      }
    } catch (err) {
      console.error("Błąd:", err);
      // Usuń alert, pozostaw console.error
    }
  };

  // Usunięto walidację po stronie frontendu dla terminu
  const handleAddTerm = () => {
    const newTerm = {
      date: newAnnouncement.tempDate || "",
      hour: newAnnouncement.tempHour
        ? newAnnouncement.tempHour.padStart(2, "0")
        : "",
      minutes: newAnnouncement.tempMinutes
        ? newAnnouncement.tempMinutes.padStart(2, "0")
        : "",
    };

    setNewAnnouncement((prev) => ({
      ...prev,
      terms: [...prev.terms, newTerm],
      tempDate: "",
      tempHour: "",
      tempMinutes: "",
    }));
  };

  const removeTerm = (index) => {
    setNewAnnouncement((prev) => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index),
    }));
  };

  // przełączanie widoczności powiadomień
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <div className="home-container">
      <header>
        <div className="notification-bell" onClick={toggleNotifications}>
          <span role="img" aria-label="Dzwonek">
            🔔
          </span>
          {notifications.length > 0 && (
            <span className="notification-count">{notifications.length}</span>
          )}
          {showNotifications && (
            <div className="notifications-list">
              {notifications.length ? (
                <ul>
                  {notifications.map((notification, index) => (
                    <li key={index} className="notification-item">
                      <h4 className="h4-notification-title">
                        {notification.title}
                        <button
                          className="delete-button"
                          onClick={() => deleteNotification(notification._id)}
                        >
                          X
                        </button>
                      </h4>
                      <p>{notification.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Brak nowych powiadomień.</p>
              )}
            </div>
          )}
        </div>
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
                onClick={handleManageReservations}
                className="manage-account-button"
              >
                Zarządzaj rezerwacjami
              </button>
              <button
                className="manage-account-button"
                onClick={() => navigate(`/chat`)}
              >
                Chat
              </button>

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
      </header>
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
                <button
                  onClick={() => showDetails(announcement)}
                  className="details-button"
                  aria-label={`Zobacz szczegóły ogłoszenia ${announcement.title}`}
                >
                  <span className="details-button-icon">ℹ️</span> Szczegóły
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak dostępnych ogłoszeń.</p>
        )}
      </section>

      {selectedAnnouncement && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={closeModal}>
              X
            </button>
            <h2>{selectedAnnouncement.title}</h2>
            {user.role === "student" && (
              <button
                className="details-button"
                onClick={() =>
                  handleViewReviews(selectedAnnouncement.teacher_name)
                }
              >
                Zobacz opinie
              </button>
            )}
            <h3>{selectedAnnouncement.teacher_name}</h3>
            <p>{selectedAnnouncement.content}</p>
            <p className="data-ogloszenia">{selectedAnnouncement.date}</p>
            <p>{selectedAnnouncement.subject}</p>
            <div>
              {/* Select do wyboru dnia */}
              <label>
                Wybierz dzień:
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="" disabled>
                    Wybierz dzień
                  </option>
                  {uniqueDates.map((date, index) => (
                    <option key={index} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </label>

              {/* Wyświetlanie kafelków z godzinami po wybraniu dnia */}
              {selectedDate ? (
                <div className="tile-container">
                  {filteredTerms.length > 0 ? (
                    filteredTerms.map((term, index) => (
                      <div
                        key={`${term.date}-${term.hour}-${term.minutes}-${index}`}
                        className="tile-wrapper"
                      >
                        <button
                          className={`tile ${
                            selectedTermIndex === index ? "selected" : ""
                          }`}
                          onClick={() => setSelectedTermIndex(index)}
                        >
                          {term.hour}:{term.minutes}
                        </button>

                        {/* Wyświetl przycisk rezerwacji tylko dla wybranego kafelka */}
                        {user?.role === "student" &&
                          selectedTermIndex === index && (
                            <button
                              className="reserve-button"
                              onClick={() =>
                                handleReservation(
                                  selectedAnnouncement._id,
                                  index
                                )
                              }
                            >
                              Rezerwuj
                            </button>
                          )}
                      </div>
                    ))
                  ) : (
                    <p>Brak dostępnych godzin :(</p>
                  )}
                </div>
              ) : (
                <p>Wybierz dzień, aby zobaczyć dostępne godziny.</p>
              )}
            </div>
          </div>
        </div>
      )}

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
                  // Usuń required
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
                  // Usuń required
                ></textarea>
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
                  // Usuń required
                />
              </label>

              <label>
                Termin odbycia korepetycji (opcjonalnie):
                <input
                  type="date"
                  value={newAnnouncement.tempDate}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      tempDate: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="Godzina"
                  value={newAnnouncement.tempHour}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      tempHour: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Minuty"
                  value={newAnnouncement.tempMinutes}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      tempMinutes: e.target.value,
                    })
                  }
                />
                <button type="button" onClick={handleAddTerm}>
                  Dodaj termin
                </button>
              </label>

              <h3>Dodane terminy:</h3>
              <ul>
                {newAnnouncement.terms.map((term, index) => (
                  <li key={index}>
                    {term.date} - {term.hour}:{term.minutes}
                    <button type="button" onClick={() => removeTerm(index)}>
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>

              <button type="submit" className="confirm-button">
                Dodaj ogłoszenie
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

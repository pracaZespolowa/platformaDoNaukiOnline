import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ user, setUser }) {
  const [showOptions, setShowOptions] = useState(false);
  const [announcements, setAnnouncements] = useState([]); // Stan na ogłoszenia
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // Stan na wybrany rekord
  const [selectedSubject, setSelectedSubject] = useState("wszystkie");
  const navigate = useNavigate();
  const subjects = [...new Set(announcements.map(item => item.subject))];
  const filteredAnnouncements = selectedSubject === "wszystkie"
    ? announcements
    : announcements.filter(announcement => announcement.subject === selectedSubject);

  // Sprawdzenie, czy użytkownik jest już zalogowany
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      navigate("/home");
    }
  }, [navigate, setUser]);

  useEffect(() => {
    async function fetchAnnouncements() {
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
    }

    fetchAnnouncements();
  }, []);

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleManageAccount = () => {
    navigate("/zarzadzaj");
  };

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

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  return (
    <div className="home-container">
      <header>
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
      </header>
      <h1>Witaj w aplikacji, {user?.firstName}!</h1>

      <section className="sekcja-filtrów">
        <h2>Filtry</h2>
        <label className="label-filtr">
          Przedmiot <select className="lista-przedmiotow" onChange={handleSubjectChange}>
            <option value="wszystkie">Wszystkie</option>
            {subjects.length ? (
              subjects.map((e) => 
                <option key={e} value={e}>{e}</option>
              )
            ) : (
              <option disabled>Brak filtrów</option>
            )}
            
          </select>
        </label>
      </section>

      <section className="sekcja-ogloszen">
        <h2>Ogłoszenia</h2>
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
            <p>{selectedAnnouncement.details}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

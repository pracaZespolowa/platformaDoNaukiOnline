import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ user, setUser }) {
  const [showOptions, setShowOptions] = useState(false);
  const [announcements, setAnnouncements] = useState([]); // Stan na ogłoszenia
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // Stan na wybrany rekord
  const [showAddForm, setShowAddForm] = useState(false); // Stan do kontrolowania widoczności formularza
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    date: "",
    teacher_name: user?.firstName + " " + user?.lastName,
    subject: ""
  });
  const navigate = useNavigate();

  // Sprawdzenie, czy użytkownik jest już zalogowany
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
          setAnnouncements(data.announcements); // Ustawienie ogłoszeń w stanie
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

  // Funkcja do zamykania formularza dodawania ogłoszenia
  const closeAddForm = () => {
    setShowAddForm(false);
    setNewAnnouncement({
      title: "",
      content: "",
      date: "",
      teacher_name: user?.firstName + " " + user?.lastName,
      subject: ""
    });
  };

  // Funkcja do obsługi wysyłania nowego ogłoszenia
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
  
    console.log("Dodawanie ogłoszenia:", newAnnouncement); // Loguj dane ogłoszenia
  
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
        const updatedAnnouncementsResponse = await fetch("http://localhost:4000/announcements");
        if (updatedAnnouncementsResponse.ok) {
          const updatedData = await updatedAnnouncementsResponse.json();
          setAnnouncements(updatedData.announcements); // Aktualizacja stanu ogłoszeń
           
          alert("Ogłoszenie dodano pomyślnie!");// Wyświetlenie alertu z potwierdzeniem
        } else {
          console.error("Błąd podczas pobierania zaktualizowanej listy ogłoszeń");
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

      

  <section className="sekcja-ogloszen">
    <div className="ogloszenia-header">
      <h2>Ogłoszenia</h2>
      {user?.role === "teacher" && (
        <button onClick={openAddForm} className="add-announcement-button">
          Dodaj ogłoszenie
        </button>
      )}
    </div>
    {announcements.length ? (
      <ul className="lista-ogloszen">
        {announcements.map((announcement) => (
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
              <label>
                Nauczyciel: {newAnnouncement.teacher_name}
              </label>

              <label>
                Tytuł:
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Treść:
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
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
                    setNewAnnouncement({ ...newAnnouncement, date: e.target.value })
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
                    setNewAnnouncement({ ...newAnnouncement, subject: e.target.value })
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
    </div>
  );
}

export default Home;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ user, setUser }) { // Dodajemy setUser do propsów
  const [showOptions, setShowOptions] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    date: "",
    teacher_name: user?.firstName + " " + user?.lastName,
    subject: "",
  });
  const [selectedSubject, setSelectedSubject] = useState("wszystkie");
  const navigate = useNavigate();

  const subjects = [...new Set(announcements.map((item) => item.subject))];
  const filteredAnnouncements =
    selectedSubject === "wszystkie"
      ? announcements
      : announcements.filter(
          (announcement) => announcement.subject === selectedSubject
        );

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
          console.error("Error fetching announcements");
        }
      } catch (err) {
        console.error("Error:", err);
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

  const showDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  const openAddForm = () => {
    setShowAddForm(true);
  };

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
        const updatedAnnouncementsResponse = await fetch(
          "http://localhost:4000/announcements"
        );
        if (updatedAnnouncementsResponse.ok) {
          const updatedData = await updatedAnnouncementsResponse.json();
          setAnnouncements(updatedData.announcements);
          alert("Ogłoszenie dodano pomyślnie!");
        } else {
          console.error("Error fetching updated announcements list");
        }
        closeAddForm();
      } else {
        const errorData = await response.json();
        alert("Błąd podczas dodawania ogłoszenia: " + errorData.error);
      }
    } catch (err) {
      alert("Błąd podczas wysyłania danych: " + err.message);
    }
  };

  return (
    <div className="home-container">
      <header>
        <div className="profile" onClick={toggleOptions} role="button" aria-label="Pokaż opcje">
          <div className="avatar-placeholder"></div>
          {showOptions && (
            <div className="profile-options">
              <p className="user-email">{user?.email}</p>
              <button onClick={handleManageAccount} className="manage-account-button">
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
    </div>
  );
}

export default Home;

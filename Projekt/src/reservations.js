import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./reservations.css";

function Reservations({ user, setUser }) {
  const navigate = useNavigate();
  const [role] = useState(user?.role || "");
  const [reservations, setReservations] = useState([]); // Stan powiadomień
  const [message, setMessage] = useState(""); // Komunikaty dla użytkownika

  const handleBackToHome = () => {
    navigate("/home");
  };

  // pobieranie rezerwacji dla bieżącego użytkownika/nauczyciela
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        if (role === "teacher") {
          const teacherEmail = user?.email;
          const response = await fetch(
            `http://localhost:4000/reservations/teacher/${teacherEmail}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Odpowiedź z serwera:", data);
            setReservations(data.reservations);
          } else {
            console.error("Błąd podczas pobierania rezerwacji");
          }
        } else {
          const userEmail = user?.email;
          const response = await fetch(
            `http://localhost:4000/reservations/user/${userEmail}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Odpowiedź z serwera:", data);
            setReservations(data.reservations);
          } else {
            console.error("Błąd podczas pobierania rezerwacji");
          }
        }
      } catch (error) {
        console.error("Błąd serwera:", error);
      }
    };

    if (user?.email) {
      fetchReservations();
    }
  }, [user?.email, role]);

  // akceptacja rezerwacji
  const handleAcceptReservation = async (reservationId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/reservation/accept/${reservationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setMessage("Rezerwacja została zaakceptowana.");
        const data = await response.json();
        const { userEmail, updatedReservation } = data;

        // Tworzymy powiadomienie po akceptacji
        const newNotification = {
          title: "Akceptacja rezerwacji",
          message: `Twoja rezerwacja na ${updatedReservation.subject} u ${updatedReservation.teacher_name} została zaakceptowana!\n
                    Data: ${updatedReservation.date.date} ${updatedReservation.date.hour}.${updatedReservation.date.minutes}`,
          date: new Date().toISOString(),
          userEmail: userEmail,
        };

        // Wysyłanie powiadomienia do serwera
        await fetch("http://localhost:4000/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newNotification),
        });
      } else {
        setMessage("Błąd podczas akceptacji rezerwacji.");
        console.error("Błąd podczas akceptacji rezerwacji");
      }
    } catch (error) {
      console.error("Błąd serwera:", error);
    }
  };

  // odrzucanie/usuwanie rezerwacji
  const handleDeclineReservation = async (reservationId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/reservation/decline/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Usuń odrzuconą rezerwację z listy
        setReservations((prevReservations) =>
          prevReservations.filter(
            (reservation) => reservation._id !== reservationId
          )
        );

        const data = await response.json();
        const { userEmail, reservation } = data;

        // Tworzymy powiadomienie po odrzuceniu
        const newNotification = {
          title: "Odrzucenie rezerwacji",
          message: `Twoja rezerwacja na ${reservation.subject} u ${reservation.teacher_name} została odrzucona i usunięta.\n
                    Data: ${reservation.date.date} ${reservation.date.hour}.${reservation.date.minutes}`,
          date: new Date().toISOString(),
          userEmail: userEmail,
        };

        // Wysyłanie powiadomienia do serwera
        await fetch("http://localhost:4000/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newNotification),
        });
      } else {
        console.error("Błąd podczas akceptacji rezerwacji");
      }
    } catch (error) {
      console.error("Błąd serwera:", error);
    }
  };

  return (
    <div className="reservations-container">
      <button className="back-button" onClick={handleBackToHome}>
        <img
          src="https://img.icons8.com/ios-filled/50/000000/home.png"
          alt="Home"
          className="home-icon"
        />
      </button>
      <div className="reservation-list">
        {reservations.length ? (
          <ul>
            {message && <p className="status-message">{message}</p>}
            {reservations.map((reservation, index) => (
              <li key={index} className="reservation-item">
                <h3>{reservation.subject}</h3>
                <h4>{reservation.teacher_name}</h4>
                <p>Dzień {reservation.date.date}</p>
                <p>
                  Godzina {reservation.date.hour}.{reservation.date.minutes}
                </p>
                {reservation.accepted ? (
                  <p className="accept-status">Rezerwacja zaakceptowana!</p>
                ) : (
                  <p className="accept-status">
                    Rezerwacja czeka na akceptację
                  </p>
                )}
                {user?.role === "teacher" ? (
                  <div className="button-section">
                    <button
                      className="accept-button"
                      onClick={() => handleAcceptReservation(reservation._id)}
                    >
                      Akceptuj
                    </button>
                    <button
                      className="decline-button"
                      onClick={() => handleDeclineReservation(reservation._id)}
                    >
                      Odrzuć
                    </button>
                  </div>
                ) : (
                  <div className="button-section">
                    <button
                      className="decline-button"
                      onClick={() => handleDeclineReservation(reservation._id)}
                    >
                      Zrezygnuj
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <h1>Brak rezerwacji.</h1>
        )}
      </div>
    </div>
  );
}

export default Reservations;

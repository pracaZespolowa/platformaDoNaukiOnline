import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import "./Kalendarz.css";

function ScheduleCalendar({ user }) {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  // Funkcja do pobrania rezerwacji
  const fetchReservations = async () => {
    if (!user?.email) return;

    try {
      const email = user.email;
      const role = user.role;
      const url =
        role === "teacher"
          ? `https://platforma-backend-xz8b.onrender.com/reservations/teacher/${email}`
          : `https://platforma-backend-xz8b.onrender.com/reservations/user/${email}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Konwersja daty na string, jeśli jest obiektem Date
        const formattedReservations = data.reservations.map((res) => ({
          ...res,
          date:
            typeof res.date === "string"
              ? res.date
              : new Date(res.date).toISOString().split("T")[0], // Formatowanie do YYYY-MM-DD
        }));
        setReservations(formattedReservations);
      } else {
        console.error("Błąd podczas pobierania rezerwacji.");
      }
    } catch (error) {
      console.error("Błąd serwera:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  // Funkcja do przekształcania danych na obiekt Date
  const parseReservationDate = (res) => {
    let dateStr;

    // Sprawdzenie, czy res.date to string, czy obiekt
    if (typeof res.date === "string") {
      dateStr = res.date; // Jeśli string, używaj go bezpośrednio
    } else if (res.date instanceof Date) {
      // Jeśli obiekt typu Date, przekonwertuj go na string w formacie YYYY-MM-DD
      const year = res.date.getFullYear();
      const month = String(res.date.getMonth() + 1).padStart(2, "0"); // Miesiące są indeksowane od 0
      const day = String(res.date.getDate()).padStart(2, "0");
      dateStr = `${day}-${month}-${year}`;
    } else {
      console.error("Nieprawidłowy format daty:", res.date);
      return null; // Zwróć null, jeśli format jest nieobsługiwany
    }

    // Split działa na dateStr tylko, jeśli jest poprawnym stringiem
    const [day, month, year] = dateStr.split("-");
    const hours = parseInt(res.hour, 10);
    const minutes = parseInt(res.minute, 10);
    return new Date(year, month - 1, day, hours, minutes);
  };

  // Funkcja wyświetlająca zawartość dnia w kalendarzu
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayReservations = reservations.filter((res) => {
        const resDate = parseReservationDate(res);
        return resDate.toDateString() === date.toDateString();
      });

      if (dayReservations.length > 0) {
        return <div className="event-marker">📌</div>;
      }
    }
    return null;
  };

  // Wyświetlanie szczegółów rezerwacji dla wybranego dnia
  const selectedDateReservations = reservations.filter((res) => {
    const resDate = parseReservationDate(res);
    return resDate.toDateString() === date.toDateString();
  });

  // Funkcja powrotu do strony głównej
  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <div className="kalendarz-container">
      <button className="back-button" onClick={handleBackToHome}>
        <img
          src="https://img.icons8.com/ios-filled/50/000000/home.png"
          alt="Home"
          className="home-icon"
        />
      </button>
      <h1>Kalendarz</h1>
      <div className="calendar-wrapper">
        <Calendar onChange={setDate} value={date} tileContent={tileContent} />
      </div>
      <div className="details-section">
        <h2>Szczegóły dnia</h2>
        {selectedDateReservations.length > 0 ? (
          <ul>
            {selectedDateReservations.map((res, index) => {
              const resDate = parseReservationDate(res);
              return (
                <li key={index}>
                  <strong>{res.subject}</strong> o{" "}
                  {resDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Brak rezerwacji na ten dzień.</p>
        )}
      </div>
    </div>
  );
}

export default ScheduleCalendar;

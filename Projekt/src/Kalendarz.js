import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";

function ScheduleCalendar({ user }) {
    const [reservations, setReservations] = useState([]);
    const [date, setDate] = useState(new Date());
    const navigate = useNavigate();

    // Pobranie rezerwacji dla użytkownika lub nauczyciela
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const email = user?.email;
                let url = "";

                if (user?.role === "teacher") {
                    url = `http://localhost:4000/reservations/teacher/${email}`;
                } else {
                    url = `http://localhost:4000/reservations/user/${email}`;
                }

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setReservations(data.reservations);
                } else {
                    console.error("Błąd podczas pobierania rezerwacji.");
                }
            } catch (error) {
                console.error("Błąd serwera:", error);
            }
        };

        if (user?.email) {
            fetchReservations();
        }
    }, [user]);

    // Funkcja wyświetlająca zawartość dnia w kalendarzu
    const tileContent = ({ date, view }) => {
        if (view === "month") {
            const dayReservations = reservations.filter(
                (res) => new Date(res.date.date).toDateString() === date.toDateString()
            );

            if (dayReservations.length > 0) {
                return <div className="event-marker">📌</div>;
            }
        }
        return null;
    };

    // Wyświetlanie szczegółów rezerwacji dla wybranego dnia
    const selectedDateReservations = reservations.filter(
        (res) => new Date(res.date.date).toDateString() === date.toDateString()
    );

    return (
        <div style={{ padding: "20px" }}>
            <h1>Kalendarz zajęć</h1>
            <Calendar
                onChange={setDate}
                value={date}
                tileContent={tileContent}
            />
            <div style={{ marginTop: "20px" }}>
                <h2>Szczegóły dnia</h2>
                {selectedDateReservations.length > 0 ? (
                    <ul>
                        {selectedDateReservations.map((res, index) => (
                            <li key={index}>
                                <strong>{res.subject}</strong> o{" "}
                                {new Date(res.date.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Brak rezerwacji na ten dzień.</p>
                )}
            </div>
        </div>
    );
}

export default ScheduleCalendar;

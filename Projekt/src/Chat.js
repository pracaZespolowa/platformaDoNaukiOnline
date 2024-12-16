import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

function Chat({ user }) {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !user.email) return;

    const fetchData = async () => {
      try {
        if (user.role === "student") {
          const teacherResponse = await fetch(
            `http://localhost:4000/chat/teacher?email=${user.email}`
          );
          if (teacherResponse.ok) {
            const data = await teacherResponse.json();
            if (data.teachers && data.teachers.length > 0) {
              const uniqueTeachers = data.teachers.filter(
                (teacher, index, array) =>
                  index === array.findIndex((t) => t.email === teacher.email)
              );

              setTeachers(uniqueTeachers);
              setTeacher(uniqueTeachers[0]);
            } else {
              setError("Brak zaakceptowanych nauczycieli dla tego studenta.");
            }
          } else {
            const errorData = await teacherResponse.json();
            setError(errorData.error || "Nie udało się pobrać nauczycieli.");
          }
        } else if (user.role === "teacher") {
          const studentResponse = await fetch(
            `http://localhost:4000/chat/students?teacherEmail=${user.email}`
          );
          if (studentResponse.ok) {
            const data = await studentResponse.json();
            if (data.students && data.students.length > 0) {
              setStudents(data.students);
            } else {
              setError(
                "Brak zaakceptowanych rezerwacji (studentów) dla tego nauczyciela."
              );
            }
          } else {
            const errorData = await studentResponse.json();
            setError(errorData.error || "Nie udało się pobrać studentów.");
          }
        }
      } catch (err) {
        console.error("Błąd sieci:", err);
        setError("Błąd podczas pobierania danych.");
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let endpoint;

        if (user.role === "student" && teacher) {
          endpoint = `http://localhost:4000/chat/messages?teacherEmail=${teacher.email}&userEmail=${user.email}`;
        } else if (user.role === "teacher" && currentStudent) {
          endpoint = `http://localhost:4000/chat/messages?teacherEmail=${user.email}&userEmail=${currentStudent.email}`;
        } else {
          return;
        }

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        } else {
          setError("Nie udało się pobrać wiadomości.");
        }
      } catch (err) {
        console.error("Błąd sieci:", err);
        setError("Błąd podczas ładowania wiadomości.");
      }
    };

    fetchMessages();
  }, [teacher, currentStudent, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    let receiverEmail;
    if (user.role === "student" && teacher) {
      receiverEmail = teacher.email;
    } else if (user.role === "teacher" && currentStudent) {
      receiverEmail = currentStudent.email;
    } else {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: user.email,
          receiverEmail: receiverEmail,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");

        // Tworzymy powiadomienie po rezerwacji do użytkownika
        const newNotification = {
          title: "Wiadomość",
          message: "Otrzymałeś nową wiadomość!",
          date: new Date().toISOString(),
          userEmail: receiverEmail,
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
        setError("Nie udało się wysłać wiadomości.");
      }
    } catch (err) {
      console.error("Błąd sieci:", err);
      setError("Błąd podczas wysyłania wiadomości.");
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (user.role === "student") {
    if (!teacher) {
      return (
        <div>Ładowanie danych lub brak zaakceptowanych nauczycieli...</div>
      );
    }

    return (
      <div className="chat-container">
        <h1>Chat z nauczycielem: {teacher.name}</h1>
        <div className="teachers-list">
          <h2>Nauczyciele:</h2>
          <ul>
            {teachers.map((t, index) => (
              <li key={index}>
                {t.name} - {t.email} ({t.subject})
                <button
                  className="btn"
                  onClick={() => {
                    setTeacher(t);
                  }}
                >
                  Rozpocznij chat
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((msg, index) => {
              let roleIcon = msg.senderEmail === user.email ? "S" : "T";
              return (
                <div
                  key={index}
                  className={`message ${
                    msg.senderEmail === user.email ? "sent" : "received"
                  }`}
                >
                  <p>
                    <strong>{roleIcon}:</strong> {msg.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napisz wiadomość..."
          />
          <button className="btn" onClick={handleSendMessage}>
            Wyślij
          </button>
        </div>
        <button className="btn" onClick={() => navigate("/home")}>
          Powrót
        </button>
      </div>
    );
  } else if (user.role === "teacher") {
    if (students.length === 0) {
      return <div>Ładowanie studentów lub brak rezerwacji...</div>;
    }

    return (
      <div className="chat-container">
        <h1>
          Chat ze studentem:{" "}
          {currentStudent ? currentStudent.email : "Wybierz studenta"}
        </h1>
        <div className="students-list">
          <h2>Studenci z zaakceptowaną rezerwacją:</h2>
          <ul>
            {students.map((s, index) => (
              <li key={index}>
                {s.email} ({s.subject})
                <button
                  className="btn"
                  onClick={() => {
                    setCurrentStudent(s);
                  }}
                >
                  Rozpocznij chat
                </button>
              </li>
            ))}
          </ul>
        </div>

        {currentStudent && (
          <>
            <div className="chat-messages">
              {messages.map((msg, index) => {
                let roleIcon = msg.senderEmail === user.email ? "T" : "S";
                return (
                  <div
                    key={index}
                    className={`message ${
                      msg.senderEmail === user.email ? "sent" : "received"
                    }`}
                  >
                    <p>
                      <strong>{roleIcon}:</strong> {msg.content}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Napisz wiadomość..."
              />
              <button className="btn" onClick={handleSendMessage}>
                Wyślij
              </button>
              <button className="btn" onClick={() => navigate("/home")}>
                Powrót
              </button>
            </div>
          </>
        )}
      </div>
    );
  } else {
    return <div>Nieznana rola użytkownika.</div>;
  }
}

export default Chat;

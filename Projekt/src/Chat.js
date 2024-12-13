import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

function Chat({ user }) {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeacherData = async () => {
      console.log("user", user);

      try {
        const response = await fetch(
          `http://localhost:4000/chat/teacher?email=${user?.email}`
        );
        console.log("user", user);
        if (response.ok) {
          const data = await response.json();
          setTeacher(data.teacher);
        } else {
          const errorData = await response.json();
          setError(
            errorData.error || "Nie udało się pobrać danych nauczyciela."
          );
        }
      } catch (err) {
        console.error("Błąd sieci:", err);
        setError("Błąd podczas pobierania danych nauczyciela.");
      }
    };

    fetchTeacherData();
  }, [user.email]);

  useEffect(() => {
    if (!teacher) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/chat/messages?teacherEmail=${teacher.email}&userEmail=${user.email}`
        );
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
  }, [teacher, user.email]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`http://localhost:4000/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderEmail: user.email,
          receiverEmail: teacher.email,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      } else {
        setError("Nie udało się wysłać wiadomości.");
      }
    } catch (err) {
      console.error("Błąd sieci:", err);
      setError("Błąd podczas wysyłania wiadomości.");
    }
  };

  if (!teacher) {
    return <div>Ładowanie danych nauczyciela...</div>;
  }

  return (
    <div className="chat-container">
      <h1>Chat z nauczycielem: {teacher.name}</h1>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.senderEmail === user.email ? "sent" : "received"
            }`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Napisz wiadomość..."
        />
        <button onClick={handleSendMessage}>Wyślij</button>
      </div>
      {error && <p className="error">{error}</p>}
      <button onClick={() => navigate("/home")}>Powrót</button>
    </div>
  );
}

export default Chat;

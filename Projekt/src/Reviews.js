import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./Reviews.css"; // Importowanie pliku CSS

const Reviews = () => {
  const { teacherId } = useParams();
  const location = useLocation();
  const user = location.state?.user;
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/reviews/${teacherId}`
        );
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Błąd podczas pobierania opinii");
        }
      } catch (error) {
        console.error("Błąd serwera:", error);
      }
    };

    fetchReviews();
  }, [teacherId]);

  const handleAddReview = async () => {
    if (!newReview) return;

    try {
      const response = await fetch(
        `http://localhost:4000/reviews/${teacherId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            review: newReview,
            studentEmail: user.email,
            rating: newRating,
          }),
        }
      );

      if (response.ok) {
        const addedReview = await response.json();
        setReviews([...reviews, addedReview]);
        setNewReview("");
        setNewRating(1);
        console.log(addedReview);
      } else {
        console.error("Błąd podczas dodawania opinii");
      }
    } catch (error) {
      console.error("Błąd serwera:", error);
    }
  };

  return (
    <div className="reviews-container">
      <h1>Opinie o nauczycielu</h1>
      <ul>
        {reviews.map((review, index) => (
          <li key={index} className="review-item">
            <h3>{review.studentEmail}</h3>
            <p>{review.review}</p>
            <p>Ocena: {review.rating} / 5</p>
            <p>Data: {new Date(review.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      {user?.role === "student" && (
        <div className="add-review">
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Dodaj opinię..."
          />
          <select
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>
                {star} {star === 1 ? "gwiazdka" : "gwiazdki"}
              </option>
            ))}
          </select>
          <button onClick={handleAddReview}>Dodaj opinię</button>
        </div>
      )}
    </div>
  );
};

export default Reviews;

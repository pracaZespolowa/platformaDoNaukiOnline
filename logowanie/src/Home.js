// src/Home.js
import React from 'react';

function Home({ user }) {
  return (
    <div className="home-container">
      <h1>Welcome, {user}!</h1> 
      <p>You have successfully logged in.</p>
      <div className="home">
      
      </div>

    </div>
    
  );
  
}


export default Home;

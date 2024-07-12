import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div className="App">
      <div className="background"></div>
      <div className="content">
        <h1>TACO DOG</h1>
      </div>
      <div className="taco-dog-container">
        <img src="/taco_dog.png" alt="Taco Dog" className="taco-dog-image" />
      </div>
      <div 
        className="inverse-circle"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      ></div>
    </div>
  );
}

export default App;
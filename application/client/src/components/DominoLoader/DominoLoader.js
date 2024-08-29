// animations/DominoLoader.js
import React from 'react';
import './DominoLoader.css'; // Import the CSS for the loader

const DominoLoader = () => {
  return (
    <div className="loading-container">
      <div className="domino-loader">
        <div className="domino domino1"></div>
        <div className="domino domino2"></div>
        <div className="domino domino3"></div>
        <div className="domino domino4"></div>
        <div className="domino domino5"></div>
      </div>
    </div>
  );
};

export default DominoLoader;
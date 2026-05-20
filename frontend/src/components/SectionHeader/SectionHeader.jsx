import React from 'react';
import './SectionHeader.css';

const SectionHeader = ({ title, showViewAll = false, timer = null }) => {
  return (
    <div className="section-header-container">
      <div className="section-title-wrapper">
        <div className="yellow-bar"></div>
        <h2 className="section-title">{title}</h2>
        
        {timer && (
          <div className="timer-wrapper">
            <div className="timer-item">
              <span className="timer-value">{timer.days}</span>
              <span className="timer-label">Días</span>
            </div>
            <span className="timer-separator">:</span>
            <div className="timer-item">
              <span className="timer-value">{timer.hours}</span>
              <span className="timer-label">Horas</span>
            </div>
            <span className="timer-separator">:</span>
            <div className="timer-item">
              <span className="timer-value">{timer.minutes}</span>
              <span className="timer-label">Minutos</span>
            </div>
            <span className="timer-separator">:</span>
            <div className="timer-item">
              <span className="timer-value">{timer.seconds}</span>
              <span className="timer-label">Segundos</span>
            </div>
          </div>
        )}
      </div>

      {showViewAll && (
        <button className="view-all-btn">Ver Todos</button>
      )}
    </div>
  );
};

export default SectionHeader;

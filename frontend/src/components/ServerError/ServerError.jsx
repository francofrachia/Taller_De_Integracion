import React, { useState } from 'react';
import './ServerError.css';

const ServerError = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="server-error-container">
      {/* 3D Floating bricks in the background */}
      <div className="floating-bricks-container" aria-hidden="true">
        <div className="floating-brick red-brick"></div>
        <div className="floating-brick yellow-brick"></div>
        <div className="floating-brick blue-brick"></div>
        <div className="floating-brick green-brick"></div>
      </div>

      <div className="error-card-glass animate-fade-in">
        <div className="error-illustration-wrapper">
          <svg
            width="220"
            height="160"
            viewBox="0 0 220 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="error-svg"
          >
            {/* Studs/dots pattern background in SVG grid */}
            <rect x="20" y="120" width="180" height="24" rx="6" fill="#e5e5e5" />
            <circle cx="35" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="55" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="75" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="95" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="115" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="135" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="155" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="175" cy="120" r="5" fill="#d1d1d1" />
            <circle cx="195" cy="120" r="5" fill="#d1d1d1" />

            {/* Left Block (Lego Brick Red) */}
            <g className="lego-block left-block">
              {/* Studs */}
              <rect x="48" y="70" width="12" height="6" rx="2" fill="#ff5e62" />
              <rect x="68" y="70" width="12" height="6" rx="2" fill="#ff5e62" />
              {/* Main brick */}
              <rect x="40" y="76" width="50" height="36" rx="4" fill="#ff5e62" />
              {/* Cable interface */}
              <rect x="85" y="88" width="10" height="12" fill="#2d3748" />
              <path d="M 95 94 C 110 94, 105 50, 95 40" stroke="#2d3748" strokeWidth="6" strokeLinecap="round" fill="none" className="disconnected-cable" />
            </g>

            {/* Right Block (Lego Brick Blue) */}
            <g className="lego-block right-block">
              {/* Studs */}
              <rect x="138" y="70" width="12" height="6" rx="2" fill="#007bff" />
              <rect x="158" y="70" width="12" height="6" rx="2" fill="#007bff" />
              {/* Main brick */}
              <rect x="130" y="76" width="50" height="36" rx="4" fill="#007bff" />
              {/* Cable interface */}
              <rect x="125" y="88" width="10" height="12" fill="#2d3748" />
              <path d="M 125 94 C 110 94, 115 130, 125 140" stroke="#2d3748" strokeWidth="6" strokeLinecap="round" fill="none" className="disconnected-cable-2" />
            </g>

            {/* Warning Glow / Sparks */}
            <g className="warning-symbol">
              <circle cx="110" cy="94" r="22" fill="#ffcf00" fillOpacity="0.15" className="spark-glow" />
              <path d="M 110 80 L 110 96" stroke="#ffcf00" strokeWidth="4" strokeLinecap="round" className="spark-line" />
              <circle cx="110" cy="106" r="3" fill="#ffcf00" />
            </g>

            {/* Spark lines */}
            <path d="M 98 65 L 102 69" stroke="#ffcf00" strokeWidth="2" strokeLinecap="round" className="mini-spark" />
            <path d="M 122 65 L 118 69" stroke="#ffcf00" strokeWidth="2" strokeLinecap="round" className="mini-spark" />
          </svg>
        </div>

        <h2>¡Problemas de conexión!</h2>
        <p>
          No pudimos conectarnos con nuestro catálogo. El servidor de base de datos está en mantenimiento o no se encuentra disponible en este momento.
        </p>

        <button 
          className={`error-retry-btn ${isRetrying ? 'loading' : ''}`} 
          onClick={handleRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <span className="spinner"></span>
              <span>Reconectando...</span>
            </>
          ) : (
            <>
              <span>Reintentar Conexión</span>
              <span className="btn-arrow">⚡</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ServerError;

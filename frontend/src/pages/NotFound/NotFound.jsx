import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './NotFound.css';

const NotFound = () => {
  return (
    <>
      <Navbar />
      <div className="notfound-container">
        <div className="notfound-content animate-fade-in">
          <div className="notfound-bricks">
            <div className="brick brick-red animate-bounce-delay-1"></div>
            <div className="brick brick-yellow animate-bounce-delay-2"></div>
            <div className="brick brick-blue animate-bounce-delay-3"></div>
          </div>
          
          <h1 className="notfound-title">404</h1>
          <h2 className="notfound-subtitle">¡Ups! Nos faltan piezas.</h2>
          
          <p className="notfound-text">
            Parece que te salteaste un paso en el manual de instrucciones o esta página fue desarmada y guardada en la caja equivocada.
          </p>
          
          <Link to="/" className="btn-primary-custom notfound-btn">
            Volver al Inicio
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;

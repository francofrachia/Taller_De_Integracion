import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Footer.css';

const Footer = () => {
  const { usuario } = useContext(AppContext);

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col">
          <h3>Soporte</h3>
          <ul>
            <li><Link to="/preguntas">Preguntas Frecuentes (FAQ)</Link></li>
            <li><Link to="/envios">Política de envíos y devoluciones</Link></li>
            <li><Link to="/contacto">Contacto: soporte@bloquesmundo.com</Link></li>
            <li>+54 11 1234-5678</li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Cuenta</h3>
          <ul>
            <li><Link to={usuario ? "/cuenta" : "/login"}>Mi cuenta</Link></li>
            <li><Link to={usuario ? "/cuenta" : "/login"} state={usuario ? { section: 'historial' } : null}>Historial de compras</Link></li>
            <li><Link to={usuario ? "/cuenta" : "/login"} state={usuario ? { section: 'favoritos' } : null}>Mis Favoritos</Link></li>
            <li><Link to="/carrito">Carrito</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Sobre la APP</h3>
          <ul>
            <li><Link to="/nosotros">Quiénes somos</Link></li>
            <li><Link to="/terminos">Términos de uso</Link></li>
            <li><Link to="/privacidad">Política de privacidad</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Bloques Mundo. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;

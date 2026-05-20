import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col">
          <h3>Soporte</h3>
          <ul>
            <li><a href="/preguntas">Preguntas Frecuentes (FAQ)</a></li>
            <li><a href="/envios">Política de envíos y devoluciones</a></li>
            <li><a href="/contacto">Contacto: soporte@bloquesmundo.com</a></li>
            <li>+54 11 1234-5678</li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Cuenta</h3>
          <ul>
            <li><a href="/login">Mi cuenta</a></li>
            <li><a href="/perfil/compras">Historial de compras</a></li>
            <li><a href="/perfil/favoritos">Mis Favoritos</a></li>
            <li><a href="/carrito">Carrito</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Sobre la APP</h3>
          <ul>
            <li><a href="/nosotros">Quiénes somos</a></li>
            <li><a href="/terminos">Términos de uso</a></li>
            <li><a href="/privacidad">Política de privacidad</a></li>
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

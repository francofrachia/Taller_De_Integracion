import React from 'react';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-col">
                    <h4>Soporte</h4>
                    <p>Concepción del Uruguay,<br />Entre Ríos, Argentina.</p>
                    <p>bloquemundo@gmail.com</p>
                    <p>+54 9 3442 00-0000</p>
                </div>

                <div className="footer-col">
                    <h4>Cuenta</h4>
                    <ul>
                        <li><a href="#mi-cuenta">Mi cuenta</a></li>
                        <li><a href="#iniciar-sesion">Iniciar Sesión / Registrarse</a></li>
                        <li><a href="#carrito">Carrito</a></li>
                        <li><a href="#favoritos">Favoritos</a></li>
                        <li><a href="#tienda">Tienda</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Sobre la APP</h4>
                    <ul>
                        <li><a href="#privacidad">Políticas de Privacidad</a></li>
                        <li><a href="#terminos">Términos de Uso</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Bloque Mundo. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

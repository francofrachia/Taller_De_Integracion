import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import './Login.css';

export default function Login() {
    const { sincronizarUsuarioConBackend, loginConEmail } = useContext(AppContext);
    const [mensaje, setMensaje] = useState('');
    const [perfil, setPerfil] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || '/';

    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "676947281267-v3l9o98u7f9b3v8ids8t0fhgb9ar3mbm.apps.googleusercontent.com";

    useEffect(() => {
        const scriptId = 'google-gis-sdk';
        let script = document.getElementById(scriptId);

        const inicializarGoogle = () => {
            if (window.google) {
                // Establecer el callback activo para esta instancia de componente
                window._googleSignInActiveCallback = manejarRespuestaGoogle;

                // Solo inicializar una vez a nivel global
                if (!window._googleSignInInitialized) {
                    window.google.accounts.id.initialize({
                        client_id: CLIENT_ID,
                        context: "signin",
                        ux_mode: "popup",
                        callback: (response) => {
                            if (window._googleSignInActiveCallback) {
                                window._googleSignInActiveCallback(response);
                            }
                        },
                        auto_prompt: false
                    });
                    window._googleSignInInitialized = true;
                }

                const buttonDiv = document.getElementById("g_id_signin");
                if (buttonDiv) {
                    window.google.accounts.id.renderButton(buttonDiv, {
                        type: "standard",
                        shape: "rectangular",
                        theme: "outline",
                        text: "signin_with",
                        size: "large",
                        logo_alignment: "center"
                    });
                }
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = inicializarGoogle;
            document.body.appendChild(script);
        } else {
            if (window.google) {
                inicializarGoogle();
            } else {
                const existingOnload = script.onload;
                script.onload = () => {
                    if (existingOnload) existingOnload();
                    inicializarGoogle();
                };
            }
        }

        return () => {
            if (window._googleSignInActiveCallback === manejarRespuestaGoogle) {
                window._googleSignInActiveCallback = null;
            }
        };
    }, []);

    async function manejarRespuestaGoogle(response) {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const datosDecodificados = JSON.parse(
                decodeURIComponent(
                    window.atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                )
            );

            setPerfil({
                picture: datosDecodificados.picture,
                name: datosDecodificados.given_name,
                email: datosDecodificados.email
            });

            setMensaje(`¡Hola, ${datosDecodificados.given_name}!`);

            const usuarioGoogle = {
                nombre: datosDecodificados.given_name,
                email: datosDecodificados.email
            };

            const usuarioBackend = await sincronizarUsuarioConBackend(usuarioGoogle);

            if (usuarioBackend) {
                setTimeout(() => { navigate(from, { replace: true }); }, 1500);
            } else {
                setMensaje("Error de sincronización con el servidor.");
            }
        } catch (error) {
            console.error("Error al procesar el inicio de sesión con Google:", error);
            setMensaje("Error al iniciar sesión.");
        }
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validaciones del frontend
        const emailTrim = email.trim();
        const passwordTrim = password.trim();

        if (!emailTrim || !passwordTrim) {
            setMensaje('Por favor, completa todos los campos.');
            return;
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(emailTrim)) {
            setMensaje('El formato del correo electrónico no es válido.');
            return;
        }

        if (passwordTrim.length < 6) {
            setMensaje('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoggingIn(true);
        setMensaje('');

        try {
            const res = await loginConEmail(emailTrim, passwordTrim);
            if (res.success) {
                setMensaje('¡Inicio de sesión exitoso! Redireccionando...');
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1200);
            } else {
                setMensaje(res.error);
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            setMensaje('Ocurrió un error inesperado al intentar iniciar sesión.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <main className="login-main">
                <div className="login-card">
                    {/* Panel izquierdo — imagen */}
                    <div className="login-image-panel">
                        <img
                            src="/images/login_banner.webp"
                            alt="Bloque Mundo LEGO"
                            className="login-banner-img"
                        />
                    </div>

                    {/* Panel derecho — formulario */}
                    <div className="login-form-panel">
                        {perfil ? (
                            <div className="login-success">
                                <img src={perfil.picture} alt="Foto de perfil" className="login-avatar" />
                                <h2>{mensaje}</h2>
                                <p>{perfil.email}</p>
                                <p className="login-redirect">Redireccionando a la tienda...</p>
                            </div>
                        ) : (
                            <>
                                <h1 className="login-title">Iniciar Sesión</h1>
                                <p className="login-subtitle">Ingresá tus Datos</p>

                                <form className="login-form" onSubmit={handleLoginSubmit}>
                                    <div className="login-field">
                                        <input
                                            type="email"
                                            placeholder="Correo Electrónico"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="login-input"
                                        />
                                    </div>
                                    <div className="login-field">
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="login-input"
                                        />
                                    </div>

                                    <button type="submit" className="login-btn" disabled={isLoggingIn}>
                                        {isLoggingIn ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                                    </button>

                                    <div className="login-forgot">
                                        <a href="#">Olvidé mi contraseña</a>
                                    </div>
                                </form>

                                <div className="login-divider">
                                    <span>o continuá con</span>
                                </div>

                                {/* Botón de Google */}
                                <div id="g_id_signin" className="login-google-btn"></div>

                                {mensaje && <p className="login-msg">{mensaje}</p>}

                                <p className="login-register">
                                    ¿No tenés cuenta?{' '}
                                    <Link to="/register" state={{ from }}>Registrate</Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

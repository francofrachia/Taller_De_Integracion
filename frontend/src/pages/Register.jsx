import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import registerImg from '../assets/40792_Lifestyle_Envr_en-gb.webp';
import './Login.css'; // Reutilizamos los estilos del login porque la estructura es idéntica

export default function Register() {
    const { sincronizarUsuarioConBackend, registrarConEmail } = useContext(AppContext);
    const [mensaje, setMensaje] = useState('');
    const [perfil, setPerfil] = useState(null);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
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
                        context: "signin", // Usar "signin" como base (no afecta al botón estandar que usa "signup_with")
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
                        text: "signup_with",
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

            setMensaje(`¡Bienvenido, ${datosDecodificados.given_name}!`);

            const usuarioGoogle = {
                nombre: datosDecodificados.given_name,
                email: datosDecodificados.email
            };

            const usuarioBackend = await sincronizarUsuarioConBackend(usuarioGoogle);

            if (usuarioBackend) {
                setTimeout(() => { navigate(from, { replace: true }); }, 1500);
            } else {
                setMensaje("Error al crear la cuenta en el servidor.");
            }
        } catch (error) {
            console.error("Error al procesar el registro con Google:", error);
            setMensaje("Error al registrarse.");
        }
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validaciones del frontend
        const nombreTrim = nombre.trim();
        const emailTrim = email.trim();
        const passwordTrim = password.trim();

        if (!nombreTrim || !emailTrim || !passwordTrim) {
            setMensaje('Por favor, completa todos los campos.');
            return;
        }

        // Validación estricta del Nombre
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
        if (nombreTrim.length < 2 || nombreTrim.length > 50 || !regexNombre.test(nombreTrim)) {
            setMensaje('El nombre solo puede contener letras, espacios y guiones, con una longitud de 2 a 50 caracteres.');
            return;
        }

        // Validación estricta del Email
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailTrim.length > 100 || !regexEmail.test(emailTrim)) {
            setMensaje('El formato del correo electrónico no es válido.');
            return;
        }

        // Validación estricta de la Contraseña
        if (passwordTrim.length < 6 || passwordTrim.length > 50) {
            setMensaje('La contraseña debe tener entre 6 y 50 caracteres.');
            return;
        }

        setIsRegistering(true);
        setMensaje('');

        try {
            const res = await registrarConEmail(nombreTrim, emailTrim, passwordTrim);
            if (res.success) {
                setMensaje('¡Cuenta creada con éxito! Redireccionando...');
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1200);
            } else {
                setMensaje(res.error);
            }
        } catch (error) {
            console.error("Error al registrarse:", error);
            setMensaje('Ocurrió un error inesperado al intentar crear tu cuenta.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <main className="login-main">
                <div className="login-card">
                    {/* Panel izquierdo — imagen (usando la del elefante) */}
                    <div className="login-image-panel">
                        <img
                            src={registerImg}
                            alt="Bloque Mundo LEGO Registro"
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
                                <h1 className="login-title">Crear una Cuenta</h1>
                                <p className="login-subtitle">Ingresá tus Datos</p>

                                <form className="login-form" onSubmit={handleRegisterSubmit}>
                                    <div className="login-field">
                                        <input
                                            type="text"
                                            placeholder="Nombre"
                                            value={nombre}
                                            onChange={e => setNombre(e.target.value)}
                                            className="login-input"
                                            required
                                        />
                                    </div>
                                    <div className="login-field">
                                        <input
                                            type="email"
                                            placeholder="Correo Electrónico"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="login-input"
                                            required
                                        />
                                    </div>
                                    <div className="login-field">
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="login-input"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="login-btn" disabled={isRegistering}>
                                        {isRegistering ? 'Creando Cuenta...' : 'Crear Cuenta'}
                                    </button>
                                </form>

                                <div className="login-divider">
                                    <span>o continuá con</span>
                                </div>

                                {/* Botón de Google */}
                                <div id="g_id_signin" className="login-google-btn"></div>

                                {mensaje && <p className="login-msg">{mensaje}</p>}

                                <p className="login-register">
                                    ¿Ya tenés cuenta?{' '}
                                    <Link to="/login" state={{ from }}>Iniciar Sesión</Link>
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

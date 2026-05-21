import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import registerImg from '../assets/40792_Lifestyle_Envr_en-gb.webp';
import './Login.css'; // Reutilizamos los estilos del login porque la estructura es idéntica

export default function Register() {
    const { sincronizarUsuarioConBackend } = useContext(AppContext);
    const [mensaje, setMensaje] = useState('');
    const [perfil, setPerfil] = useState(null);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const CLIENT_ID = "676947281267-v3l9o98u7f9b3v8ids8t0fhgb9ar3mbm.apps.googleusercontent.com";

    useEffect(() => {
        const scriptId = 'google-gis-sdk';
        let script = document.getElementById(scriptId);

        const inicializarGoogle = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    context: "signup",
                    ux_mode: "popup",
                    callback: manejarRespuestaGoogle,
                    auto_prompt: false
                });

                const buttonDiv = document.getElementById("g_id_signin");
                if (buttonDiv) {
                    window.google.accounts.id.renderButton(buttonDiv, {
                        type: "standard",
                        shape: "rectangular",
                        theme: "outline",
                        text: "signup_with",
                        size: "large",
                        width: "100%",
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
            inicializarGoogle();
        }
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
                setTimeout(() => { navigate('/'); }, 1500);
            } else {
                setMensaje("Error al crear la cuenta en el servidor.");
            }
        } catch (error) {
            console.error("Error al procesar el registro con Google:", error);
            setMensaje("Error al registrarse.");
        }
    }

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        // Por ahora solo visual — conectar con backend cuando esté listo
        setMensaje('Funcionalidad de registro por email próximamente.');
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

                                    <button type="submit" className="login-btn">
                                        Crear Cuenta
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
                                    <Link to="/login">Iniciar Sesión</Link>
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

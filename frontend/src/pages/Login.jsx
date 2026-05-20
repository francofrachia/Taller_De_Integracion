import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Login() {
    const { sincronizarUsuarioConBackend } = useContext(AppContext);
    const [mensaje, setMensaje] = useState('');
    const [perfil, setPerfil] = useState(null);
    const navigate = useNavigate();

    const CLIENT_ID = "676947281267-v3l9o98u7f9b3v8ids8t0fhgb9ar3mbm.apps.googleusercontent.com";

    useEffect(() => {
        // 1. Cargar dinámicamente el script de Google Identity Services
        const scriptId = 'google-gis-sdk';
        let script = document.getElementById(scriptId);

        const inicializarGoogle = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    context: "signin",
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
            inicializarGoogle();
        }

        return () => {
            // No destruimos el script para que siga cargado si volvemos a la página,
            // pero podemos limpiar el contenedor si se desmonta.
        };
    }, []);

    // 2. Callback cuando Google responde exitosamente
    async function manejarRespuestaGoogle(response) {
        console.log("Token JWT de Google recibido:", response.credential);

        try {
            // Decodificar el token JWT recibido en el cliente (atob)
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

            console.log("Datos de Google desencriptados:", datosDecodificados);

            // Mostrar el perfil del usuario temporalmente en pantalla
            setPerfil({
                picture: datosDecodificados.picture,
                name: datosDecodificados.given_name,
                email: datosDecodificados.email
            });

            setMensaje(`¡Hola, ${datosDecodificados.given_name}!`);

            // Armar objeto de usuario para el backend
            const usuarioGoogle = {
                nombre: datosDecodificados.given_name,
                email: datosDecodificados.email
            };

            // Sincronizar con el backend de Express usando el Contexto
            const usuarioBackend = await sincronizarUsuarioConBackend(usuarioGoogle);

            if (usuarioBackend) {
                // Redirigir al inicio después de 1.5 segundos
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setMensaje("Error de sincronización con el servidor.");
            }
        } catch (error) {
            console.error("Error al procesar el inicio de sesión con Google:", error);
            setMensaje("Error al iniciar sesión.");
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Bloque Mundo 🧱</h2>
                <p className="login-subtitle">Iniciá sesión para continuar</p>

                {/* Contenedor del Botón de Google */}
                {!perfil && (
                    <div 
                        id="g_id_signin" 
                        style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
                    ></div>
                )}

                {/* Mensaje de Estado / Bienvenida */}
                {perfil && (
                    <div className="mensaje-login">
                        {perfil.picture && (
                            <img 
                                src={perfil.picture} 
                                alt="Foto de perfil" 
                                style={{ borderRadius: '50%', width: '50px', marginBottom: '10px' }} 
                            />
                        )}
                        <span>{mensaje}</span>
                        {perfil.email && (
                            <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                {perfil.email}
                            </span>
                        )}
                        <span style={{ fontSize: '0.85rem', color: '#0055AD', marginTop: '10px' }}>
                            Redireccionando a la tienda...
                        </span>
                    </div>
                )}

                <br />
                <Link to="/" className="back-link">
                    Volver a la tienda
                </Link>
            </div>
        </div>
    );
}

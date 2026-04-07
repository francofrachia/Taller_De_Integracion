// /assets/js/auth.js

// Función para registrar/loguear al usuario en TU base de datos
async function sincronizarUsuarioConBackend(usuarioGoogle) {
    try {
        // Usamos la variable API_URL de config.js en lugar de escribir toda la ruta
        const respuesta = await fetch(`${API_URL}/auth/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: usuarioGoogle.nombre, // Ajustado para que coincida con lo que decodificamos
                email: usuarioGoogle.email
            })
        });

        const datos = await respuesta.json();
        console.log("Respuesta de Bloque Mundo Backend:", datos);

        // Guardamos el usuario en el localStorage para mantener la sesión
        localStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));

        // Redirigimos al inicio después de loguearse exitosamente
        window.location.href = "../index.html";

    } catch (error) {
        console.error("Error sincronizando con el backend:", error);
    }
}
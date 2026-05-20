import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // 1. Cargar datos del localStorage e inicializar sesión al montar
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario_bloquemundo');
        if (usuarioGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (e) {
                console.error("Error al parsear el usuario guardado:", e);
            }
        }

        const carritoGuardado = localStorage.getItem('carrito_items');
        if (carritoGuardado) {
            try {
                setCartItems(JSON.parse(carritoGuardado));
            } catch (e) {
                console.error("Error al parsear el carrito", e);
            }
        }

        obtenerProductos();
    }, []);

    // 2. Fetch de productos del backend
    async function obtenerProductos() {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/productos`);
            if (response.ok) {
                const data = await response.json();
                setProductos(data);
            } else {
                console.error("Error en la respuesta de la API de productos");
            }
        } catch (error) {
            console.error("Error conectando con la API:", error);
        } finally {
            setLoading(false);
        }
    }

    // 3. Función para añadir al carrito (guardar el ítem completo)
    function agregarAlCarrito(producto) {
        setCartItems(prevItems => {
            const index = prevItems.findIndex(item => item.id === producto.id);
            let newItems = [...prevItems];
            if (index !== -1) {
                // Si ya existe, incrementar cantidad
                newItems[index].cantidad = (newItems[index].cantidad || 1) + 1;
            } else {
                // Si no existe, agregar con cantidad 1
                newItems.push({ ...producto, cantidad: 1 });
            }
            localStorage.setItem('carrito_items', JSON.stringify(newItems));
            return newItems;
        });
        console.log(`Producto ${producto.nombre} añadido al carrito.`);
    }

    function vaciarCarrito() {
        setCartItems([]);
        localStorage.removeItem('carrito_items');
    }

    // 4. Función de sincronización de usuario al iniciar sesión con Google
    async function sincronizarUsuarioConBackend(usuarioGoogle) {
        try {
            const respuesta = await fetch(`${API_URL}/auth/google-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: usuarioGoogle.nombre,
                    email: usuarioGoogle.email
                })
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                console.log("Respuesta de Bloque Mundo Backend:", datos);
                
                // Guardar en estado y localStorage
                setUsuario(datos.usuario);
                localStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                return datos.usuario;
            } else {
                console.error("Error al sincronizar con el backend");
                return null;
            }
        } catch (error) {
            console.error("Error sincronizando con el backend:", error);
            return null;
        }
    }

    // 5. Cerrar sesión
    function logout() {
        setUsuario(null);
        localStorage.removeItem('usuario_bloquemundo');
        console.log("Sesión cerrada.");
    }

    return (
        <AppContext.Provider value={{
            productos,
            busqueda,
            setBusqueda,
            cartItems,
            agregarAlCarrito,
            vaciarCarrito,
            usuario,
            setUsuario,
            sincronizarUsuarioConBackend,
            logout,
            loading,
            API_URL
        }}>
            {children}
        </AppContext.Provider>
    );
}

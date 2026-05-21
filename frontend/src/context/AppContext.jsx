import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cart, setCart] = useState(null); // Objeto de carrito del backend: { id_carrito, total, items }
    const [cartCount, setCartCount] = useState(0);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // 1. Cargar datos del localStorage / sessionStorage e inicializar sesión al montar
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario_bloquemundo') || sessionStorage.getItem('usuario_bloquemundo');
        if (usuarioGuardado) {
            try {
                const user = JSON.parse(usuarioGuardado);
                setUsuario(user);
                obtenerCarrito(user.id_usuario);
            } catch (e) {
                console.error("Error al parsear el usuario guardado:", e);
            }
        } else {
            // Si no hay usuario, no cargamos carrito (limpiar estado)
            setCart(null);
            setCartCount(0);
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

    // 3. Funciones de carrito conectadas al backend
    async function obtenerCarrito(id_usuario) {
        try {
            const response = await fetch(`${API_URL}/carrito?id_usuario=${id_usuario}`);
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                // Calcular total de ítems para el badge
                const count = data.items.reduce((acc, item) => acc + item.cantidad, 0);
                setCartCount(count);
            }
        } catch (error) {
            console.error("Error obteniendo carrito:", error);
        }
    }

    async function agregarAlCarrito(id_producto, cantidad = 1) {
        if (!usuario || !usuario.id_usuario) {
            return { success: false, requireLogin: true };
        }

        // Guardar valores previos por si falla la llamada
        const oldCart = cart;
        const oldCartCount = cartCount;

        // Actualización optimista
        let newItems = [];
        let itemAlreadyInCart = false;

        if (cart && cart.items) {
            newItems = cart.items.map(item => {
                if (item.id_producto === id_producto) {
                    itemAlreadyInCart = true;
                    return { ...item, cantidad: item.cantidad + cantidad };
                }
                return item;
            });
        }

        if (!itemAlreadyInCart) {
            const productInfo = productos.find(p => p.id_producto === id_producto);
            const newItem = {
                id_producto,
                cantidad,
                precio: productInfo ? parseFloat(productInfo.precio) : 0,
                nombre: productInfo ? productInfo.nombre : 'Producto',
                imagenes: productInfo ? (productInfo.imagenes || []) : [],
                stock: productInfo ? productInfo.stock : 99
            };
            newItems = [...newItems, newItem];
        }

        const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
        const newCart = { 
            id_carrito: cart?.id_carrito || null, 
            total: newTotal, 
            items: newItems 
        };

        setCart(newCart);
        setCartCount(newItems.reduce((acc, item) => acc + item.cantidad, 0));

        const id_usuario = usuario.id_usuario;
        try {
            const response = await fetch(`${API_URL}/carrito/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario, id_producto, cantidad })
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                setCartCount(data.items.reduce((acc, item) => acc + item.cantidad, 0));
                console.log(`Producto ${id_producto} añadido al carrito.`);
                return { success: true };
            } else {
                console.error("Error al añadir al carrito");
                setCart(oldCart);
                setCartCount(oldCartCount);
                return { success: false, error: 'Error del servidor' };
            }
        } catch (error) {
            console.error(error);
            setCart(oldCart);
            setCartCount(oldCartCount);
            return { success: false, error: error.message };
        }
    }

    async function actualizarCantidadCarrito(id_producto, cantidad) {
        if (!usuario || !usuario.id_usuario) {
            return { success: false, requireLogin: true };
        }

        const oldCart = cart;
        const oldCartCount = cartCount;

        // Actualización optimista
        if (cart && cart.items) {
            const newItems = cart.items.map(item => {
                if (item.id_producto === id_producto) {
                    return { ...item, cantidad };
                }
                return item;
            });
            const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
            const newCart = { ...cart, items: newItems, total: newTotal };
            setCart(newCart);
            setCartCount(newItems.reduce((acc, item) => acc + item.cantidad, 0));
        }

        const id_usuario = usuario.id_usuario;
        try {
            const response = await fetch(`${API_URL}/carrito/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario, id_producto, cantidad })
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                setCartCount(data.items.reduce((acc, item) => acc + item.cantidad, 0));
            } else {
                setCart(oldCart);
                setCartCount(oldCartCount);
            }
        } catch (error) {
            console.error(error);
            setCart(oldCart);
            setCartCount(oldCartCount);
        }
    }

    async function removerDelCarrito(id_producto) {
        if (!usuario || !usuario.id_usuario) {
            return { success: false, requireLogin: true };
        }

        const oldCart = cart;
        const oldCartCount = cartCount;

        // Actualización optimista
        if (cart && cart.items) {
            const newItems = cart.items.filter(item => item.id_producto !== id_producto);
            const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
            const newCart = { ...cart, items: newItems, total: newTotal };
            setCart(newCart);
            setCartCount(newItems.reduce((acc, item) => acc + item.cantidad, 0));
        }

        const id_usuario = usuario.id_usuario;
        try {
            const response = await fetch(`${API_URL}/carrito/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario, id_producto })
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                setCartCount(data.items.reduce((acc, item) => acc + item.cantidad, 0));
            } else {
                setCart(oldCart);
                setCartCount(oldCartCount);
            }
        } catch (error) {
            console.error(error);
            setCart(oldCart);
            setCartCount(oldCartCount);
        }
    }

    async function vaciarCarrito() {
        if (!usuario || !usuario.id_usuario) {
            return;
        }
        const id_usuario = usuario.id_usuario;
        try {
            const response = await fetch(`${API_URL}/carrito/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario })
            });
            if (response.ok) {
                setCart({ id_carrito: cart?.id_carrito, total: 0, items: [] });
                setCartCount(0);
            }
        } catch (error) {
            console.error(error);
        }
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
                
                // Guardar en estado, localStorage y sessionStorage
                setUsuario(datos.usuario);
                localStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                // Cargar carrito del usuario
                obtenerCarrito(datos.usuario.id_usuario);
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
        sessionStorage.removeItem('usuario_bloquemundo');
        console.log("Sesión cerrada.");
    }

    return (
        <AppContext.Provider value={{
            productos,
            busqueda,
            setBusqueda,
            cart,
            cartCount,
            agregarAlCarrito,
            actualizarCantidadCarrito,
            removerDelCarrito,
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

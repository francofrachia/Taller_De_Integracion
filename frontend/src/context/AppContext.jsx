import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cart, setCart] = useState(null); // Objeto de carrito del backend: { id_carrito, total, items }
    const [cartCount, setCartCount] = useState(0);
    const [favoritos, setFavoritos] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false); // true cuando usuario+carrito+productos ya cargaron

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // 5. Cerrar sesión (definida arriba para poder invocarla desde init y otros métodos)
    function logout() {
        setUsuario(null);
        setToken(null);
        setCart(null);
        setCartCount(0);
        setFavoritos([]); // Limpiar favoritos también al cerrar sesión
        localStorage.removeItem('usuario_bloquemundo');
        sessionStorage.removeItem('usuario_bloquemundo');
        localStorage.removeItem('token_bloquemundo');
        sessionStorage.removeItem('token_bloquemundo');
        console.log("Sesión cerrada y limpiada.");
    }

    // 1. Cargar datos del localStorage / sessionStorage e inicializar sesión al montar
    useEffect(() => {
        const init = async () => {
            let tokenGuardado = localStorage.getItem('token_bloquemundo') || sessionStorage.getItem('token_bloquemundo');
            const usuarioGuardado = localStorage.getItem('usuario_bloquemundo') || sessionStorage.getItem('usuario_bloquemundo');
            
            // Sanitización extrema: Si el token guardado es la cadena "null" o "undefined" debido a bugs previos, limpiarlo
            if (tokenGuardado === 'null' || tokenGuardado === 'undefined') {
                tokenGuardado = null;
                localStorage.removeItem('token_bloquemundo');
                sessionStorage.removeItem('token_bloquemundo');
            }

            let loadedToken = null;
            if (tokenGuardado) {
                loadedToken = tokenGuardado;
                setToken(tokenGuardado);
            }

            if (usuarioGuardado) {
                try {
                    const user = JSON.parse(usuarioGuardado);
                    setUsuario(user);
                    // Esperamos tanto productos como carrito antes de marcar como inicializado
                    await Promise.all([
                        obtenerProductos(),
                        obtenerCarrito(loadedToken),
                        obtenerFavoritos(loadedToken)
                    ]);
                } catch (e) {
                    console.error("Error al parsear el usuario guardado:", e);
                    await obtenerProductos();
                }
            } else {
                // Si no hay usuario, no cargamos carrito (limpiar estado)
                setCart(null);
                setCartCount(0);
                setFavoritos([]);
                await obtenerProductos();
            }
            setIsInitialized(true);
        };
        init();
    }, []);

    // 2. Fetch de productos del backend (público)
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

    // 3. Funciones de carrito conectadas al backend (Protegidas con JWT)
    async function obtenerCarrito(tokenHeaderVal) {
        const currentToken = tokenHeaderVal || token;
        if (!currentToken || currentToken === 'null' || currentToken === 'undefined') return;

        try {
            const response = await fetch(`${API_URL}/carrito`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                // Calcular total de ítems para el badge
                const count = data.items.reduce((acc, item) => acc + item.cantidad, 0);
                setCartCount(count);
            } else if (response.status === 401 || response.status === 403) {
                // Si el token es inválido o expiró en el backend, auto-logout para limpiar el estado corrupto
                console.warn("Sesión expirada o inválida detectada al obtener carrito. Auto-logout.");
                logout();
            } else {
                // Si falla el carrito, inicializamos uno vacío para no bloquear la app
                setCart({ id_carrito: null, total: 0, items: [] });
            }
        } catch (error) {
            console.error("Error obteniendo carrito:", error);
            setCart({ id_carrito: null, total: 0, items: [] });
        }
    }

    async function agregarAlCarrito(id_producto, cantidad = 1) {
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
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

        try {
            const response = await fetch(`${API_URL}/carrito/add`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_producto, cantidad })
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                setCartCount(data.items.reduce((acc, item) => acc + item.cantidad, 0));
                console.log(`Producto ${id_producto} añadido al carrito.`);
                return { success: true };
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida detectada al agregar producto. Auto-logout.");
                logout();
                setCart(oldCart);
                setCartCount(oldCartCount);
                return { success: false, requireLogin: true };
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
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
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

        try {
            const response = await fetch(`${API_URL}/carrito/update`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_producto, cantidad })
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                setCartCount(data.items.reduce((acc, item) => acc + item.cantidad, 0));
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida al actualizar carrito. Auto-logout.");
                logout();
                setCart(oldCart);
                setCartCount(oldCartCount);
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
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
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

        try {
            const response = await fetch(`${API_URL}/carrito/remove`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_producto })
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
                setCartCount(data.items.reduce((acc, item) => acc + item.cantidad, 0));
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida al remover item. Auto-logout.");
                logout();
                setCart(oldCart);
                setCartCount(oldCartCount);
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
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/carrito/clear`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setCart({ id_carrito: cart?.id_carrito, total: 0, items: [] });
                setCartCount(0);
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida al vaciar carrito. Auto-logout.");
                logout();
            }
        } catch (error) {
            console.error(error);
        }
    }

    // 4. Favoritos
    async function obtenerFavoritos(tokenHeaderVal) {
        const currentToken = tokenHeaderVal || token;
        if (!currentToken || currentToken === 'null' || currentToken === 'undefined') return;

        try {
            const response = await fetch(`${API_URL}/favoritos`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFavoritos(data.favoritos.map(f => f.id_producto)); // Guardamos solo IDs en el contexto para acceso rápido
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida detectada al obtener favoritos. Auto-logout.");
                logout();
            }
        } catch (error) {
            console.error("Error al obtener favoritos:", error);
        }
    }

    async function toggleFavorito(id_producto) {
        if (!usuario || !token || token === 'null' || token === 'undefined') {
            alert('Debes iniciar sesión para agregar a favoritos');
            return;
        }

        const isFav = favoritos.includes(id_producto);
        const method = isFav ? 'DELETE' : 'POST';

        // Actualización optimista
        if (isFav) {
            setFavoritos(prev => prev.filter(id => id !== id_producto));
        } else {
            setFavoritos(prev => [...prev, id_producto]);
        }

        try {
            const response = await fetch(`${API_URL}/favoritos`, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_producto })
            });
            if (!response.ok) {
                // Revertir en caso de error
                if (isFav) setFavoritos(prev => [...prev, id_producto]);
                else setFavoritos(prev => prev.filter(id => id !== id_producto));

                if (response.status === 401 || response.status === 403) {
                    console.warn("Sesión expirada o inválida al hacer toggle en favoritos. Auto-logout.");
                    logout();
                }
            }
        } catch (error) {
            console.error("Error al hacer toggle en favoritos:", error);
            if (isFav) setFavoritos(prev => [...prev, id_producto]);
            else setFavoritos(prev => prev.filter(id => id !== id_producto));
        }
    }

    // 5. Función de sincronización de usuario al iniciar sesión con Google
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
                setToken(datos.token);
                localStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                localStorage.setItem('token_bloquemundo', datos.token);
                sessionStorage.setItem('token_bloquemundo', datos.token);
                
                // Cargar carrito y favoritos del usuario usando el token retornado
                obtenerCarrito(datos.token);
                obtenerFavoritos(datos.token);
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

    async function loginConEmail(email, contrasena) {
        try {
            const respuesta = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, contrasena })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                console.log("[Login] Inicio de sesión exitoso con email.");
                setUsuario(datos.usuario);
                setToken(datos.token);
                localStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                localStorage.setItem('token_bloquemundo', datos.token);
                sessionStorage.setItem('token_bloquemundo', datos.token);

                await Promise.all([
                    obtenerCarrito(datos.token),
                    obtenerFavoritos(datos.token)
                ]);

                return { success: true, usuario: datos.usuario };
            } else {
                return { success: false, error: datos.error || 'Error al iniciar sesión.' };
            }
        } catch (error) {
            console.error("Error en loginConEmail:", error);
            return { success: false, error: 'Error de conexión con el servidor.' };
        }
    }

    async function registrarConEmail(nombre, email, contrasena) {
        try {
            const respuesta = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, email, contrasena })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                console.log("[Register] Cuenta creada exitosamente con email.");
                setUsuario(datos.usuario);
                setToken(datos.token);
                localStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(datos.usuario));
                localStorage.setItem('token_bloquemundo', datos.token);
                sessionStorage.setItem('token_bloquemundo', datos.token);

                await Promise.all([
                    obtenerCarrito(datos.token),
                    obtenerFavoritos(datos.token)
                ]);

                return { success: true, usuario: datos.usuario };
            } else {
                return { success: false, error: datos.error || 'Error al registrar el usuario.' };
            }
        } catch (error) {
            console.error("Error en registrarConEmail:", error);
            return { success: false, error: 'Error de conexión con el servidor.' };
        }
    }


    async function actualizarAvatar(avatar_url) {
        if (!usuario || !token || token === 'null' || token === 'undefined') {
            return { success: false, requireLogin: true };
        }

        try {
            const respuesta = await fetch(`${API_URL}/auth/avatar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar_url })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                console.log("[Avatar] Avatar actualizado con éxito.");
                // Actualizar en el estado y almacenamiento
                const nuevoUsuario = { ...usuario, avatar_url: datos.usuario.avatar_url };
                setUsuario(nuevoUsuario);
                localStorage.setItem('usuario_bloquemundo', JSON.stringify(nuevoUsuario));
                sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(nuevoUsuario));
                return { success: true };
            } else if (respuesta.status === 401 || respuesta.status === 403) {
                console.warn("Sesión expirada o inválida al actualizar avatar. Auto-logout.");
                logout();
                return { success: false, requireLogin: true };
            } else {
                return { success: false, error: datos.error || 'Error al actualizar el avatar.' };
            }
        } catch (error) {
            console.error("Error en actualizarAvatar:", error);
            return { success: false, error: 'Error de conexión con el servidor.' };
        }
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
            favoritos,
            toggleFavorito,
            usuario,
            setUsuario,
            token,
            setToken,
            sincronizarUsuarioConBackend,
            loginConEmail,
            registrarConEmail,
            actualizarAvatar,
            logout,
            loading,
            isInitialized,
            API_URL
        }}>
            {children}
        </AppContext.Provider>
    );
}

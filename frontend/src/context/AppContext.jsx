import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getRealStock } from '../utils/stockHelpers';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [fetchError, setFetchError] = useState(false);
    const [cart, setCart] = useState(null); // Objeto de carrito del backend: { id_carrito, total, items }
    const [cartCount, setCartCount] = useState(0);
    const [favoritos, setFavoritos] = useState([]);
    const [favoritosData, setFavoritosData] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false); // true cuando usuario+carrito+productos ya cargaron
    const [loginTooltipVisible, setLoginTooltipVisible] = useState(false);
    const [promociones, setPromociones] = useState([]);
    const [toasts, setToasts] = useState([]);

    const addToast = (titulo, mensaje, tipo = 'success') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, titulo, mensaje, tipo, exiting: false }]);
        
        // Iniciar animación de salida a los 2.7 segundos
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        }, 2700);

        // Remover del estado a los 3.0 segundos
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // Helper privado para persistir sesión (Principios DRY/SOLID)
    function persistirSesion(nuevoUsuario, nuevoToken) {
        if (nuevoUsuario) {
            setUsuario(nuevoUsuario);
            localStorage.setItem('usuario_bloquemundo', JSON.stringify(nuevoUsuario));
            sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(nuevoUsuario));
        }
        if (nuevoToken && nuevoToken !== 'null' && nuevoToken !== 'undefined') {
            setToken(nuevoToken);
            localStorage.setItem('token_bloquemundo', nuevoToken);
            sessionStorage.setItem('token_bloquemundo', nuevoToken);
        }
    }

    // 5. Cerrar sesión (definida arriba para poder invocarla desde init y otros métodos)
    function logout() {
        setUsuario(null);
        setToken(null);
        setCart(null);
        setCartCount(0);
        setFavoritos([]); // Limpiar favoritos también al cerrar sesión
        setFavoritosData([]);
        localStorage.removeItem('usuario_bloquemundo');
        sessionStorage.removeItem('usuario_bloquemundo');
        localStorage.removeItem('token_bloquemundo');
        sessionStorage.removeItem('token_bloquemundo');
        console.log("Sesión cerrada y limpiada.");
    }

    // 1. Cargar datos del localStorage / sessionStorage e inicializar sesión al montar
    useEffect(() => {
        const init = async () => {
            try {
                let tokenGuardado = localStorage.getItem('token_bloquemundo') || sessionStorage.getItem('token_bloquemundo');
                const usuarioGuardado = localStorage.getItem('usuario_bloquemundo') || sessionStorage.getItem('usuario_bloquemundo');
                
                // Sanitización extrema (Legado): Si existiera el string 'null', lo limpiamos
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
                            obtenerProductos().catch(err => console.error("Error init productos:", err)),
                            obtenerPromociones().catch(err => console.error("Error init promos:", err)),
                            obtenerCarrito(loadedToken).catch(err => console.error("Error init carrito:", err)),
                            obtenerFavoritos(loadedToken).catch(err => console.error("Error init favoritos:", err))
                        ]);
                    } catch (e) {
                        console.error("Error al parsear el usuario guardado:", e);
                        await Promise.all([
                            obtenerProductos().catch(err => console.error("Error init productos fallback:", err)),
                            obtenerPromociones().catch(err => console.error("Error init promos fallback:", err))
                        ]);
                    }
                } else {
                    // Si no hay usuario, no cargamos carrito (limpiar estado)
                    setCart(null);
                    setCartCount(0);
                    setFavoritos([]);
                    await Promise.all([
                        obtenerProductos().catch(err => console.error("Error init productos guest:", err)),
                        obtenerPromociones().catch(err => console.error("Error init promos guest:", err))
                    ]);
                }
            } catch (err) {
                console.error("Error crítico en inicialización de AppContext:", err);
            } finally {
                setIsInitialized(true);
            }
        };
        init();
    }, []);

    // 1.5 Conexión SSE para recibir actualizaciones en tiempo real del stock
    useEffect(() => {
        const evtSource = new EventSource(`${API_URL}/stream/stock`);

        evtSource.addEventListener('stock_update', (e) => {
            console.log('SSE: Actualización de stock recibida, sincronizando catálogo...');
            fetch(`${API_URL}/productos`)
                .then(res => res.json())
                .then(data => setProductos(data))
                .catch(err => console.error("Error sincronizando catálogo:", err));
        });

        evtSource.onerror = () => {
            console.warn("SSE: Error de conexión, intentando reconectar...");
        };

        return () => {
            evtSource.close();
        };
    }, [API_URL]);

    // Sincronizar catálogo y carrito/reservas al recuperar el foco de la pestaña, cambiar visibilidad o regresar de páginas externas
    useEffect(() => {
        let lastSync = 0;
        const handleSync = () => {
            const now = Date.now();
            // Evitar spam de peticiones (cooldown de 1.5s)
            if (now - lastSync < 1500) return;
            lastSync = now;

            console.log("[AppContext] Detectado foco/visibilidad/pageshow. Sincronizando stock y carrito con el servidor...");
            obtenerProductos(true);
            
            const currentToken = localStorage.getItem('token_bloquemundo') || sessionStorage.getItem('token_bloquemundo') || token;
            if (currentToken && currentToken !== 'null' && currentToken !== 'undefined') {
                obtenerCarrito(currentToken);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                handleSync();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleSync);
        window.addEventListener('pageshow', handleSync);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleSync);
            window.removeEventListener('pageshow', handleSync);
        };
    }, [token]);

    // 2. Fetch de productos del backend (público)
    const obtenerProductos = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await fetch(`${API_URL}/productos`);
            if (response.ok) {
                const data = await response.json();
                setProductos(data);
                setFetchError(false);
            } else {
                console.error("Error en la respuesta de la API de productos");
                setFetchError(true);
            }
        } catch (error) {
            console.error("Error conectando con la API:", error);
            setFetchError(true);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [API_URL]);

    // 2.5 Fetch promociones del backend
    async function obtenerPromociones() {
        try {
            const response = await fetch(`${API_URL}/productos/promociones`);
            if (response.ok) {
                const data = await response.json();
                setPromociones(data);
            }
        } catch (error) {
            console.error("Error obteniendo promociones:", error);
        }
    }

    // 3. Funciones de carrito conectadas al backend (Protegidas con JWT)
    const obtenerCarrito = useCallback(async (tokenHeaderVal) => {
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
    }, [token, API_URL]);

    async function agregarAlCarrito(id_producto, cantidad = 1) {
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
            addToast('Iniciar Sesión', 'Debes iniciar sesión para agregar productos al carrito.', 'warning');
            return { success: false, requireLogin: true };
        }

        const dbProduct = productos.find(p => p.id_producto === id_producto);
        if (!dbProduct) {
            addToast('Error', 'Producto no encontrado.', 'error');
            return { success: false };
        }

        if (dbProduct.activo === false) {
            addToast('No disponible', 'Este producto ha sido descontinuado.', 'warning');
            return { success: false };
        }

        const realStock = getRealStock(id_producto, productos, cart);
        const currentItem = cart?.items?.find(item => item.id_producto === id_producto);
        const currentQty = currentItem ? currentItem.cantidad : 0;
        const targetQty = currentQty + cantidad;

        if (targetQty > realStock) {
            addToast('Stock Insuficiente', `No puedes agregar más unidades. El stock máximo disponible es de ${realStock} unidades.`, 'warning');
            return { success: false };
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
                
                addToast('Sesión Expirada', 'Por favor, inicia sesión de nuevo.', 'warning');
                
                return { success: false, requireLogin: true };
            } else {
                console.error("Error al añadir al carrito");
                setCart(oldCart);
                setCartCount(oldCartCount);
                
                addToast('Error', 'No se pudo agregar el producto al carrito.', 'error');
                
                return { success: false, error: 'Error del servidor' };
            }
        } catch (error) {
            console.error(error);
            setCart(oldCart);
            setCartCount(oldCartCount);
            
            addToast('Error de Conexión', 'Comprueba tu conexión e intenta de nuevo.', 'error');
            
            return { success: false, error: error.message };
        }
    }

    async function actualizarCantidadCarrito(id_producto, cantidad) {
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
            return { success: false, requireLogin: true };
        }

        const dbProduct = productos.find(p => p.id_producto === id_producto);
        if (!dbProduct) {
            addToast('Error', 'Producto no encontrado.', 'error');
            return { success: false };
        }

        if (dbProduct.activo === false) {
            addToast('No disponible', 'Este producto ha sido descontinuado.', 'warning');
            return { success: false };
        }

        const realStock = getRealStock(id_producto, productos, cart);
        if (cantidad > realStock) {
            addToast('Stock Insuficiente', `No puedes seleccionar esa cantidad. El stock máximo disponible es de ${realStock} unidades.`, 'warning');
            return { success: false };
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
                return { success: true };
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida al actualizar carrito. Auto-logout.");
                logout();
                setCart(oldCart);
                setCartCount(oldCartCount);
                return { success: false, requireLogin: true };
            } else {
                setCart(oldCart);
                setCartCount(oldCartCount);
                return { success: false, error: 'Error del servidor' };
            }
        } catch (error) {
            console.error(error);
            setCart(oldCart);
            setCartCount(oldCartCount);
            return { success: false, error: error.message || 'Error de red' };
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
                return { success: true };
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida al remover item. Auto-logout.");
                logout();
                setCart(oldCart);
                setCartCount(oldCartCount);
                return { success: false, requireLogin: true };
            } else {
                setCart(oldCart);
                setCartCount(oldCartCount);
                return { success: false, error: 'Error del servidor' };
            }
        } catch (error) {
            console.error(error);
            setCart(oldCart);
            setCartCount(oldCartCount);
            return { success: false, error: error.message || 'Error de red' };
        }
    }

    async function vaciarCarrito(localOnly = false, productIds = null) {
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
            return { success: false, requireLogin: true };
        }
        if (localOnly) {
            if (productIds && Array.isArray(productIds) && cart && cart.items) {
                const remainingItems = cart.items.filter(item => !productIds.includes(String(item.id_producto)));
                const newTotal = remainingItems.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
                setCart({ ...cart, total: newTotal, items: remainingItems });
                setCartCount(remainingItems.reduce((acc, item) => acc + item.cantidad, 0));
            } else {
                setCart({ id_carrito: cart?.id_carrito, total: 0, items: [] });
                setCartCount(0);
            }
            return { success: true };
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
                return { success: true };
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida al vaciar carrito. Auto-logout.");
                logout();
                return { success: false, requireLogin: true };
            } else {
                return { success: false, error: 'Error del servidor al vaciar carrito' };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message || 'Error de red' };
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
                setFavoritos(data.favoritos.map(f => Number(f.id_producto))); // Guardamos solo IDs en formato numérico
                setFavoritosData(data.favoritos); // Guardamos la info completa para mostrar
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sesión expirada o inválida detectada al obtener favoritos. Auto-logout.");
                logout();
            }
        } catch (error) {
            console.error("Error al obtener favoritos:", error);
        }
    }

    async function toggleFavorito(id_producto) {
        if (!usuario || !usuario.id_usuario || !token || token === 'null' || token === 'undefined') {
            setLoginTooltipVisible(true);
            // Ocultarlo automáticamente después de unos segundos
            setTimeout(() => setLoginTooltipVisible(false), 2500);
            addToast('Iniciar Sesión', 'Debes iniciar sesión para agregar productos a tus favoritos.', 'warning');
            return;
        }

        const idNum = Number(id_producto);
        const isFav = favoritos.map(Number).includes(idNum);
        const method = isFav ? 'DELETE' : 'POST';

        // Actualización optimista
        if (isFav) {
            setFavoritos(prev => prev.map(Number).filter(id => id !== idNum));
            setFavoritosData(prev => prev.filter(p => Number(p.id_producto) !== idNum));
        } else {
            setFavoritos(prev => [...prev.map(Number), idNum]);
            const prod = productos.find(p => Number(p.id_producto) === idNum);
            if (prod) setFavoritosData(prev => [...prev, prod]);
        }

        try {
            const response = await fetch(`${API_URL}/favoritos`, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_producto: idNum })
            });
            if (response.ok) {
            } else {
                // Revertir en caso de error
                if (isFav) {
                    setFavoritos(prev => [...prev.map(Number), idNum]);
                    const prod = productos.find(p => Number(p.id_producto) === idNum);
                    if (prod) setFavoritosData(prev => [...prev, prod]);
                } else {
                    setFavoritos(prev => prev.map(Number).filter(id => id !== idNum));
                    setFavoritosData(prev => prev.filter(p => Number(p.id_producto) !== idNum));
                }

                addToast('Error', 'No se pudo actualizar tus favoritos.', 'error');

                if (response.status === 401 || response.status === 403) {
                    console.warn("Sesión expirada o inválida al hacer toggle en favoritos. Auto-logout.");
                    logout();
                }
            }
        } catch (error) {
            console.error("Error al hacer toggle en favoritos:", error);
            if (isFav) {
                setFavoritos(prev => [...prev.map(Number), idNum]);
                const prod = productos.find(p => Number(p.id_producto) === idNum);
                if (prod) setFavoritosData(prev => [...prev, prod]);
            } else {
                setFavoritos(prev => prev.map(Number).filter(id => id !== idNum));
                setFavoritosData(prev => prev.filter(p => Number(p.id_producto) !== idNum));
            }
            addToast('Error de Conexión', 'No se pudo conectar con el servidor.', 'error');
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
                
                // Guardar en estado, localStorage y sessionStorage (DRY)
                persistirSesion(datos.usuario, datos.token);
                
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
                persistirSesion(datos.usuario, datos.token);

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
                persistirSesion(datos.usuario, datos.token);

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
                // Actualizar en el estado y almacenamiento (DRY)
                const nuevoUsuario = { ...usuario, avatar_url: datos.usuario.avatar_url };
                persistirSesion(nuevoUsuario, null);
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
            promociones,
            busqueda,
            setBusqueda,
            cart,
            cartCount,
            agregarAlCarrito,
            actualizarCantidadCarrito,
            removerDelCarrito,
            vaciarCarrito,
            favoritos,
            favoritosData,
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
            API_URL,
            fetchError,
            loginTooltipVisible,
            setLoginTooltipVisible,
            obtenerProductos,
            obtenerPromociones,
            obtenerCarrito,
            mostrarNotificacion: addToast
        }}>
            {children}
            
            {/* Contenedor de Notificaciones Globales (Toasts) */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`toast-item ${toast.exiting ? 'exiting' : ''}`}
                    >
                        <div className={`toast-icon-wrapper ${toast.tipo}`}>
                            {toast.tipo === 'success' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : toast.tipo === 'error' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            )}
                        </div>
                        <div className="toast-content">
                            {toast.titulo && <div className="toast-title">{toast.titulo}</div>}
                            <div className="toast-message">{toast.mensaje}</div>
                        </div>
                        <button 
                            className="toast-close-btn" 
                            onClick={() => {
                                setToasts(prev => prev.map(t => t.id === toast.id ? { ...t, exiting: true } : t));
                                setTimeout(() => {
                                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                                }, 300);
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <div className={`toast-progress ${toast.tipo}`} />
                    </div>
                ))}
            </div>
        </AppContext.Provider>
    );
}

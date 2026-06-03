import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const AdminRoute = ({ children }) => {
    const { usuario, isInitialized } = useContext(AppContext);

    if (!isInitialized) {
        // Muestra un loader o pantalla en blanco mientras verifica el contexto
        return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando administrador...</div>;
    }

    if (!usuario || usuario.rol !== 'admin') {
        // Redirige al inicio si no es administrador o no está logueado
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;

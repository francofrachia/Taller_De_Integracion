import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import Promociones from './pages/Promociones/Promociones';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import PaymentStatus from './pages/PaymentStatus/PaymentStatus';
import Account from './pages/Account/Account';
import About from './pages/About/About';
import NotFound from './pages/NotFound/NotFound';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminRoute from './components/AdminRoute/AdminRoute';
import { AppContext } from './context/AppContext';

// Sincronizador de ruta para mantener siempre el stock y carrito actualizados en cada navegación
function RouteSync() {
  const location = useLocation();
  const { obtenerCarrito, token } = useContext(AppContext);

  useEffect(() => {
    console.log(`[RouteSync] Navegación detectada a: ${location.pathname}. Sincronizando datos del carrito...`);
    const currentToken = token || localStorage.getItem('token_bloquemundo') || sessionStorage.getItem('token_bloquemundo');
    if (currentToken && currentToken !== 'null' && currentToken !== 'undefined') {
        obtenerCarrito(currentToken);
    }
  }, [location.pathname, token, obtenerCarrito]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouteSync />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Catalog />} />
        <Route path="/promociones" element={<Promociones />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cuenta" element={<Account />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/payment-success" element={<PaymentStatus type="success" />} />
        <Route path="/payment-failure" element={<PaymentStatus type="failure" />} />
        <Route path="/payment-pending" element={<PaymentStatus type="pending" />} />
        
        {/* Rutas de Administrador */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, { useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './PaymentStatus.css';

const PaymentStatus = ({ type }) => {
  const { vaciarCarrito, usuario, loading } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  // Scroll to top strictly ONCE on mount to prevent scroll tugging/snapping on subsequent re-renders
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (loading) {
      console.log("[PaymentStatus] App context is loading user session, delaying cart clear.");
      return;
    }

    if (type === 'success') {
      sessionStorage.removeItem('checkout_form_data');
      if (usuario && usuario.id_usuario) {
        console.log("[PaymentStatus] User session loaded. Clearing cart for user:", usuario.id_usuario);
        vaciarCarrito();
      } else {
        console.warn("[PaymentStatus] Payment success page reached but no logged-in user found.");
      }
    }
  }, [type, loading, usuario, vaciarCarrito]);

  const renderContent = () => {
    switch (type) {
      case 'success':
        return (
          <div className="status-card success">
            <div className="status-icon">✓</div>
            <h1>¡Gracias por tu compra!</h1>
            <p className="status-message">Tu pago ha sido aprobado de manera exitosa y hemos registrado tu orden.</p>
            {paymentId && (
              <div className="status-details">
                <p><strong>ID de Pago:</strong> {paymentId}</p>
                <p><strong>Estado:</strong> Aprobado</p>
              </div>
            )}
            <p className="status-subtext">Te enviamos los detalles del envío y facturación a tu correo registrado.</p>
            <div className="status-actions">
              <Link to="/" className="primary-btn">Volver al catálogo</Link>
            </div>
          </div>
        );
      case 'failure':
        return (
          <div className="status-card failure">
            <div className="status-icon">✗</div>
            <h1>Pago Rechazado</h1>
            <p className="status-message">Lamentablemente no pudimos procesar tu pago. Por favor intenta con otro medio o ponte en contacto con tu banco.</p>
            {paymentId && (
              <div className="status-details">
                <p><strong>ID de Transacción:</strong> {paymentId}</p>
                <p><strong>Estado:</strong> Rechazado / Fallido</p>
              </div>
            )}
            <div className="status-actions">
              <Link to="/checkout" className="primary-btn-outline">Volver a intentar</Link>
            </div>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="status-card pending">
            <div className="status-icon">⌛</div>
            <h1>Pago Pendiente</h1>
            <p className="status-message">Tu pago se encuentra en proceso de aprobación por parte del proveedor del servicio.</p>
            {paymentId && (
              <div className="status-details">
                <p><strong>ID de Pago:</strong> {paymentId}</p>
                <p><strong>Estado:</strong> Pendiente de acreditación</p>
              </div>
            )}
            <p className="status-subtext">Te notificaremos vía correo electrónico en cuanto el estado de tu pago cambie.</p>
            <div className="status-actions">
              <Link to="/" className="primary-btn">Volver al inicio</Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="payment-status-page">
      <Navbar />
      <main className="container status-container">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default PaymentStatus;

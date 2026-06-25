import React, { useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import sealLogo from '../../assets/logo_cera_bloque_mundo_removed.webp';
import './PaymentStatus.css';

const PaymentStatus = ({ type }) => {
  const { vaciarCarrito, obtenerCarrito, token, usuario, loading, API_URL } = useContext(AppContext);
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
        const isDirectPurchase = searchParams.get('direct_purchase') === 'true';
        if (!isDirectPurchase) {
          const purchasedIdsStr = sessionStorage.getItem('purchased_item_ids');
          if (purchasedIdsStr) {
            console.log("[PaymentStatus] User session loaded. Clearing purchased items locally for user:", usuario.id_usuario);
            let purchasedIds = null;
            try {
              purchasedIds = JSON.parse(purchasedIdsStr);
            } catch (e) {
              console.error("Error parsing purchased_item_ids:", e);
            }
            if (purchasedIds && Array.isArray(purchasedIds)) {
              vaciarCarrito(true, purchasedIds);
            }
            sessionStorage.removeItem('purchased_item_ids');
            
            // Sincronizar el carrito del backend después de 1 segundo para dar tiempo a la base de datos
            setTimeout(() => {
              obtenerCarrito(token);
            }, 1000);
          }
        } else {
          console.log("[PaymentStatus] User session loaded. Direct purchase detected, not clearing cart.");
        }
      } else {
        console.warn("[PaymentStatus] Payment success page reached but no logged-in user found.");
      }
    }

    if (type === 'failure') {
      if (paymentId && token) {
        console.log("[PaymentStatus] Se detectó un pago fallido/rechazado. Registrando en backend...");
        fetch(`${API_URL}/mercadopago/procesar-pago-fallido`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ paymentId })
        })
        .then(res => {
          if (res.ok) {
            console.log("Pago fallido procesado y registrado con éxito.");
          } else {
            console.error("Error al procesar el pago fallido en el backend:", res.status);
          }
        })
        .catch(err => {
          console.error("Error de red al procesar el pago fallido:", err);
        });
      }
    }
  }, [type, loading, usuario, vaciarCarrito, obtenerCarrito, token, searchParams, paymentId, API_URL]);

  const renderContent = () => {
    switch (type) {
      case 'success':
        return (
          <div className="status-card success">
            <div className="status-icon status-seal success-glow">
              <img src={sealLogo} alt="Sello Bloque Mundo" className="status-seal-img" />
            </div>
            <h1>¡Gracias por tu compra!</h1>
            <p className="status-message">Tu pago ha sido aprobado de manera exitosa y hemos registrado tu orden.</p>
            {paymentId && (
              <div className="status-details">
                <div className="details-header">
                  <span className="details-title">Detalle de transacción</span>
                  <span className="details-badge success">Completado</span>
                </div>
                <div className="details-body">
                  <div className="details-row">
                    <span className="details-label">ID de Pago</span>
                    <span className="details-value">{paymentId}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Estado</span>
                    <span className="details-value status-success-text">Aprobado</span>
                  </div>
                </div>
              </div>
            )}
            <p className="status-subtext">Te enviamos los detalles del envío y facturación a tu correo registrado.</p>
            <div className="status-actions">
              <a href="/" className="primary-btn">Volver al catálogo</a>
            </div>
          </div>
        );
      case 'failure':
        return (
          <div className="status-card failure">
            <div className="status-icon status-seal failure-glow">
              <img src={sealLogo} alt="Sello Bloque Mundo" className="status-seal-img" />
            </div>
            <h1>Pago Rechazado</h1>
            <p className="status-message">Lamentablemente no pudimos procesar tu pago. Por favor intenta con otro medio o ponte en contacto con tu banco.</p>
            {paymentId && (
              <div className="status-details">
                <div className="details-header">
                  <span className="details-title">Detalle de transacción</span>
                  <span className="details-badge failure">Rechazado</span>
                </div>
                <div className="details-body">
                  <div className="details-row">
                    <span className="details-label">ID de Transacción</span>
                    <span className="details-value">{paymentId}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Estado</span>
                    <span className="details-value status-failure-text">Rechazado / Fallido</span>
                  </div>
                </div>
              </div>
            )}
            <div className="status-actions">
              <a href="/checkout" className="primary-btn-outline">Volver a intentar</a>
            </div>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="status-card pending">
            <div className="status-icon pending-glow">
              <span className="pending-emoji-pulse">⌛</span>
            </div>
            <h1>Pago Pendiente</h1>
            <p className="status-message">Tu pago se encuentra en proceso de aprobación por parte del proveedor del servicio.</p>
            {paymentId && (
              <div className="status-details">
                <div className="details-header">
                  <span className="details-title">Detalle de transacción</span>
                  <span className="details-badge pending">Pendiente</span>
                </div>
                <div className="details-body">
                  <div className="details-row">
                    <span className="details-label">ID de Pago</span>
                    <span className="details-value">{paymentId}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Estado</span>
                    <span className="details-value status-pending-text">Pendiente de acreditación</span>
                  </div>
                </div>
              </div>
            )}
            <p className="status-subtext">Te notificaremos vía correo electrónico en cuanto el estado de tu pago cambie.</p>
            <div className="status-actions">
              <a href="/" className="primary-btn">Volver al inicio</a>
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

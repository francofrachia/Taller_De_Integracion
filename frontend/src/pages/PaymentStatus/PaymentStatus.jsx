import { useEffect, useContext, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import sealLogo from '../../assets/logo_cera_bloque_mundo_removed.webp';
import './PaymentStatus.css';

const PAYMENT_TYPE_LABELS = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  account_money: 'Dinero en cuenta',
  ticket: 'Efectivo / Cupón',
  bank_transfer: 'Transferencia bancaria',
};

const formatPaymentType = (paymentType) => PAYMENT_TYPE_LABELS[paymentType] || null;

const STATUS_CONFIG = {
  success: {
    kicker: 'Orden confirmada',
    title: '¡Gracias por tu compra!',
    lead: 'El pago fue aprobado y tu pedido ya quedó registrado en Bloque Mundo.',
    statusLabel: 'Aprobado',
    getFootnote: (userEmail) =>
      userEmail
        ? `Enviamos el comprobante y el detalle del pedido a ${userEmail}.`
        : 'Enviamos los detalles de facturación y seguimiento a tu correo registrado.',
    primaryAction: {
      to: '/productos',
      label: 'Seguir explorando',
      iconAfter: FiArrowRight,
    },
    secondaryAction: {
      to: '/cuenta',
      state: { section: 'pendientes' },
      label: 'Ver en Mi Cuenta',
      iconBefore: FiShoppingBag,
    },
  },
  failure: {
    kicker: 'Transacción no completada',
    title: 'No pudimos procesar tu pago',
    lead: 'La entidad emisora o Mercado Pago rechazó la operación. No se realizó ningún cargo.',
    statusLabel: 'Rechazado',
    getFootnote: () =>
      'Podés intentar nuevamente con otra tarjeta o medio de pago desde el checkout.',
    primaryAction: {
      to: '/checkout',
      label: 'Reintentar pago',
      iconBefore: FiRefreshCw,
    },
    secondaryAction: {
      to: '/carrito',
      label: 'Volver al carrito',
    },
  },
  pending: {
    kicker: 'Pago en verificación',
    title: 'Tu pago está pendiente',
    lead: 'Estamos esperando la confirmación final de acreditación por parte del medio de pago.',
    statusLabel: 'En proceso de acreditación',
    getFootnote: () =>
      'Te notificaremos por correo electrónico apenas se acredite el pago.',
    primaryAction: {
      to: '/cuenta',
      state: { section: 'pendientes' },
      label: 'Ver estado del pedido',
      iconBefore: FiShoppingBag,
    },
    secondaryAction: {
      to: '/',
      label: 'Volver al inicio',
    },
  },
};

const PaymentStatusView = ({
  type,
  transactionId,
  merchantOrderId,
  paymentMethodLabel,
  formattedDate,
  userEmail,
}) => {
  const variant = STATUS_CONFIG[type] ? type : 'pending';
  const config = STATUS_CONFIG[variant];
  const PrimaryIconBefore = config.primaryAction.iconBefore;
  const PrimaryIconAfter = config.primaryAction.iconAfter;
  const SecondaryIconBefore = config.secondaryAction.iconBefore;

  const ledgerRows = [
    { label: 'Estado', value: config.statusLabel, valueClass: variant },
    transactionId && { label: 'Operación', value: `#${transactionId}` },
    merchantOrderId && { label: 'Orden', value: `#${merchantOrderId}` },
    paymentMethodLabel && { label: 'Medio de pago', value: paymentMethodLabel },
    { label: 'Fecha', value: formattedDate },
  ].filter(Boolean);

  return (
    <article className={`status-editorial ${variant}`}>
      <header className="status-header">
        <div className="status-seal-wrap">
          <img
            src={sealLogo}
            alt="Sello Bloque Mundo"
            className="status-seal-img"
          />
        </div>
        <div className="status-kicker">
          <span className={`status-dot ${variant}`} aria-hidden="true" />
          <span>{config.kicker}</span>
        </div>
        <h1 className="status-title">{config.title}</h1>
        <p className="status-lead">{config.lead}</p>
      </header>

      <section className="status-ledger" aria-label="Detalle de la operación">
        {ledgerRows.map((row) => (
          <div className="ledger-row" key={row.label}>
            <span className="ledger-label">{row.label}</span>
            <span className={`ledger-value ${row.valueClass || ''}`}>
              {row.value}
            </span>
          </div>
        ))}
      </section>

      <p className="status-footnote">{config.getFootnote(userEmail)}</p>

      <div className="status-actions">
        <Link
          to={config.primaryAction.to}
          state={config.primaryAction.state}
          className="status-btn-primary"
        >
          {PrimaryIconBefore && <PrimaryIconBefore aria-hidden="true" />}
          <span>{config.primaryAction.label}</span>
          {PrimaryIconAfter && <PrimaryIconAfter aria-hidden="true" />}
        </Link>
        <Link
          to={config.secondaryAction.to}
          state={config.secondaryAction.state}
          className="status-btn-secondary"
        >
          {SecondaryIconBefore && <SecondaryIconBefore aria-hidden="true" />}
          <span>{config.secondaryAction.label}</span>
        </Link>
      </div>
    </article>
  );
};

const PaymentStatus = ({ type }) => {
  const { vaciarCarrito, obtenerCarrito, token, usuario, loading, API_URL } = useContext(AppContext);
  const [searchParams] = useSearchParams();

  const rawPaymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const paymentId = rawPaymentId && rawPaymentId !== 'null' ? rawPaymentId : null;
  const rawMerchantOrder = searchParams.get('merchant_order_id');
  const merchantOrderId = rawMerchantOrder && rawMerchantOrder !== 'null' ? rawMerchantOrder : null;
  const paymentMethodLabel = formatPaymentType(searchParams.get('payment_type'));

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    []
  );

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

  return (
    <div className="payment-status-page">
      <Navbar />
      <main className="container status-container">
        <PaymentStatusView
          type={type}
          transactionId={paymentId}
          merchantOrderId={merchantOrderId}
          paymentMethodLabel={paymentMethodLabel}
          formattedDate={formattedDate}
          userEmail={usuario?.email || usuario?.correo || null}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PaymentStatus;

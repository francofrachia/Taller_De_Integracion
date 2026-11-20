import { useState, useEffect, useLayoutEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import './ScrollToTop.css';

const SCROLL_STORAGE_KEY = 'bm_scroll_pos';

const getSavedScrollY = (currentPathname) => {
  try {
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.pathname === currentPathname && typeof parsed.y === 'number' && parsed.y > 0) {
      return parsed.y;
    }
  } catch {
    return null;
  }
  return null;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { loading, isInitialized } = useContext(AppContext);
  const prevPathnameRef = useRef(pathname);
  const [initialSavedY] = useState(() => getSavedScrollY(pathname));
  const pendingRestoreYRef = useRef(initialSavedY);
  const [isVisible, setIsVisible] = useState(false);

  // Evitar que el navegador intente restaurar el scroll por su cuenta antes de montar React
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Cancelar restauración pendiente si el usuario scrollea manualmente mientras revalida en segundo plano
  useEffect(() => {
    const cancelPendingRestore = () => {
      pendingRestoreYRef.current = null;
    };

    window.addEventListener('wheel', cancelPendingRestore, { passive: true });
    window.addEventListener('touchmove', cancelPendingRestore, { passive: true });
    return () => {
      window.removeEventListener('wheel', cancelPendingRestore);
      window.removeEventListener('touchmove', cancelPendingRestore);
    };
  }, []);

  // Antes del primer pintado: subir al tope en cambio de ruta, o restaurar posición en F5
  useLayoutEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      pendingRestoreYRef.current = null;
      prevPathnameRef.current = pathname;
      try {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify({ pathname, y: 0 }));
      } catch {
        // Ignorar errores de almacenamiento
      }
      window.scrollTo(0, 0);
      return;
    }

    if (pendingRestoreYRef.current !== null) {
      window.scrollTo(0, pendingRestoreYRef.current);
    }
  }, [pathname]);

  // Reaplicar antes de pintar si al terminar la carga inicial cambió la altura del layout
  useLayoutEffect(() => {
    if (!loading && isInitialized && pendingRestoreYRef.current !== null) {
      const targetY = pendingRestoreYRef.current;
      pendingRestoreYRef.current = null;
      window.scrollTo(0, targetY);
    }
  }, [loading, isInitialized]);

  // Mostrar/Ocultar el botón flotante y guardar la posición de scroll actual
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const shouldShow = currentY > 300;
      setIsVisible(prev => (prev !== shouldShow ? shouldShow : prev));

      if (pendingRestoreYRef.current === null) {
        try {
          sessionStorage.setItem(
            SCROLL_STORAGE_KEY,
            JSON.stringify({ pathname: window.location.pathname, y: currentY })
          );
        } catch {
          // Ignorar errores de almacenamiento
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      title="Volver arriba"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  );
};

export default ScrollToTop;

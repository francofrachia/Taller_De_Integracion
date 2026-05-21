import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

// Cuando el usuario vuelve desde un sitio externo (como Mercado Pago), el browser
// puede restaurar la página desde el bfcache (back-forward cache) con código viejo congelado.
// Esto detecta esa situacion y fuerza un reload para garantizar codigo fresco.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('[App] Página restaurada desde bfcache, recargando para evitar estado viejo...');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)

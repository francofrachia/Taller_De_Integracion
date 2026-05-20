import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
<<<<<<< Updated upstream
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        {/* Rutas futuras
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/productos" element={<Catalog />} />
        */}
      </Routes>
    </BrowserRouter>
  );
=======
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Navbar />
                    <div style={{ flex: 1 }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/carrito" element={<Cart />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </BrowserRouter>
        </AppProvider>
    );
>>>>>>> Stashed changes
}

export default App;

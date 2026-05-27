import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import PaymentStatus from './pages/PaymentStatus/PaymentStatus';
import Account from './pages/Account/Account';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cuenta" element={<Account />} />
        <Route path="/payment-success" element={<PaymentStatus type="success" />} />
        <Route path="/payment-failure" element={<PaymentStatus type="failure" />} />
        <Route path="/payment-pending" element={<PaymentStatus type="pending" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

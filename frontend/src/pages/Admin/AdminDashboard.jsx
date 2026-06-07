import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');

    const renderContent = () => {
        switch (activeTab) {
            case 'products': return <AdminProducts />;
            case 'orders': return <AdminOrders />;
            default: return <AdminProducts />;
        }
    };

    return (
        <div className="admin-page">
            <Navbar />
            <div className="admin-container">
                <div className="admin-top-nav">
                    <h2>Panel Admin</h2>
                    <ul className="admin-nav-tabs">
                        <li 
                            className={activeTab === 'products' ? 'active' : ''} 
                            onClick={() => setActiveTab('products')}
                        >
                            Productos
                        </li>
                        <li 
                            className={activeTab === 'orders' ? 'active' : ''} 
                            onClick={() => setActiveTab('orders')}
                        >
                            Ventas
                        </li>
                    </ul>
                </div>
                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;

import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import AdminProducts from './components/AdminProducts';
import AdminPromotions from './components/AdminPromotions';
import AdminOrders from './components/AdminOrders';
import AdminCategories from './components/AdminCategories';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');

    const renderContent = () => {
        switch (activeTab) {
            case 'products': return <AdminProducts />;
            case 'categories': return <AdminCategories />;
            case 'promotions': return <AdminPromotions />;
            case 'orders': return <AdminOrders />;
            default: return <AdminProducts />;
        }
    };

    return (
        <div className="admin-page">
            <Navbar />
            <div className="admin-container">
                <aside className="admin-sidebar">
                    <h2>Panel Admin</h2>
                    <ul>
                        <li 
                            className={activeTab === 'products' ? 'active' : ''} 
                            onClick={() => setActiveTab('products')}
                        >
                            📦 Productos
                        </li>
                        <li 
                            className={activeTab === 'categories' ? 'active' : ''} 
                            onClick={() => setActiveTab('categories')}
                        >
                            📂 Categorías
                        </li>
                        <li 
                            className={activeTab === 'promotions' ? 'active' : ''} 
                            onClick={() => setActiveTab('promotions')}
                        >
                            🏷️ Promociones
                        </li>
                        <li 
                            className={activeTab === 'orders' ? 'active' : ''} 
                            onClick={() => setActiveTab('orders')}
                        >
                            🛍️ Ventas
                        </li>
                    </ul>
                </aside>
                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;

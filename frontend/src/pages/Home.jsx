import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
    const { productos, busqueda, loading, agregarAlCarrito } = useContext(AppContext);

    // Filtrar los productos reactivamente según la búsqueda
    const productosFiltrados = productos.filter((prod) =>
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <main>
            <section id="banner">
                <h2>¡Encontrá tu próximo desafío! 🧱</h2>
            </section>

            <ProductGrid 
                productos={productosFiltrados} 
                loading={loading} 
                onAgregar={agregarAlCarrito}
            />
        </main>
    );
}

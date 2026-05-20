import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ productos, loading, onAgregar }) {
    if (loading) {
        return (
            <section className="grid-productos">
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                    Cargando productos...
                </p>
            </section>
        );
    }

    if (productos.length === 0) {
        return (
            <section className="grid-productos">
                <div className="no-productos">
                    No se encontraron productos que coincidan con la búsqueda.
                </div>
            </section>
        );
    }

    return (
        <section className="grid-productos">
            {productos.map((prod) => (
                <ProductCard 
                    key={prod.id_producto} 
                    producto={prod} 
                    onAgregar={onAgregar}
                />
            ))}
        </section>
    );
}

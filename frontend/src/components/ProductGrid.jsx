import React from 'react';
import ProductCard from './ProductCard';

const ProductCardSkeleton = () => (
  <div className="producto-card">
    <div className="card-image" style={{ display: 'block', padding: '0' }}>
      <div className="skeleton" style={{ width: '100%', height: '100%', aspectRatio: '1', borderRadius: '0' }}></div>
    </div>
    <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="skeleton" style={{ width: '80%', height: '18px' }}></div>
      <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '30%', height: '12px' }}></div>
      <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '4px', marginTop: '10px' }}></div>
    </div>
  </div>
);

export default function ProductGrid({ productos, loading, onAgregar }) {
    if (loading) {
        return (
            <section className="grid-productos">
                {[1, 2, 3, 4].map((n) => (
                    <ProductCardSkeleton key={n} />
                ))}
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

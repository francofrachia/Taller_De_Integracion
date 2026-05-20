import React from 'react';

export default function ProductCard({ producto, onAgregar }) {
    const imagenGenerica = 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=300&q=80';
    const srcFinal = producto.imagen_url || imagenGenerica;

    return (
        <div className="producto-card">
            <div className="card-image">
                <img 
                    src={srcFinal} 
                    alt={producto.nombre} 
                    onError={(e) => {
                        e.target.src = imagenGenerica;
                    }}
                />
                {producto.es_nuevo && <span className="badge-nuevo">NUEVO</span>}
            </div>
            <div className="card-content">
                <h3>{producto.nombre}</h3>
                <span className="precio-actual">${producto.precio}</span>
                {producto.stock !== undefined && (
                    <div className="stock">Stock: {producto.stock} u.</div>
                )}
                <button 
                    className="btn-add" 
                    onClick={() => onAgregar(producto.id_producto)}
                >
                    Añadir al carrito
                </button>
            </div>
        </div>
    );
}

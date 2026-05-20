import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  // Render stars based on rating (mock)
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="product-card">
      <Link to={`/producto/${product.id}`} className="product-card-link">
        <div className="product-card-image-container">
          {product.discount && (
            <span className="discount-badge">-{product.discount}%</span>
          )}
          <button className="favorite-btn" title="Agregar a favoritos" onClick={(e) => e.preventDefault()}>♡</button>
          <img src={product.image} alt={product.title} className="product-image" />
        </div>
        
        <div className="product-card-content">
          <h3 className="product-title">{product.title}</h3>
          
          <div className="product-prices">
            {product.oldPrice && (
              <span className="old-price">${product.oldPrice}</span>
            )}
            <span className="current-price">${product.price}</span>
          </div>
          
          <div className="product-rating">
            <div className="stars">{renderStars(product.rating)}</div>
            <span className="reviews-count">({product.reviews})</span>
          </div>
        </div>
      </Link>
      <div className="product-card-actions">
        <button className="add-to-cart-btn">Agregar al Carrito</button>
      </div>
    </div>
  );
};

export default ProductCard;

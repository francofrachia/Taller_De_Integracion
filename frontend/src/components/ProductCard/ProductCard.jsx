import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import placeholderImg from '../../assets/product_placeholder.png';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { agregarAlCarrito, favoritos, toggleFavorito } = useContext(AppContext);
  const navigate = useNavigate();

  const handleAddCart = async (e) => {
    e.preventDefault();
    const res = await agregarAlCarrito(product.id, 1);
    if (res && res.requireLogin) {
      navigate('/login');
    }
  };

  const handleToggleFav = (e) => {
    e.preventDefault();
    toggleFavorito(product.id);
  };

  const isFav = favoritos && favoritos.includes(product.id);

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
          <button 
            className={`favorite-btn ${isFav ? 'active' : ''}`} 
            title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"} 
            onClick={handleToggleFav}
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </button>
          <img 
            src={(!product.image || product.image.includes('legostore.com')) ? placeholderImg : product.image} 
            alt={product.title} 
            className="product-image" 
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop if fallback also fails
              e.target.src = placeholderImg;
            }}
          />
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
        <button className="add-to-cart-btn" onClick={handleAddCart}>
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

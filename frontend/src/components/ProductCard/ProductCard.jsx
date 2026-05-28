import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import placeholderImg from '../../assets/imagen no existente BM.png';
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

  // Helper to resolve and format category name with fallback
  const getCategoryDisplay = () => {
    if (product.categoryName && product.categoryName.trim()) {
      return product.categoryName;
    }
    if (product.collection && product.collection.trim() && product.collection.toLowerCase() !== 'otros') {
      const coll = product.collection.toLowerCase();
      if (coll === 'super heroes') return 'Super Héroes';
      if (coll === 'star wars') return 'Star Wars';
      if (coll === 'harry potter') return 'Harry Potter';
      if (coll === 'marvel') return 'Marvel';
      if (coll === 'city') return 'City';
      return coll.charAt(0).toUpperCase() + coll.slice(1);
    }
    return 'LEGO';
  };

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
          
          <div className="product-card-hover-container">
            <span className="product-card-category">{getCategoryDisplay()}</span>
            <p className="product-card-short-desc">{product.description || 'Set de colección LEGO.'}</p>
          </div>
          
          <div className="product-prices">
            {product.oldPrice && (
              <span className="old-price">${product.oldPrice}</span>
            )}
            <span className="current-price">${product.price}</span>
          </div>
          
          <div className="product-rating">
            {product.reviews > 0 ? (
              <>
                <div className="stars">{renderStars(product.rating)}</div>
                <span className="reviews-count">({product.reviews})</span>
              </>
            ) : (
              <span className="no-reviews-text">Sin reseñas</span>
            )}
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

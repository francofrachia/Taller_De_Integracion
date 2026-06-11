import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import { displayCategoryName } from '../../utils/categoryHelpers';
import placeholderImg from '../../assets/imagen no existente BM.webp';
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
    e.stopPropagation();
    toggleFavorito(product.id);
  };

  const isFav = favoritos && favoritos.includes(product.id);

  // Helper to resolve and format category name with fallback
  const getCategoryDisplay = () => {
    let catName = 'LEGO';
    if (product.categoryName && product.categoryName.trim()) {
      catName = product.categoryName;
    } else if (product.collection && product.collection.trim() && product.collection.toLowerCase() !== 'otros') {
      const coll = product.collection.toLowerCase();
      if (coll === 'super heroes') return 'Super Héroes';
      if (coll === 'star wars') return 'Star Wars';
      if (coll.includes('harry potter')) return 'Harry Potter';
      if (coll === 'marvel') return 'Marvel';
      if (coll === 'city') return 'City';
      catName = coll.charAt(0).toUpperCase() + coll.slice(1);
    }
    return displayCategoryName(catName);
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
    <div className="product-card" style={{ position: 'relative' }}>
      <button 
        className={`favorite-btn ${isFav ? 'active' : ''}`} 
        title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"} 
        onClick={handleToggleFav}
        style={{ zIndex: 10 }}
      >
        {isFav ? <FaHeart /> : <FaRegHeart />}
      </button>

      <Link to={`/producto/${product.id}`} className="product-card-link">
        <div className="product-card-image-container">
          <div className="product-badges">
            {product.stock <= 0 && (
              <span className="out-of-stock-badge">Agotado</span>
            )}
            {product.stock > 5 && product.stock <= 10 && (
              <span className="last-units-badge">Últimas unidades</span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="last-units-badge" style={{ backgroundColor: '#d32f2f' }}>¡Últimas {product.stock}!</span>
            )}
            {product.stock > 0 && product.discount ? (
              <span className="discount-badge">-{Math.round(Number(product.discount))}%</span>
            ) : null}
          </div>
          <img 
            src={(!product.image || product.image.includes('legostore.com')) ? placeholderImg : product.image} 
            alt={product.title} 
            className="product-image" 
            style={product.stock <= 0 ? { filter: 'grayscale(1) opacity(0.5)' } : {}}
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
              <span className="old-price">${parseFloat(product.oldPrice).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            )}
            <span className="current-price">${parseFloat(product.price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
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
        {product.activo === false ? (
          <button className="add-to-cart-btn out-of-stock-btn" disabled style={{ backgroundColor: '#ffcccc', color: '#cc0000', border: '1px solid #cc0000' }}>
            Discontinuado
          </button>
        ) : (
          <button className="add-to-cart-btn" onClick={handleAddCart}>
            Agregar al Carrito
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

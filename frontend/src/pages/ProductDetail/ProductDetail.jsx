import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { agregarAlCarrito, usuario } = React.useContext(AppContext);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const navigate = useNavigate();
  
  // Ref para el carrusel de relacionados
  const carouselRef = React.useRef(null);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleBuyNow = async () => {
    if (!usuario || !usuario.id_usuario) {
      navigate('/login');
      return;
    }

    if (!product || product.stock <= 0) return;
    
    setIsProcessingPayment(true);
    setPaymentError(null);

    let qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (product && qty > product.stock) qty = product.stock;

    try {
      const response = await fetch('http://localhost:3000/api/mercadopago/create_preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cartItems: [{
            id_producto: product.id,
            cantidad: qty
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const data = await response.json();
      
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió el punto de inicio de Mercado Pago');
      }
    } catch (err) {
      console.error('Error al iniciar compra:', err);
      setPaymentError(err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch product detail
    fetch(`http://localhost:3000/api/productos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Producto no encontrado');
        return res.json();
      })
      .then(data => {
        setProduct({
          id: data.id_producto,
          categoryId: data.id_categoria,
          title: data.nombre,
          price: data.precio,
          description: data.descripcion || 'Sin descripción disponible.',
          stock: data.stock,
          images: data.imagenes && data.imagenes.length > 0 ? data.imagenes : ['https://via.placeholder.com/600x600?text=Sin+Imagen'],
          rating: data.calificacion || 4.5,
          reviews: data.reseñas || 0
        });
        
        // Ahora que tenemos la categoría, buscamos los relacionados y las reseñas en paralelo
        return Promise.all([
          fetch('http://localhost:3000/api/productos').then(r => r.json()),
          fetch(`http://localhost:3000/api/productos/${id}/resenas`).then(r => {
            if (!r.ok) return []; // Si el endpoint falla (ej. servidor no reiniciado), devuelve array vacío
            return r.json();
          }).catch(() => []) // También atrapamos errores de red o parseo
        ]).then(([allProducts, resenasData]) => {
            let filteredData = allProducts.filter(item => 
              item.id_producto.toString() !== id.toString() && 
              item.id_categoria === data.id_categoria
            );

            // Fallback: si no hay productos de la misma categoría, mostrar otros del catálogo
            if (filteredData.length === 0) {
              filteredData = allProducts.filter(item => 
                item.id_producto.toString() !== id.toString()
              );
            }
            
            const mapped = filteredData.map(item => ({
              id: item.id_producto,
              title: item.nombre,
              price: item.precio,
              image: item.imagen_url || 'https://via.placeholder.com/300x300'
            }));
            setRelatedProducts(mapped);
            setReviews(resenasData || []);
          });
      })
      .then(() => setLoading(false))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleQuantityChange = (change) => {
    let currentQty = parseInt(quantity, 10);
    if (isNaN(currentQty)) {
      currentQty = 1;
    }
    const newQuantity = currentQty + change;
    const maxStock = product?.stock || 1;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setQuantity('');
      return;
    }
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (cleanVal === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(cleanVal, 10);
    if (!isNaN(num)) {
      setQuantity(num);
    }
  };

  const handleQuantityBlur = () => {
    let val = parseInt(quantity, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300; // Ajustar según el ancho de la tarjeta
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const nextImage = () => setMainImageIndex((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setMainImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);

  const calculateAverageRating = (reviewsArr) => {
    if (!reviewsArr || reviewsArr.length === 0) return 5;
    const sum = reviewsArr.reduce((acc, curr) => acc + (curr.puntaje || 5), 0);
    return Math.round(sum / reviewsArr.length);
  };

  if (loading) return <div><Navbar /><div className="container" style={{padding: '100px 0'}}>Cargando detalles...</div><Footer /></div>;
  if (error) return <div><Navbar /><div className="container" style={{padding: '100px 0'}}>Error: {error}</div><Footer /></div>;
  if (!product) return null;

  return (
    <div className="product-detail-page">
      <Navbar />
      
      <main className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Inicio</Link> / <span className="current">Producto</span>
        </div>

        <div className="product-detail-grid">
          {/* Galería de imágenes */}
          <div className="product-gallery">
            <div className="thumbnails-column">
              {product.images.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail-container ${index === mainImageIndex ? 'active' : ''}`}
                  onClick={() => setMainImageIndex(index)}
                >
                  <img src={img} alt={`Miniatura ${index + 1}`} />
                </div>
              ))}
            </div>
            <div className="main-image-container">
              {product.images.length > 1 && (
                <button className="gallery-arrow prev" onClick={prevImage}>&lt;</button>
              )}
              <img src={product.images[mainImageIndex]} alt={product.title} className="main-image" />
              {product.images.length > 1 && (
                <button className="gallery-arrow next" onClick={nextImage}>&gt;</button>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="product-info">
            <h1 className="product-detail-title">{product.title}</h1>
            
            <div className="product-meta">
              <span className="stars" style={{ color: '#FFB500', fontSize: '16px', verticalAlign: 'middle' }}>
                {'★'.repeat(calculateAverageRating(reviews)).padEnd(5, '☆')}
              </span>
              <span className="reviews-count" style={{ color: 'var(--text-gray)', verticalAlign: 'middle' }}>({reviews.length} Reseñas)</span>
              <span className="meta-divider" style={{ verticalAlign: 'middle' }}>|</span>
              <span className="stock-status" style={{ verticalAlign: 'middle' }}>
                {product.stock > 10 ? (
                  <span style={{ color: '#2e7d32' }}>En stock</span>
                ) : product.stock > 0 ? (
                  <span style={{ color: '#f57c00' }}>Últimas {product.stock} unidades</span>
                ) : (
                  <span style={{ color: '#d32f2f' }}>Agotado</span>
                )}
              </span>
            </div>

            <div className="product-detail-price">${product.price}</div>

            <div className="product-description">
              <p><strong>Descripción:</strong> {product.description}</p>
            </div>

            <hr className="divider" />

            <div className="product-actions">
              <p className="quantity-label">Cantidad:</p>
              <div className="action-row" style={{ flexWrap: 'wrap' }}>
                <div className={`quantity-selector ${quantity > product.stock ? "qty-selector-error" : ""}`}>
                  <button onClick={() => handleQuantityChange(-1)} disabled={isProcessingPayment}>-</button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={handleQuantityInputChange}
                    onBlur={handleQuantityBlur}
                    min="1"
                    max={product?.stock || 1}
                    disabled={isProcessingPayment} 
                  />
                  <button className="plus-btn" onClick={() => handleQuantityChange(1)} disabled={isProcessingPayment}>+</button>
                </div>
                
                <button 
                  className="buy-now-btn" 
                  onClick={handleBuyNow} 
                  disabled={isProcessingPayment || product.stock <= 0 || quantity > product.stock}
                >
                  {isProcessingPayment ? 'Procesando...' : product.stock <= 0 ? 'Sin stock' : 'Comprar ahora'}
                </button>
                <button 
                  className="btn-outline" 
                  style={{marginLeft: '10px'}}
                  onClick={async () => {
                    let qty = parseInt(quantity, 10);
                    if (isNaN(qty) || qty < 1) qty = 1;
                    if (product && qty > product.stock) return;
                    const res = await agregarAlCarrito(product.id, qty);
                    if (res && res.requireLogin) {
                      navigate('/login');
                    }
                  }} 
                  disabled={product.stock <= 0 || quantity > product.stock}
                >
                  Agregar al Carrito
                </button>
                <button className="favorite-btn-large" title="Agregar a favoritos">♡</button>
              </div>
              {quantity > product.stock && (
                <p className="stock-warning-msg" style={{ color: '#d32f2f', fontSize: '14px', marginTop: '-5px', fontWeight: '500' }}>
                  ⚠️ No hay suficiente stock. El máximo es {product.stock} unidades.
                </p>
              )}
              {paymentError && (
                <p className="payment-error-msg" style={{ color: '#d32f2f', fontSize: '14px', marginTop: '10px', fontWeight: '500' }}>
                  ❌ {paymentError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Artículos Relacionados */}
        <section className="related-products-section">
          <SectionHeader title="Artículos relacionados" />
          <div className="carousel-wrapper">
            <button className="carousel-btn left" onClick={() => scrollCarousel('left')}>&lt;</button>
            <div className={`carousel-container ${relatedProducts.length === 1 ? 'carousel-centered' : ''}`} ref={carouselRef}>
              {relatedProducts.map(prod => (
                <div className="carousel-item" key={prod.id}>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
            <button className="carousel-btn right" onClick={() => scrollCarousel('right')}>&gt;</button>
          </div>
        </section>

        {/* Reseñas del Producto */}
        <section className="product-reviews-section">
          <SectionHeader title="Reseñas de Usuarios" />
          <div className="reviews-container">
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-gray)' }}>Aún no hay reseñas para este producto.</p>
            ) : (
              reviews.map(review => (
                <div className="review-card" key={review.id_comentario}>
                  <div className="review-header">
                    <div className="review-author">
                      {review.anonimo ? 'Usuario Anónimo' : `${review.autor_nombre} ${review.autor_apellido}`}
                    </div>
                    <div className="review-stars">
                      {/* Renderizar estrellas según puntaje si existe, o por defecto 5 */}
                      {'★'.repeat(review.puntaje || 5).padEnd(5, '☆')}
                    </div>
                  </div>
                  {review.fecha && (
                    <p className="review-date">
                      {new Date(review.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  <p className="review-text">{review.texto}</p>
                </div>
              ))
            )}
            
            {reviews.length > 0 && (
              <button className="primary-btn-outline" style={{marginTop: '20px'}}>Ver todas las reseñas</button>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

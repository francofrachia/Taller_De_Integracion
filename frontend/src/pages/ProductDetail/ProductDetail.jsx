import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import placeholderProduct from '../../assets/imagen no existente BM.png';
import './ProductDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { agregarAlCarrito, usuario, favoritos, toggleFavorito, token } = React.useContext(AppContext);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const navigate = useNavigate();

  // Ref para el carrusel de relacionados
  const carouselRef = React.useRef(null);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Estados para reseña y calificación
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [eligibility, setEligibility] = useState(null);

  const fetchEligibility = React.useCallback(async () => {
    if (!token || !usuario) {
      setEligibility(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/productos/${id}/elegibilidad-resena`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEligibility(data);
      }
    } catch (err) {
      console.error('Error al obtener elegibilidad:', err);
    }
  }, [id, token, usuario]);

  useEffect(() => {
    fetchEligibility();
  }, [id, token, usuario, fetchEligibility]);

  const handleBuyNow = async () => {
    if (!usuario || !usuario.id_usuario) {
      navigate('/login', { state: { from: `/producto/${id}` } });
      return;
    }

    if (!product || product.stock <= 0) return;

    setIsProcessingPayment(true);
    setPaymentError(null);

    let qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (product && qty > product.stock) qty = product.stock;

    try {
      // Agregar al carrito optimista/backend
      const res = await agregarAlCarrito(product.id, qty);
      if (res && res.success) {
        // Redirigir a facturación para completar datos antes de pagar
        navigate('/checkout');
      } else if (res && res.requireLogin) {
        navigate('/login', { state: { from: `/producto/${id}` } });
      } else {
        throw new Error(res?.error || 'Error al agregar el producto al carrito');
      }
    } catch (err) {
      console.error('Error al iniciar compra:', err);
      setPaymentError(err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitReview = async () => {
    if (userRating < 1 || userRating > 5) {
      setReviewErrorMsg('Por favor selecciona un puntaje entre 1 y 5 estrellas.');
      return;
    }

    setSubmittingReview(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      const response = await fetch(`${API_URL}/productos/${id}/calificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          puntaje: userRating,
          texto: reviewText,
          anonimo: isAnonymous
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setReviewSuccessMsg('¡Muchas gracias por calificar este producto!');
        setReviewText('');
        setUserRating(0);
        fetchEligibility();

        // Volver a cargar las reseñas en el frontend de forma reactiva e inmediata
        fetch(`${API_URL}/productos/${id}/resenas`)
          .then(r => r.json())
          .then(data => {
            setReviews(data || []);
            setCurrentReviewIndex(0); // Mostrar la reseña más reciente primero
          })
          .catch(err => console.error('Error al actualizar reseñas:', err));
      } else {
        setReviewErrorMsg(resData.error || 'Ocurrió un error al enviar tu calificación.');
      }
    } catch (err) {
      console.error('Error enviando calificación:', err);
      setReviewErrorMsg('Problemas de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch product detail
    fetch(`${API_URL}/productos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Producto no encontrado');
        return res.json();
      })
      .then(data => {
        setProduct({
          id: data.id_producto,
          categoryId: data.id_categoria,
          categoryName: data.categoria_nombre,
          title: data.nombre,
          price: data.precio,
          description: data.descripcion || 'Sin descripción disponible.',
          stock: data.stock,
          images: data.imagenes && data.imagenes.length > 0 ? data.imagenes : [placeholderProduct],
          rating: parseFloat(data.calificacion) || 5,
          reviews: parseInt(data.resenas || data.reseñas) || 0
        });

        // Ahora que tenemos la categoría, buscamos los relacionados y las reseñas en paralelo
        return Promise.all([
          fetch(`${API_URL}/productos`).then(r => r.json()),
          fetch(`${API_URL}/productos/${id}/resenas`).then(r => {
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

          const mapped = filteredData.map(item => {
            const price = parseFloat(item.precio) || 0;
            return {
              id: item.id_producto,
              title: item.nombre || item.titulo || 'Producto sin nombre',
              description: item.descripcion || '',
              categoryName: item.categoria_nombre || '',
              categoryId: item.id_categoria,
              price,
              oldPrice: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
              discount: item.discount || item.descuento || null,
              rating: parseFloat(item.calificacion) || 5,
              reviews: parseInt(item.resenas || item.reseñas) || 0,
              image: item.imagen_url,
              collection: item.tipo_coleccion ? item.tipo_coleccion.toLowerCase().trim() : 'otros',
              age: item.edad_recomendada || null,
              stock: item.stock !== undefined ? parseInt(item.stock, 10) : 0,
              isExclusive: (item.edad_recomendada && item.edad_recomendada >= 16) || price > 35000 || (item.tipo_coleccion && item.tipo_coleccion.toLowerCase().includes('star wars')),
              isComingSoon: item.id_producto % 4 === 0
            };
          });
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

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <main className="container">
          {/* Breadcrumb Skeleton */}
          <div className="breadcrumb">
            <span className="skeleton" style={{ width: '50px', height: '14px' }}></span> / <span className="skeleton" style={{ width: '80px', height: '14px' }}></span>
          </div>

          <div className="product-detail-grid">
            {/* Galería de imágenes Skeleton */}
            <div className="product-gallery">
              <div className="thumbnails-column">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="thumbnail-container" style={{ border: 'none', cursor: 'default' }}>
                    <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '4px' }}></div>
                  </div>
                ))}
              </div>
              <div className="main-image-container" style={{ minHeight: '500px' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '8px' }}></div>
              </div>
            </div>

            {/* Información del producto Skeleton */}
            <div className="product-info" style={{ gap: '15px' }}>
              <div className="skeleton" style={{ width: '70%', height: '36px', marginBottom: '10px' }}></div>

              <div className="product-meta" style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
                <span className="meta-divider">|</span>
                <div className="skeleton" style={{ width: '80px', height: '16px' }}></div>
              </div>

              <div className="skeleton" style={{ width: '120px', height: '32px', margin: '10px 0' }}></div>

              <div className="product-description" style={{ margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ width: '100%', height: '16px' }}></div>
                <div className="skeleton" style={{ width: '95%', height: '16px' }}></div>
                <div className="skeleton" style={{ width: '90%', height: '16px' }}></div>
              </div>

              <hr className="divider" style={{ margin: '15px 0' }} />

              <div className="product-actions" style={{ gap: '15px' }}>
                <div className="skeleton" style={{ width: '80px', height: '16px' }}></div>
                <div className="action-row" style={{ flexWrap: 'wrap' }}>
                  <div className="skeleton" style={{ width: '155px', height: '45px', borderRadius: '4px' }}></div>
                  <div className="skeleton" style={{ flex: 1, minWidth: '150px', height: '45px', borderRadius: '4px' }}></div>
                  <div className="skeleton" style={{ flex: 1, minWidth: '150px', height: '45px', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) return <div><Navbar /><div className="container" style={{ padding: '100px 0' }}>Error: {error}</div><Footer /></div>;
  if (!product) return null;

  return (
    <div className="product-detail-page">
      <Navbar />

      <main className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Inicio</Link> / <Link to="/productos" className="breadcrumb-category-link">{product.categoryName || 'Catálogo'}</Link> / <span className="current">{product.title}</span>
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
                  <img
                    src={(!img || img.includes('legostore.com')) ? placeholderProduct : img}
                    alt={`Miniatura ${index + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderProduct;
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="main-image-container" style={{ position: 'relative' }}>
              <button
                className={`product-image-fav-btn ${favoritos && favoritos.includes(product.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorito(product.id);
                }}
                title={favoritos && favoritos.includes(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {favoritos && favoritos.includes(product.id) ? <FaHeart /> : <FaRegHeart />}
              </button>

              {product.images.length > 1 && (
                <button className="gallery-arrow prev" onClick={prevImage}>&lt;</button>
              )}
              <img
                src={(!product.images[mainImageIndex] || product.images[mainImageIndex].includes('legostore.com')) ? placeholderProduct : product.images[mainImageIndex]}
                alt={product.title}
                className="main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = placeholderProduct;
                }}
              />
              {product.images.length > 1 && (
                <button className="gallery-arrow next" onClick={nextImage}>&gt;</button>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="product-info">
            {product.categoryName && (
              <span className="product-detail-category-badge">{product.categoryName}</span>
            )}
            <h1 className="product-detail-title">{product.title}</h1>

            <div className="product-meta">
              {reviews.length > 0 ? (
                <>
                  <span className="stars" style={{ color: '#FFB500', fontSize: '16px', verticalAlign: 'middle' }}>
                    {'★'.repeat(calculateAverageRating(reviews)).padEnd(5, '☆')}
                  </span>
                  <span className="reviews-count" style={{ color: 'var(--text-gray)', verticalAlign: 'middle' }}>({reviews.length} Reseñas)</span>
                </>
              ) : (
                <span className="no-reviews-text" style={{ color: 'var(--text-gray)', fontStyle: 'italic', fontSize: '14px', verticalAlign: 'middle' }}>Sin reseñas todavía</span>
              )}
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
                  style={{ marginLeft: '10px' }}
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
              </div>
              {quantity > product.stock && (
                <p className="stock-warning-msg" style={{ color: '#d32f2f', fontSize: '14px', marginTop: '-5px', fontWeight: '500' }}>
                  No hay suficiente stock.
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

          {/* Listado de comentarios/reseñas existentes - Se muestra PRIMERO */}
          <div className="reviews-container" style={{ marginBottom: '20px' }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                Aún no hay reseñas para este producto. ¡Sé el primero en calificar tu compra!
              </p>
            ) : (
              <>
                <div className="reviews-slider-wrapper">
                  {reviews.length > 1 && (
                    <button
                      className="reviews-slider-btn left"
                      onClick={() => setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)}
                      title="Reseña anterior"
                    >
                      &lt;
                    </button>
                  )}

                  <div className="review-card animate-fade-slide" key={reviews[currentReviewIndex].id_comentario}>
                    <div className="review-header">
                      <div className="review-author">
                        {reviews[currentReviewIndex].anonimo ? 'Usuario Anónimo' : `${reviews[currentReviewIndex].autor_nombre} ${reviews[currentReviewIndex].autor_apellido}`}
                      </div>
                      <div className="review-stars">
                        {'★'.repeat(reviews[currentReviewIndex].puntaje || 5).padEnd(5, '☆')}
                      </div>
                    </div>
                    {reviews[currentReviewIndex].fecha && (
                      <p className="review-date">
                        {new Date(reviews[currentReviewIndex].fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    <p className="review-text">{reviews[currentReviewIndex].texto || 'Calificó este producto sin dejar un comentario escrito.'}</p>
                  </div>

                  {reviews.length > 1 && (
                    <button
                      className="reviews-slider-btn right"
                      onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)}
                      title="Siguiente reseña"
                    >
                      &gt;
                    </button>
                  )}
                </div>

                {reviews.length > 1 && (
                  <div className="reviews-slider-dots">
                    {reviews.map((_, idx) => (
                      <button
                        key={idx}
                        className={`reviews-slider-dot ${idx === currentReviewIndex ? 'active' : ''}`}
                        onClick={() => setCurrentReviewIndex(idx)}
                        title={`Ver reseña ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Formulario de Calificación (Solo compradores verificados) - Se muestra SEGUNDO (al final) */}
          {!usuario ? (
            <div className="login-to-review-prompt glassmorphic">
              <p>Debes <Link to="/login" state={{ from: `/producto/${id}` }}>iniciar sesión</Link> para calificar y dejar una reseña de este producto.</p>
            </div>
          ) : eligibility === null ? (
            <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: '16px', marginTop: '40px' }}></div>
          ) : eligibility.puedeResenar ? (
            <div className="add-review-form glassmorphic animate-fade-in">
              <h3>Calificar este Producto</h3>
              <p className="add-review-subtitle">
                Dejanos tu puntaje y un comentario sobre tu experiencia de construcción.
                {eligibility.totalComprado > 0 && (
                  <span style={{ display: 'block', fontSize: '12px', color: '#4caf50', marginTop: '6px', fontWeight: '600' }}>
                    ✔ Compra verificada: Has adquirido este set {eligibility.totalComprado} {eligibility.totalComprado === 1 ? 'vez' : 'veces'} y publicado {eligibility.totalResenas} {eligibility.totalResenas === 1 ? 'reseña' : 'reseñas'}.
                  </span>
                )}
              </p>

              <div className="rating-select-group">
                <span className="rating-select-label">Tu Calificación:</span>
                <div className="stars-selector">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      className={`star-select-btn ${(hoverRating || userRating) >= starValue ? 'active' : ''}`}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(starValue)}
                      title={`${starValue} Estrella${starValue > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <span className="rating-selected-text">
                    ({userRating} Estrella{userRating > 1 ? 's' : ''})
                  </span>
                )}
              </div>

              <div className="review-input-group">
                <label htmlFor="review-textarea">Tu Comentario (opcional):</label>
                <textarea
                  id="review-textarea"
                  rows="4"
                  placeholder="¿Qué te pareció el set? ¿Tiene detalles divertidos? ¿Faltaron piezas?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <div className="review-options-row">
                <label className="anonymous-toggle">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>Publicar como comentario anónimo</span>
                </label>
              </div>

              {reviewErrorMsg && <p className="review-error-text">⚠️ {reviewErrorMsg}</p>}
              {reviewSuccessMsg && <p className="review-success-text">✓ {reviewSuccessMsg}</p>}

              <button
                className="btn-primary-custom submit-review-btn"
                onClick={handleSubmitReview}
                disabled={submittingReview || userRating === 0}
              >
                {submittingReview ? 'Enviando...' : 'Enviar Calificación'}
              </button>
            </div>
          ) : eligibility.comprado ? (
            <div className="verified-review-limit-msg glassmorphic">
              <div className="verified-icon">🏆</div>
              <p><strong>¡Reseñas Completadas!</strong></p>
              <p>Ya has calificado todas tus compras de este producto ({eligibility.totalComprado} {eligibility.totalComprado === 1 ? 'unidad comprada' : 'unidades compradas'} y {eligibility.totalResenas} {eligibility.totalResenas === 1 ? 'reseña publicada' : 'reseñas publicadas'}). ¡Muchísimas gracias por tu valiosa opinión!</p>
            </div>
          ) : (
            <div className="verified-purchase-lock-msg glassmorphic">
              <div className="lock-icon">🔒</div>
              <p><strong>Reseña Exclusiva para Compradores Verificados</strong></p>
              <p>En BloqueMundo queremos que todas las opiniones sean auténticas y útiles. Para calificar este set de Lego, primero debés adquirirlo a través de nuestra tienda. ¡Esperamos ver tu opinión de construcción pronto!</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

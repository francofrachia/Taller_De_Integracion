import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { FiEdit2, FiUploadCloud, FiX, FiSearch, FiTrash2 } from 'react-icons/fi';

const AdminProducts = () => {
    const { token, API_URL, productos, obtenerProductos, obtenerPromociones } = useContext(AppContext);
    const [localProducts, setLocalProducts] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        id_categoria: '',
        edad_recomendada: '',
        ultimo_lanzamiento: false
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagenes_a_borrar, setImagenesABorrar] = useState([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Buscador y panel de ofertas
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [panelTop, setPanelTop] = useState(0);
    const [allPromotions, setAllPromotions] = useState([]);
    const [promoFormData, setPromoFormData] = useState({
        descripcion: '',
        porcentaje: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    const fetchAdminProductos = async () => {
        try {
            const res = await fetch(`${API_URL}/productos/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setLocalProducts(data);
            }
        } catch (e) {
            console.error("Error fetching admin products", e);
        }
    };

    useEffect(() => {
        fetchAdminProductos();
        fetchCategorias();
        fetchAllPromotions();
    }, []);

    // Llenar campos de promoción al seleccionar un producto
    useEffect(() => {
        if (selectedProduct) {
            const promo = allPromotions.find(p => p.id_producto === selectedProduct.id_producto);
            if (promo) {
                setPromoFormData({
                    descripcion: promo.descripcion || '',
                    porcentaje: parseFloat(promo.porcentaje).toString(),
                    fecha_inicio: promo.fecha_inicio ? promo.fecha_inicio.split('T')[0] : '',
                    fecha_fin: promo.fecha_fin ? promo.fecha_fin.split('T')[0] : ''
                });
            } else {
                setPromoFormData({
                    descripcion: '',
                    porcentaje: '',
                    fecha_inicio: '',
                    fecha_fin: ''
                });
            }
        }
    }, [selectedProduct, allPromotions]);

    const fetchCategorias = async () => {
        try {
            const res = await fetch(`${API_URL}/productos/categorias/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCategorias(data);
            }
        } catch (e) {
            console.error("Error fetching categorias", e);
        }
    };

    const fetchAllPromotions = async () => {
        try {
            const res = await fetch(`${API_URL}/promociones`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAllPromotions(data);
            }
        } catch (e) {
            console.error("Error fetching promotions", e);
        }
    };

    const handleOpenModal = async (prod = null) => {
        if (prod) {
            setEditingProduct(prod);
            // Fetch detailed product from backend to get all images
            try {
                const res = await fetch(`${API_URL}/productos/${prod.id_producto}`);
                if (res.ok) {
                    const detailedProd = await res.json();
                    setFormData({
                        nombre: detailedProd.nombre,
                        descripcion: detailedProd.descripcion || '',
                        precio: Math.round(parseFloat(detailedProd.precio)),
                        stock: detailedProd.stock,
                        id_categoria: detailedProd.id_categoria,
                        edad_recomendada: detailedProd.edad_recomendada || '',
                        ultimo_lanzamiento: detailedProd.ultimo_lanzamiento || false
                    });
                    setExistingImages(detailedProd.imagenes || []);
                } else {
                    setFormData({
                        nombre: prod.nombre,
                        descripcion: prod.descripcion || '',
                        precio: Math.round(parseFloat(prod.precio)),
                        stock: prod.stock,
                        id_categoria: prod.id_categoria,
                        edad_recomendada: prod.edad_recomendada || '',
                        ultimo_lanzamiento: prod.ultimo_lanzamiento || false
                    });
                    setExistingImages(prod.imagen_url ? [prod.imagen_url] : []);
                }
            } catch (e) {
                console.error("Error fetching detailed product", e);
                setFormData({
                    nombre: prod.nombre,
                    descripcion: prod.descripcion || '',
                    precio: Math.round(parseFloat(prod.precio)),
                    stock: prod.stock,
                    id_categoria: prod.id_categoria,
                    edad_recomendada: prod.edad_recomendada || '',
                    ultimo_lanzamiento: prod.ultimo_lanzamiento || false
                });
                setExistingImages(prod.imagen_url ? [prod.imagen_url] : []);
            }
        } else {
            setEditingProduct(null);
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                stock: '',
                id_categoria: categorias.length > 0 ? categorias[0].id_categoria : '',
                edad_recomendada: '',
                ultimo_lanzamiento: false
            });
            setExistingImages([]);
        }
        setSelectedFiles([]);
        setPreviewUrls([]);
        setImagenesABorrar([]);
        setIsCreatingCategory(false);
        setNewCategoryName('');
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            if (files.length > 0) {
                setSelectedFiles(prev => [...prev, ...files]);
                const newPreviews = files.map(file => URL.createObjectURL(file));
                setPreviewUrls(prev => [...prev, ...newPreviews]);
            }
        }
    };

    const handleRemoveExistingImage = (url) => {
        setImagenesABorrar(prev => [...prev, url]);
        setExistingImages(prev => prev.filter(img => img !== url));
    };

    const handleRemoveNewFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        setIsSubmitting(true);

        let finalCategoryId = formData.id_categoria;

        if (isCreatingCategory && newCategoryName.trim()) {
            try {
                const catRes = await fetch(`${API_URL}/productos/categorias/admin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre: newCategoryName.trim() })
                });
                
                if (catRes.ok) {
                    const data = await catRes.json();
                    if (data.categoria && data.categoria.id_categoria) {
                        finalCategoryId = data.categoria.id_categoria;
                        // update state for UI
                        setFormData(prev => ({ ...prev, id_categoria: finalCategoryId }));
                        setNewCategoryName('');
                        setIsCreatingCategory(false);
                        await fetchCategorias();
                    }
                } else {
                    const data = await catRes.json();
                    alert(data.error || 'Error al crear la categoría');
                    setIsSubmitting(false);
                    return; // Stop product creation if category fails
                }
            } catch (err) {
                console.error(err);
                alert('Error de red al crear la categoría');
                setIsSubmitting(false);
                return;
            }
        }

        if (!finalCategoryId) {
            alert("Debe seleccionar o crear una categoría para el producto.");
            setIsSubmitting(false);
            return;
        }

        const url = editingProduct ? `${API_URL}/productos/${editingProduct.id_producto}` : `${API_URL}/productos`;
        const method = editingProduct ? 'PUT' : 'POST';

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'id_categoria') {
                submitData.append(key, finalCategoryId);
            } else {
                submitData.append(key, formData[key]);
            }
        });

        if (imagenes_a_borrar.length > 0) {
            submitData.append('imagenes_a_borrar', JSON.stringify(imagenes_a_borrar));
        }

        selectedFiles.forEach(file => {
            submitData.append('imagenes', file);
        });

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            if (res.ok) {
                alert(editingProduct ? 'Producto actualizado' : 'Producto creado');
                setIsModalOpen(false);
                if (obtenerProductos) await obtenerProductos();
                await fetchAdminProductos();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar');
            }
        } catch (e) {
            console.error(e);
            alert("Error de red");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto? Se ocultará de la tienda.')) return;
        try {
            const res = await fetch(`${API_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                alert('Producto eliminado exitosamente');
                if (obtenerProductos) await obtenerProductos();
                await fetchAdminProductos();
                if (selectedProduct && selectedProduct.id_producto === id) setSelectedProduct(null);
            } else {
                alert('Error al eliminar el producto');
            }
        } catch (e) {
            console.error("Error deleting product", e);
            alert("Error de red");
        }
    };

    const handleSaveCategoryInline = async () => {
        if (!newCategoryName.trim()) {
            alert("El nombre de la categoría no puede estar vacío");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/productos/categorias/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: newCategoryName.trim() })
            });

            if (res.ok) {
                const data = await res.json();
                alert('Categoría creada exitosamente');
                setNewCategoryName('');
                setIsCreatingCategory(false);
                await fetchCategorias();
                if (data.categoria && data.categoria.id_categoria) {
                    setFormData(prev => ({ ...prev, id_categoria: data.categoria.id_categoria }));
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar la categoría');
            }
        } catch (e) {
            console.error(e);
            alert("Error de red");
        }
    };

    // Crear o editar una promoción para el producto seleccionado
    const handleSavePromo = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        const currentPromo = allPromotions.find(p => p.id_producto === selectedProduct.id_producto);
        const url = currentPromo ? `${API_URL}/promociones/${currentPromo.id_promo}` : `${API_URL}/promociones`;
        const method = currentPromo ? 'PUT' : 'POST';

        const dataToSend = {
            descripcion: 'Oferta Especial',
            porcentaje: parseFloat(promoFormData.porcentaje),
            fecha_inicio: promoFormData.fecha_inicio,
            fecha_fin: promoFormData.fecha_fin,
            id_producto: selectedProduct.id_producto
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (res.ok) {
                alert(currentPromo ? 'Oferta actualizada exitosamente' : 'Oferta creada exitosamente');
                await fetchAllPromotions();
                if (obtenerProductos) await obtenerProductos();
                if (obtenerPromociones) await obtenerPromociones();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar la oferta');
            }
        } catch (err) {
            console.error("Error saving promo:", err);
            alert("Error al guardar la oferta");
        }
    };

    // Eliminar la promoción del producto seleccionado
    const handleDeletePromo = async () => {
        if (!selectedProduct) return;
        const currentPromo = allPromotions.find(p => p.id_producto === selectedProduct.id_producto);
        if (!currentPromo) return;

        if (!window.confirm("¿Seguro que deseas eliminar la oferta de este producto?")) return;

        try {
            const res = await fetch(`${API_URL}/promociones/${currentPromo.id_promo}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                alert('Oferta eliminada exitosamente');
                setSelectedProduct(null);
                await fetchAllPromotions();
                if (obtenerProductos) await obtenerProductos();
                if (obtenerPromociones) await obtenerPromociones();
            } else {
                alert('Error al eliminar la oferta');
            }
        } catch (err) {
            console.error("Error deleting promo:", err);
            alert("Error de red");
        }
    };

    // Filtrado de productos basado en la consulta de búsqueda
    const filteredProducts = localProducts.filter(p => 
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id_producto.toString().includes(searchQuery) ||
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            {/* Header del panel de productos con buscador integrado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2>Gestión de Productos</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                    {/* Buscador premium con iconografía */}
                    <div style={{ position: 'relative', maxWidth: '350px', width: '100%' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input 
                            type="text" 
                            placeholder="Buscar producto por nombre, ID o categoría..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.25rem',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#111827'; e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.05)'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                    
                    <button className="admin-btn primary" onClick={() => handleOpenModal()}>+ Nuevo Producto</button>
                </div>
            </div>

            {/* Layout principal flexible: Oferta a la izquierda (si hay selección), Tabla a la derecha */}
            <div style={{ display: 'flex', gap: selectedProduct ? '2rem' : '0', alignItems: 'flex-start', position: 'relative' }}>
                
                {/* Contenedor lateral de Promoción para permitir alineación exacta */}
                {selectedProduct && (
                    <div style={{ width: '320px', flexShrink: 0, position: 'relative', alignSelf: 'stretch' }}>
                        <div className="promo-side-panel animate-slide-right" style={{
                            width: '320px',
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            position: 'absolute',
                            top: `${panelTop}px`,
                            transition: 'top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            zIndex: 10
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>
                                    {allPromotions.some(p => p.id_producto === selectedProduct.id_producto) ? 'Editar Oferta' : 'Crear Oferta'}
                                </h3>
                                <button 
                                    onClick={() => setSelectedProduct(null)} 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                                    title="Cerrar panel"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                            
                            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4' }}>
                                Producto: <strong style={{ color: '#111827' }}>{selectedProduct.nombre}</strong> <br/>
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>ID del producto: {selectedProduct.id_producto}</span>
                            </p>

                            <form onSubmit={handleSavePromo}>
                                <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Descuento (%)</label>
                                    <input 
                                        type="number" 
                                        name="porcentaje" 
                                        value={promoFormData.porcentaje} 
                                        onChange={(e) => setPromoFormData(prev => ({ ...prev, porcentaje: e.target.value }))}
                                        placeholder="15" 
                                        min="1" 
                                        max="100" 
                                        required 
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Fecha de Inicio</label>
                                    <input 
                                        type="date" 
                                        name="fecha_inicio" 
                                        value={promoFormData.fecha_inicio} 
                                        onChange={(e) => setPromoFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                                        required 
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Fecha de Fin</label>
                                    <input 
                                        type="date" 
                                        name="fecha_fin" 
                                        value={promoFormData.fecha_fin} 
                                        onChange={(e) => setPromoFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
                                        required 
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
                                    />
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button type="submit" className="admin-btn primary" style={{ width: '100%', padding: '0.65rem' }}>
                                        {allPromotions.some(p => p.id_producto === selectedProduct.id_producto) ? 'Guardar Cambios' : 'Crear Oferta'}
                                    </button>
                                    {allPromotions.some(p => p.id_producto === selectedProduct.id_producto) && (
                                        <button 
                                            type="button" 
                                            className="admin-btn danger" 
                                            onClick={handleDeletePromo} 
                                            style={{ width: '100%', padding: '0.65rem' }}
                                        >
                                            Eliminar Oferta
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tabla de Productos */}
                <div className="admin-table-container" style={{ flex: 1, minWidth: 0, marginTop: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Oferta</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => {
                                const isSelected = selectedProduct?.id_producto === p.id_producto;
                                return (
                                    <tr 
                                        key={p.id_producto}
                                        onClick={(e) => {
                                            setSelectedProduct(p);
                                            const tr = e.currentTarget;
                                            const calculatedTop = tr.offsetTop + (tr.offsetHeight / 2) - 200;
                                            setPanelTop(Math.max(0, calculatedTop));
                                            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                        style={{ 
                                            cursor: 'pointer', 
                                            backgroundColor: isSelected ? '#f1f5f9' : '',
                                            borderLeft: isSelected ? '4px solid #ffcf00' : '4px solid transparent',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <td>{p.id_producto}</td>
                                        <td style={{ fontWeight: '600', color: '#1f2937' }}>
                                            {p.nombre}
                                            {p.activo === false && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginLeft: '8px', fontWeight: 'bold' }}>(Eliminado)</span>}
                                        </td>
                                        <td>{p.categoria_nombre || 'Sin categoría'}</td>
                                        <td>${parseFloat(p.precio).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                                        <td>{p.stock}</td>
                                        <td>
                                            {p.descuento ? (
                                                <span style={{ 
                                                    backgroundColor: '#ffefef', 
                                                    color: '#ff3366', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '700',
                                                    border: '1px solid rgba(255, 51, 102, 0.15)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    -{Math.round(parseFloat(p.descuento))}% OFF
                                                </span>
                                            ) : (
                                                <span style={{ color: '#9ca3af' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 'none' }} onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={() => handleOpenModal(p)} 
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '6px', borderRadius: '4px', transition: 'all 0.2s' }}
                                                title="Editar Producto"
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(p.id_producto)} 
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px', borderRadius: '4px', transition: 'all 0.2s', marginLeft: '4px' }}
                                                title="Eliminar Producto"
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontStyle: 'italic' }}>
                                        No se encontraron productos que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Modal de Creación/Edición de Producto */}
            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-group">
                                <label>Nombre</label>
                                <input name="nombre" value={formData.nombre} onChange={handleChange} required />
                            </div>
                            <div className="admin-form-group">
                                <label>Descripción</label>
                                <textarea 
                                    name="descripcion" 
                                    value={formData.descripcion} 
                                    onChange={handleChange} 
                                    style={{ resize: 'none', height: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Precio</label>
                                <input type="number" name="precio" value={formData.precio} onChange={handleChange} onWheel={(e) => e.target.blur()} required min="0" step="1"/>
                            </div>
                            <div className="admin-form-group">
                                <label>Stock</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} onWheel={(e) => e.target.blur()} required min="0" step="1" />
                            </div>
                            <div className="admin-form-group">
                                <label>Edad Recomendada</label>
                                <select 
                                    name="edad_recomendada" 
                                    value={formData.edad_recomendada} 
                                    onChange={handleChange}
                                >
                                    <option value="">Todas las edades</option>
                                    <option value="2">2+ años</option>
                                    <option value="3">3+ años</option>
                                    <option value="6">6+ años</option>
                                    <option value="8">8+ años</option>
                                    <option value="9">9+ años</option>
                                    <option value="12">12+ años</option>
                                    <option value="16">16+ años</option>
                                    <option value="18">18+ años</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Categoría</label>
                                {isCreatingCategory ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Nombre de la nueva categoría" 
                                            value={newCategoryName} 
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <button 
                                            type="button" 
                                            className="admin-btn primary"
                                            onClick={handleSaveCategoryInline}
                                            style={{ height: '38px', padding: '0 1rem' }}
                                        >
                                            Crear
                                        </button>
                                        <button 
                                            type="button" 
                                            className="admin-btn"
                                            onClick={() => {
                                                setIsCreatingCategory(false);
                                                setNewCategoryName('');
                                            }}
                                            style={{ height: '38px', padding: '0 1rem', background: '#f3f4f6', color: '#4b5563' }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select 
                                            name="id_categoria" 
                                            value={formData.id_categoria} 
                                            onChange={handleChange} 
                                            required
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Seleccione...</option>
                                            {categorias.map(c => (
                                                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            className="admin-btn"
                                            onClick={() => setIsCreatingCategory(true)}
                                            style={{ padding: '0 1.25rem', height: '42px', background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', whiteSpace: 'nowrap' }}
                                            title="Crear Nueva Categoría"
                                        >
                                            + Nueva
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="admin-form-group">
                                <label>Imágenes del Producto</label>
                                <div 
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        backgroundColor: isDragging ? '#fffae6' : '#f9fafb',
                                        color: isDragging ? '#ffcf00' : '#4b5563',
                                        borderRadius: '12px',
                                        border: isDragging ? '2px dashed #ffcf00' : '2px dashed #d1d5db',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        marginBottom: '1rem',
                                        textAlign: 'center'
                                    }}
                                    onClick={() => document.getElementById('product-image-input').click()}
                                >
                                    <FiUploadCloud size={36} style={{ marginBottom: '0.75rem', color: isDragging ? '#ffcf00' : '#9ca3af' }} />
                                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1f2937' }}>
                                        {isDragging ? '¡Suelta las imágenes aquí!' : 'Arrastra y suelta imágenes aquí'}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        o haz clic para explorar tus archivos
                                    </span>
                                    <input 
                                        id="product-image-input"
                                        type="file" 
                                        name="imagenes" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={handleFileChange} 
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {existingImages.map((url, index) => (
                                        <div key={`exist-${index}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                            <img 
                                                src={url.startsWith('http') ? url : `${API_URL.replace('/api', '')}${url.startsWith('/') ? url : '/uploads/' + url}`} 
                                                alt={`Imagen guardada ${index + 1}`} 
                                                style={{ width: '90px', height: '90px', objectFit: 'cover', display: 'block' }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveExistingImage(url)}
                                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                title="Eliminar imagen"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {previewUrls.map((url, index) => (
                                        <div key={`prev-${index}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #10b981' }}>
                                            <img 
                                                src={url} 
                                                alt={`preview-${index}`} 
                                                style={{ width: '86px', height: '86px', objectFit: 'cover', display: 'block' }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveNewFile(index)}
                                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                title="Descartar archivo"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', padding: '0.5rem 0' }}>
                                <input 
                                    type="checkbox" 
                                    name="ultimo_lanzamiento" 
                                    id="ultimo_lanzamiento"
                                    checked={formData.ultimo_lanzamiento} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, ultimo_lanzamiento: e.target.checked }))} 
                                    style={{ width: '20px', height: '20px', cursor: 'pointer', margin: 0 }}
                                />
                                <label htmlFor="ultimo_lanzamiento" style={{ cursor: 'pointer', marginBottom: 0, fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>
                                    Último Lanzamiento (Mostrar en la sección de novedades de la página principal)
                                </label>
                            </div>

                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="admin-btn primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;

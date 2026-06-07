import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../../context/AppContext';
import { FiEdit2, FiUploadCloud, FiX } from 'react-icons/fi';

const AdminProducts = () => {
    const { token, API_URL, productos } = useContext(AppContext);
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
        edad_recomendada: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagenes_a_borrar, setImagenesABorrar] = useState([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        setLocalProducts(productos);
        fetchCategorias();
    }, [productos]);

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
                        precio: detailedProd.precio,
                        stock: detailedProd.stock,
                        id_categoria: detailedProd.id_categoria,
                        edad_recomendada: detailedProd.edad_recomendada || ''
                    });
                    setExistingImages(detailedProd.imagenes || []);
                } else {
                    setFormData({
                        nombre: prod.nombre,
                        descripcion: prod.descripcion || '',
                        precio: prod.precio,
                        stock: prod.stock,
                        id_categoria: prod.id_categoria,
                        edad_recomendada: prod.edad_recomendada || ''
                    });
                    setExistingImages(prod.imagen_url ? [prod.imagen_url] : []);
                }
            } catch (e) {
                console.error("Error fetching detailed product", e);
                setFormData({
                    nombre: prod.nombre,
                    descripcion: prod.descripcion || '',
                    precio: prod.precio,
                    stock: prod.stock,
                    id_categoria: prod.id_categoria,
                    edad_recomendada: prod.edad_recomendada || ''
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
                edad_recomendada: ''
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
        
        // Crear object URLs para previsualización
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const handleRemoveExistingImage = (url) => {
        setImagenesABorrar(prev => [...prev, url]);
        setExistingImages(prev => prev.filter(img => img !== url));
    };

    const handleRemoveNewFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        // Revocar la URL de objeto para evitar fugas de memoria
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingProduct ? `${API_URL}/productos/${editingProduct.id_producto}` : `${API_URL}/productos`;
        const method = editingProduct ? 'PUT' : 'POST';

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
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
                    // NO incluimos Content-Type aquí para que el navegador genere correctamente el boundary de multipart/form-data
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            if (res.ok) {
                alert(editingProduct ? 'Producto actualizado' : 'Producto creado');
                setIsModalOpen(false);
                // Acá idealmente se debería re-fetchear los productos llamando a un fetch interno o recargar la página.
                window.location.reload(); 
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar');
            }
        } catch (e) {
            console.error(e);
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
                
                // Re-obtener las categorías
                await fetchCategorias();
                
                // Seleccionar la nueva categoría automáticamente
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Gestión de Productos</h2>
                <button className="admin-btn primary" onClick={() => handleOpenModal()}>+ Nuevo Producto</button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localProducts.map(p => (
                            <tr key={p.id_producto}>
                                <td>{p.id_producto}</td>
                                <td>{p.nombre}</td>
                                <td>{p.categoria_nombre || 'Sin categoría'}</td>
                                <td>${parseFloat(p.precio).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                                <td>{p.stock}</td>
                                <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 'none' }}>
                                    <button 
                                        onClick={() => handleOpenModal(p)} 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '6px', borderRadius: '4px', transition: 'all 0.2s' }}
                                        title="Editar"
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                    style={{ resize: 'vertical', minHeight: '100px', maxHeight: '300px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Precio</label>
                                <input type="number" name="precio" value={formData.precio} onChange={handleChange} required min="1" step="0.01"/>
                            </div>
                            <div className="admin-form-group">
                                <label>Stock</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" />
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
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        borderRadius: '8px',
                                        border: '1px dashed #9ca3af',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; e.currentTarget.style.borderColor = '#6b7280'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#9ca3af'; }}
                                    >
                                        <FiUploadCloud size={20} />
                                        Subir Imágenes
                                        <input 
                                            type="file" 
                                            name="imagenes" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleFileChange} 
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {/* Imágenes existentes (al editar) */}
                                    {existingImages.map((url, index) => (
                                        <div key={`exist-${index}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                            <img 
                                                src={url.startsWith('http') || url.startsWith('/') ? (url.startsWith('http') ? url : `${API_URL}${url}`) : `${API_URL}/uploads/${url}`} 
                                                alt={`existente-${index}`} 
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

                                    {/* Previsualización de nuevos archivos seleccionados */}
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
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="admin-btn primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;

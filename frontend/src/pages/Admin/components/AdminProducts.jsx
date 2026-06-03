import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

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

    const handleOpenModal = (prod = null) => {
        if (prod) {
            setEditingProduct(prod);
            setFormData({
                nombre: prod.nombre,
                descripcion: prod.descripcion || '',
                precio: prod.precio,
                stock: prod.stock,
                id_categoria: prod.id_categoria,
                edad_recomendada: prod.edad_recomendada || ''
            });
            // Asumiendo que el endpoint de obtener todos o ID devuelve el array de 'imagenes'
            setExistingImages(prod.imagenes || (prod.imagen_url ? [prod.imagen_url] : []));
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
                                <td>${p.precio}</td>
                                <td>{p.stock}</td>
                                <td>
                                    <button className="admin-btn edit" onClick={() => handleOpenModal(p)}>Editar</button>
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
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} />
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
                                <select name="id_categoria" value={formData.id_categoria} onChange={handleChange} required>
                                    <option value="">Seleccione...</option>
                                    {categorias.map(c => (
                                        <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="admin-form-group">
                                <label>Imágenes del Producto</label>
                                <input type="file" name="imagenes" accept="image/*" multiple onChange={handleFileChange} />
                                
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                    {/* Imágenes existentes (al editar) */}
                                    {existingImages.map((url, index) => (
                                        <div key={`exist-${index}`} style={{ position: 'relative' }}>
                                            <img 
                                                src={url.startsWith('http') || url.startsWith('/') ? (url.startsWith('http') ? url : `${API_URL}${url}`) : `${API_URL}/uploads/${url}`} 
                                                alt={`existente-${index}`} 
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveExistingImage(url)}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}

                                    {/* Previsualización de nuevos archivos seleccionados */}
                                    {previewUrls.map((url, index) => (
                                        <div key={`prev-${index}`} style={{ position: 'relative' }}>
                                            <img 
                                                src={url} 
                                                alt={`preview-${index}`} 
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #4CAF50' }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveNewFile(index)}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                            >
                                                X
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

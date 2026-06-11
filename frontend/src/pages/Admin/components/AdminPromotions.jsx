import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';

const AdminPromotions = () => {
    const { token, API_URL, obtenerPromociones, mostrarNotificacion } = useContext(AppContext);
    const [promotions, setPromotions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, onCancel: () => setConfirmModalData(prev => ({ ...prev, isOpen: false })) });
    const [formData, setFormData] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        porcentaje: '',
        id_producto: '',
        id_categoria: '',
        descripcion: ''
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            // Nota: Aquí deberíamos tener un GET /api/promociones con auth que traiga todas (incluso expiradas si queremos historial)
            // Por ahora usamos el endpoint que hicimos para admin
            const res = await fetch(`${API_URL}/promociones`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setPromotions(data);
            }
        } catch (e) {
            console.error("Error fetching promotions", e);
        }
    };

    const handleOpenModal = (promo = null) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                fecha_inicio: promo.fecha_inicio.split('T')[0],
                fecha_fin: promo.fecha_fin.split('T')[0],
                porcentaje: promo.porcentaje,
                id_producto: promo.id_producto || '',
                id_categoria: promo.id_categoria || '',
                descripcion: promo.descripcion || ''
            });
        } else {
            setEditingPromo(null);
            setFormData({
                fecha_inicio: '',
                fecha_fin: '',
                porcentaje: '',
                id_producto: '',
                id_categoria: '',
                descripcion: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingPromo ? `${API_URL}/promociones/${editingPromo.id_promo}` : `${API_URL}/promociones`;
        const method = editingPromo ? 'PUT' : 'POST';

        // Validar que se envíe o id_producto o id_categoria
        const dataToSend = { ...formData };
        if (!dataToSend.id_producto) delete dataToSend.id_producto;
        if (!dataToSend.id_categoria) delete dataToSend.id_categoria;

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
                mostrarNotificacion('Éxito', editingPromo ? 'Promoción actualizada' : 'Promoción creada', 'success');
                setIsModalOpen(false);
                fetchPromotions();
                if (obtenerPromociones) obtenerPromociones();
            } else {
                const data = await res.json();
                mostrarNotificacion('Error', data.error || 'Error al guardar', 'error');
            }
        } catch (e) {
            console.error(e);
            mostrarNotificacion('Error', 'Error de red', 'error');
        }
    };

    const handleDelete = (id) => {
        setConfirmModalData({
            isOpen: true,
            title: 'Eliminar Promoción',
            message: '¿Seguro que deseas eliminar esta promoción?',
            onConfirm: async () => {
                setConfirmModalData(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await fetch(`${API_URL}/promociones/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (res.ok) {
                        mostrarNotificacion('Éxito', 'Promoción eliminada exitosamente', 'success');
                        fetchPromotions();
                        if (obtenerPromociones) obtenerPromociones();
                    } else {
                        mostrarNotificacion('Error', 'Error al eliminar', 'error');
                    }
                } catch(e) {
                    mostrarNotificacion('Error', 'Error de red', 'error');
                }
            },
            onCancel: () => setConfirmModalData(prev => ({ ...prev, isOpen: false }))
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Gestión de Promociones</h2>
                <button className="admin-btn primary" onClick={() => handleOpenModal()}>+ Nueva Promoción</button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descripción</th>
                            <th>Descuento</th>
                            <th>Aplica a</th>
                            <th>Vencimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(p => (
                            <tr key={p.id_promo}>
                                <td>{p.id_promo}</td>
                                <td>{p.descripcion}</td>
                                <td>{parseFloat(p.porcentaje).toString()}%</td>
                                <td>
                                    {p.producto_nombre ? `${p.producto_nombre}` : ''}
                                    {p.categoria_nombre ? `Categoría: ${p.categoria_nombre}` : ''}
                                    {!p.producto_nombre && !p.categoria_nombre && 'Global (Toda la tienda)'}
                                </td>
                                <td>{new Date(p.fecha_fin).toLocaleDateString()}</td>
                                <td style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', borderBottom: 'none' }}>
                                    <button 
                                        onClick={() => handleOpenModal(p)} 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '6px', borderRadius: '4px', transition: 'all 0.2s' }}
                                        title="Editar"
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(p.id_promo)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px', borderRadius: '4px', transition: 'all 0.2s' }}
                                        title="Eliminar"
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <FiTrash2 size={18} />
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
                        <h3>{editingPromo ? 'Editar Promoción' : 'Crear Promoción'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-group">
                                <label>Descripción</label>
                                <input name="descripcion" value={formData.descripcion} onChange={handleChange} required />
                            </div>
                            <div className="admin-form-group">
                                <label>Porcentaje de Descuento</label>
                                <input type="number" name="porcentaje" value={formData.porcentaje} onChange={handleChange} required min="1" max="100"/>
                            </div>
                            <div className="admin-form-group">
                                <label>Fecha de Inicio</label>
                                <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
                            </div>
                            <div className="admin-form-group">
                                <label>Fecha de Fin</label>
                                <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required />
                            </div>
                            <div className="admin-form-group">
                                <label>ID Producto (opcional)</label>
                                <input 
                                    type="number" 
                                    name="id_producto" 
                                    value={formData.id_producto} 
                                    onChange={handleChange} 
                                    placeholder="Si aplica a un producto"
                                    disabled={!!formData.id_categoria}
                                    title={formData.id_categoria ? "Deshabilitado porque ya seleccionaste una categoría" : ""}
                                    min="1"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>ID Categoría (opcional)</label>
                                <input 
                                    type="number" 
                                    name="id_categoria" 
                                    value={formData.id_categoria} 
                                    onChange={handleChange} 
                                    placeholder="Si aplica a una categoría" 
                                    disabled={!!formData.id_producto}
                                    title={formData.id_producto ? "Deshabilitado porque ya seleccionaste un producto" : ""}
                                    min="1"
                                />
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="admin-btn primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <ConfirmModal 
                isOpen={confirmModalData.isOpen}
                title={confirmModalData.title}
                message={confirmModalData.message}
                onConfirm={confirmModalData.onConfirm}
                onCancel={confirmModalData.onCancel}
            />
        </div>
    );
};

export default AdminPromotions;

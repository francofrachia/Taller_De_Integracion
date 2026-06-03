import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

const AdminCategories = () => {
    const { token, API_URL } = useContext(AppContext);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        nombre: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/productos/categorias/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (e) {
            console.error("Error fetching categorias", e);
        }
    };

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setFormData({ nombre: cat.nombre });
        } else {
            setEditingCategory(null);
            setFormData({ nombre: '' });
        }
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingCategory 
            ? `${API_URL}/productos/categorias/admin/${editingCategory.id_categoria}` 
            : `${API_URL}/productos/categorias/admin`;
        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
                setIsModalOpen(false);
                fetchCategories();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar');
            }
        } catch (e) {
            console.error(e);
            alert("Error de red");
        }
    };

    const handleDelete = async (id_categoria) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta categoría? Solo se podrá borrar si no tiene productos asociados.")) return;
        try {
            const res = await fetch(`${API_URL}/productos/categorias/admin/${id_categoria}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                alert('Categoría eliminada con éxito');
                fetchCategories();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al eliminar');
            }
        } catch(e) {
            alert('Error de red');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Gestión de Categorías</h2>
                <button className="admin-btn primary" onClick={() => handleOpenModal()}>+ Nueva Categoría</button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id_categoria}>
                                <td>{c.id_categoria}</td>
                                <td>{c.nombre}</td>
                                <td>
                                    <button className="admin-btn edit" onClick={() => handleOpenModal(c)} style={{marginRight: '0.5rem'}}>Editar</button>
                                    <button className="admin-btn danger" onClick={() => handleDelete(c.id_categoria)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>{editingCategory ? 'Editar Categoría' : 'Crear Categoría'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-group">
                                <label>Nombre de la Categoría</label>
                                <input name="nombre" value={formData.nombre} onChange={handleChange} required />
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

export default AdminCategories;

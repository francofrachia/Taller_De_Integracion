import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { FiEdit2, FiDownload } from 'react-icons/fi';
import { useToast } from '../../../components/Toast/ToastContext';
import { useConfirm } from '../../../components/Confirm/ConfirmContext';

const AdminOrders = () => {
    const { token, API_URL } = useContext(AppContext);
    const toast = useToast();
    const { confirm } = useConfirm();
    const [orders, setOrders] = useState([]);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/compras/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.compras);
            }
        } catch (e) {
            console.error("Error fetching orders", e);
        }
    };

    const handleStatusChange = async (id_compra, newStatus, currentStatus) => {
        if (!newStatus || newStatus === currentStatus) return;

        if (newStatus === 'Rechazado') {
            toast.error('No está permitido rechazar compras.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/compras/admin/${id_compra}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: newStatus })
            });

            if (res.ok) {
                toast.success('Estado actualizado exitosamente');
                fetchOrders(); // recargar
                setEditingOrderId(null); // ocultar el selector
            } else {
                const data = await res.json();
                toast.error(data.error || 'Error al actualizar estado');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error de red');
        }
    };

    const exportToCSV = () => {
        if (!orders || orders.length === 0) {
            toast.error('No hay ventas para exportar');
            return;
        }
        
        const headers = ['ID Compra', 'Fecha', 'Email Usuario', 'Total ($)', 'Estado', 'Productos (Cant x Nombre @ Precio)'];
        
        const rows = orders.map(o => {
            const date = new Date(o.fecha).toLocaleDateString();
            const prods = o.lineas ? o.lineas.map(l => `${l.cantidad}x ${l.nombre} ($${l.precio})`).join(' | ') : '';
            return [
                o.id_compra,
                date,
                `"${o.usuario_email}"`,
                o.total,
                `"${o.estado}"`,
                `"${prods}"`
            ].join(';');
        });
        
        const csvContent = [headers.join(';'), ...rows].join('\n');
        
        // Agregar BOM para que Excel detecte UTF-8 sin problemas de codificación
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ventas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Gestión de Ventas</h2>
                <button 
                    className="admin-btn primary" 
                    onClick={exportToCSV}
                    title="Descargar listado completo en formato Excel (CSV)"
                >
                    <FiDownload size={18} />
                    Exportar a Excel
                </button>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Compra</th>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Total</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <React.Fragment key={o.id_compra}>
                            <tr 
                                onClick={() => {
                                    if (editingOrderId === o.id_compra) return;
                                    setExpandedOrderId(expandedOrderId === o.id_compra ? null : o.id_compra);
                                }}
                                style={{ cursor: editingOrderId === o.id_compra ? 'default' : 'pointer' }}
                            >
                                <td>{o.id_compra}</td>
                                <td>{new Date(o.fecha).toLocaleDateString()}</td>
                                <td>{o.usuario_email}</td>
                                <td>${parseFloat(o.total)}</td>
                                <td>
                                    {editingOrderId === o.id_compra ? (
                                        <select 
                                            value={o.estado}
                                            onChange={(e) => handleStatusChange(o.id_compra, e.target.value, o.estado)}
                                            onBlur={() => setEditingOrderId(null)}
                                            autoFocus
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                border: '2px solid #ffcc00',
                                                fontFamily: 'inherit',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                minWidth: '150px',
                                                height: '29px',
                                                cursor: 'pointer',
                                                backgroundColor: '#fff',
                                                color: '#1a1a1a',
                                                outline: 'none',
                                                boxShadow: '0 4px 12px rgba(255, 204, 0, 0.25)',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Pago aprobado">Pago aprobado</option>
                                            <option value="En proceso">En proceso</option>
                                            <option value="Pedido despachado">Pedido despachado</option>
                                            <option value="Finalizado">Finalizado</option>
                                        </select>
                                    ) : (
                                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', 
                                                borderRadius: '4px',
                                                backgroundColor: o.estado === 'Rechazado' ? '#fee2e2' : '#dcfce7',
                                                color: o.estado === 'Rechazado' ? '#991b1b' : '#166534',
                                                fontSize: '0.85rem',
                                                minWidth: '150px',
                                                display: 'inline-block',
                                                textAlign: 'center'
                                            }}>
                                                {o.estado}
                                            </span>
                                            {o.estado !== 'Rechazado' && o.estado !== 'Finalizado' && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingOrderId(o.id_compra);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '100%',
                                                        marginLeft: '12px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#9ca3af',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '50%',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#1a1a1a';
                                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#9ca3af';
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                    title="Editar Estado"
                                                >
                                                    <FiEdit2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                            
                            {/* Fila de detalles expandible */}
                            {expandedOrderId === o.id_compra && (
                                <tr style={{ backgroundColor: '#fcfcfc' }}>
                                    <td colSpan="5" style={{ padding: '0' }}>
                                        <div style={{ 
                                            padding: '1.5rem', 
                                            borderTop: '1px solid #f3f4f6',
                                            borderBottom: '1px solid #e5e7eb',
                                            borderLeft: '4px solid #ffcc00',
                                            boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.05)'
                                        }}>
                                            <h4 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Productos de la orden #{o.id_compra}
                                            </h4>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {o.lineas && o.lineas.map((linea, idx) => (
                                                    <div key={idx} style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center',
                                                        padding: '0.75rem 1rem',
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{ fontWeight: '600', color: '#1f2937' }}>{linea.cantidad}x</span>
                                                            <span style={{ color: '#4b5563' }}>{linea.nombre}</span>
                                                        </div>
                                                        <div style={{ fontWeight: '600', color: '#111827' }}>
                                                            ${parseFloat(linea.precio)} c/u
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!o.lineas || o.lineas.length === 0) && (
                                                    <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No se encontraron detalles de productos para esta orden.</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;

import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Aceptar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content animate-fade-in">
                <div className="confirm-modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="confirm-modal-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>{cancelText}</button>
                    <button className="btn-confirm" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

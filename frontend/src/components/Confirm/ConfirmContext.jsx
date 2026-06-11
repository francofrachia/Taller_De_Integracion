import React, { createContext, useContext, useState, useCallback } from 'react';
import './ConfirmModal.css';

const ConfirmContext = createContext();

export const useConfirm = () => {
    return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        onConfirm: null,
        onCancel: null
    });

    const confirm = useCallback((message) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                message,
                onConfirm: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {confirmState.isOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-icon">
                            ⚠️
                        </div>
                        <h3 className="confirm-modal-title">Confirmar Acción</h3>
                        <p className="confirm-modal-message">{confirmState.message}</p>
                        <div className="confirm-modal-actions">
                            <button className="btn-outline confirm-btn-cancel" onClick={confirmState.onCancel}>
                                Cancelar
                            </button>
                            <button className="btn-yellow confirm-btn-accept" onClick={confirmState.onConfirm}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

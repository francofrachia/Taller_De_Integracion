import React, { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext';
import { MdCheckCircle, MdError, MdInfo, MdClose } from 'react-icons/md';
import './Toast.css';

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now().toString() + Math.random().toString();
        
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast--${t.type}`}>
                        <div className="toast-icon">
                            {t.type === 'success' && <MdCheckCircle />}
                            {t.type === 'error' && <MdError />}
                            {t.type === 'info' && <MdInfo />}
                        </div>
                        <div className="toast-message">{t.message}</div>
                        <button className="toast-close" onClick={() => removeToast(t.id)}>
                            <MdClose />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

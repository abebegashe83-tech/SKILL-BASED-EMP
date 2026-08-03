'use client';

import React, { useEffect } from 'react';

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
}) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div
                className="absolute inset-0"
                onClick={onClose}
                aria-label="Close modal background"
            />
            <div
                className={`relative w-full max-w-md bg-white rounded-lg shadow-xl ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    {title && (
                        <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 mb-1 ml-auto text-gray-400 hover:text-gray-900 focus:outline-none rounded-md hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;

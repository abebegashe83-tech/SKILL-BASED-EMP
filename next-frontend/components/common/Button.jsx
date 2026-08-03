'use client';

import React from 'react';
import { Spinner } from './Spinner';

export const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

    const variants = {
        primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
        danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
    };

    const isDisabled = disabled || isLoading;

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={isDisabled}
            {...props}
        >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {children}
        </button>
    );
};

export default Button;

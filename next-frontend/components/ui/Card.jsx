'use client';

import React from 'react';

export const Card = ({ children, className = '', padding = 'p-6', ...props }) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-md border border-gray-100 ${padding} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

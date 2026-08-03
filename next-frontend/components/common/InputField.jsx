'use client';

import React from 'react';

export const InputField = React.forwardRef(({
    label,
    error,
    id,
    className = '',
    ...props
}, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            {label && (
                <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                ref={ref}
                className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                {...props}
            />
            {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
        </div>
    );
});

InputField.displayName = 'InputField';

export default InputField;

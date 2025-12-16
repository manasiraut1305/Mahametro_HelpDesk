// src/components/ui/button.jsx
import React from 'react';

export function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition ${className}`}
    >
      {children}
    </button>
  );
}

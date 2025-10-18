// client/src/components/common/Button.jsx
import React from 'react';

export default function Button({ children, onClick, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-white shadow-sm
        bg-gradient-to-r from-green-500 to-green-700
        hover:from-green-600 hover:to-green-800
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400
        disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

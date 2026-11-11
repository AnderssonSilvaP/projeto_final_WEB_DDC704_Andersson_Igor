import React from 'react';

export const Spinner = ({ label = 'Carregando...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-24" role="status">
    <div className="w-10 h-10 border-4 border-chess-green border-t-transparent rounded-full animate-spin" />
    <span className="text-sm font-bold text-chess-gray">{label}</span>
  </div>
);

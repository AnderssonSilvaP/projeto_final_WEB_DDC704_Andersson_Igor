import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) => {
  const { playMove } = useAudio();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-chess-dark border border-chess-border rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-chess-border bg-chess-panel flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-chess-gray font-medium">{subtitle}</p>}
          </div>
          <button
            onClick={() => {
              playMove();
              onClose();
            }}
            className="p-1.5 rounded-lg text-chess-gray hover:text-white hover:bg-chess-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

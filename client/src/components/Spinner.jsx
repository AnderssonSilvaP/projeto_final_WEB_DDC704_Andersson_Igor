import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

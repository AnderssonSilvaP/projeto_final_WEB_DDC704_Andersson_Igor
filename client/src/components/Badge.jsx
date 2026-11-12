import React from 'react';

const STYLES = {
  agendado: 'bg-sky-50 text-sky-700 border-sky-200',
  confirmado: 'bg-brand-50 text-brand-700 border-brand-200',
  concluido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelado: 'bg-rose-50 text-rose-700 border-rose-200',
  admin: 'bg-amber-50 text-amber-700 border-amber-200',
  paciente: 'bg-slate-100 text-slate-700 border-slate-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
};

const LABELS = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  admin: 'Admin',
  paciente: 'Paciente',
};

export default function Badge({ variant = 'default', children }) {
  const style = STYLES[variant] || STYLES.default;
  const text = children || LABELS[variant] || variant;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {text}
    </span>
  );
}

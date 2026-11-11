import React from 'react';

export const EvaluationBar = ({ score = 4.5, label = 'Performance Clínica', subtitle = 'Indicador de Eficiência' }) => {
  // Score de -5 a +10 mapeado para 0% a 100% da barra
  const percentage = Math.min(95, Math.max(5, ((score + 5) / 15) * 100));
  const isPositive = score >= 0;

  return (
    <div className="bg-chess-panel border border-chess-border rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-chess-gray">
            {subtitle}
          </span>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>{label}</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded text-xs font-black tracking-wide font-mono ${
              isPositive
                ? 'bg-chess-green/20 text-chess-green border border-chess-green/30'
                : 'bg-chess-red/20 text-chess-red border border-chess-red/30'
            }`}
          >
            {isPositive ? `+${score.toFixed(1)}` : score.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Visual Efficiency Bar */}
      <div className="relative w-full h-5 bg-chess-darkest rounded-md overflow-hidden border border-chess-border flex">
        <div
          className="h-full bg-chess-green transition-all duration-700 ease-out flex items-center justify-end px-2"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 25 && (
            <span className="text-[10px] font-black text-white font-mono drop-shadow">
              {score >= 0 ? `+${score.toFixed(1)}` : ''}
            </span>
          )}
        </div>
        <div
          className="h-full bg-chess-dark transition-all duration-700 ease-out flex items-center justify-start px-2"
          style={{ width: `${100 - percentage}%` }}
        >
          {percentage <= 25 && (
            <span className="text-[10px] font-black text-chess-gray font-mono">
              {score.toFixed(1)}
            </span>
          )}
        </div>
        {/* Center 0.0 marker */}
        <div className="absolute top-0 bottom-0 left-[33.3%] w-[2px] bg-chess-border/60 z-10" />
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-chess-gray font-semibold">
        <span>Abaixo da Meta</span>
        <span className="text-chess-gold font-bold">Equilíbrio Operacional</span>
        <span className="text-chess-green font-bold">Alta Eficiência</span>
      </div>
    </div>
  );
};

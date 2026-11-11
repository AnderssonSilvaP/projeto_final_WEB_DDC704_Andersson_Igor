import React, { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Shield,
  Zap,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const CONDITIONS = [
  { id: 'higido', label: 'Hígido (Sadio)', color: '#ffffff', fill: '#3d3a34', tactic: 'best', symbol: '✓', badge: 'Saudável' },
  { id: 'carie', label: 'Cárie Dentária', color: '#fa4141', fill: '#fa4141', tactic: 'blunder', symbol: 'C', badge: 'Tratar' },
  { id: 'restauracao', label: 'Restauração Resina', color: '#3b82f6', fill: '#3b82f6', tactic: 'good', symbol: 'R', badge: 'Restaurado' },
  { id: 'canal', label: 'Endodontia (Canal)', color: '#a855f7', fill: '#a855f7', tactic: 'mistake', symbol: 'E', badge: 'Tratado' },
  { id: 'coroa', label: 'Coroa / Prótese', color: '#e5b338', fill: '#e5b338', tactic: 'brilliant', symbol: 'P', badge: 'Prótese' },
  { id: 'implante', label: 'Implante Dentário', color: '#06b6d4', fill: '#06b6d4', tactic: 'brilliant', symbol: 'I', badge: 'Implante' },
  { id: 'extracao', label: 'Exodontia (Extraído)', color: '#f97316', fill: '#f97316', tactic: 'blunder', symbol: 'X', badge: 'Extração' },
  { id: 'ortodontia', label: 'Ortodontia (Bráquete)', color: '#81b64c', fill: '#81b64c', tactic: 'good', symbol: 'O', badge: 'Alinhamento' },
  { id: 'tartaro', label: 'Tártaro / Profilaxia', color: '#a3a3a3', fill: '#a3a3a3', tactic: 'inaccuracy', symbol: 'T', badge: 'Profilaxia' },
];

const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const CHILD_UPPER_RIGHT = [55, 54, 53, 52, 51];
const CHILD_UPPER_LEFT = [61, 62, 63, 64, 65];
const CHILD_LOWER_RIGHT = [85, 84, 83, 82, 81];
const CHILD_LOWER_LEFT = [71, 72, 73, 74, 75];

export const OdontogramView = ({
  teeth = [],
  onUpdateTooth,
  onGenerateBudget,
  readOnly = false,
  healthScore = 85,
}) => {
  const { playClick, playAlert, playError, playSuccess } = useAudio();
  const [archType, setArchType] = useState('adulto');

  const [selectedTooth, setSelectedTooth] = useState(16);
  const [selectedSurface, setSelectedSurface] = useState('oclusal');
  const [selectedCondition, setSelectedCondition] = useState('carie');
  const [customPrice, setCustomPrice] = useState(180);
  const [toothNote, setToothNote] = useState('');

  const currentToothData = teeth.find((t) => t.toothNumber === selectedTooth) || {
    toothNumber: selectedTooth,
    generalCondition: 'higido',
    surfaces: {
      vestibular: { condition: 'higido' },
      lingual: { condition: 'higido' },
      mesial: { condition: 'higido' },
      distal: { condition: 'higido' },
      oclusal: { condition: 'higido' },
    },
    chessTactics: 'best',
  };

  const handleToothClick = (toothNum) => {
    playClick();
    setSelectedTooth(toothNum);
    const found = teeth.find((t) => t.toothNumber === toothNum);
    if (found) {
      setSelectedCondition(found.generalCondition || 'higido');
      setToothNote(found.notes || '');
      setCustomPrice(found.price || 0);
    } else {
      setSelectedCondition('higido');
      setToothNote('');
      setCustomPrice(0);
    }
  };

  const handleApplyCondition = () => {
    if (!onUpdateTooth) return;

    if (selectedCondition === 'carie') playError();
    else if (selectedCondition === 'implante' || selectedCondition === 'coroa') playSuccess();
    else playAlert();

    const conditionObj = CONDITIONS.find((c) => c.id === selectedCondition);

    const updatedSurfaces = { ...(currentToothData.surfaces || {}) };
    if (selectedSurface === 'todas') {
      ['vestibular', 'lingual', 'mesial', 'distal', 'oclusal'].forEach((s) => {
        updatedSurfaces[s] = { condition: selectedCondition };
      });
    } else {
      updatedSurfaces[selectedSurface] = { condition: selectedCondition };
    }

    onUpdateTooth(selectedTooth, {
      generalCondition: selectedCondition,
      surfaces: updatedSurfaces,
      chessTactics: conditionObj?.tactic || 'best',
      procedureName: conditionObj?.label || '',
      price: Number(customPrice),
      notes: toothNote,
      status: selectedCondition === 'higido' ? 'higido' : 'necessita_tratamento',
    });
  };

  const getToothSurfaceColor = (toothNum, surfaceName) => {
    const tooth = teeth.find((t) => t.toothNumber === toothNum);
    if (!tooth) return '#3d3a34';

    const surfaceCond = tooth.surfaces?.[surfaceName]?.condition || tooth.generalCondition || 'higido';
    const condConfig = CONDITIONS.find((c) => c.id === surfaceCond);
    return condConfig ? condConfig.fill : '#3d3a34';
  };

  const getToothBadge = (toothNum) => {
    const tooth = teeth.find((t) => t.toothNumber === toothNum);
    if (!tooth || tooth.generalCondition === 'higido') return null;
    const cond = CONDITIONS.find((c) => c.id === tooth.generalCondition);
    return cond;
  };

  const renderToothSVG = (toothNum) => {
    const isSelected = selectedTooth === toothNum;
    const badge = getToothBadge(toothNum);

    const vestColor = getToothSurfaceColor(toothNum, 'vestibular');
    const lingColor = getToothSurfaceColor(toothNum, 'lingual');
    const mesColor = getToothSurfaceColor(toothNum, 'mesial');
    const distColor = getToothSurfaceColor(toothNum, 'distal');
    const oclColor = getToothSurfaceColor(toothNum, 'oclusal');

    return (
      <div
        key={toothNum}
        onClick={() => handleToothClick(toothNum)}
        className={`relative flex flex-col items-center p-1.5 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'bg-chess-green/20 ring-2 ring-chess-green scale-105 shadow-lg'
            : 'hover:bg-chess-panel/60 bg-chess-darker border border-chess-border/60'
        }`}
      >
        <span
          className={`text-[11px] font-black font-mono mb-1 ${
            isSelected ? 'text-chess-green' : 'text-chess-gray'
          }`}
        >
          {toothNum}
        </span>

        <svg width="44" height="44" viewBox="0 0 100 100" className="drop-shadow">
          <rect x="5" y="5" width="90" height="90" rx="14" fill="#1e1e1b" stroke="#3d3a34" strokeWidth="3" />

          <polygon
            points="10,10 90,10 70,30 30,30"
            fill={vestColor}
            stroke="#1e1e1b"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity"
          />

          <polygon
            points="30,70 70,70 90,90 10,90"
            fill={lingColor}
            stroke="#1e1e1b"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity"
          />

          <polygon
            points="10,10 30,30 30,70 10,90"
            fill={mesColor}
            stroke="#1e1e1b"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity"
          />

          <polygon
            points="90,10 70,30 70,70 90,90"
            fill={distColor}
            stroke="#1e1e1b"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity"
          />

          <polygon
            points="30,30 70,30 70,70 30,70"
            fill={oclColor}
            stroke="#1e1e1b"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity"
          />
        </svg>

        {badge && (
          <span
            className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded text-[9px] font-black leading-none shadow-md"
            style={{ backgroundColor: badge.fill, color: '#ffffff' }}
          >
            {badge.symbol}
          </span>
        )}
      </div>
    );
  };

  const upperRight = archType === 'adulto' ? ADULT_UPPER_RIGHT : CHILD_UPPER_RIGHT;
  const upperLeft = archType === 'adulto' ? ADULT_UPPER_LEFT : CHILD_UPPER_LEFT;
  const lowerRight = archType === 'adulto' ? ADULT_LOWER_RIGHT : CHILD_LOWER_RIGHT;
  const lowerLeft = archType === 'adulto' ? ADULT_LOWER_LEFT : CHILD_LOWER_LEFT;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-chess-border">
          <div className="flex items-center gap-3">
            <div className="flex bg-chess-darker p-1 rounded-xl border border-chess-border">
              <button
                onClick={() => { playClick(); setArchType('adulto'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  archType === 'adulto'
                    ? 'bg-chess-green text-white shadow-chess-btn'
                    : 'text-chess-gray hover:text-white'
                }`}
              >
                Arcada Adulta (32 dentes)
              </button>
              <button
                onClick={() => { playClick(); setArchType('infantil'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  archType === 'infantil'
                    ? 'bg-chess-green text-white shadow-chess-btn'
                    : 'text-chess-gray hover:text-white'
                }`}
              >
                Arcada Decídua (20 dentes)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-chess-gray">Índice Bucal</span>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-chess-green" />
                <span>{healthScore}% Higidez</span>
              </div>
            </div>
          </div>
        </div>

        <div className="my-6">
          <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-chess-gray mb-2">
            Arcada Superior (Maxila)
          </div>
          <div className="flex items-center justify-center gap-4 bg-chess-dark/60 p-4 rounded-xl border border-chess-border/80">
            <div className="flex items-center gap-1.5">
              {upperRight.map((n) => renderToothSVG(n))}
            </div>
            <div className="w-[2px] h-14 bg-chess-green/40 rounded-full" />
            <div className="flex items-center gap-1.5">
              {upperLeft.map((n) => renderToothSVG(n))}
            </div>
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-center justify-center gap-4 bg-chess-dark/60 p-4 rounded-xl border border-chess-border/80">
            <div className="flex items-center gap-1.5">
              {lowerRight.map((n) => renderToothSVG(n))}
            </div>
            <div className="w-[2px] h-14 bg-chess-green/40 rounded-full" />
            <div className="flex items-center gap-1.5">
              {lowerLeft.map((n) => renderToothSVG(n))}
            </div>
          </div>
          <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-chess-gray mt-2">
            Arcada Inferior (Mandíbula)
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-chess-border">
          <div className="text-[11px] font-bold uppercase text-chess-gray mb-2">
            Legenda Clínica Padronizada:
          </div>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-chess-darker border border-chess-border text-xs"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                <span className="text-white font-medium">{c.label}</span>
                <span className="text-[10px] font-mono font-bold text-chess-gray">({c.symbol})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-chess-border mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-chess-gray">Diagnóstico Clínico</span>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Dente #{selectedTooth}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-chess-darker text-chess-green border border-chess-border">
                    {selectedTooth <= 28 ? 'Superior' : 'Inferior'}
                  </span>
                </h4>
              </div>
              <div className="w-10 h-10 rounded-xl bg-chess-dark flex items-center justify-center border border-chess-border">
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-chess-gray mb-1.5 uppercase">
                Face Anatômica:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'todas', label: 'Dente Todo' },
                  { id: 'oclusal', label: 'Oclusal / Incisal' },
                  { id: 'vestibular', label: 'Vestibular' },
                  { id: 'lingual', label: 'Lingual/Palatina' },
                  { id: 'mesial', label: 'Mesial' },
                  { id: 'distal', label: 'Distal' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { playClick(); setSelectedSurface(s.id); }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      selectedSurface === s.id
                        ? 'bg-chess-green/20 border-chess-green text-chess-green'
                        : 'bg-chess-darker border-chess-border text-chess-gray hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-chess-gray mb-1.5 uppercase">
                Procedimento / Diagnóstico:
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => {
                  playClick();
                  setSelectedCondition(e.target.value);
                  const priceMap = {
                    higido: 0,
                    carie: 190,
                    restauracao: 180,
                    canal: 750,
                    coroa: 1300,
                    implante: 2400,
                    extracao: 250,
                    ortodontia: 220,
                    tartaro: 160,
                  };
                  setCustomPrice(priceMap[e.target.value] || 0);
                }}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-chess-green"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.badge})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-chess-gray mb-1.5 uppercase">
                Honorário Estimado (R$):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-chess-gray font-bold">R$</span>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-chess-darker border border-chess-border rounded-lg pl-9 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-chess-green font-mono"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-chess-gray mb-1.5 uppercase">
                Observações Clínicas / Detalhes:
              </label>
              <textarea
                rows="2"
                value={toothNote}
                onChange={(e) => setToothNote(e.target.value)}
                placeholder="Ex: Lesão profunda em esmalte e dentina, indicação de resina nanoparticulada..."
                className="w-full bg-chess-darker border border-chess-border rounded-lg p-2.5 text-xs text-white placeholder-chess-gray focus:outline-none focus:border-chess-green resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleApplyCondition}
            className="w-full py-2.5 rounded-xl text-sm font-extrabold chess-btn-green flex items-center justify-center gap-2 mb-3"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aplicar no Dente #{selectedTooth}</span>
          </button>
        </div>

        {onGenerateBudget && (
          <div className="bg-chess-panel border border-chess-border rounded-2xl p-4 shadow-chess-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-chess-gold/10 text-chess-gold border border-chess-gold/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">Plano de Tratamento Odontológico</h5>
                <p className="text-xs text-chess-gray">
                  Gere um orçamento detalhado com base nos procedimentos selecionados.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                playSuccess();
                onGenerateBudget();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-black chess-btn-gold flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Gerar Orçamento do Odontograma</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Clock,
  Activity,
  Sparkles,
  Info,
  CheckCircle,
  Coffee,
  Shield,
  Zap,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const ClinicMiniMap = ({
  waitingCount = 2,
  chair1Occupied = true,
  chair2Occupied = true,
  chair3Occupied = false,
  highlightChair = null,
}) => {
  const { playMove } = useAudio();
  const [selectedRoom, setSelectedRoom] = useState('recepcao');

  const rooms = {
    recepcao: {
      name: 'Recepção & Lounge de Espera',
      type: 'Área Social',
      status: `${waitingCount} paciente(s) aguardando`,
      timeEst: `~${waitingCount * 12} min de espera`,
      details: 'Ambiente climatizado com poltronas ergonômicas, Wi-Fi e acompanhamento por painel digital.',
      color: 'border-chess-gold text-chess-gold',
    },
    c1: {
      name: 'Consultório 1: Cadeira Titânio',
      type: 'Cirurgia Avançada & Implantes',
      doctor: 'Dr. Roberto Silveira (CRO-RR 4521)',
      status: chair1Occupied ? 'Em Atendimento' : 'Livre / Higienizado',
      timeEst: chair1Occupied ? '~20 min restantes' : 'Disponível imediatamente',
      details: 'Sala cirúrgica com pressão positiva, foco cirúrgico de LED e motor de implantes com contra-ângulo redutor.',
      color: 'border-chess-green text-chess-green',
    },
    c2: {
      name: 'Consultório 2: Cadeira Ouro',
      type: 'Ortodontia & Harmonização Facial',
      doctor: 'Dra. Mariana Costa (CRO-RR 5892)',
      status: chair2Occupied ? 'Em Atendimento' : 'Livre / Higienizado',
      timeEst: chair2Occupied ? '~15 min restantes' : 'Disponível imediatamente',
      details: 'Consultório dedicado ao escaneamento 3D intraoral, alinhadores invisíveis e estética orofacial.',
      color: 'border-chess-blue text-chess-blue',
    },
    c3: {
      name: 'Consultório 3: Cadeira Esmeralda',
      type: 'Clínica Geral & Prevenção',
      doctor: 'Equipe de Clínica Integrada',
      status: chair3Occupied ? 'Em Atendimento' : 'Livre / Pronto para Atendimento',
      timeEst: chair3Occupied ? '~25 min restantes' : 'Livre agora',
      details: 'Consultório com ultrassom periodontal piezoelétrico e fotopolimerizador de alta potência.',
      color: 'border-chess-green text-chess-green',
    },
    raioX: {
      name: 'Centro de Diagnóstico por Imagem',
      type: 'Tomografia & Radiologia Digital',
      status: 'Pronto para Disparo',
      timeEst: 'Exames em 3 minutos',
      details: 'Equipamento de Tomografia Computadorizada Cone Beam 3D e Panorâmica Digital com laudo instantâneo.',
      color: 'border-purple-500 text-purple-400',
    },
    esterilizacao: {
      name: 'Central de Esterilização',
      type: 'Biossegurança RDC 15',
      status: 'Ciclo Ativo 134°C',
      timeEst: 'Autoclaves classe B',
      details: 'Termodesinfectora hospitalar, seladoras ultrassônicas e rastreabilidade total por código de barras.',
      color: 'border-cyan-500 text-cyan-400',
    },
  };

  const currentRoomInfo = rooms[selectedRoom] || rooms.recepcao;

  return (
    <div className="bg-chess-panel border border-chess-border rounded-3xl p-6 shadow-2xl space-y-5">
      {/* Header do Mini Mapa */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-chess-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-chess-darker border border-chess-border text-chess-green">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Mini Mapa Interativo da Clínica</span>
              <span className="w-2 h-2 rounded-full bg-chess-green animate-ping" />
            </h3>
            <p className="text-xs text-chess-gray">
              Visualização arquitetônica das salas, fluxo de pacientes e ocupação ao vivo.
            </p>
          </div>
        </div>

        {/* Resumo da Clínica */}
        <div className="flex items-center gap-3 bg-chess-darker px-3 py-1.5 rounded-xl border border-chess-border text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Users className="w-3.5 h-3.5 text-chess-gold" />
            <span>{waitingCount + (chair1Occupied ? 1 : 0) + (chair2Occupied ? 1 : 0)} pacientes na clínica</span>
          </div>
          <span className="text-chess-border">|</span>
          <div className="flex items-center gap-1 font-mono font-bold text-chess-green">
            <Clock className="w-3.5 h-3.5" />
            <span>Espera média: ~12 min</span>
          </div>
        </div>
      </div>

      {/* Grid Arquitetônico 2D da Clínica */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Planta Baixa Interativa */}
        <div className="md:col-span-8 bg-chess-darker p-4 rounded-2xl border border-chess-border relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold text-chess-gray tracking-wider mb-3 flex items-center justify-between">
            <span>Planta da Clínica • OdontoCheck Prime</span>
            <span className="text-chess-green font-mono">1º Andar • 3 Consultórios</span>
          </div>

          <div className="grid grid-cols-6 gap-2.5 min-h-[280px]">
            {/* Recepção & Lounge (3 colunas, 3 linhas) */}
            <div
              onClick={() => { playMove(); setSelectedRoom('recepcao'); }}
              className={`col-span-3 row-span-2 p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRoom === 'recepcao'
                  ? 'bg-chess-panel border-chess-gold ring-2 ring-chess-gold/50 shadow-lg'
                  : 'bg-chess-dark/80 border-chess-border/80 hover:border-chess-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-chess-gold">Entrada</span>
                  <div className="text-xs font-black text-white">Recepção & Lounge</div>
                </div>
                <span className="text-lg">🛋️</span>
              </div>

              {/* Pacientes Sentados (Avatares animados) */}
              <div className="py-2">
                <div className="text-[11px] text-chess-gray mb-1">Sala de Espera:</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: Math.max(1, waitingCount) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg bg-chess-panel border border-chess-border flex items-center justify-center text-xs relative"
                      title={`Paciente #${i + 1} aguardando`}
                    >
                      <span>👤</span>
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-chess-gold animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] font-mono text-chess-gold font-bold">
                {waitingCount} aguardando • ~{waitingCount * 12} min
              </div>
            </div>

            {/* Consultório 1 (Cirurgia) */}
            <div
              onClick={() => { playMove(); setSelectedRoom('c1'); }}
              className={`col-span-3 p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRoom === 'c1' || highlightChair === 1
                  ? 'bg-chess-panel border-chess-green ring-2 ring-chess-green/50 shadow-lg'
                  : 'bg-chess-dark/80 border-chess-border/80 hover:border-chess-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-chess-green">Cadeira #1</span>
                  <div className="text-xs font-black text-white">Cirurgia & Implantes</div>
                  <span className="text-[10px] text-chess-gray">Dr. Roberto Silveira</span>
                </div>
                <span className="text-lg">🩺</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold pt-1">
                <span className={chair1Occupied ? 'text-chess-red' : 'text-chess-green'}>
                  {chair1Occupied ? '● Em Cirurgia' : '○ Livre'}
                </span>
                <span className="text-chess-gray">Titânio</span>
              </div>
            </div>

            {/* Consultório 2 (Ortodontia) */}
            <div
              onClick={() => { playMove(); setSelectedRoom('c2'); }}
              className={`col-span-3 p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRoom === 'c2' || highlightChair === 2
                  ? 'bg-chess-panel border-chess-blue ring-2 ring-chess-blue/50 shadow-lg'
                  : 'bg-chess-dark/80 border-chess-border/80 hover:border-chess-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-chess-blue">Cadeira #2</span>
                  <div className="text-xs font-black text-white">Ortodontia 3D</div>
                  <span className="text-[10px] text-chess-gray">Dra. Mariana Costa</span>
                </div>
                <span className="text-lg">🦷</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold pt-1">
                <span className={chair2Occupied ? 'text-chess-red' : 'text-chess-green'}>
                  {chair2Occupied ? '● Em Atendimento' : '○ Livre'}
                </span>
                <span className="text-chess-gray">Ouro</span>
              </div>
            </div>

            {/* Consultório 3 (Clínica Geral) */}
            <div
              onClick={() => { playMove(); setSelectedRoom('c3'); }}
              className={`col-span-2 p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRoom === 'c3' || highlightChair === 3
                  ? 'bg-chess-panel border-chess-green ring-2 ring-chess-green/50 shadow-lg'
                  : 'bg-chess-dark/80 border-chess-border/80 hover:border-chess-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-chess-green">Cadeira #3</span>
                  <div className="text-xs font-black text-white">Clínica Geral</div>
                </div>
                <span className="text-base">🪥</span>
              </div>
              <div className="text-[10px] font-bold text-chess-green">
                {chair3Occupied ? '● Ocupado' : '○ Livre Agora'}
              </div>
            </div>

            {/* Raio-X & Tomografia 3D */}
            <div
              onClick={() => { playMove(); setSelectedRoom('raioX'); }}
              className={`col-span-2 p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRoom === 'raioX'
                  ? 'bg-chess-panel border-purple-500 ring-2 ring-purple-500/50 shadow-lg'
                  : 'bg-chess-dark/80 border-chess-border/80 hover:border-chess-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-purple-400">Diagnóstico</span>
                  <div className="text-xs font-black text-white">Tomografia 3D</div>
                </div>
                <span className="text-base">🔬</span>
              </div>
              <div className="text-[10px] font-bold text-purple-400">Cone Beam HD</div>
            </div>

            {/* Esterilização & Biossegurança */}
            <div
              onClick={() => { playMove(); setSelectedRoom('esterilizacao'); }}
              className={`col-span-2 p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRoom === 'esterilizacao'
                  ? 'bg-chess-panel border-cyan-500 ring-2 ring-cyan-500/50 shadow-lg'
                  : 'bg-chess-dark/80 border-chess-border/80 hover:border-chess-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400">Biossegurança</span>
                  <div className="text-xs font-black text-white">Esterilização</div>
                </div>
                <span className="text-base">🧼</span>
              </div>
              <div className="text-[10px] font-bold text-cyan-400">100% Estéril</div>
            </div>
          </div>
        </div>

        {/* Detalhes da Sala Selecionada */}
        <div className="md:col-span-4 bg-chess-darker p-5 rounded-2xl border border-chess-border flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-chess-border">
              <span className="text-[10px] font-black uppercase text-chess-gray tracking-wider">
                Detalhes da Sala
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${currentRoomInfo.color}`}>
                {currentRoomInfo.type}
              </span>
            </div>

            <h4 className="text-base font-extrabold text-white mt-3">{currentRoomInfo.name}</h4>
            {currentRoomInfo.doctor && (
              <p className="text-xs text-chess-green font-bold mt-0.5">{currentRoomInfo.doctor}</p>
            )}

            <div className="space-y-2 mt-4 text-xs">
              <div className="p-2.5 rounded-xl bg-chess-panel border border-chess-border flex items-center justify-between">
                <span className="text-chess-gray font-semibold">Status ao vivo:</span>
                <span className="font-bold text-white">{currentRoomInfo.status}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-chess-panel border border-chess-border flex items-center justify-between">
                <span className="text-chess-gray font-semibold">Tempo estimado:</span>
                <span className="font-bold text-chess-gold font-mono">{currentRoomInfo.timeEst}</span>
              </div>
            </div>

            <p className="text-xs text-chess-gray mt-4 leading-relaxed">
              {currentRoomInfo.details}
            </p>
          </div>

          <div className="p-3 bg-chess-panel rounded-xl border border-chess-border flex items-center gap-2 text-xs text-chess-light">
            <Info className="w-4 h-4 text-chess-green flex-shrink-0" />
            <span>Clique em qualquer ambiente no mapa para inspecionar ocupação e equipe.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

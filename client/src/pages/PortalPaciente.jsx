import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Zap,
  Activity,
  ArrowRight,
  Sun,
  Moon,
  Palette,
  Check,
  Stethoscope,
  ChevronRight,
  Star,
  Camera,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { InteractiveReception } from '../components/InteractiveReception';
import { ClinicMiniMap } from '../components/ClinicMiniMap';
import { api } from '../services/api';

const DOCTORS = [
  {
    id: 'roberto',
    name: 'Dr. Roberto Silveira',
    cro: 'CRO-RR 4521',
    role: 'Diretor Clínico & Cirurgião Bucomaxilofacial',
    specialties: ['Implantodontia', 'Carga Imediata', 'Cirurgia Guiada 3D'],
    experience: '18 anos de experiência',
    education: 'Mestrado em Implantodontia pela USP • Especialista em Reconstrução Óssea',
    rating: 4.98,
    reviews: 540,
    chair: 'Cadeira 1 (Titânio)',
    bio: 'Pioneiro em cirurgias guiadas por tomografia sem incisões desnecessárias. Mais de 4.500 implantes dentários instalados com taxa de sucesso superior a 98.8%.',
    tags: ['Implantes', 'Sisos Complexos', 'Enxertos', 'Sedação'],
  },
  {
    id: 'mariana',
    name: 'Dra. Mariana Costa',
    cro: 'CRO-RR 5892',
    role: 'Ortodontista & Especialista em Estética Orofacial',
    specialties: ['Alinhadores Invisíveis', 'Invisalign Top Doctor', 'Harmonização'],
    experience: '12 anos de experiência',
    education: 'Especialização em Ortodontia Digital • Certificação Platinum Invisalign',
    rating: 4.96,
    reviews: 620,
    chair: 'Cadeira 2 (Ouro)',
    bio: 'Especialista em transformação digital do sorriso através de escaneamento 3D e alinhadores transparentes ultraconfortáveis, além de bioestimuladores faciais.',
    tags: ['Aparelhos Invisíveis', 'Lentes de Contato', 'Harmonização', 'ATM'],
  },
  {
    id: 'carlos',
    name: 'Dr. Carlos Fontes',
    cro: 'CRO-RR 3910',
    role: 'Especialista em Endodontia Microscópica',
    specialties: ['Tratamento de Canal em Sessão Única', 'Microscopia Operatória'],
    experience: '14 anos de experiência',
    education: 'Especialista em Endodontia Avançada • Membro da Sociedade Brasileira de Endodontia',
    rating: 4.95,
    reviews: 380,
    chair: 'Cadeira 1 (Titânio) / Cadeira 3',
    bio: 'Utiliza microscópio ótico cirúrgico Zeiss para tratamentos de canal 100% indolores, precisos e conservadores, na grande maioria das vezes concluídos em sessão única.',
    tags: ['Canal sem Dor', 'Microscópio Óptico', 'Retratamentos', 'Urgência'],
  },
  {
    id: 'beatriz',
    name: 'Dra. Beatriz Mendes',
    cro: 'CRO-RR 6204',
    role: 'Odontopediatra & Periodontista Integrativa',
    specialties: ['Odontopediatria', 'Periodontia Clínica', 'Sedação com Óxido Nitroso'],
    experience: '9 anos de experiência',
    education: 'Residência em Odontopediatria e Manejo Comportamental Lúdico',
    rating: 4.99,
    reviews: 490,
    chair: 'Cadeira 3 (Esmeralda)',
    bio: 'Dedicada ao atendimento acolhedor de crianças, adolescentes e pacientes com fobia de dentista, garantindo experiências odontológicas sem trauma e saúde gengival integral.',
    tags: ['Crianças', 'Gengiva Saudável', 'Sedação Leve', 'Prevenção'],
  },
];

const DIAGNOSTIC_EXAMS = [
  {
    id: 'tomografia',
    title: 'Tomografia Computadorizada Cone Beam 3D',
    category: 'Diagnóstico Tridimensional',
    description: 'Imagens volumétricas tridimensionais de altíssima definição milimétrica para planejamento cirúrgico de implantes, sisos e patologias com 80% menos radiação.',
    indications: ['Planejamento de Implantes', 'Sisos Inclusos próximos ao Nervo', 'Endodontia Avançada', 'Lesões Ósseas'],
    timeMinutes: 5,
    delivery: 'Laudo digital e corte 3D entregues no mesmo dia',
    badge: 'Alta Precisão 3D',
  },
  {
    id: 'scanner',
    title: 'Escaneamento Intraoral 3D Colorido',
    category: 'Odontologia Digital',
    description: 'Scanner digital de última geração que substitui de forma definitiva a desconfortável massa de moldagem (alginato). Captura a arcada em cores reais em 3 minutos.',
    indications: ['Alinhadores Invisíveis', 'Facetas e Lentes de Porcelana', 'Coroas Cerâmicas', 'Acompanhamento de Desgastes'],
    timeMinutes: 8,
    delivery: 'Modelo digital interativo visualizado na hora',
    badge: '100% Digital • Sem Enjoo',
  },
  {
    id: 'panoramica',
    title: 'Radiografia Panorâmica Digital HD',
    category: 'Radiografia Digital',
    description: 'Exame panorâmico completo dos maxilares, dentes, seios maxilares e articulações temporomandibulares em uma única tomada rápida de 12 segundos.',
    indications: ['Avaliação Inicial Completa', 'Pesquisa de Focos de Infecção', 'Ortodontia', 'Avaliação Óssea Geral'],
    timeMinutes: 3,
    delivery: 'Resultado instantâneo no prontuário eletrônico',
    badge: 'Ultra Rápido',
  },
  {
    id: 'camera',
    title: 'Check-up Preventivo com Câmera Intraoral HD',
    category: 'Prevenção & Detecção Precoce',
    description: 'Micro-câmera com aumento de até 60x que projeta em tela de alta resolução lesões iniciais de cárie, microfraturas e restaurações infiltradas invisíveis a olho nu.',
    indications: ['Prevenção Periódica', 'Detecção Precoce de Trincas', 'Acompanhamento Visual pelo Paciente'],
    timeMinutes: 10,
    delivery: 'Fotos integradas ao laudo preventivo digital',
    badge: 'Detecção Precoce',
  },
];

const SURGERIES = [
  {
    id: 'implantes',
    name: 'Implantes Dentários com Carga Imediata',
    badge: 'Dente no Mesmo Dia',
    description: 'Reposição fixa e definitiva de um ou mais dentes perdidos com fixação em titânio ou cerâmica pura. Em casos selecionados, o dente provisório fixo é instalado em até 24-48h.',
    recovery: 'Recuperação confortável em 2 a 3 dias com protocolo analgésico preventivo.',
    features: ['Cirurgia Guiada sem Retalho Amplo', 'Estabilidade Primária Otimizada', 'Preserva a Mastigação Natural'],
  },
  {
    id: 'sisos',
    name: 'Extração Cirúrgica de Sisos Inclusos',
    badge: 'Atraumática & Segura',
    description: 'Remoção planejada com precisão milimétrica via tomografia 3D, preservando o nervo alveolar inferior e as estruturas nobres. Procedimento rápido com sedação consciente opcional.',
    recovery: 'Edema mínimo e volta às atividades leves em 48 horas.',
    features: ['Planejamento Tomográfico 3D', 'Laserterapia pós-operatória inclusa', 'Técnica Atraumática'],
  },
  {
    id: 'enxerto',
    name: 'Enxertos Ósseos & Levantamento de Seio Maxilar',
    badge: 'Bioengenharia Tecidual',
    description: 'Regeneração do volume ósseo reabsorvido utilizando biomateriais biocompatíveis importados e membranas de colágeno, preparando a base para instalação de implantes estáveis.',
    recovery: 'Procedimento ambulatorial sob anestesia local computadorizada indolor.',
    features: ['Biomateriais de Alta Pureza', 'Preservação de Rebordo Alveolar', 'Sedação Opcional'],
  },
  {
    id: 'alinhadores',
    name: 'Ortodontia Digital com Alinhadores Invisíveis',
    badge: 'Estética & Conforto',
    description: 'Alinhamento completo dos dentes através de placas plásticas transparentes sob medida, trocadas quinzenalmente. Totalmente removíveis para comer e higienizar sem constrangimento.',
    recovery: 'Sem cortes, sem fios metálicos pontiagudos e sem emergências de braquete quebrado.',
    features: ['Removível para Alimentação', 'Previsão de Resultado em 3D', 'Visitas mais Rápidas'],
  },
  {
    id: 'lentes',
    name: 'Lentes de Contato e Facetas em Porcelana Pura',
    badge: 'Estética de Alta Fidelidade',
    description: 'Lâminas cerâmicas ultrafinas em dissilicato de lítio (E-Max) cimentadas sobre o esmalte, corrigindo cor, formato, fechando diastemas e harmonizando o sorriso com durabilidade de décadas.',
    recovery: 'Mínimo ou nenhum desgaste da estrutura sadia do dente.',
    features: ['Cerâmica E-Max Alemã', 'Mock-up Digital Prévio', 'Não Amarela com o Tempo'],
  },
  {
    id: 'canal',
    name: 'Endodontia Mecanizada em Sessão Única',
    badge: 'Tratamento sem Dor',
    description: 'Tratamento de canal rápido com limas rotatórias de níquel-titânio e localizador foraminal eletrônico. Elimina a infecção e preserva o dente natural sem dor.',
    recovery: 'Alívio imediato da dor pulsátil com pós-operatório tranquilo.',
    features: ['Microscopia Operatória', 'Sessão Única em 90% dos Casos', 'Anestesia Computadorizada'],
  },
];

export const PortalPaciente = () => {
  const { isAuthenticated } = useAuth();
  const { playClick, playSuccess } = useAudio();
  const { isDark, toggleMode, theme, selectTheme, themes } = useTheme();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [waitingCount, setWaitingCount] = useState(3);
  const [currentTicket, setCurrentTicket] = useState('A-102');
  const nextTicket = 'A-103';

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const res = await api.get('/appointments/today');
        if (res.data && res.data.data) {
          const waiting = res.data.data.filter((a) => a.status === 'aguardando');
          const inProgress = res.data.data.filter((a) => a.status === 'em_atendimento');
          setWaitingCount(waiting.length > 0 ? waiting.length : 2);
          if (inProgress.length > 0) {
            setCurrentTicket(`A-${String(100 + inProgress.length).slice(-3)}`);
          }
        }
      } catch (err) {
      }
    };
    fetchQueueStatus();
  }, []);

  const handleCheckinFinished = (result) => {
    setCheckinSuccessData(result);
    setWaitingCount((prev) => prev + 1);
    playSuccess();
  };

  const scrollToSection = (id) => {
    playClick();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-chess-dark text-white selection:bg-chess-green selection:text-white transition-colors">
      <div className="bg-chess-darker border-b border-chess-border py-2 px-4 text-xs font-semibold text-chess-gray flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-chess-green font-bold">
            <span className="w-2 h-2 rounded-full bg-chess-green animate-ping inline-block" />
            Clínica Aberta Hoje • 07:30 às 19:30
          </span>
          <span className="hidden sm:inline text-chess-border">|</span>
          <span className="flex items-center gap-1 text-chess-gray">
            <MapPin className="w-3.5 h-3.5 text-chess-gold" />
            Av. Ene Garcez, 1420 - Centro, Boa Vista - RR
          </span>
          <span className="hidden sm:inline text-chess-border">|</span>
          <a
            href="tel:95991234567"
            className="flex items-center gap-1 text-chess-blue hover:underline font-bold"
          >
            <Phone className="w-3.5 h-3.5" />
            Plantão & Urgência: (95) 99123-4567
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playClick();
                toggleMode();
              }}
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="p-1.5 rounded-lg bg-chess-panel border border-chess-border text-chess-gray hover:text-chess-green transition-all text-xs flex items-center gap-1.5"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-chess-gold" />
                  <span className="hidden sm:inline font-bold text-[11px]">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-chess-blue" />
                  <span className="hidden sm:inline font-bold text-[11px]">Modo Escuro</span>
                </>
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  playClick();
                  setThemeDropdownOpen((prev) => !prev);
                }}
                title="Escolher Tema Visual da Clínica"
                className="p-1.5 rounded-lg bg-chess-panel border border-chess-border text-chess-gray hover:text-chess-green transition-all text-xs flex items-center gap-1.5"
              >
                <Palette className="w-3.5 h-3.5 text-chess-green" />
                <span className="hidden sm:inline font-bold text-[11px]">
                  {themes.find((t) => t.id === theme)?.label.split(' ')[0] || 'Tema'}
                </span>
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-chess-panel border border-chess-border rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn space-y-2">
                  <div className="px-2 py-1 text-xs font-extrabold uppercase tracking-wider text-chess-gray border-b border-chess-border pb-1.5 flex items-center justify-between">
                    <span>Temas da Clínica</span>
                    <span className="text-[10px] text-chess-gold font-mono">{isDark ? 'ESCURO' : 'CLARO'}</span>
                  </div>

                  <div className="space-y-1">
                    {themes.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            playClick();
                            selectTheme(t.id);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? 'bg-chess-darker font-bold border border-chess-border text-chess-green'
                              : 'hover:bg-chess-darker/60 text-chess-gray hover:text-chess-light'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0"
                              style={{ backgroundColor: t.color }}
                            />
                            <div className="text-xs">{t.label}</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-chess-green" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-chess-green text-white font-bold text-xs hover:bg-chess-green-hover transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              Painel Clínico
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-chess-panel border border-chess-border text-white hover:border-chess-gold font-bold text-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-chess-gold" />
              Área do Profissional
            </Link>
          )}
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-chess-dark/95 backdrop-blur border-b border-chess-border">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-chess-panel border border-chess-border flex items-center justify-center shadow-chess-card">
              <svg className="w-7 h-7 text-chess-green" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 18 C38 18 32 26 32 40 C32 50 36 62 42 78 C44 83 48 84 50 78 C52 72 54 64 56 64 C58 64 60 72 62 78 C64 84 68 83 70 78 C76 62 80 50 80 40 C80 26 74 18 62 18 C58 18 54 22 50 22 C46 22 42 18 50 18 Z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 font-['Montserrat']">
                ODONTO<span className="text-chess-green">CHECK</span>
              </div>
              <div className="text-[11px] text-chess-gray font-semibold tracking-wider uppercase">
                Centro de Cirurgia & Odontologia Digital 3D
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-chess-gray">
            <button
              onClick={() => scrollToSection('apresentacao')}
              className="hover:text-white transition-colors"
            >
              Apresentação
            </button>
            <button
              onClick={() => scrollToSection('fila-minimapa')}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Users className="w-4 h-4 text-chess-gold" />
              Fila & Mini-Mapa
            </button>
            <button
              onClick={() => scrollToSection('avatar-recepcao')}
              className="hover:text-chess-green transition-colors flex items-center gap-1 text-chess-green font-extrabold"
            >
              <Sparkles className="w-4 h-4" />
              Recepção Virtual Sofia
            </button>
            <button
              onClick={() => scrollToSection('medicos')}
              className="hover:text-white transition-colors"
            >
              Médicos
            </button>
            <button
              onClick={() => scrollToSection('exames')}
              className="hover:text-white transition-colors"
            >
              Exames 3D
            </button>
            <button
              onClick={() => scrollToSection('cirurgias')}
              className="hover:text-white transition-colors"
            >
              Cirurgias
            </button>
          </nav>

          <button
            onClick={() => scrollToSection('avatar-recepcao')}
            className="chess-btn-green px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fazer Check-in Agora</span>
          </button>
        </div>
      </header>

      <section id="apresentacao" className="relative overflow-hidden py-10 sm:py-14 border-b border-chess-border">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-chess-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chess-panel border border-chess-border text-chess-light text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-chess-green animate-ping" />
              <span>Odontologia de Alta Performance • Fluxo 100% Digital 3D</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              O futuro do seu sorriso com precisão cirúrgica e acolhimento humano.
            </h1>

            <p className="text-xs sm:text-sm text-chess-gray leading-relaxed max-w-lg">
              Bem-vindo à OdontoCheck. Unimos tomografia Cone Beam 3D, escaneamento intraoral sem massa e cirurgias guiadas por computador para procedimentos rápidos, confortáveis e definitivos.
            </p>

            <div className="bg-chess-darker border border-chess-border rounded-2xl p-4 shadow-chess-card space-y-3.5">
              <div className="flex items-center justify-between border-b border-chess-border pb-2.5">
                <span className="text-[11px] font-bold text-white flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-chess-green" />
                  <span>Painel da Sala de Espera</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-chess-panel border border-chess-border text-chess-gold font-mono">
                  Ao Vivo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-chess-panel border border-chess-border rounded-xl p-3 text-center">
                  <span className="text-[10px] text-chess-gray block">Última Chamada</span>
                  <span className="text-2xl font-black text-chess-green font-mono">{currentTicket}</span>
                  <span className="text-[10px] text-chess-gray block mt-0.5">Cadeira 1 • Dr. Roberto</span>
                </div>
                <div className="bg-chess-panel border border-chess-border rounded-xl p-3 text-center">
                  <span className="text-[10px] text-chess-gray block">Próxima Senha</span>
                  <span className="text-2xl font-black text-chess-gold font-mono">{nextTicket}</span>
                  <span className="text-[10px] text-chess-gray block mt-0.5">Cadeira 2 • Dra. Mariana</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1 text-chess-gray">
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-chess-blue" />
                  <span>Fila: <strong className="text-white">{waitingCount} aguardando</strong></span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-chess-gold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{waitingCount * 12} min de espera</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-chess-panel border border-chess-border rounded-xl p-2.5 text-center">
                <div className="text-base font-black text-chess-green font-mono">+12.500</div>
                <div className="text-[10px] text-chess-gray">Pacientes</div>
              </div>
              <div className="bg-chess-panel border border-chess-border rounded-xl p-2.5 text-center">
                <div className="text-base font-black text-chess-gold font-mono">99.4%</div>
                <div className="text-[10px] text-chess-gray">Satisfação</div>
              </div>
              <div className="bg-chess-panel border border-chess-border rounded-xl p-2.5 text-center">
                <div className="text-base font-black text-purple-400 font-mono">Tomografia 3D</div>
                <div className="text-[10px] text-chess-gray">No Local</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => scrollToSection('fila-minimapa')}
                className="chess-btn-gray px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-chess-gold" />
                <span>Explorar Mini-Mapa 2D</span>
              </button>

              <button
                onClick={() => scrollToSection('medicos')}
                className="chess-btn-gray px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-chess-green" />
                <span>Equipe de Cirurgiões</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7" id="avatar-recepcao">
            <InteractiveReception onCheckinSuccess={handleCheckinFinished} />
          </div>
        </div>
      </section>

      <section id="fila-minimapa" className="py-16 bg-chess-darker/60 border-b border-chess-border">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-chess-gold uppercase tracking-wider block">
              Transparência & Fluxo Clínico
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mini-Mapa da Clínica & Ocupação dos Consultórios
            </h2>
            <p className="text-chess-gray text-xs sm:text-sm">
              Consulte a ocupação em tempo real de cada ambiente, visualize onde seu atendimento ocorrerá e acompanhe os pacientes aguardando no lounge.
            </p>
          </div>

          <div className="bg-chess-dark border border-chess-border rounded-2xl p-4 sm:p-6 shadow-chess-card">
            <ClinicMiniMap
              waitingCount={waitingCount}
              chair1Occupied={true}
              chair2Occupied={true}
              chair3Occupied={false}
            />
          </div>
        </div>
      </section>

      <section id="medicos" className="py-16 sm:py-20 bg-chess-darker/60 border-b border-chess-border">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chess-panel border border-chess-border text-chess-blue text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Corpo Clínico Integrado</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Nossos Cirurgiões-Dentistas & Especialistas
            </h2>
            <p className="text-chess-gray text-sm sm:text-base">
              Profissionais dedicados, pós-graduados nas melhores instituições do país e com constante atualização tecnológica internacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCTORS.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-chess-dark border border-chess-border hover:border-chess-green/70 rounded-2xl p-5 shadow-chess-card transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-chess-panel border border-chess-border flex items-center justify-center text-3xl shadow-md group-hover:scale-105 transition-transform">
                      {doctor.name.replace(/^Dra?\.\s*/, "").charAt(0)}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-chess-gold bg-chess-panel px-2.5 py-1 rounded-full border border-chess-border">
                        {doctor.cro}
                      </span>
                      <div className="flex items-center gap-1 mt-1.5 justify-end text-xs text-chess-gold font-bold">
                        <Star className="w-3.5 h-3.5 fill-chess-gold" />
                        <span>{doctor.rating}</span>
                        <span className="text-chess-gray text-[10px]">({doctor.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-chess-green transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-xs font-bold text-chess-green mt-0.5">{doctor.role}</p>
                    <p className="text-[11px] text-chess-gray font-semibold mt-0.5">{doctor.experience}</p>
                  </div>

                  <p className="text-xs text-chess-gray leading-relaxed">{doctor.bio}</p>

                  <div className="p-2.5 rounded-xl bg-chess-panel/60 border border-chess-border text-[11px] text-chess-gray space-y-1">
                    <div className="font-bold text-white text-[10px] uppercase tracking-wider">
                      Consultório Principal:
                    </div>
                    <div className="text-chess-gold font-semibold">{doctor.chair}</div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {doctor.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-chess-panel text-chess-gray border border-chess-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-chess-border">
                  <button
                    onClick={() => scrollToSection('avatar-recepcao')}
                    className="w-full py-2.5 rounded-xl bg-chess-panel hover:bg-chess-green hover:text-white border border-chess-border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Check-in com este especialista</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="exames" className="py-16 sm:py-20 border-b border-chess-border">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chess-panel border border-chess-border text-chess-green text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>Diagnóstico por Imagem Digital</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Exames Digitais e Tomografia 3D no Local
            </h2>
            <p className="text-chess-gray text-sm sm:text-base">
              Não perca tempo se deslocando para centros de radiologia externos. Realizamos todos os exames no próprio consultório durante sua consulta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIAGNOSTIC_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="bg-chess-darker border border-chess-border hover:border-chess-gold/60 rounded-2xl p-6 shadow-chess-card transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-chess-panel border border-chess-border flex items-center justify-center text-2xl">
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-chess-gold">
                          {exam.category}
                        </span>
                        <h3 className="text-lg font-black text-white leading-snug">{exam.title}</h3>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-chess-green/15 border border-chess-green/40 text-chess-green">
                      {exam.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-chess-gray leading-relaxed">
                    {exam.description}
                  </p>

                  <div>
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-2">
                      Principais Indicações Clínicas:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {exam.indications.map((ind, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-chess-gray">
                          <CheckCircle2 className="w-3.5 h-3.5 text-chess-green flex-shrink-0" />
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-chess-border flex items-center justify-between text-xs text-chess-gray">
                  <span className="flex items-center gap-1 font-mono font-bold text-chess-gold">
                    <Clock className="w-3.5 h-3.5" />
                    Duração: {exam.timeMinutes} min
                  </span>
                  <span className="text-[11px] text-chess-green font-bold">
                    {exam.delivery}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cirurgias" className="py-16 sm:py-20 bg-chess-darker/60 border-b border-chess-border">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chess-panel border border-chess-border text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Procedimentos de Alta Complexidade</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Cirurgias & Reabilitações Especializadas
            </h2>
            <p className="text-chess-gray text-sm sm:text-base">
              Do implante unitário à reabilitação total do arco dentário com segurança anestésica, biossegurança rigorosa e tecnologia minimamente invasiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SURGERIES.map((surg) => (
              <div
                key={surg.id}
                className="bg-chess-dark border border-chess-border hover:border-chess-green rounded-2xl p-6 shadow-chess-card transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-chess-panel border border-chess-border flex items-center justify-center text-2xl">
                      <Sparkles size={22} />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-chess-panel border border-chess-border text-chess-gold">
                      {surg.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white">{surg.name}</h3>
                    <p className="text-xs text-chess-gray mt-2 leading-relaxed">{surg.description}</p>
                  </div>

                  <div className="space-y-1.5">
                    {surg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-chess-gray font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-chess-green flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-chess-panel/60 border border-chess-border text-[11px] text-chess-gray">
                    <span className="font-bold text-white block mb-0.5">Pós-Operatório & Recuperação:</span>
                    {surg.recovery}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-chess-border">
                  <button
                    onClick={() => scrollToSection('avatar-recepcao')}
                    className="w-full py-2.5 rounded-xl bg-chess-panel hover:bg-chess-green hover:text-white border border-chess-border text-xs font-black transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Avaliar para este procedimento</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-chess-border">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              O que dizem os nossos pacientes
            </h2>
            <p className="text-xs sm:text-sm text-chess-gray">
              Histórias reais de sorrisos transformados com precisão e carinho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-chess-darker border border-chess-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-chess-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-chess-gold" />
                ))}
              </div>
              <p className="text-xs text-chess-gray leading-relaxed italic">
                "Fiz a cirurgia dos 4 dentes do siso com o Dr. Roberto. Estava apavorada, mas a anestesia foi indolor e com a tomografia 3D foi tudo muito rápido. Em 2 dias já estava sem inchaço."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-chess-border">
                <div className="w-8 h-8 rounded-full bg-chess-panel border border-chess-border flex items-center justify-center font-bold text-xs text-white">
                  AF
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Ana Flávia Miranda</div>
                  <div className="text-[10px] text-chess-gray">Extração de Sisos 3D</div>
                </div>
              </div>
            </div>

            <div className="bg-chess-darker border border-chess-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-chess-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-chess-gold" />
                ))}
              </div>
              <p className="text-xs text-chess-gray leading-relaxed italic">
                "A recepção virtual da Sofia é sensacional! Fiz o check-in no celular ao chegar, ela já perguntou minhas alergias e quando entrei na Cadeira 2 a Dra. Mariana já tinha tudo na tela."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-chess-border">
                <div className="w-8 h-8 rounded-full bg-chess-panel border border-chess-border flex items-center justify-center font-bold text-xs text-white">
                  RC
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Rodrigo Carvalho</div>
                  <div className="text-[10px] text-chess-gray">Alinhadores Invisíveis</div>
                </div>
              </div>
            </div>

            <div className="bg-chess-darker border border-chess-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-chess-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-chess-gold" />
                ))}
              </div>
              <p className="text-xs text-chess-gray leading-relaxed italic">
                "Coloquei implantes de carga imediata na frente. Saí da clínica no mesmo dia já com os dentes fixos provisórios e sem sentir dor nenhuma. Mudou minha autoestima por completo!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-chess-border">
                <div className="w-8 h-8 rounded-full bg-chess-panel border border-chess-border flex items-center justify-center font-bold text-xs text-white">
                  LS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Lúcia Helena Silveira</div>
                  <div className="text-[10px] text-chess-gray">Implantes Carga Imediata</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-chess-darker py-12 border-t border-chess-border text-xs text-chess-gray">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-chess-panel border border-chess-border flex items-center justify-center">
                <svg className="w-5 h-5 text-chess-green" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 18 C38 18 32 26 32 40 C32 50 36 62 42 78 C44 83 48 84 50 78 C52 72 54 64 56 64 C58 64 60 72 62 78 C64 84 68 83 70 78 C76 62 80 50 80 40 C80 26 74 18 62 18 C58 18 54 22 50 22 C46 22 42 18 50 18 Z" />
                </svg>
              </div>
              <span className="font-extrabold text-base text-white tracking-tight font-['Montserrat']">
                ODONTO<span className="text-chess-green">CHECK</span>
              </span>
            </div>
            <p className="leading-relaxed">
              Clínica odontológica de alta complexidade com fluxo 100% digital, tomografia Cone Beam 3D e biossegurança hospitalar.
            </p>
            <div className="text-[11px] text-chess-gray">
              RT: Dr. Roberto Silveira • CRO-RR 4521 • EPAO 189
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
              Horários de Atendimento
            </h4>
            <div className="space-y-1">
              <div>Segunda a Sexta: 07:30 às 19:30</div>
              <div>Sábado: 08:00 às 13:00</div>
              <div className="text-chess-gold font-bold">Plantão de Urgência 24 Horas</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
              Localização & Contato
            </h4>
            <div className="space-y-1">
              <div>Av. Ene Garcez, 1420 - Centro</div>
              <div>Boa Vista - Roraima • CEP 69301-160</div>
              <div>Telefone: (95) 3624-9000</div>
              <div className="text-chess-green font-bold">WhatsApp: (95) 99123-4567</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
              Área do Profissional
            </h4>
            <p className="leading-relaxed">
              Acesso restrito para dentistas, recepcionistas e equipe administrativa da clínica.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-chess-panel border border-chess-border text-white hover:border-chess-green font-bold text-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-chess-green" />
              <span>Acessar Prontuário & Agenda</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-8 mt-8 border-t border-chess-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © 2026 OdontoCheck Odontologia de Excelência. Todos os direitos reservados.
          </div>
          <div>
            Desenvolvido com Arquitetura Web Moderna • Vite, React, Node.js & MongoDB
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortalPaciente;
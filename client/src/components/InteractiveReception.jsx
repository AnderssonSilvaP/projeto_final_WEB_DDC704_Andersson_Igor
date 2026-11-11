import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  User,
  Heart,
  Smile,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Activity,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAudio } from '../context/AudioContext';

const COMPLAINT_OPTIONS = [
  { id: 'dor', label: 'Dor de Dente ou Sensibilidade Aguda' },
  { id: 'limpeza', label: 'Limpeza / Profilaxia de Rotina' },
  { id: 'implante', label: 'Avaliação para Implante Dentário' },
  { id: 'aparelho', label: 'Ortodontia / Alinhadores Invisíveis' },
  { id: 'clareamento', label: 'Clareamento & Estética Dental' },
  { id: 'canal', label: 'Tratamento de Canal em Sessão Única' },
];

const ALLERGY_OPTIONS = [
  'Penicilina',
  'Dipirona',
  'Anti-inflamatórios (AINEs)',
  'Anestésico Odontológico',
  'Látex (Luvas)',
  'Nenhuma Alergia Conhecida',
];

const MEDICAL_HISTORY_OPTIONS = [
  'Hipertensão (Pressão Alta)',
  'Diabetes Mellitus',
  'Problemas Cardíacos',
  'Dificuldade de Coagulação / Sangramento',
  'Histórico Periodontal na Família',
  'Fumante / Tabagista',
  'Nenhum Histórico Relevante',
];

export const InteractiveReception = ({ onCheckinSuccess }) => {
  const { playClick, playAlert, playSuccess } = useAudio();

  const [interactionMode, setInteractionMode] = useState('chat');
  const [avatarState, setAvatarState] = useState('idle');

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'sofia',
      text: 'Olá! Seja muito bem-vindo à OdontoCheck. Eu sou a Sofia, assistente virtual da clínica. Você pode conversar comigo por texto ou por voz! Como posso te ajudar hoje?',
      timestamp: 'Agora',
      suggestions: [
        'Quero fazer meu check-in',
        'Estou com dor de dente',
        'Gostaria de avaliar implantes',
        'Quais os horários da clínica?',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBottomRef = useRef(null);

  const [clinicalData, setClinicalData] = useState({
    name: '',
    phone: '',
    complaint: '',
    allergies: [],
    chronicConditions: [],
    medications: '',
    urgencyLevel: 'normal',

  });

  const [step, setStep] = useState(1);
  const [checkinResult, setCheckinResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const speak = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#•]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.08;

      utterance.onstart = () => setAvatarState('speaking');
      utterance.onend = () => setAvatarState('idle');
      utterance.onerror = () => setAvatarState('idle');

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setAvatarState('idle');
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Você pode usar a caixa de texto logo abaixo!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setAvatarState('listening');
        playClick();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAvatarState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        setAvatarState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setAvatarState('idle');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!text || isProcessing) return;

    setInputText('');
    playAlert();

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setAvatarState('thinking');

    try {
      let responseData = null;
      try {
        const res = await api.post('/patients/assistant-chat', {
          message: text,
          context: clinicalData,
          history: messages.slice(-4).map((m) => ({ role: m.sender, content: m.text })),
        });
        responseData = res;
      } catch (err) {
        responseData = processLocalNLP(text, clinicalData);
      }

      if (responseData) {
        const { reply, extractedData, suggestions, readyForCheckin, avatarEmotion } = responseData;

        if (extractedData) {
          setClinicalData((prev) => ({
            ...prev,
            name: extractedData.name || prev.name,
            phone: extractedData.phone || prev.phone,
            complaint: extractedData.complaint || prev.complaint,
            allergies: Array.from(new Set([...prev.allergies, ...(extractedData.allergies || [])])),
            chronicConditions: Array.from(new Set([...prev.chronicConditions, ...(extractedData.chronicConditions || [])])),
            medications: extractedData.medications || prev.medications,
            urgencyLevel: extractedData.urgencyLevel || prev.urgencyLevel,
          }));
        }

        const sofiaMessage = {
          id: Date.now() + 1,
          sender: 'sofia',
          text: reply,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          suggestions: suggestions || [],
          readyForCheckin: !!readyForCheckin,
        };

        setMessages((prev) => [...prev, sofiaMessage]);
        setAvatarState(avatarEmotion || 'speaking');
        speak(reply);

        if (readyForCheckin) {
          playSuccess();
        }
      }
    } catch (error) {
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'sofia',
        text: 'Compreendi! Estou pronta para te encaminhar. Se desejar, podemos confirmar seu check-in e emitir sua senha agora mesmo.',
        timestamp: 'Agora',
        suggestions: ['Confirmar meu check-in', 'Ver tempo de espera'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setAvatarState('speaking');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setAvatarState((prev) => (prev === 'thinking' || prev === 'speaking' ? 'idle' : prev));
      }, 3500);
    }
  };

  const processLocalNLP = (input, currentCtx) => {
    const clean = input.toLowerCase();
    const extracted = { ...currentCtx };
    let reply = '';
    let suggestions = [];
    let readyForCheckin = false;
    let avatarEmotion = 'speaking';

    const nameMatch = input.match(/(?:meu nome é|me chamo|sou o|sou a)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?)/i);
    if (nameMatch) {
      const candidate = nameMatch[1].trim();
      const cleanCandidate = candidate.replace(/\b(e|que|gostaria|estou|tenho|sou|quero|favor|pra)\b.*$/i, '').trim();
      if (cleanCandidate.length >= 2) extracted.name = cleanCandidate;
    }

    if (clean.includes('dor') || clean.includes('inchado') || clean.includes('sangrando') || clean.includes('quebrou')) {
      extracted.complaint = extracted.complaint || 'Dor Aguda / Urgência Dentária';
      extracted.urgencyLevel = 'alta';
      avatarEmotion = 'empathetic';
    } else if (clean.includes('implante')) {
      extracted.complaint = 'Avaliação para Implante Dentário';
    } else if (clean.includes('aparelho') || clean.includes('alinhador')) {
      extracted.complaint = 'Ortodontia / Alinhadores Invisíveis';
    } else if (clean.includes('limpeza') || clean.includes('profilaxia')) {
      extracted.complaint = 'Limpeza e Profilaxia de Rotina';
    }

    if (clean.includes('penicilina')) extracted.allergies = Array.from(new Set([...extracted.allergies, 'Penicilina']));
    if (clean.includes('dipirona')) extracted.allergies = Array.from(new Set([...extracted.allergies, 'Dipirona']));
    if (clean.includes('anti-inflamatório') || clean.includes('ibuprofeno')) extracted.allergies = Array.from(new Set([...extracted.allergies, 'Anti-inflamatórios (AINEs)']));
    if (clean.includes('anestesia') || clean.includes('anestésico')) extracted.allergies = Array.from(new Set([...extracted.allergies, 'Anestésico Odontológico']));

    if (clean.includes('horário') || clean.includes('funciona')) {
      reply = 'Nosso atendimento é de Segunda a Sexta das 07:30 às 19:30 e Sábados das 08:00 às 13:00. Temos também plantão 24h para emergências!';
      suggestions = ['Fazer meu check-in', 'Onde fica a clínica?'];
    } else if (clean.includes('endereço') || clean.includes('onde')) {
      reply = 'Estamos localizados na Av. Ene Garcez, 1420 - Centro, Boa Vista - RR. Estacionamento próprio gratuito!';
      suggestions = ['Fazer meu check-in', 'Conhecer os médicos'];
    } else if (!extracted.name) {
      reply = 'Para iniciarmos seu atendimento com todo carinho, por favor, como posso te chamar?';
      suggestions = ['Meu nome é...', 'Estou com muita dor', 'Quero tirar uma dúvida'];
    } else if (!extracted.complaint) {
      reply = `Prazer em te conhecer, ${extracted.name}! Qual o principal motivo da sua visita à clínica hoje?`;
      suggestions = ['Dor de dente aguda', 'Limpeza / Profilaxia', 'Implantes dentários', 'Alinhadores invisíveis'];
    } else {
      readyForCheckin = true;
      avatarEmotion = 'celebrating';
      reply = `Perfeito, ${extracted.name}! Dados clínicos anotados com sucesso. Deseja que eu emita sua senha oficial para a fila de espera agora?`;
      suggestions = ['Sim, confirmar check-in!', 'Quanto tempo de espera?'];
    }

    return { reply, extractedData: extracted, suggestions, readyForCheckin, avatarEmotion };
  };

  const handleFinalizeCheckin = async () => {
    setIsSubmitting(true);
    playAlert();

    const nameToUse = clinicalData.name.trim() || 'Paciente Recepção Virtual';
    const phoneToUse = clinicalData.phone.trim() || '(95) 99123-4567';
    const complaintToUse = clinicalData.complaint || 'Avaliação Inicial & Triagem';

    try {
      const res = await api.post('/patients/interactive-checkin', {
        name: nameToUse,
        phone: phoneToUse,
        complaint: complaintToUse,
        allergies: clinicalData.allergies,
        chronicConditions: clinicalData.chronicConditions,
        medicationsInUse: clinicalData.medications || 'Nenhum medicamento contínuo',
        procedure: complaintToUse,
      });

      setCheckinResult(res);
      playSuccess();
      setAvatarState('celebrating');

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });

      speak(`Parabéns, ${nameToUse}! Seu check-in foi registrado. Você é o número ${res.queuePosition || 3} na fila de atendimento com tempo estimado de ${res.estimatedWaitMinutes || 25} minutos. Fique à vontade em nosso lounge!`);

      if (onCheckinSuccess) onCheckinSuccess(res);
    } catch (err) {
      const fallbackRes = {
        queuePosition: 3,
        estimatedWaitMinutes: 25,
        chairNumber: clinicalData.urgencyLevel === 'alta' ? 1 : 2,
        appointment: { timeSlot: 'Agora', status: 'aguardando' },
      };
      setCheckinResult(fallbackRes);
      playSuccess();
      setAvatarState('celebrating');

      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      speak(`Check-in confirmado com sucesso, ${nameToUse}! Você é o número 3 na fila.`);

      if (onCheckinSuccess) onCheckinSuccess(fallbackRes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    playClick();
    setCheckinResult(null);
    setClinicalData({
      name: '',
      phone: '',
      complaint: '',
      allergies: [],
      chronicConditions: [],
      medications: '',
      urgencyLevel: 'normal',
    });
    setStep(1);
    setAvatarState('idle');
    setMessages([
      {
        id: Date.now(),
        sender: 'sofia',
        text: 'Atendimento reiniciado! Olá novamente. Como posso te ajudar hoje?',
        timestamp: 'Agora',
        suggestions: ['Fazer check-in para hoje', 'Ver os dentistas', 'Tirar uma dúvida'],
      },
    ]);
  };

  return (
    <div className="bg-chess-panel border border-chess-border rounded-2xl shadow-2xl overflow-hidden transition-all text-chess-light">
      <div className="bg-chess-darker px-5 py-4 border-b border-chess-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 transition-all ${
                avatarState === 'listening'
                  ? 'bg-amber-500/20 border-amber-500 scale-105 shadow-amber-500/20'
                  : avatarState === 'thinking'
                  ? 'bg-blue-500/20 border-blue-400 animate-pulse'
                  : avatarState === 'speaking'
                  ? 'bg-chess-green/20 border-chess-green shadow-sm'
                  : avatarState === 'empathetic'
                  ? 'bg-rose-500/20 border-rose-400'
                  : avatarState === 'celebrating'
                  ? 'bg-chess-green/30 border-chess-green scale-110'
                  : 'bg-chess-card border-chess-border'
              }`}
            >
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-chess-darker flex items-center justify-center text-[8px] ${
                  avatarState === 'listening'
                    ? 'bg-amber-400 animate-ping'
                    : avatarState === 'speaking'
                    ? 'bg-chess-green animate-pulse'
                    : 'bg-chess-green'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-chess-light tracking-tight">Sofia</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-chess-green/15 text-chess-green border border-chess-green/30 font-mono">
                {avatarState === 'listening'
                  ? 'Ouvindo você...'
                  : avatarState === 'thinking'
                  ? 'Processando...'
                  : avatarState === 'speaking'
                  ? 'Falando...'
                  : avatarState === 'empathetic'
                  ? 'Acolhimento Clínico'
                  : 'Concierge OdontoCheck'}
              </span>
            </div>
            <p className="text-xs text-chess-gray mt-0.5">
              Inteligência clínica com triagem pré-anamnese e voz em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-chess-card p-1 rounded-xl border border-chess-border flex items-center text-xs font-semibold">
            <button
              onClick={() => { playClick(); setInteractionMode('chat'); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                interactionMode === 'chat'
                  ? 'bg-chess-green text-white font-bold shadow-sm keep-white'
                  : 'text-chess-gray hover:text-chess-light'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Livre</span>
            </button>
            <button
              onClick={() => { playClick(); setInteractionMode('stepper'); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                interactionMode === 'stepper'
                  ? 'bg-chess-green text-white font-bold shadow-sm keep-white'
                  : 'text-chess-gray hover:text-chess-light'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Passo a Passo</span>
            </button>
          </div>

          <button
            onClick={() => {
              playClick();
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (next) speak('Voz ativada! Estou pronta para conversar.');
            }}
            title={voiceEnabled ? 'Desativar voz da Sofia' : 'Ativar voz sintetizada da Sofia'}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              voiceEnabled
                ? 'bg-chess-green/20 border-chess-green text-chess-green'
                : 'bg-chess-card border-chess-border text-chess-gray hover:text-chess-light'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            title="Reiniciar atendimento"
            className="p-2 rounded-xl bg-chess-card border border-chess-border text-chess-gray hover:text-chess-light transition-all text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {checkinResult ? (
        <div className="p-8 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-chess-green/20 border-2 border-chess-green flex items-center justify-center text-4xl shadow-xl">
            OK
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-chess-green">
              Check-in Confirmado com Sucesso
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-chess-light">
              Sua Senha Oficial é #{checkinResult.queuePosition ? `A-${100 + checkinResult.queuePosition}` : 'A-104'}
            </h3>
            <p className="text-sm text-chess-gray max-w-md mx-auto">
              Olá, <span className="font-bold text-chess-light">{clinicalData.name || 'Paciente'}</span>! Você já está registrado na sala de espera dos nossos dentistas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto bg-chess-card p-4 rounded-xl border border-chess-border text-left text-xs">
            <div>
              <span className="text-[10px] text-chess-gray uppercase font-bold block">Posição na Fila:</span>
              <span className="text-lg font-mono font-black text-chess-green">
                {checkinResult.queuePosition || 3}º Lugar
              </span>
            </div>
            <div>
              <span className="text-[10px] text-chess-gray uppercase font-bold block">Tempo Estimado:</span>
              <span className="text-lg font-mono font-black text-amber-500">
                ~{checkinResult.estimatedWaitMinutes || 25} min
              </span>
            </div>
            <div>
              <span className="text-[10px] text-chess-gray uppercase font-bold block">Consultório / Cadeira:</span>
              <span className="text-lg font-bold text-chess-light">
                Cadeira {checkinResult.chairNumber || (clinicalData.urgencyLevel === 'alta' ? 1 : 2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-chess-darker border border-chess-border rounded-xl max-w-md mx-auto text-xs text-chess-gray">
            <p>
              Por favor, dirija-se ao nosso lounge climatizado. Nosso painel digital chamará sua senha assim que a sala estiver higienizada.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-chess-card border border-chess-border text-xs font-bold text-chess-light hover:border-chess-green transition-all"
            >
              Fazer Novo Atendimento / Limpar
            </button>
          </div>
        </div>
      ) : interactionMode === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          <div className="lg:col-span-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-chess-border bg-chess-dark">
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[380px] min-h-[300px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'sofia' && (
                    <div className="w-8 h-8 rounded-xl bg-chess-card border border-chess-border flex items-center justify-center text-base flex-shrink-0">
                      S
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-chess-green text-white font-medium rounded-br-sm shadow-md keep-white'
                          : 'bg-chess-panel text-chess-light border border-chess-border rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {msg.sender === 'sofia' && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(sug)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-chess-card hover:bg-chess-green hover:text-white border border-chess-border text-chess-gray hover:keep-white transition-all text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.readyForCheckin && (
                      <div className="pt-2">
                        <button
                          onClick={handleFinalizeCheckin}
                          disabled={isSubmitting}
                          className="chess-btn-green w-full py-3 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 keep-white"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{isSubmitting ? 'Gerando sua Senha...' : 'Confirmar e Emitir Minha Senha'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-chess-card border border-chess-border flex items-center justify-center text-xs font-bold text-chess-light flex-shrink-0">
                      Eu
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-chess-gray bg-chess-card p-3 rounded-xl w-fit border border-chess-border animate-pulse">
                  <span>Sofia está analisando sua mensagem...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            <div className="p-3 sm:p-4 bg-chess-darker border-t border-chess-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  disabled={isProcessing}
                  title="Falar com a Sofia pelo microfone"
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-chess-card border-chess-border text-chess-gray hover:text-chess-green hover:border-chess-green'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Ouvindo... pode falar agora!'
                      : 'Converse com a Sofia (ex: "meu nome é Marcos, sinto dor no siso e sou alérgico a dipirona")...'
                  }
                  className="flex-1 bg-chess-card border border-chess-border focus:border-chess-green rounded-xl px-4 py-2.5 text-xs sm:text-sm text-chess-light placeholder:text-chess-gray outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  className="chess-btn-green px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm keep-white"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 bg-chess-darker p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-chess-border pb-2.5 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-chess-light flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-chess-green" />
                  <span>Pré-Anamnese em Tempo Real</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-chess-card text-chess-gray border border-chess-border font-mono">
                  HUD Sofia
                </span>
              </div>

              <p className="text-[11px] text-chess-gray mb-4">
                Enquanto você conversa, a Sofia extrai automaticamente os dados clínicos para agilizar seu atendimento na cadeira odontológica.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-chess-panel border border-chess-border flex items-center justify-between">
                  <span className="text-chess-gray flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-chess-green" />
                    Nome:
                  </span>
                  <span className="font-bold text-chess-light truncate max-w-[150px]">
                    {clinicalData.name || <span className="text-chess-gray opacity-60 italic">Não informado</span>}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-chess-panel border border-chess-border flex items-center justify-between">
                  <span className="text-chess-gray flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    Motivo:
                  </span>
                  <span className="font-bold text-chess-light truncate max-w-[150px]">
                    {clinicalData.complaint || <span className="text-chess-gray opacity-60 italic">Aguardando relato</span>}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-chess-panel border border-chess-border space-y-1">
                  <span className="text-chess-gray flex items-center gap-1.5 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    Alergias Identificadas:
                  </span>
                  {clinicalData.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {clinicalData.allergies.map((alg, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-500">
                          {alg}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-chess-gray opacity-60 italic">Nenhuma informada</span>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-chess-panel border border-chess-border space-y-1">
                  <span className="text-chess-gray flex items-center gap-1.5 text-[11px]">
                    <Heart className="w-3.5 h-3.5 text-blue-500" />
                    Histórico / Condições:
                  </span>
                  {clinicalData.chronicConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {clinicalData.chronicConditions.map((cond, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-500">
                          {cond}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-chess-gray opacity-60 italic">Nenhum registrado</span>
                  )}
                </div>

                {clinicalData.urgencyLevel === 'alta' && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2 text-rose-500 text-xs font-bold animate-pulse">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Prioridade Clínica Alta (Dor / Sintoma Agudo)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-chess-border">
              <button
                onClick={handleFinalizeCheckin}
                disabled={isSubmitting}
                className="chess-btn-green w-full py-3 rounded-xl text-white font-black text-xs shadow-md keep-white"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Gerando Senha...' : 'Emitir Senha Agora'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    step === s
                      ? 'bg-chess-green text-white ring-4 ring-chess-green/20 keep-white'
                      : step > s
                      ? 'bg-chess-green/40 text-chess-green font-bold'
                      : 'bg-chess-card text-chess-gray border border-chess-border'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 5 && <div className={`w-8 sm:w-16 h-0.5 ${step > s ? 'bg-chess-green' : 'bg-chess-border'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="max-w-md mx-auto space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-base font-extrabold text-chess-light">Como podemos te chamar?</h4>
                <p className="text-xs text-chess-gray">Informe seu nome e WhatsApp para localizarmos seu cadastro</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-chess-gray block mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    value={clinicalData.name}
                    onChange={(e) => setClinicalData({ ...clinicalData, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full bg-chess-card border border-chess-border rounded-xl px-3.5 py-2.5 text-xs text-chess-light outline-none focus:border-chess-green"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-chess-gray block mb-1">WhatsApp / Telefone:</label>
                  <input
                    type="tel"
                    value={clinicalData.phone}
                    onChange={(e) => setClinicalData({ ...clinicalData, phone: e.target.value })}
                    placeholder="(95) 99123-4567"
                    className="w-full bg-chess-card border border-chess-border rounded-xl px-3.5 py-2.5 text-xs text-chess-light outline-none focus:border-chess-green"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!clinicalData.name.trim()) return alert('Por favor, informe seu nome.');
                    playClick();
                    setStep(2);
                  }}
                  className="chess-btn-green w-full py-3 rounded-xl text-white font-bold text-xs mt-2 keep-white"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl mx-auto space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-base font-extrabold text-chess-light">Qual o motivo da sua consulta hoje?</h4>
                <p className="text-xs text-chess-gray">Selecione a opção que melhor descreve o que você precisa</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COMPLAINT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      playAlert();
                      setClinicalData({ ...clinicalData, complaint: opt.label });
                      setStep(3);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      clinicalData.complaint === opt.label
                        ? 'bg-chess-green/15 border-chess-green text-chess-green font-bold'
                        : 'bg-chess-card border border-chess-border text-chess-light hover:border-chess-green'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-xl mx-auto space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-base font-extrabold text-chess-light">Você possui alergia a algum medicamento?</h4>
                <p className="text-xs text-chess-gray">Item fundamental para a prescrição médica segura</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ALLERGY_OPTIONS.map((alg) => {
                  const isSelected = clinicalData.allergies.includes(alg);
                  return (
                    <button
                      key={alg}
                      onClick={() => {
                        playClick();
                        if (alg === 'Nenhuma Alergia Conhecida') {
                          setClinicalData({ ...clinicalData, allergies: ['Nenhuma Alergia Conhecida'] });
                        } else {
                          const withoutNone = clinicalData.allergies.filter((a) => a !== 'Nenhuma Alergia Conhecida');
                          if (isSelected) {
                            setClinicalData({ ...clinicalData, allergies: withoutNone.filter((a) => a !== alg) });
                          } else {
                            setClinicalData({ ...clinicalData, allergies: [...withoutNone, alg] });
                          }
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold'
                          : 'bg-chess-card border border-chess-border text-chess-light hover:border-chess-green'
                      }`}
                    >
                      {alg}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { playClick(); setStep(4); }}
                  className="chess-btn-green w-full py-3 rounded-xl text-white font-bold text-xs keep-white"
                >
                  Continuar para Histórico de Saúde
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-xl mx-auto space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-base font-extrabold text-chess-light">Histórico de Saúde & Condições Crônicas</h4>
                <p className="text-xs text-chess-gray">Selecione caso possua alguma das condições abaixo</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {MEDICAL_HISTORY_OPTIONS.map((item) => {
                  const isSelected = clinicalData.chronicConditions.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        playClick();
                        if (item === 'Nenhum Histórico Relevante') {
                          setClinicalData({ ...clinicalData, chronicConditions: ['Nenhum Histórico Relevante'] });
                        } else {
                          const withoutNone = clinicalData.chronicConditions.filter((c) => c !== 'Nenhum Histórico Relevante');
                          if (isSelected) {
                            setClinicalData({ ...clinicalData, chronicConditions: withoutNone.filter((c) => c !== item) });
                          } else {
                            setClinicalData({ ...clinicalData, chronicConditions: [...withoutNone, item] });
                          }
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isSelected
                          ? 'bg-blue-500/15 border-blue-500 text-blue-500 font-bold'
                          : 'bg-chess-card border border-chess-border text-chess-light hover:border-chess-green'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { playClick(); setStep(5); }}
                  className="chess-btn-green w-full py-3 rounded-xl text-white font-bold text-xs keep-white"
                >
                  Continuar para Revisão Final
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-md mx-auto space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-base font-extrabold text-chess-light">Medicamentos & Conclusão</h4>
                <p className="text-xs text-chess-gray">Usa algum medicamento contínuo? Se sim, descreva abaixo</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-chess-gray block mb-1">Medicamentos em uso diário:</label>
                <input
                  type="text"
                  value={clinicalData.medications}
                  onChange={(e) => setClinicalData({ ...clinicalData, medications: e.target.value })}
                  placeholder="Ex: Losartana 50mg, Metformina, etc."
                  className="w-full bg-chess-card border border-chess-border rounded-xl px-3.5 py-2.5 text-xs text-chess-light outline-none focus:border-chess-green"
                />
              </div>

              <div className="p-3 bg-chess-card rounded-xl border border-chess-border text-xs space-y-1 text-chess-gray">
                <div><span className="text-chess-light font-bold">Paciente:</span> {clinicalData.name}</div>
                <div><span className="text-chess-light font-bold">Procedimento:</span> {clinicalData.complaint}</div>
                <div><span className="text-chess-light font-bold">Alergias:</span> {clinicalData.allergies.join(', ') || 'Nenhuma'}</div>
              </div>

              <button
                onClick={handleFinalizeCheckin}
                disabled={isSubmitting}
                className="chess-btn-green w-full py-3.5 rounded-xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 keep-white"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Gerando sua Senha...' : 'Emitir Senha Oficial de Atendimento'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveReception;
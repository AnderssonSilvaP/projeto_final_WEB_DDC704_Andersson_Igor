import React, { useState, useEffect } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Play,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';
import { useAudio } from '../context/AudioContext';

const TIME_SLOTS = [
  '08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
  '14:00', '14:45', '15:30', '16:15', '17:00', '17:45',
];

export const Agenda = () => {
  const { playClick, playAlert, playSuccess } = useAudio();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedChair, setSelectedChair] = useState('todas');

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState('');
  const [newDentist, setNewDentist] = useState('');
  const [newChair, setNewChair] = useState(1);
  const [newTime, setNewTime] = useState('08:00');
  const [newProcedure, setNewProcedure] = useState('Profilaxia e Avaliação Clínica');
  const [newPrice, setNewPrice] = useState(180);
  const [newNotes, setNewNotes] = useState('');

  const [reminderModal, setReminderModal] = useState({ open: false, appointment: null });

  const fetchAgenda = async () => {
    try {
      setLoading(true);
      const [aptRes, patRes, userRes] = await Promise.all([
        api.get(`/appointments?date=${selectedDate}${selectedChair !== 'todas' ? `&chair=${selectedChair}` : ''}`),
        api.get('/patients'),
        api.get('/auth/users?role=dentista'),
      ]);

      setAppointments(aptRes.appointments || []);
      setPatients(patRes.patients || []);
      setDentists(userRes.users || []);

      if (userRes.users?.length > 0 && !newDentist) {
        setNewDentist(userRes.users[0]._id);
      }
      if (patRes.patients?.length > 0 && !newPatient) {
        setNewPatient(patRes.patients[0]._id);
      }
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [selectedDate, selectedChair]);

  const handlePrevDay = () => {
    playClick();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    playClick();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    playClick();
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      playSuccess();
      await api.post('/appointments', {
        patient: newPatient,
        dentist: newDentist,
        chairNumber: Number(newChair),
        date: selectedDate,
        timeSlot: newTime,
        procedure: newProcedure,
        price: Number(newPrice),
        notes: newNotes,
      });

      setIsModalOpen(false);
      fetchAgenda();
    } catch (err) {
      alert(err.message || 'Erro ao agendar consulta');
    }
  };

  const handleStatusUpdate = async (aptId, newStatus) => {
    try {
      playAlert();
      await api.patch(`/appointments/${aptId}/status`, { status: newStatus });
      fetchAgenda();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar status');
    }
  };

  const getAppointmentsForSlot = (chairNum, time) => {
    return appointments.find(
      (a) => a.chairNumber === chairNum && a.timeSlot === time && a.status !== 'cancelado'
    );
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-lg bg-chess-darker border border-chess-border text-chess-gray hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-chess-darker px-4 py-2 rounded-xl border border-chess-border">
            <CalendarIcon className="w-4 h-4 text-chess-green" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg bg-chess-darker border border-chess-border text-chess-gray hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-xl text-xs font-bold chess-btn-dark"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-2 bg-chess-darker p-1 rounded-xl border border-chess-border">
          {[
            { id: 'todas', label: 'Todas as Cadeiras' },
            { id: '1', label: 'C1: Cirurgia' },
            { id: '2', label: 'C2: Ortodontia' },
            { id: '3', label: 'C3: Geral' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => { playClick(); setSelectedChair(c.id); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedChair === c.id
                  ? 'bg-chess-green text-white shadow-chess-btn'
                  : 'text-chess-gray hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => { playClick(); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl text-xs font-black chess-btn-green flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3]
          .filter((chairNum) => selectedChair === 'todas' || selectedChair === String(chairNum))
          .map((chairNum) => {
            const chairTitles = {
              1: { name: 'Cadeira #1: Titânio', spec: 'Cirurgia & Implantodontia', color: 'border-chess-green' },
              2: { name: 'Cadeira #2: Ouro', spec: 'Ortodontia & Estética', color: 'border-chess-gold' },
              3: { name: 'Cadeira #3: Esmeralda', spec: 'Clínica Geral & Prevenção', color: 'border-chess-blue' },
            };
            const chairInfo = chairTitles[chairNum];

            return (
              <div
                key={chairNum}
                className="bg-chess-panel border border-chess-border rounded-2xl p-4 shadow-chess-card flex flex-col"
              >
                <div className={`pb-3 mb-4 border-b border-chess-border border-l-4 pl-3 ${chairInfo.color}`}>
                  <h4 className="text-base font-extrabold text-white">{chairInfo.name}</h4>
                  <p className="text-xs text-chess-gray">{chairInfo.spec}</p>
                </div>

                <div className="space-y-3 flex-1">
                  {TIME_SLOTS.map((time) => {
                    const apt = getAppointmentsForSlot(chairNum, time);

                    if (!apt) {
                      return (
                        <div
                          key={time}
                          onClick={() => {
                            setNewChair(chairNum);
                            setNewTime(time);
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl border border-dashed border-chess-border/60 bg-chess-darker/50 hover:bg-chess-darker hover:border-chess-green/50 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <span className="text-xs font-mono font-bold text-chess-gray">
                            {time}
                          </span>
                          <span className="text-[11px] font-semibold text-chess-gray group-hover:text-chess-green flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Horário Livre</span>
                          </span>
                        </div>
                      );
                    }

                    const statusStyles = {
                      agendado: 'bg-chess-darker border-chess-border text-chess-light',
                      confirmado: 'bg-chess-blue/15 border-chess-blue/40 text-white',
                      aguardando: 'bg-chess-gold/15 border-chess-gold/40 text-white',
                      em_atendimento: 'bg-chess-green/20 border-chess-green text-white ring-1 ring-chess-green',
                      concluido: 'bg-zinc-800/60 border-zinc-700 text-zinc-400 opacity-80',
                    };

                    return (
                      <div
                        key={time}
                        className={`p-3 rounded-xl border shadow-sm transition-all ${
                          statusStyles[apt.status] || statusStyles.agendado
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black font-mono text-chess-gold">
                            {apt.timeSlot}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-chess-darker/70">
                            {apt.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-sm font-extrabold text-white truncate">
                          {apt.patient?.name}
                        </div>
                        <div className="text-xs text-chess-gray truncate mb-2">
                          {apt.procedure}
                        </div>

                        <div className="pt-2 border-t border-chess-border/40 flex items-center justify-between gap-1">
                          <button
                            onClick={() => setReminderModal({ open: true, appointment: apt })}
                            title="Enviar lembrete de consulta WhatsApp"
                            className="p-1 rounded text-chess-green hover:bg-chess-dark"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1">
                            {apt.status === 'agendado' && (
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'confirmado')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold chess-btn-dark"
                              >
                                Confirmar
                              </button>
                            )}
                            {apt.status === 'confirmado' && (
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'aguardando')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold chess-btn-gold"
                              >
                                Chegou
                              </button>
                            )}
                            {apt.status === 'aguardando' && (
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'em_atendimento')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold chess-btn-green flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                <span>Iniciar</span>
                              </button>
                            )}
                            {apt.status === 'em_atendimento' && (
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'concluido')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold chess-btn-green"
                              >
                                Finalizar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Consulta Odontológica"
        subtitle={`Data selecionada: ${selectedDate}`}
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
              Paciente:
            </label>
            <select
              value={newPatient}
              onChange={(e) => setNewPatient(e.target.value)}
              required
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            >
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.cpf})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                Cirurgião-Dentista:
              </label>
              <select
                value={newDentist}
                onChange={(e) => setNewDentist(e.target.value)}
                required
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                {dentists.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                Cadeira / Sala:
              </label>
              <select
                value={newChair}
                onChange={(e) => setNewChair(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value={1}>Cadeira 1 - Cirurgia & Implantes</option>
                <option value={2}>Cadeira 2 - Ortodontia & Estética</option>
                <option value={3}>Cadeira 3 - Clínica Geral</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                Horário:
              </label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                Valor Previsto (R$):
              </label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
              Procedimento:
            </label>
            <input
              type="text"
              value={newProcedure}
              onChange={(e) => setNewProcedure(e.target.value)}
              required
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
              Observações / Alergias:
            </label>
            <textarea
              rows="2"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full bg-chess-darker border border-chess-border rounded-lg p-2.5 text-xs text-white resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green"
          >
            Confirmar e Inserir na Agenda
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={reminderModal.open}
        onClose={() => setReminderModal({ open: false, appointment: null })}
        title="Lembrete de Consulta (WhatsApp)"
        subtitle="Confirmação de presença do paciente"
      >
        {reminderModal.appointment && (
          <div className="space-y-4">
            <div className="p-4 bg-chess-darker border border-chess-border rounded-xl text-xs space-y-2 font-mono text-chess-light">
              <p>
                Olá <strong>{reminderModal.appointment.patient?.name}</strong>!
              </p>
              <p>
                Lembramos da sua consulta na <strong>Clínica Odontológica</strong> marcada para:
              </p>
              <p className="text-chess-gold font-bold">
                Data: {reminderModal.appointment.date} às {reminderModal.appointment.timeSlot}
              </p>
              <p>
                Procedimento: {reminderModal.appointment.procedure} com Dr(a). {reminderModal.appointment.dentist?.name}.
              </p>
              <p className="text-chess-gray">
                Por favor, responda 1 para CONFIRMAR ou 2 para REMARCAR.
              </p>
            </div>

            <button
              onClick={() => {
                playSuccess();
                alert('Mensagem de lembrete enviada via WhatsApp com sucesso!');
                setReminderModal({ open: false, appointment: null });
              }}
              className="w-full py-2.5 rounded-xl text-sm font-bold chess-btn-green flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar via WhatsApp</span>
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

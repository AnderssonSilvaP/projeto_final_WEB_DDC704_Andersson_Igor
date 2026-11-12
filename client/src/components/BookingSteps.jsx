import React, { useState, useEffect } from 'react';
import { Check, Clock, UserCheck, ChevronRight, ChevronLeft, ShieldAlert, User } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import FormField from './FormField';
import Badge from './Badge';

export const DENTISTS = [
  'Dr. Roberto Silveira',
  'Dra. Mariana Costa',
  'Dr. Carlos Fontes',
];

export const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export default function BookingSteps({
  services,
  patients,
  initialServiceId = '',
  onSuccess,
  onCancel,
}) {
  const { user, isPaciente, isMedico } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [step, setStep] = useState(initialServiceId ? 2 : 1);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [dentistName, setDentistName] = useState(
    isMedico && user?.name ? user.name : DENTISTS[0]
  );
  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState('');
  const [patientId, setPatientId] = useState(patients[0]?._id || '');
  const [notes, setNotes] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isMedico && user?.name) {
      setDentistName(user.name);
    }
  }, [isMedico, user]);

  useEffect(() => {
    if (patients.length > 0 && (!patientId || isPaciente)) {
      setPatientId(patients[0]._id);
    }
  }, [patients, patientId, isPaciente]);

  useEffect(() => {
    if (!date || !dentistName) return;
    let cancelled = false;
    setLoadingSlots(true);
    api
      .get(`/appointments/occupied?date=${encodeURIComponent(date)}&dentistName=${encodeURIComponent(dentistName)}`)
      .then((res) => {
        if (!cancelled) {
          const slots = res.occupiedSlots || [];
          setOccupiedSlots(slots);
          if (slots.includes(timeSlot)) setTimeSlot('');
        }
      })
      .catch(() => {
        if (!cancelled) setOccupiedSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, dentistName]);

  const selectedService = services.find((s) => s._id === serviceId);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    if (!serviceId || !date || !timeSlot || !patientId) {
      setError('Preencha todos os campos obrigatórios do agendamento.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/appointments', {
        service: serviceId,
        patient: patientId,
        dentistName,
        date,
        timeSlot,
        notes,
      });
      onSuccess(res.appointment);
    } catch (err) {
      setError(err.message || 'Não foi possível concluir o agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Procedimento' },
    { num: 2, title: 'Data e Horário' },
    { num: 3, title: isPaciente ? 'Confirmação' : 'Paciente' },
  ];

  const ownPatient = patients[0] || null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-brand-50/60 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Agendamento Online • Unidade Boa Vista
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Agende sua consulta em 3 passos
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((s, idx) => {
            const active = step === s.num;
            const done = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      done
                        ? 'bg-brand-600 text-white'
                        : active
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:inline ${
                      active || done ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-5 h-px bg-slate-300" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm font-medium text-slate-600 mb-4">
              1. Qual procedimento você deseja agendar?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map((service) => {
                const selected = serviceId === service._id;
                return (
                  <button
                    key={service._id}
                    type="button"
                    onClick={() => {
                      setServiceId(service._id);
                      setStep(2);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selected
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-brand-500 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {service.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        R$ {Number(service.price).toFixed(2)}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm mt-2">
                      {service.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {service.description || 'Atendimento especializado.'}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-3">
                      <Clock className="w-3.5 h-3.5" /> {service.durationMinutes} min
                    </div>
                  </button>
                );
              })}
            </div>
            {onCancel && (
              <div className="mt-5 flex justify-end">
                <Button variant="secondary" onClick={onCancel}>
                  Fechar
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Data da consulta"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <FormField
                label="Cirurgião-Dentista"
                as="select"
                value={dentistName}
                disabled={isMedico}
                onChange={(e) => setDentistName(e.target.value)}
              >
                {DENTISTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Horários disponíveis ({date.split('-').reverse().join('/')})
                </span>
                {loadingSlots && (
                  <span className="text-xs text-slate-400">Verificando agenda...</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const occupied = occupiedSlots.includes(slot);
                  const selected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={occupied}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        occupied
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : selected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-brand-600 hover:text-brand-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot}</span>
                      {occupied && <span className="no-underline text-[10px]">(Ocupado)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button
                disabled={!timeSlot || !date}
                onClick={() => setStep(3)}
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Procedimento selecionado</span>
                <strong className="text-slate-900 text-sm">{selectedService?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Profissional</span>
                <strong className="text-slate-900">{dentistName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Data e Horário</span>
                <strong className="text-brand-700">
                  {date.split('-').reverse().join('/')} às {timeSlot}
                </strong>
              </div>
            </div>

            {isPaciente ? (
              <div className="rounded-xl bg-brand-50/50 border border-brand-200 p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700 block">
                      Agendamento pessoal (titular da conta)
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {ownPatient?.name || user?.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      CPF: {ownPatient?.cpf || 'Não informado'} • Telefone: {ownPatient?.phone || user?.phone || '—'}
                    </p>
                  </div>
                </div>
                {ownPatient?.healthInsurance && (
                  <Badge>{ownPatient.healthInsurance}</Badge>
                )}
              </div>
            ) : (
              <FormField
                label="Paciente"
                as="select"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                {patients.length === 0 && (
                  <option value="">Cadastre um paciente na aba Pacientes primeiro</option>
                )}
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — CPF: {p.cpf} ({p.healthInsurance})
                  </option>
                ))}
              </FormField>
            )}

            <FormField
              label="Observações ou queixa principal (opcional)"
              as="textarea"
              rows={2}
              placeholder="Ex: Sensibilidade, check-up semestral..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button type="submit" loading={submitting} disabled={!patientId}>
                <UserCheck className="w-4 h-4" /> Confirmar Agendamento
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

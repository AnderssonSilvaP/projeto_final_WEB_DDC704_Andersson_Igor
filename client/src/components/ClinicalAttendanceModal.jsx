import React, { useState, useEffect } from 'react';
import { AlertTriangle, Stethoscope, ClipboardCheck, Calendar, Clock } from 'lucide-react';
import { api } from '../services/api';
import Modal from './Modal';
import FormField from './FormField';
import Button from './Button';
import Badge from './Badge';

export default function ClinicalAttendanceModal({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [status, setStatus] = useState('concluido');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [allergies, setAllergies] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status === 'agendado' ? 'confirmado' : appointment.status);
      setClinicalNotes(appointment.clinicalNotes || '');
      setRecommendations(appointment.recommendations || '');
      setAllergies(appointment.patient?.allergies || '');
      setError('');
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/appointments/${appointment._id}`, {
        status,
        clinicalNotes,
        recommendations,
      });

      if (appointment.patient?._id && allergies !== (appointment.patient.allergies || '')) {
        await api.put(`/patients/${appointment.patient._id}`, { allergies });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar evolução clínica.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Atendimento Clínico"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Paciente em atendimento
              </span>
              <p className="text-sm font-bold text-slate-900">
                {appointment.patient?.name}
              </p>
            </div>
            <Badge>{appointment.patient?.healthInsurance || 'Particular'}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-200/70">
            <span className="inline-flex items-center gap-1 font-medium text-brand-700">
              <Stethoscope className="w-3.5 h-3.5" /> {appointment.service?.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {appointment.date.split('-').reverse().join('/')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {appointment.timeSlot}
            </span>
          </div>

          {appointment.notes && (
            <p className="text-xs text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-200">
              <strong className="text-slate-700">Queixa / Observação inicial:</strong> {appointment.notes}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Alerta de Alergias / Restrições Medicamentosas
          </div>
          <input
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="Ex: Dipirona, Penicilina, Látex ou Nenhuma alergia relatada"
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-amber-600 focus:outline-none"
          />
        </div>

        <FormField
          label="Status do Atendimento"
          as="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="confirmado">Confirmado (Em consultório)</option>
          <option value="concluido">Concluído (Atendimento finalizado)</option>
          <option value="agendado">Agendado</option>
          <option value="cancelado">Cancelado / Falta do paciente</option>
        </FormField>

        <FormField
          label="Evolução Clínica / Procedimento Realizado (Prontuário)"
          as="textarea"
          rows={3}
          placeholder="Descreva os procedimentos clínicos executados, anestésico utilizado, achados clínicos..."
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
        />

        <FormField
          label="Recomendações Pós-Consulta / Prescrição para o Paciente"
          as="textarea"
          rows={3}
          placeholder="Orientações de cuidados pós-procedimento, medicação prescrita e prazo de retorno (visível ao paciente)..."
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            <ClipboardCheck className="w-4 h-4" /> Salvar Prontuário
          </Button>
        </div>
      </form>
    </Modal>
  );
}

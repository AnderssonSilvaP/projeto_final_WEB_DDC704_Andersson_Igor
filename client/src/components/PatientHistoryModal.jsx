import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Stethoscope,
  Save,
} from 'lucide-react';
import { api } from '../services/api';
import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';
import Spinner from './Spinner';

export default function PatientHistoryModal({
  patientId,
  isOpen,
  onClose,
  onUpdated,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !patientId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    setSavedFeedback(false);

    api
      .get(`/patients/${patientId}/history`)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setAllergies(res.patient?.allergies || '');
          setNotes(res.patient?.notes || '');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Erro ao carregar prontuário do paciente.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, patientId]);

  const handleSaveAnamnesis = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    setSavingNotes(true);
    setSavedFeedback(false);
    setError('');
    try {
      const res = await api.put(`/patients/${patientId}`, { allergies, notes });
      setData((prev) => (prev ? { ...prev, patient: res.patient } : prev));
      setSavedFeedback(true);
      if (onUpdated) onUpdated(res.patient);
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar o prontuário.');
    } finally {
      setSavingNotes(false);
    }
  };

  const patient = data?.patient;
  const appointments = data?.appointments || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patient ? `Prontuário Clínico • ${patient.name}` : 'Prontuário Clínico'}
    >
      {loading ? (
        <Spinner label="Carregando histórico clínico..." />
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      ) : patient ? (
        <div className="space-y-5">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">CPF / Nascimento</span>
              <strong className="text-slate-800">
                {patient.cpf} •{' '}
                {patient.birthDate
                  ? String(patient.birthDate).slice(0, 10).split('-').reverse().join('/')
                  : '—'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Contato</span>
              <strong className="text-slate-800">{patient.phone}</strong>
            </div>
            <Badge>{patient.healthInsurance}</Badge>
          </div>

          <form onSubmit={handleSaveAnamnesis} className="space-y-3 bg-amber-50/40 border border-amber-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Anamnese e Observações Clínicas Permanentes
              </span>
              {savedFeedback && (
                <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Atualizado
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Alergias / Restrições Medicamentosas
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Dipirona, Penicilina, Látex..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Resumo Clínico / Anotações do Prontuário
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações odontológicas gerais do paciente..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={savingNotes}>
                <Save className="w-3.5 h-3.5" /> Salvar Anamnese
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              Histórico de Consultas ({appointments.length})
            </h4>

            {appointments.length === 0 ? (
              <div className="rounded-xl border border-slate-200 py-8 text-center text-xs text-slate-500">
                Nenhuma consulta registrada para este paciente.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {appointments.map((app) => (
                  <div
                    key={app._id}
                    className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        <span>{app.date.split('-').reverse().join('/')}</span>
                        <span className="text-slate-400">•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.timeSlot}</span>
                      </div>
                      <Badge variant={app.status} />
                    </div>

                    <div className="text-xs text-slate-700 flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
                        {app.service?.name || 'Procedimento'}
                      </span>
                      <span className="text-slate-500">{app.dentistName}</span>
                    </div>

                    {app.clinicalNotes && (
                      <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-xs text-slate-700">
                        <strong className="block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                          Evolução Clínica
                        </strong>
                        {app.clinicalNotes}
                      </div>
                    )}

                    {app.recommendations && (
                      <div className="rounded-lg bg-brand-50/50 border border-brand-200/70 p-2.5 text-xs text-brand-900">
                        <strong className="block text-[11px] uppercase tracking-wider text-brand-700 mb-0.5">
                          Recomendações Pós-Consulta
                        </strong>
                        {app.recommendations}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

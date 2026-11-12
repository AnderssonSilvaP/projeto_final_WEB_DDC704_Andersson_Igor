import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  ClipboardCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingSteps, { DENTISTS, TIME_SLOTS } from '../components/BookingSteps';
import ClinicalAttendanceModal from '../components/ClinicalAttendanceModal';
import PatientClinicalCard from '../components/PatientClinicalCard';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

export default function AgendamentosPage() {
  const { user, isAdmin, isMedico, isPaciente } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showWizard, setShowWizard] = useState(Boolean(preselectedService));
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dentistFilter, setDentistFilter] = useState('todos');

  const [attendingItem, setAttendingItem] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    patient: '',
    service: '',
    dentistName: DENTISTS[0],
    date: '',
    timeSlot: TIME_SLOTS[0],
    status: 'agendado',
    notes: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set('date', dateFilter);
      if (statusFilter !== 'todos') params.set('status', statusFilter);
      if (isAdmin && dentistFilter !== 'todos') params.set('dentistName', dentistFilter);

      const [appRes, srvRes, patRes] = await Promise.all([
        api.get(`/appointments?${params.toString()}`),
        api.get('/services'),
        api.get('/patients'),
      ]);

      setAppointments(appRes.appointments || []);
      setServices(srvRes.services || []);
      setPatients(patRes.patients || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, dentistFilter, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEditModal = (item) => {
    setEditing(item);
    setEditForm({
      patient: item.patient?._id || '',
      service: item.service?._id || '',
      dentistName: item.dentistName,
      date: item.date,
      timeSlot: item.timeSlot,
      status: item.status,
      notes: item.notes || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setError('');
    try {
      const payload = isPaciente
        ? {
            service: editForm.service,
            dentistName: editForm.dentistName,
            date: editForm.date,
            timeSlot: editForm.timeSlot,
            notes: editForm.notes,
          }
        : editForm;

      await api.put(`/appointments/${editing._id}`, payload);
      setEditing(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar agendamento.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      await loadData();
    } catch (err) {
      setError(err.message || 'Não foi possível alterar o status.');
    }
  };

  const handlePatientCancel = async (id) => {
    if (!window.confirm('Deseja realmente cancelar a sua consulta?')) return;
    await handleStatusChange(id, 'cancelado');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este agendamento?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.message || 'Erro ao excluir agendamento.');
    }
  };

  if (loading) return <Spinner label="Carregando agenda..." />;

  const pendingDoctorCount = appointments.filter(
    (a) => a.status === 'agendado' || a.status === 'confirmado'
  ).length;
  const completedDoctorCount = appointments.filter((a) => a.status === 'concluido').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isMedico
              ? `Minha Agenda Clínica • ${user?.name}`
              : isPaciente
                ? 'Minhas Consultas'
                : 'Gestão de Agendamentos'}
          </h1>
          <p className="text-sm text-slate-500">
            {isMedico
              ? `Pacientes agendados exclusivamente com você (${user?.specialty || 'Cirurgião-Dentista'}).`
              : isPaciente
                ? 'Agende consultas para você, acompanhe seus horários e veja recomendações médicas.'
                : 'Controle completo da agenda de todos os profissionais da clínica.'}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowWizard((v) => !v);
            if (preselectedService) setSearchParams({});
          }}
        >
          <Plus className="w-4 h-4" />
          {showWizard
            ? 'Ocultar Agendamento'
            : isMedico
              ? 'Agendar Retorno'
              : 'Agendar Consulta'}
        </Button>
      </div>

      {isMedico && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Na Minha Agenda"
            value={appointments.length}
            subtitle="Consultas atribuídas a você"
            icon={CalendarCheck}
          />
          <StatCard
            title="Aguardando Atendimento"
            value={pendingDoctorCount}
            subtitle="Agendados ou confirmados"
            icon={Clock}
          />
          <StatCard
            title="Pacientes Atendidos"
            value={completedDoctorCount}
            subtitle="Com prontuário concluído"
            icon={CheckCircle2}
          />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {showWizard && (
        <BookingSteps
          services={services}
          patients={patients}
          initialServiceId={preselectedService}
          onCancel={() => {
            setShowWizard(false);
            if (preselectedService) setSearchParams({});
          }}
          onSuccess={() => {
            setShowWizard(false);
            if (preselectedService) setSearchParams({});
            loadData();
          }}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800">
            {isPaciente
              ? `Meus Agendamentos (${appointments.length})`
              : isMedico
                ? `Fila de Atendimento (${appointments.length})`
                : `Consultas Registradas (${appointments.length})`}
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <select
                value={dentistFilter}
                onChange={(e) => setDentistFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-brand-600 focus:outline-none bg-white"
              >
                <option value="todos">Todos os dentistas</option>
                {DENTISTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-brand-600 focus:outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                Limpar data
              </button>
            )}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-brand-600 focus:outline-none bg-white"
            >
              <option value="todos">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Nenhum agendamento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Data / Hora</th>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Procedimento</th>
                  <th className="py-3 px-4">Profissional</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {appointments.map((item) => {
                  const canPatientModify =
                    isPaciente && item.status !== 'concluido' && item.status !== 'cancelado';

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          {item.date.split('-').reverse().join('/')}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {item.timeSlot}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {item.patient?.name || 'Paciente removido'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.patient?.phone} • {item.patient?.healthInsurance}
                        </div>
                        {(isMedico || isAdmin) &&
                          item.patient?.allergies &&
                          item.patient.allergies !== 'Nenhuma alergia relatada' && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3" /> Alergia: {item.patient.allergies}
                            </span>
                          )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {item.service?.name || 'Procedimento'}
                        </div>
                        <div className="text-xs text-slate-500">
                          R$ {Number(item.service?.price || 0).toFixed(2)}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            Obs: {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">
                        {item.dentistName}
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaciente ? (
                          <Badge variant={item.status} />
                        ) : (
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 focus:border-brand-600 focus:outline-none"
                          >
                            <option value="agendado">Agendado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {(isMedico || isAdmin) && (
                            <button
                              type="button"
                              onClick={() => setAttendingItem(item)}
                              title="Registrar atendimento e evolução clínica"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>{item.clinicalNotes ? 'Prontuário' : 'Atender'}</span>
                            </button>
                          )}

                          {(isAdmin || isMedico || canPatientModify) && (
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title={isPaciente ? 'Remarcar consulta' : 'Editar agendamento'}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {canPatientModify && (
                            <button
                              type="button"
                              onClick={() => handlePatientCancel(item._id)}
                              title="Cancelar minha consulta"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              title="Excluir agendamento (Admin)"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isPaciente && <PatientClinicalCard appointments={appointments} />}

      <ClinicalAttendanceModal
        appointment={attendingItem}
        isOpen={Boolean(attendingItem)}
        onClose={() => setAttendingItem(null)}
        onSuccess={loadData}
      />

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={isPaciente ? 'Remarcar Minha Consulta' : 'Editar Agendamento'}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {!isPaciente && (
            <FormField
              label="Paciente"
              as="select"
              value={editForm.patient}
              disabled={isMedico}
              onChange={(e) => setEditForm({ ...editForm, patient: e.target.value })}
              required
            >
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.cpf})
                </option>
              ))}
            </FormField>
          )}

          <FormField
            label="Procedimento"
            as="select"
            value={editForm.service}
            onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
            required
          >
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — R$ {Number(s.price).toFixed(2)}
              </option>
            ))}
          </FormField>

          <FormField
            label="Profissional"
            as="select"
            value={editForm.dentistName}
            disabled={isMedico}
            onChange={(e) => setEditForm({ ...editForm, dentistName: e.target.value })}
          >
            {DENTISTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Data"
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              required
            />
            <FormField
              label="Horário"
              as="select"
              value={editForm.timeSlot}
              onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </FormField>
          </div>

          {!isPaciente && (
            <FormField
              label="Status"
              as="select"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </FormField>
          )}

          <FormField
            label="Observações / Queixa"
            as="textarea"
            rows={2}
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={savingEdit}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

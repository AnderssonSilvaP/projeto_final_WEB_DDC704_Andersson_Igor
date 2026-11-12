import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PatientHistoryModal from '../components/PatientHistoryModal';
import PatientProfileFields, { INITIAL_PATIENT_FORM } from '../components/PatientProfileFields';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { formatEmail, formatTextLimit, INSURANCES } from '../utils/masks';

export default function PacientesPage() {
  const { isAdmin, isMedico } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [insurance, setInsurance] = useState('todos');
  const [onlyMine, setOnlyMine] = useState(true);

  const [historyPatientId, setHistoryPatientId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_PATIENT_FORM);
  const [saving, setSaving] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (insurance !== 'todos') params.set('insurance', insurance);
      if (isMedico && onlyMine) params.set('onlyMine', 'true');
      const res = await api.get(`/patients?${params.toString()}`);
      setPatients(res.patients || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar pacientes.');
    } finally {
      setLoading(false);
    }
  }, [search, insurance, isMedico, onlyMine]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const openCreate = () => {
    setEditing(null);
    setForm(INITIAL_PATIENT_FORM);
    setModalOpen(true);
  };

  const openEdit = (patient) => {
    setEditing(patient);
    setForm({
      name: patient.name || '',
      cpf: patient.cpf || '',
      birthDate: patient.birthDate ? String(patient.birthDate).slice(0, 10) : '',
      gender: patient.gender || 'Não informado',
      phone: patient.phone || '',
      emergencyContact: patient.emergencyContact || '',
      cep: patient.cep || '',
      address: patient.address || '',
      city: patient.city || 'Boa Vista',
      state: patient.state || 'RR',
      healthInsurance: patient.healthInsurance || 'Particular',
      insuranceNumber: patient.insuranceNumber || '',
      allergies: patient.allergies || '',
      email: patient.email || '',
      notes: patient.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/patients/${editing._id}`, form);
      } else {
        await api.post('/patients', form);
      }
      setModalOpen(false);
      await loadPatients();
    } catch (err) {
      setError(err.message || 'Erro ao salvar paciente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este paciente e seus agendamentos?')) return;
    try {
      await api.delete(`/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message || 'Erro ao excluir paciente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isMedico ? 'Prontuários Clínicos dos Pacientes' : 'Gestão de Pacientes'}
          </h1>
          <p className="text-sm text-slate-500">
            {isMedico
              ? 'Consulte anamnese, alergias e histórico de evoluções clínicas dos seus pacientes.'
              : 'Cadastro completo, convênios e prontuários dos pacientes da clínica.'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Novo Paciente
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
            />
          </div>

          {isMedico && (
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOnlyMine(true)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  onlyMine ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Meus Pacientes
              </button>
              <button
                type="button"
                onClick={() => setOnlyMine(false)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  !onlyMine ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Todos da Clínica
              </button>
            </div>
          )}

          <select
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-700 bg-white focus:border-brand-600 focus:outline-none"
          >
            <option value="todos">Todos os convênios</option>
            {INSURANCES.map((ins) => (
              <option key={ins} value={ins}>
                {ins}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Spinner label="Carregando prontuários..." />
        ) : patients.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Nenhum paciente encontrado para este filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Nome / CPF</th>
                  <th className="py-3 px-4">Contato / Endereço</th>
                  <th className="py-3 px-4">Anamnese / Alergias</th>
                  <th className="py-3 px-4">Convênio</th>
                  <th className="py-3 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-500">
                        CPF: {patient.cpf} • Nasc:{' '}
                        {patient.birthDate
                          ? String(patient.birthDate).slice(0, 10).split('-').reverse().join('/')
                          : '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-600" /> {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3.5 h-3.5" /> {patient.email}
                        </div>
                      )}
                      {patient.city && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> {patient.city}/{patient.state || 'RR'}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {patient.allergies && patient.allergies !== 'Nenhuma alergia relatada' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> {patient.allergies}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sem alergias relatadas</span>
                      )}
                      {patient.notes && (
                        <p className="text-slate-500 mt-1 line-clamp-1">{patient.notes}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge>{patient.healthInsurance}</Badge>
                      {patient.insuranceNumber && (
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          Nº {patient.insuranceNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHistoryPatientId(patient._id)}
                          title="Abrir Prontuário e Histórico Clínico"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Prontuário</span>
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(patient)}
                              title="Editar dados cadastrais"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(patient._id)}
                              title="Excluir paciente (Admin)"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PatientHistoryModal
        patientId={historyPatientId}
        isOpen={Boolean(historyPatientId)}
        onClose={() => setHistoryPatientId(null)}
        onUpdated={() => loadPatients()}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Ficha Completa do Paciente' : 'Novo Cadastro de Paciente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <PatientProfileFields form={form} onChange={setForm} compact />

          <FormField
            label="E-mail"
            hint={`${(form.email || '').length}/80`}
            type="email"
            maxLength={80}
            placeholder="paciente@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: formatEmail(e.target.value) })}
          />
          <FormField
            label="Observações clínicas"
            hint={`${(form.notes || '').length}/250`}
            as="textarea"
            rows={2}
            maxLength={250}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: formatTextLimit(e.target.value, 250) })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Salvar Alterações' : 'Cadastrar Paciente'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

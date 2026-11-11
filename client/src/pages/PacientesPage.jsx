import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Award,
  AlertTriangle,
  ChevronRight,
  Shield,
  MessageSquare,
  Sparkles,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { useAudio } from '../context/AudioContext';

export const PacientesPage = ({ isCreateModalOpen, onCloseCreateModal }) => {
  const navigate = useNavigate();
  const { playMove, playBrilliant, playCapture } = useAudio();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  // Modal Novo Paciente
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const isModalOpen = isCreateModalOpen !== undefined ? isCreateModalOpen : localModalOpen;
  const setModalOpen = onCloseCreateModal || setLocalModalOpen;

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    email: '',
    planName: 'Particular',
    allergies: '',
    chronicConditions: '',
    notes: '',
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients?search=${search}&insurance=${insuranceFilter}`);
      setPatients(res.patients || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, insuranceFilter]);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      playBrilliant();
      const allergiesArr = formData.allergies
        ? formData.allergies.split(',').map((a) => a.trim())
        : [];
      const chronicArr = formData.chronicConditions
        ? formData.chronicConditions.split(',').map((c) => c.trim())
        : [];

      await api.post('/patients', {
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        phone: formData.phone,
        email: formData.email,
        healthInsurance: { planName: formData.planName },
        allergies: allergiesArr,
        chronicConditions: chronicArr,
        notes: formData.notes,
      });

      if (onCloseCreateModal) onCloseCreateModal();
      else setLocalModalOpen(false);

      setFormData({
        name: '',
        cpf: '',
        birthDate: '',
        phone: '',
        email: '',
        planName: 'Particular',
        allergies: '',
        chronicConditions: '',
        notes: '',
      });

      fetchPatients();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar paciente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-chess-gray" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-chess-darker border border-chess-border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-chess-gray focus:outline-none focus:border-chess-green"
            />
          </div>

          <select
            value={insuranceFilter}
            onChange={(e) => { playMove(); setInsuranceFilter(e.target.value); }}
            className="bg-chess-darker border border-chess-border rounded-xl px-3 py-2 text-xs text-white font-bold cursor-pointer"
          >
            <option value="todos">Todos os Convênios</option>
            <option value="Particular">Particular</option>
            <option value="Uniodonto">Uniodonto</option>
            <option value="Bradesco Dental">Bradesco Dental</option>
          </select>
        </div>

        <button
          onClick={() => { playMove(); if (onCloseCreateModal) onCloseCreateModal(true); else setLocalModalOpen(true); }}
          className="px-4 py-2 rounded-xl text-xs font-black chess-btn-green flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Patient Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <div
            key={p._id}
            className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col justify-between hover:border-chess-green/50 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chess-darker border border-chess-border flex items-center justify-center font-bold text-chess-green text-base">
                    👤
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white group-hover:text-chess-green transition-colors">
                      {p.name}
                    </h4>
                    <span className="text-xs text-chess-gray font-mono">{p.cpf}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-chess-green/15 text-chess-green border border-chess-green/30">
                    Saúde: {p.eloScore || 92}%
                  </span>
                  <div className="text-[10px] text-chess-gray mt-0.5">
                    {p.chessRank || 'Adesão Regular'}
                  </div>
                </div>
              </div>

              {/* Informações Rápidas */}
              <div className="space-y-1.5 text-xs text-chess-gray py-2 border-y border-chess-border/60 my-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-chess-green" />
                  <span>{p.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-chess-gold" />
                  <span>Plano: <strong className="text-white">{p.healthInsurance?.planName || 'Particular'}</strong></span>
                </div>
                {p.allergies?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-chess-red font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Alergias: {p.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 flex items-center justify-between gap-2">
              <a
                href={`https://wa.me/55${p.phone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-chess-darker text-chess-green hover:bg-chess-dark border border-chess-border"
                title="Mensagem no WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { playMove(); navigate('/odontograma'); }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold chess-btn-dark flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-chess-green" />
                  <span>Odonto</span>
                </button>
                <button
                  onClick={() => { playMove(); navigate('/prontuario'); }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold chess-btn-dark flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-chess-gold" />
                  <span>Prontuário</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cadastro de Paciente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => (onCloseCreateModal ? onCloseCreateModal() : setLocalModalOpen(false))}
        title="Cadastrar Novo Paciente"
        subtitle="Registro clínico completo no OdontoChess"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
              Nome Completo do Paciente:
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">CPF:</label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Data Nascimento:</label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Telefone / WhatsApp:</label>
              <input
                type="text"
                required
                placeholder="(95) 90000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Plano / Convênio:</label>
              <select
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="Particular">Particular</option>
                <option value="Uniodonto">Uniodonto</option>
                <option value="Bradesco Dental">Bradesco Dental</option>
                <option value="Amil Dental">Amil Dental</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
              Alergias Conhecidas (separadas por vírgula):
            </label>
            <input
              type="text"
              placeholder="Ex: Penicilina, Látex, Dipirona"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-chess-red font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
              Condições Crônicas (Hipertensão, Diabetes...):
            </label>
            <input
              type="text"
              placeholder="Ex: Hipertensão, Diabetes Tipo 2"
              value={formData.chronicConditions}
              onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Cadastrar Paciente
          </button>
        </form>
      </Modal>
    </div>
  );
};

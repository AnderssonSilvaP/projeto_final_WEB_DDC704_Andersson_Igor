import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';
import { useAudio } from '../context/AudioContext';

export const ProtesesPage = () => {
  const { playClick, playSuccess } = useAudio();
  const [orders, setOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [labName, setLabName] = useState('Laboratório Protético Alpha Precision');
  const [itemDescription, setItemDescription] = useState('Coroa Cerâmica Pura E.max');
  const [shade, setShade] = useState('A2 (Escala VITA)');
  const [type, setType] = useState('coroa');
  const [teethNumbers, setTeethNumbers] = useState('11');
  const [dateExpected, setDateExpected] = useState('');
  const [cost, setCost] = useState(420);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [orderRes, patRes] = await Promise.all([
        api.get(`/lab-orders${statusFilter !== 'todos' ? `?status=${statusFilter}` : ''}`),
        api.get('/patients'),
      ]);
      setOrders(orderRes.orders || []);
      setPatients(patRes.patients || []);
      if (patRes.patients?.length > 0 && !selectedPatient) {
        setSelectedPatient(patRes.patients[0]._id);
      }
    } catch (err) {
      console.error('Erro ao buscar ordens de prótese:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      playSuccess();
      await api.patch(`/lab-orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar status');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      playSuccess();
      const teethArr = teethNumbers ? teethNumbers.split(',').map((t) => Number(t.trim())) : [];
      await api.post('/lab-orders', {
        patient: selectedPatient,
        labName,
        itemDescription,
        type,
        shade,
        teethNumbers: teethArr,
        dateExpected,
        cost: Number(cost),
      });

      setIsModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Erro ao enviar ordem de prótese');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-chess-darker border border-chess-border text-chess-blue">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Laboratório de Prótese & O.S.</h3>
            <p className="text-xs text-chess-gray">
              Envio, provas de infraestrutura e entrega de coroas, facetas e placas.
            </p>
          </div>
        </div>

        <button
          onClick={() => { playClick(); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl text-xs font-black chess-btn-green flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova O.S. de Prótese</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-chess-darker p-1 rounded-xl border border-chess-border text-xs overflow-x-auto">
        {[
          { id: 'todos', label: 'Todas as Ordens' },
          { id: 'enviado', label: 'Enviadas' },
          { id: 'em_producao', label: 'Em Produção' },
          { id: 'prova_agendada', label: 'Prova Agendada' },
          { id: 'concluido_pronto', label: 'Prontas p/ Instalar' },
          { id: 'instalado_paciente', label: 'Instaladas' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => { playClick(); setStatusFilter(s.id); }}
            className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${
              statusFilter === s.id
                ? 'bg-chess-green text-white shadow-chess-btn'
                : 'text-chess-gray hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((ord) => {
          const statusColors = {
            enviado: 'bg-chess-blue/15 text-chess-blue border-chess-blue/30',
            em_producao: 'bg-chess-gold/15 text-chess-gold border-chess-gold/30',
            prova_agendada: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
            concluido_pronto: 'bg-chess-green/15 text-chess-green border-chess-green/30 animate-pulse',
            instalado_paciente: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          };

          return (
            <div
              key={ord._id}
              className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-chess-border">
                  <div>
                    <span className="text-xs font-bold text-chess-gold">
                      {ord.patient?.name}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-0.5">{ord.itemDescription}</h4>
                    <span className="text-[11px] text-chess-gray">
                      {ord.labName}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                      statusColors[ord.status] || statusColors.enviado
                    }`}
                  >
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-chess-gray py-2 border-b border-chess-border/60">
                  <div>Cor / Escala: <strong className="text-white">{ord.shade}</strong></div>
                  {ord.teethNumbers?.length > 0 && (
                    <div>Dente(s): <span className="font-mono font-bold text-chess-green">#{ord.teethNumbers.join(', #')}</span></div>
                  )}
                  <div>Previsão de Entrega: <span className="text-white font-mono">{new Date(ord.dateExpected).toLocaleDateString('pt-BR')}</span></div>
                  <div>Custo Laboratorial: <span className="font-mono text-chess-light">R$ {ord.cost.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-1.5">
                {ord.status === 'enviado' && (
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'em_producao')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold chess-btn-dark"
                  >
                    Iniciar Produção
                  </button>
                )}
                {ord.status === 'em_producao' && (
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'prova_agendada')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold chess-btn-gold"
                  >
                    Agendar Prova
                  </button>
                )}
                {ord.status === 'prova_agendada' && (
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'concluido_pronto')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold chess-btn-green"
                  >
                    Peça Pronta
                  </button>
                )}
                {ord.status === 'concluido_pronto' && (
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'instalado_paciente')}
                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold chess-btn-green"
                  >
                    Instalado no Paciente
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Ordem de Serviço Protética"
        subtitle="Envio de moldagem/escaneamento ao laboratório"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Paciente:</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.cpf})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Laboratório:</label>
              <input
                type="text"
                required
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Tipo:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="coroa">Coroa</option>
              <option value="faceta">Faceta</option>
              <option value="protese_total">Prótese total</option>
              <option value="protese_parcial">Prótese parcial</option>
              <option value="placa_bruxismo">Placa de bruxismo</option>
              <option value="inlay_onlay">Inlay / Onlay</option>
              <option value="protocolo_implante">Protocolo sobre implante</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Peça / Procedimento:</label>
            <input
              type="text"
              required
              placeholder="Ex: Coroa Cerâmica Pura E.max Dente 11"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Cor (VITA):</label>
              <input
                type="text"
                value={shade}
                onChange={(e) => setShade(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Dente(s):</label>
              <input
                type="text"
                value={teethNumbers}
                onChange={(e) => setTeethNumbers(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Custo (R$):</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Data Prevista p/ Entrega:</label>
            <input
              type="date"
              required
              value={dateExpected}
              onChange={(e) => setDateExpected(e.target.value)}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white cursor-pointer"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Registrar e Enviar O.S.
          </button>
        </form>
      </Modal>
    </div>
  );
};

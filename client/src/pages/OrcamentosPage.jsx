import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  CheckCircle,
  XCircle,
  Printer,
  CreditCard,
  QrCode,
  DollarSign,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { useAudio } from '../context/AudioContext';

export const OrcamentosPage = () => {
  const { playMove, playCapture, playBrilliant } = useAudio();
  const [plans, setPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Novo Orçamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [planTitle, setPlanTitle] = useState('Plano de Reabilitação Estética e Funcional');
  const [items, setItems] = useState([
    { toothNumber: 16, procedureName: 'Restauração Resina Nanoparticulada', unitPrice: 190, quantity: 1, total: 190 },
    { toothNumber: 46, procedureName: 'Coroa Cerâmica Zircônia Pura', unitPrice: 1400, quantity: 1, total: 1400 },
  ]);
  const [discountPct, setDiscountPct] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [installments, setInstallments] = useState(1);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const [plansRes, patRes] = await Promise.all([
        api.get('/treatment-plans'),
        api.get('/patients'),
      ]);
      setPlans(plansRes.plans || []);
      setPatients(patRes.patients || []);
      if (patRes.patients?.length > 0 && !selectedPatient) {
        setSelectedPatient(patRes.patients[0]._id);
      }
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdateStatus = async (planId, newStatus) => {
    try {
      playBrilliant();
      await api.patch(`/treatment-plans/${planId}/status`, { status: newStatus });
      fetchPlans();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar status');
    }
  };

  const handleAddItem = () => {
    playMove();
    setItems([
      ...items,
      { toothNumber: 11, procedureName: 'Profilaxia e Aplicação de Flúor', unitPrice: 180, quantity: 1, total: 180 },
    ]);
  };

  const handleRemoveItem = (index) => {
    playMove();
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      playBrilliant();
      await api.post('/treatment-plans', {
        patient: selectedPatient,
        title: planTitle,
        items,
        discountPercentage: Number(discountPct),
        paymentMethod,
        installments: Number(installments),
      });

      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      alert(err.message || 'Erro ao criar orçamento');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-chess-darker border border-chess-border text-chess-gold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Planos de Tratamento & Orçamentos</h3>
            <p className="text-xs text-chess-gray">
              Propostas comerciais odontológicas com simulação de parcelamento e aprovação.
            </p>
          </div>
        </div>

        <button
          onClick={() => { playMove(); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl text-xs font-black chess-btn-green flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Orçamento</span>
        </button>
      </div>

      {/* Grid de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const statusColors = {
            pendente: 'bg-chess-gold/15 text-chess-gold border-chess-gold/30',
            aprovado: 'bg-chess-green/15 text-chess-green border-chess-green/30',
            em_execucao: 'bg-chess-blue/15 text-chess-blue border-chess-blue/30',
            concluido: 'bg-zinc-800 text-zinc-400 border-zinc-700',
            recusado: 'bg-chess-red/15 text-chess-red border-chess-red/30',
          };

          return (
            <div
              key={plan._id}
              className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-chess-border">
                  <div>
                    <span className="text-xs font-bold text-chess-gold">
                      {plan.patient?.name || 'Paciente'}
                    </span>
                    <h4 className="text-base font-extrabold text-white">{plan.title}</h4>
                    <span className="text-[11px] text-chess-gray">
                      Dr(a). {plan.dentist?.name} • {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border ${
                      statusColors[plan.status] || statusColors.pendente
                    }`}
                  >
                    {plan.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Itens do Plano */}
                <div className="py-3 space-y-2 border-b border-chess-border/60">
                  {plan.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {it.toothNumber && (
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-chess-darker text-chess-green">
                            #{it.toothNumber}
                          </span>
                        )}
                        <span className="text-white font-medium">{it.procedureName}</span>
                      </div>
                      <span className="font-mono text-chess-light font-bold">
                        R$ {it.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totais e Condições */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="text-chess-gray">
                    Condição: <strong className="text-white uppercase">{plan.paymentMethod}</strong>
                    {plan.installments > 1 && ` em ${plan.installments}x`}
                  </div>
                  <div className="text-right">
                    {plan.discountAmount > 0 && (
                      <div className="text-[11px] text-chess-green font-bold">
                        Desconto: -R$ {plan.discountAmount.toFixed(2)} ({plan.discountPercentage}%)
                      </div>
                    )}
                    <div className="text-lg font-black text-white font-mono">
                      R$ {plan.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-chess-border flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-chess-darker text-chess-gray hover:text-white border border-chess-border"
                  title="Imprimir proposta"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  {plan.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(plan._id, 'recusado')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-chess-red hover:bg-chess-darker"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(plan._id, 'aprovado')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold chess-btn-green"
                      >
                        Aprovar Tratamento
                      </button>
                    </>
                  )}
                  {plan.status === 'aprovado' && (
                    <button
                      onClick={() => handleUpdateStatus(plan._id, 'em_execucao')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold chess-btn-dark text-chess-blue"
                    >
                      Iniciar Execução
                    </button>
                  )}
                  {plan.status === 'em_execucao' && (
                    <button
                      onClick={() => handleUpdateStatus(plan._id, 'concluido')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold chess-btn-green"
                    >
                      Concluir Tratamento
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Criar Orçamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Novo Orçamento Odontológico"
        subtitle="Adicione itens e condições de pagamento"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
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
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Título do Plano:</label>
              <input
                type="text"
                required
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* Itens do Orçamento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-chess-gray">Procedimentos Inclusos:</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-chess-green hover:underline font-bold"
              >
                + Adicionar Procedimento
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-chess-darker p-2.5 rounded-xl border border-chess-border">
                <input
                  type="number"
                  placeholder="Dente"
                  value={it.toothNumber}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[idx].toothNumber = Number(e.target.value);
                    setItems(copy);
                  }}
                  className="w-16 bg-chess-panel border border-chess-border rounded px-2 py-1 text-xs text-center font-bold text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Procedimento"
                  value={it.procedureName}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[idx].procedureName = e.target.value;
                    setItems(copy);
                  }}
                  className="flex-1 bg-chess-panel border border-chess-border rounded px-2.5 py-1 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="R$"
                  value={it.unitPrice}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[idx].unitPrice = Number(e.target.value);
                    copy[idx].total = copy[idx].unitPrice * copy[idx].quantity;
                    setItems(copy);
                  }}
                  className="w-24 bg-chess-panel border border-chess-border rounded px-2 py-1 text-xs text-right font-bold text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-chess-red hover:text-white px-1 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Desconto e Pagamento */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-chess-border">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Desconto (%):</label>
              <input
                type="number"
                min="0"
                max="50"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Pagamento:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="pix">Pix (À vista)</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="convenio">Convênio</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Parcelas:</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                  <option key={n} value={n}>{n}x</option>
                ))}
              </select>
            </div>
          </div>

          {/* Totalizador */}
          <div className="p-4 bg-chess-darker rounded-xl border border-chess-border flex items-center justify-between">
            <span className="text-sm font-bold text-chess-gray">Valor Total Final:</span>
            <span className="text-xl font-black text-chess-green font-mono">
              R$ {(calculateSubtotal() * (1 - discountPct / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Emitir Proposta de Orçamento
          </button>
        </form>
      </Modal>
    </div>
  );
};

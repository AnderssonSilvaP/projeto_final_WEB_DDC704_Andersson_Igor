import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  CheckCircle,
  CreditCard,
  QrCode,
  Users,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { useAudio } from '../context/AudioContext';

export const FinanceiroPage = () => {
  const { playMove, playCapture, playBrilliant } = useAudio();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  // Modal Novo Lançamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrans, setNewTrans] = useState({
    type: 'receita',
    category: 'procedimento',
    description: '',
    amount: '',
    paymentMethod: 'pix',
  });

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const [sumRes, transRes] = await Promise.all([
        api.get('/financial/summary'),
        api.get(`/financial/transactions${typeFilter !== 'todos' ? `?type=${typeFilter}` : ''}`),
      ]);
      setSummary(sumRes.summary);
      setTransactions(transRes.transactions || []);
    } catch (err) {
      console.error('Erro ao buscar financeiro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [typeFilter]);

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      playBrilliant();
      await api.post('/financial/transactions', {
        ...newTrans,
        amount: Number(newTrans.amount),
      });

      setIsModalOpen(false);
      setNewTrans({
        type: 'receita',
        category: 'procedimento',
        description: '',
        amount: '',
        paymentMethod: 'pix',
      });
      fetchFinance();
    } catch (err) {
      alert(err.message || 'Erro ao criar lançamento');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-chess-darker border border-chess-border text-chess-green">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Fluxo Financeiro & Comissões</h3>
            <p className="text-xs text-chess-gray">
              Controle de receitas, despesas e repasses contratuais dos cirurgiões-dentistas.
            </p>
          </div>
        </div>

        <button
          onClick={() => { playMove(); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl text-xs font-black chess-btn-green flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* KPI Cards Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <span className="text-xs font-bold text-chess-gray uppercase">Receita Total</span>
          <div className="text-2xl font-black text-chess-green font-mono mt-1">
            R$ {(summary?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-chess-gray">Entradas confirmadas</span>
        </div>

        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <span className="text-xs font-bold text-chess-gray uppercase">Despesas Clínicas</span>
          <div className="text-2xl font-black text-chess-red font-mono mt-1">
            R$ {(summary?.totalExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-chess-gray">Materiais, aluguel e próteses</span>
        </div>

        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <span className="text-xs font-bold text-chess-gray uppercase">Saldo Líquido</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            R$ {(summary?.netBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-chess-green font-bold">
            Margem: {summary?.profitMarginPercentage || 0}%
          </span>
        </div>

        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <span className="text-xs font-bold text-chess-gray uppercase">Comissões Dentistas</span>
          <div className="text-2xl font-black text-chess-gold font-mono mt-1">
            R$ {(summary?.totalCommissionsPending || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-chess-gold font-bold">A repassar à equipe</span>
        </div>
      </div>

      {/* Transações & Filtros */}
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-chess-border">
          <h4 className="text-base font-extrabold text-white">Extrato de Lançamentos</h4>

          <div className="flex items-center gap-2 bg-chess-darker p-1 rounded-xl border border-chess-border text-xs">
            {['todos', 'receita', 'despesa'].map((t) => (
              <button
                key={t}
                onClick={() => { playMove(); setTypeFilter(t); }}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-chess-green text-white shadow-chess-btn'
                    : 'text-chess-gray hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {transactions.map((tx) => {
            const isRec = tx.type === 'receita';
            return (
              <div
                key={tx._id}
                className="p-3.5 bg-chess-darker border border-chess-border rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isRec ? 'bg-chess-green/15 text-chess-green border border-chess-green/30' : 'bg-chess-red/15 text-chess-red border border-chess-red/30'
                    }`}
                  >
                    {isRec ? '+' : '-'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{tx.description}</div>
                    <div className="text-xs text-chess-gray flex items-center gap-2">
                      <span className="capitalize">{tx.category.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="uppercase font-mono">{tx.paymentMethod}</span>
                      <span>•</span>
                      <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-base font-black font-mono ${
                      isRec ? 'text-chess-green' : 'text-chess-red'
                    }`}
                  >
                    {isRec ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  {tx.commission?.amount > 0 && (
                    <div className="text-[10px] text-chess-gold font-bold">
                      Comissão: R$ {tx.commission.amount.toFixed(2)} ({tx.commission.percentage}%)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Lançamento Financeiro"
        subtitle="Entrada ou saída do caixa da clínica"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Tipo:</label>
              <select
                value={newTrans.type}
                onChange={(e) => setNewTrans({ ...newTrans, type: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="receita">Receita (Entrada)</option>
                <option value="despesa">Despesa (Saída)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Categoria:</label>
              <select
                value={newTrans.category}
                onChange={(e) => setNewTrans({ ...newTrans, category: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="procedimento">Procedimento Odontológico</option>
                <option value="consulta">Consulta / Avaliação</option>
                <option value="ortodontia_mensal">Mensalidade Ortodôntica</option>
                <option value="material_dentario">Material Dentário</option>
                <option value="laboratorio_protese">Laboratório de Prótese</option>
                <option value="aluguel_clinica">Aluguel / Condomínio</option>
                <option value="salarios">Salários / Equipe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Descrição:</label>
            <input
              type="text"
              required
              placeholder="Ex: Compra de Resinas 3M Z350"
              value={newTrans.description}
              onChange={(e) => setNewTrans({ ...newTrans, description: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Valor (R$):</label>
              <input
                type="number"
                step="0.01"
                required
                value={newTrans.amount}
                onChange={(e) => setNewTrans({ ...newTrans, amount: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Forma de Pagamento:</label>
              <select
                value={newTrans.paymentMethod}
                onChange={(e) => setNewTrans({ ...newTrans, paymentMethod: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Registrar Lançamento
          </button>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';
import { useAudio } from '../context/AudioContext';

export const EstoquePage = () => {
  const { playClick, playAlert, playSuccess } = useAudio();
  const [supplies, setSupplies] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupply, setNewSupply] = useState({
    name: '',
    category: 'anestesico',
    currentStock: 10,
    minStock: 5,
    unit: 'caixas',
    batchNumber: 'LT-2026-B1',
    expirationDate: '',
    unitCost: '',
    supplier: 'Dental Cremer',
    location: 'Armário A - Gaveta 1',
  });

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/supplies?category=${categoryFilter}&search=${search}`);
      setSupplies(res.supplies || []);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, [categoryFilter, search]);

  const handleAdjustStock = async (id, delta) => {
    try {
      if (delta > 0) playAlert();
      else playClick();

      await api.patch(`/supplies/${id}/adjust`, { delta });
      fetchSupplies();
    } catch (err) {
      alert(err.message || 'Erro ao ajustar estoque');
    }
  };

  const handleCreateSupply = async (e) => {
    e.preventDefault();
    try {
      playSuccess();
      await api.post('/supplies', {
        ...newSupply,
        currentStock: Number(newSupply.currentStock),
        minStock: Number(newSupply.minStock),
        unitCost: Number(newSupply.unitCost || 0),
      });

      setIsModalOpen(false);
      setNewSupply({
        name: '',
        category: 'anestesico',
        currentStock: 10,
        minStock: 5,
        unit: 'caixas',
        batchNumber: 'LT-2026-B1',
        expirationDate: '',
        unitCost: '',
        supplier: 'Dental Cremer',
        location: 'Armário A - Gaveta 1',
      });
      fetchSupplies();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar material');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-chess-darker border border-chess-border text-chess-gold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Estoque de Materiais & Insumos</h3>
            <p className="text-xs text-chess-gray">
              Controle de anestésicos, resinas, biossegurança e alertas de reposição.
            </p>
          </div>
        </div>

        <button
          onClick={() => { playClick(); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl text-xs font-black chess-btn-green flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Material</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-chess-darker p-3 rounded-2xl border border-chess-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-chess-gray" />
          <input
            type="text"
            placeholder="Buscar material ou lote..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-chess-panel border border-chess-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-chess-gray focus:outline-none focus:border-chess-green"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'anestesico', label: 'Anestésicos' },
            { id: 'resina', label: 'Resinas' },
            { id: 'biosseguranca', label: 'Biossegurança' },
            { id: 'cirurgia', label: 'Cirurgia' },
            { id: 'descartavel', label: 'Descartáveis' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => { playClick(); setCategoryFilter(c.id); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === c.id
                  ? 'bg-chess-green text-white shadow-chess-btn'
                  : 'bg-chess-panel text-chess-gray hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supplies.map((item) => {
          const isLow = item.currentStock <= item.minStock;

          return (
            <div
              key={item._id}
              className={`bg-chess-panel border rounded-2xl p-5 shadow-chess-card flex flex-col justify-between transition-all ${
                isLow ? 'border-chess-red/60 bg-chess-red/5' : 'border-chess-border'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-chess-gold">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-0.5">{item.name}</h4>
                  </div>
                  {isLow && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chess-red/20 text-chess-red border border-chess-red/40 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Baixo
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-chess-gray py-2 border-y border-chess-border/60 my-2">
                  <div>Lote: <span className="font-mono text-white font-bold">{item.batchNumber}</span></div>
                  <div>Validade: <span className="text-white">{new Date(item.expirationDate).toLocaleDateString('pt-BR')}</span></div>
                  <div>Local: <span className="text-chess-light">{item.location}</span></div>
                  <div>Fornecedor: <span className="text-chess-light">{item.supplier}</span></div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-chess-gray">Mínimo: {item.minStock} {item.unit}</span>
                </div>

                <div className="flex items-center gap-2 bg-chess-darker px-2 py-1 rounded-xl border border-chess-border">
                  <button
                    onClick={() => handleAdjustStock(item._id, -1)}
                    className="w-6 h-6 rounded bg-chess-panel hover:bg-chess-red hover:text-white text-chess-gray flex items-center justify-center font-bold text-xs"
                    title="Diminuir estoque"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="text-sm font-black text-white font-mono min-w-8 text-center">
                    {item.currentStock}
                  </span>

                  <button
                    onClick={() => handleAdjustStock(item._id, +1)}
                    className="w-6 h-6 rounded bg-chess-panel hover:bg-chess-green hover:text-white text-chess-gray flex items-center justify-center font-bold text-xs"
                    title="Aumentar estoque"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Material Odontológico"
        subtitle="Entrada no estoque da clínica"
      >
        <form onSubmit={handleCreateSupply} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Nome do Material / Marca:</label>
            <input
              type="text"
              required
              placeholder="Ex: Articaína 4% com Epinefrina DFL"
              value={newSupply.name}
              onChange={(e) => setNewSupply({ ...newSupply, name: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Categoria:</label>
              <select
                value={newSupply.category}
                onChange={(e) => setNewSupply({ ...newSupply, category: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="anestesico">Anestésico</option>
                <option value="resina">Resina Composta</option>
                <option value="biosseguranca">Biossegurança</option>
                <option value="cirurgia">Cirurgia & Sutura</option>
                <option value="descartavel">Descartável</option>
                <option value="ortodontia">Ortodontia</option>
                <option value="endodontia">Endodontia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Unidade:</label>
              <input
                type="text"
                placeholder="Ex: caixas, tubetes, seringas"
                value={newSupply.unit}
                onChange={(e) => setNewSupply({ ...newSupply, unit: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Quantidade Inicial:</label>
              <input
                type="number"
                required
                value={newSupply.currentStock}
                onChange={(e) => setNewSupply({ ...newSupply, currentStock: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Estoque Mínimo (Alerta):</label>
              <input
                type="number"
                required
                value={newSupply.minStock}
                onChange={(e) => setNewSupply({ ...newSupply, minStock: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Lote:</label>
              <input
                type="text"
                value={newSupply.batchNumber}
                onChange={(e) => setNewSupply({ ...newSupply, batchNumber: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Data de Validade:</label>
              <input
                type="date"
                required
                value={newSupply.expirationDate}
                onChange={(e) => setNewSupply({ ...newSupply, expirationDate: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Cadastrar Insumo
          </button>
        </form>
      </Modal>
    </div>
  );
};

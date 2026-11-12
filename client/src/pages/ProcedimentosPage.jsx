import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const CATEGORIES = [
  'Avaliação',
  'Prevenção',
  'Estética',
  'Ortodontia',
  'Endodontia',
  'Cirurgia',
  'Implantes',
];

const EMPTY_FORM = {
  name: '',
  category: 'Avaliação',
  description: '',
  durationMinutes: 30,
  price: 150,
};

export default function ProcedimentosPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = categoryFilter !== 'todos' ? `?category=${encodeURIComponent(categoryFilter)}` : '';
      const res = await api.get(`/services${query}`);
      setServices(res.services || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar procedimentos.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description || '',
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        price: Number(form.price),
      };
      if (editing) {
        await api.put(`/services/${editing._id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setModalOpen(false);
      await loadServices();
    } catch (err) {
      setError(err.message || 'Erro ao salvar procedimento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este procedimento?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message || 'Erro ao excluir procedimento.');
    }
  };

  if (loading) return <Spinner label="Carregando procedimentos..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Especialidades e Procedimentos</h1>
          <p className="text-sm text-slate-500">
            Catálogo de tratamentos odontológicos oferecidos na unidade.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Novo Procedimento
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['todos', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              categoryFilter === cat
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-500'
            }`}
          >
            {cat === 'todos' ? 'Todas as especialidades' : cat}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center text-sm text-slate-500">
          Nenhum procedimento cadastrado nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                    {service.category}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    R$ {Number(service.price).toFixed(2)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{service.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {service.description || 'Atendimento clínico com equipamentos modernos.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-brand-600" /> {service.durationMinutes} min
                </span>

                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        title="Editar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(service._id)}
                        title="Excluir (Admin)"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => navigate(`/agendamentos?service=${service._id}`)}
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Agendar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Procedimento' : 'Novo Procedimento'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nome do procedimento"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <FormField
            label="Especialidade / Categoria"
            as="select"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Valor (R$)"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <FormField
              label="Duração (minutos)"
              type="number"
              min="15"
              step="5"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              required
            />
          </div>
          <FormField
            label="Descrição"
            as="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

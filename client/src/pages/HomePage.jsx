import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  Users,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function HomePage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    api
      .get('/services')
      .then((res) => setServices((res.services || []).slice(0, 6)))
      .catch(() => setServices([]));
  }, []);

  const handleScheduleClick = (serviceId = '') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(serviceId ? `/agendamentos?service=${serviceId}` : '/agendamentos');
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" /> OdontoCheck • Unidade Boa Vista
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isAuthenticated
              ? `Olá, ${user?.name.split(' ')[0]}. Como podemos cuidar do seu sorriso hoje?`
              : 'Cuidado odontológico completo com agendamento simples e rápido.'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Atendimento clínico em prevenção, estética, ortodontia, endodontia e implantes.
            Escolha o procedimento, consulte os horários livres e confirme sua consulta online.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => handleScheduleClick()}>
              <Calendar className="w-4 h-4" /> Agendar Consulta
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/procedimentos')}
            >
              Ver Procedimentos
            </Button>
            {!isAuthenticated && (
              <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
                Entrar na minha conta <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Segunda a Sexta, das 08h às 18h</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Av. Ville Roy, Centro • Boa Vista - RR</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Central de Atendimento: (95) 3623-4500</span>
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => navigate('/agendamentos')}
            className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-brand-600 transition-colors shadow-sm"
          >
            <Calendar className="w-5 h-5 text-brand-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Agenda de Consultas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Marcar horários e acompanhar status de consultas.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/pacientes')}
            className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-brand-600 transition-colors shadow-sm"
          >
            <Users className="w-5 h-5 text-brand-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Pacientes</h3>
            <p className="text-xs text-slate-500 mt-1">
              Consultar e atualizar fichas cadastrais e convênios.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/procedimentos')}
            className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-brand-600 transition-colors shadow-sm"
          >
            <Stethoscope className="w-5 h-5 text-brand-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Procedimentos</h3>
            <p className="text-xs text-slate-500 mt-1">
              Catálogo de tratamentos, durações e valores.
            </p>
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-brand-600 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5 text-brand-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Dashboard Admin</h3>
              <p className="text-xs text-slate-500 mt-1">
                Indicadores operacionais e resumo diário da clínica.
              </p>
            </button>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-brand-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Convênios Aceitos</h3>
              <p className="text-xs text-slate-500 mt-1">
                Particular, Uniodonto, Bradesco Dental e Amil Dental.
              </p>
            </div>
          )}
        </section>
      )}

      {services.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Principais Tratamentos</h2>
              <p className="text-xs text-slate-500">
                Selecione um procedimento para iniciar o agendamento.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/procedimentos')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {service.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      R$ {Number(service.price).toFixed(2)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2.5">{service.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {service.durationMinutes} min
                  </span>
                  <button
                    type="button"
                    onClick={() => handleScheduleClick(service._id)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                  >
                    Agendar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

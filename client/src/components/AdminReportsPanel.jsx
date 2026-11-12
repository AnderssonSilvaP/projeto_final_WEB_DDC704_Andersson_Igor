import React from 'react';
import {
  Stethoscope,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import Badge from './Badge';

export default function AdminReportsPanel({ summary }) {
  const byDentist = summary?.byDentist || [];
  const byCategory = summary?.byCategory || [];
  const byInsurance = summary?.byInsurance || [];
  const statusBreakdown = summary?.statusBreakdown || {
    agendado: 0,
    confirmado: 0,
    concluido: 0,
    cancelado: 0,
  };

  const maxCategoryRevenue = Math.max(...byCategory.map((c) => c.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-brand-600" />
              Relatório de Produtividade e Faturamento por Profissional
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento de atendimentos realizados, agendados e receita gerada por dentista.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Receita Realizada: R$ {Number(summary?.realizedRevenue || 0).toFixed(2)}
          </span>
        </div>

        {byDentist.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Nenhum dado de produtividade disponível.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Cirurgião-Dentista</th>
                  <th className="py-3 px-4 text-center">Total Consultas</th>
                  <th className="py-3 px-4 text-center">Concluídas</th>
                  <th className="py-3 px-4 text-center">Pendentes</th>
                  <th className="py-3 px-4 text-right">Receita Realizada</th>
                  <th className="py-3 px-6 text-right">Receita Prevista</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {byDentist.map((item) => (
                  <tr key={item.dentistName} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {item.dentistName}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700">
                      {item.total}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {item.completed}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700">
                        {item.scheduled + item.confirmed}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-bold text-emerald-700">
                      R$ {Number(item.realizedRevenue || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6 text-right text-xs font-bold text-slate-900">
                      R$ {Number(item.estimatedRevenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Receita por Especialidade
              </h3>
              <p className="text-xs text-slate-500">
                Demanda de procedimentos ativos por categoria clínica.
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>

          {byCategory.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Nenhuma especialidade movimentada.
            </p>
          ) : (
            <div className="space-y-3.5">
              {byCategory.map((cat) => {
                const pct = Math.round((cat.revenue / maxCategoryRevenue) * 100);
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {cat.category}{' '}
                        <span className="text-slate-400 font-normal">
                          ({cat.count} consulta{cat.count === 1 ? '' : 's'})
                        </span>
                      </span>
                      <span className="font-bold text-slate-900">
                        R$ {Number(cat.revenue).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Distribuição por Convênio e Status
            </h3>
            <p className="text-xs text-slate-500">
              Carteira de pacientes e volume financeiro por plano odontológico.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl bg-sky-50/70 border border-sky-200 p-3 text-center">
              <span className="text-[11px] font-semibold text-sky-700 block">Agendados</span>
              <strong className="text-lg font-bold text-sky-900">{statusBreakdown.agendado}</strong>
            </div>
            <div className="rounded-xl bg-brand-50/70 border border-brand-200 p-3 text-center">
              <span className="text-[11px] font-semibold text-brand-700 block">Confirmados</span>
              <strong className="text-lg font-bold text-brand-900">{statusBreakdown.confirmado}</strong>
            </div>
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 block">Concluídos</span>
              <strong className="text-lg font-bold text-emerald-900">{statusBreakdown.concluido}</strong>
            </div>
            <div className="rounded-xl bg-rose-50/70 border border-rose-200 p-3 text-center">
              <span className="text-[11px] font-semibold text-rose-700 block">Cancelados</span>
              <strong className="text-lg font-bold text-rose-900">{statusBreakdown.cancelado}</strong>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
            {byInsurance.map((ins) => (
              <div
                key={ins.insurance}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Badge>{ins.insurance}</Badge>
                  <span className="text-slate-500">
                    {ins.patientCount} paciente(s) • {ins.appointmentCount} consulta(s)
                  </span>
                </div>
                <span className="font-bold text-slate-800">
                  R$ {Number(ins.revenue || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

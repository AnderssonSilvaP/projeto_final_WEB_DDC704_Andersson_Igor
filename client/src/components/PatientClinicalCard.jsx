import React from 'react';
import { Calendar, Clock, Stethoscope, ClipboardCheck, FileText } from 'lucide-react';
import Badge from './Badge';

export default function PatientClinicalCard({ appointments = [] }) {
  const withGuidance = appointments.filter(
    (a) => a.recommendations || a.clinicalNotes || a.status === 'concluido'
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-brand-600" />
            Recomendações Médicas e Histórico Clínico
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Orientações pós-consulta registradas pelo seu cirurgião-dentista.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {withGuidance.length} registro(s)
        </span>
      </div>

      {withGuidance.length === 0 ? (
        <div className="py-10 px-6 text-center text-sm text-slate-500">
          Nenhuma recomendação pós-consulta disponível até o momento.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {withGuidance.map((item) => (
            <div key={item._id} className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date.split('-').reverse().join('/')}
                  </span>
                  <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {item.timeSlot}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {item.service?.name || 'Consulta Odontológica'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 inline-flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
                    {item.dentistName}
                  </span>
                  <Badge variant={item.status} />
                </div>
              </div>

              {item.clinicalNotes && (
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700">
                  <strong className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                    <FileText className="w-3.5 h-3.5" /> Resumo do Procedimento Realizado
                  </strong>
                  <p className="leading-relaxed">{item.clinicalNotes}</p>
                </div>
              )}

              {item.recommendations && (
                <div className="rounded-xl bg-brand-50/60 border border-brand-200 p-3.5 text-xs text-brand-900">
                  <strong className="text-[11px] font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1 mb-1">
                    <ClipboardCheck className="w-3.5 h-3.5" /> Recomendações e Cuidados Pós-Consulta
                  </strong>
                  <p className="leading-relaxed">{item.recommendations}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

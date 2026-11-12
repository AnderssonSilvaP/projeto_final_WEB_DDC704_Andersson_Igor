import React from 'react';
import { User, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react';
import FormField from './FormField';
import {
  formatCPF,
  formatPhone,
  formatCEP,
  formatUF,
  formatName,
  formatCity,
  formatAddress,
  formatInsuranceCard,
  formatTextLimit,
  INSURANCES,
  GENDERS,
} from '../utils/masks';

export const INITIAL_PATIENT_FORM = {
  name: '',
  cpf: '',
  birthDate: '',
  gender: 'Não informado',
  phone: '',
  emergencyContact: '',
  cep: '',
  address: '',
  city: 'Boa Vista',
  state: 'RR',
  healthInsurance: 'Particular',
  insuranceNumber: '',
  allergies: '',
  email: '',
  notes: '',
};

export default function PatientProfileFields({ form, onChange, compact = false }) {
  const today = new Date().toISOString().slice(0, 10);

  const update = (field, value) => {
    onChange({ ...form, [field]: value });
  };

  const handleInsuranceChange = (value) => {
    onChange({
      ...form,
      healthInsurance: value,
      insuranceNumber: value === 'Particular' ? '' : form.insuranceNumber,
    });
  };

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <User className="w-3.5 h-3.5" /> Dados Pessoais e Contato
        </h3>

        <FormField
          label="Nome completo *"
          hint={`${(form.name || '').length}/80`}
          type="text"
          placeholder="Ex: Maria Clara Cavalcante"
          maxLength={80}
          value={form.name}
          onChange={(e) => update('name', formatName(e.target.value))}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            label="CPF *"
            hint="11 dígitos"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
            minLength={14}
            value={form.cpf}
            onChange={(e) => update('cpf', formatCPF(e.target.value))}
            required
          />
          <FormField
            label="Data de nascimento *"
            type="date"
            min="1900-01-01"
            max={today}
            value={form.birthDate}
            onChange={(e) => update('birthDate', e.target.value)}
            required
          />
          <FormField
            label="Gênero"
            as="select"
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            label="Telefone / WhatsApp *"
            hint="(DDD) + número"
            type="text"
            inputMode="numeric"
            placeholder="(95) 99100-0000"
            maxLength={15}
            minLength={14}
            value={form.phone}
            onChange={(e) => update('phone', formatPhone(e.target.value))}
            required
          />
          <FormField
            label="Contato de Emergência"
            hint="Opcional"
            type="text"
            inputMode="numeric"
            placeholder="(95) 99100-0000"
            maxLength={15}
            value={form.emergencyContact}
            onChange={(e) => update('emergencyContact', formatPhone(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <MapPin className="w-3.5 h-3.5" /> Endereço Residencial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            label="CEP *"
            hint="00000-000"
            type="text"
            inputMode="numeric"
            placeholder="69300-000"
            maxLength={9}
            minLength={9}
            value={form.cep}
            onChange={(e) => update('cep', formatCEP(e.target.value))}
            required
          />
          <div className="sm:col-span-2">
            <FormField
              label="Logradouro, Nº e Bairro *"
              hint={`${(form.address || '').length}/120`}
              type="text"
              placeholder="Ex: Av. Ville Roy, 1200 - Centro"
              maxLength={120}
              value={form.address}
              onChange={(e) => update('address', formatAddress(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormField
              label="Cidade *"
              type="text"
              placeholder="Boa Vista"
              maxLength={50}
              value={form.city}
              onChange={(e) => update('city', formatCity(e.target.value))}
              required
            />
          </div>
          <FormField
            label="UF *"
            hint="2 letras"
            type="text"
            placeholder="RR"
            maxLength={2}
            minLength={2}
            value={form.state}
            onChange={(e) => update('state', formatUF(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Convênio e Informações de Saúde
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            label="Convênio Odontológico"
            as="select"
            value={form.healthInsurance}
            onChange={(e) => handleInsuranceChange(e.target.value)}
          >
            {INSURANCES.map((ins) => (
              <option key={ins} value={ins}>
                {ins}
              </option>
            ))}
          </FormField>

          <FormField
            label="Nº da Carteirinha do Convênio"
            hint={form.healthInsurance === 'Particular' ? 'Não aplicável' : 'Até 16 dígitos'}
            type="text"
            inputMode="numeric"
            placeholder={
              form.healthInsurance === 'Particular'
                ? 'Atendimento Particular'
                : '0000 0000 0000 0000'
            }
            maxLength={19}
            disabled={form.healthInsurance === 'Particular'}
            value={form.insuranceNumber}
            onChange={(e) => update('insuranceNumber', formatInsuranceCard(e.target.value))}
          />
        </div>

        <label className="block">
          <span className="flex items-center justify-between text-xs font-semibold text-amber-800 mb-1.5">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Alergias ou Restrições Medicamentosas
            </span>
            <span className="text-[11px] font-normal text-slate-400">
              {(form.allergies || '').length}/150
            </span>
          </span>
          <input
            type="text"
            maxLength={150}
            placeholder="Ex: Dipirona, Penicilina, Látex ou Nenhuma"
            value={form.allergies}
            onChange={(e) => update('allergies', formatTextLimit(e.target.value, 150))}
            className="w-full rounded-lg border border-amber-300 bg-amber-50/30 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}

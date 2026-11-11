import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { OdontogramView } from '../components/OdontogramView';
import { useAudio } from '../context/AudioContext';

export const OdontogramaPage = () => {
  const navigate = useNavigate();
  const { playSuccess } = useAudio();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [odontogram, setOdontogram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingMessage, setSavingMessage] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        setPatients(res.patients || []);
        if (res.patients?.length > 0) {
          setSelectedPatientId(res.patients[0]._id);
        }
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      }
    };
    fetchPatients();
  }, []);

  const fetchOdontogram = async (patientId) => {
    if (!patientId) return;
    try {
      setLoading(true);
      const res = await api.get(`/odontogram/patient/${patientId}`);
      setOdontogram(res.odontogram);
    } catch (err) {
      console.error('Erro ao buscar odontograma:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      fetchOdontogram(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleUpdateTooth = async (toothNumber, toothData) => {
    try {
      const res = await api.put(
        `/odontogram/patient/${selectedPatientId}/tooth/${toothNumber}`,
        toothData
      );
      setOdontogram(res.odontogram);
      setSavingMessage(`Dente #${toothNumber} salvo.`);
      setTimeout(() => setSavingMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Erro ao atualizar dente');
    }
  };

  const handleGenerateBudget = async () => {
    try {
      const res = await api.post(`/odontogram/patient/${selectedPatientId}/generate-budget`);
      playSuccess();
      alert(`Orçamento gerado com sucesso! Total: R$ ${res.treatmentPlan.totalAmount.toFixed(2)}`);
      navigate('/orcamentos');
    } catch (err) {
      alert(err.message || 'Erro ao gerar orçamento.');
    }
  };

  const currentPatient = patients.find((p) => p._id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-xl bg-chess-darker border border-chess-border text-chess-green">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Odontograma Clínico Digital</h3>
            <p className="text-xs text-chess-gray">
              Mapeamento anatômico de superfícies dentárias e procedimentos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-chess-gray uppercase hidden sm:inline">
            Paciente:
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-chess-darker border border-chess-border rounded-xl px-4 py-2 text-sm text-white font-bold focus:outline-none focus:border-chess-green cursor-pointer w-full md:w-64"
          >
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.cpf})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentPatient && (
        <div className="bg-chess-darker border border-chess-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-chess-gray font-semibold">Nome: </span>
              <strong className="text-white text-sm">{currentPatient.name}</strong>
            </div>
            <div>
              <span className="text-chess-gray font-semibold">Plano: </span>
              <span className="text-chess-gold font-bold">
                {currentPatient.healthInsurance?.planName || 'Particular'}
              </span>
            </div>
            <div>
              <span className="text-chess-gray font-semibold">Saúde Bucal: </span>
              <span className="text-chess-green font-bold">
                {currentPatient.eloScore || 92}%
              </span>
            </div>
          </div>

          {currentPatient.allergies?.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-chess-red/15 border border-chess-red/30 text-chess-red font-bold">
              <span>Alergias: {currentPatient.allergies.join(', ')}</span>
            </div>
          )}

          {savingMessage && (
            <div className="text-chess-green font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{savingMessage}</span>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-chess-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <OdontogramView
          teeth={odontogram?.teeth || []}
          onUpdateTooth={handleUpdateTooth}
          onGenerateBudget={handleGenerateBudget}
          healthScore={odontogram?.generalHealthScore || 90}
        />
      )}
    </div>
  );
};

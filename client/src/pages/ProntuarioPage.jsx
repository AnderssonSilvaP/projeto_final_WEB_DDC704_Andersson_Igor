import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Heart,
  Pill,
  Award,
  Plus,
  Clock,
  Printer,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { useAudio } from '../context/AudioContext';

export const ProntuarioPage = () => {
  const { playMove, playCapture, playBrilliant } = useAudio();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [record, setRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('anamnese'); // 'anamnese' | 'evolucao' | 'receitas' | 'atestados' | 'radiografias'
  const [loading, setLoading] = useState(true);

  // Modais de Criação
  const [evolutionModal, setEvolutionModal] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [certificateModal, setCertificateModal] = useState(false);
  const [radiographModal, setRadiographModal] = useState(false);

  // Formulários de Novo Registro
  const [newEvolution, setNewEvolution] = useState({
    procedureDescription: '',
    teethInvolved: '',
    anesthesiaUsed: '',
    patientEvolutionState: 'Normal',
    nextStep: '',
  });

  const [newPrescription, setNewPrescription] = useState({
    medName: 'Amoxicilina 500mg',
    dosage: '1 cápsula',
    frequency: 'a cada 8 horas',
    duration: 'por 7 dias',
    instructions: 'Ingerir com água após as refeições.',
    generalInstructions: 'Manter repouso moderado e higiene com escova macia.',
  });

  const [newCertificate, setNewCertificate] = useState({
    daysOff: 1,
    cidCode: 'K02.1',
    cidDescription: 'Cárie da dentina / Intervenção restauradora cirúrgica',
    period: 'Repouso domiciliar',
  });

  const [newRadio, setNewRadio] = useState({
    title: 'Radiografia Periapical de Controle',
    type: 'periapical',
    findings: 'Sem lesão periapical visível. Crista óssea preservada.',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
  });

  // Carregar lista de pacientes
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

  const fetchRecord = async (patientId) => {
    if (!patientId) return;
    try {
      setLoading(true);
      const res = await api.get(`/medical-records/patient/${patientId}`);
      setRecord(res.medicalRecord);
    } catch (err) {
      console.error('Erro ao buscar prontuário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      fetchRecord(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Salvar Anamnese
  const handleUpdateAnamnese = async (updatedAnamnese) => {
    try {
      playCapture();
      const res = await api.put(`/medical-records/patient/${selectedPatientId}/anamnese`, updatedAnamnese);
      setRecord((prev) => ({ ...prev, anamnese: res.anamnese }));
      alert('Anamnese atualizada com sucesso!');
    } catch (err) {
      alert(err.message || 'Erro ao atualizar anamnese');
    }
  };

  // Adicionar Evolução
  const handleAddEvolution = async (e) => {
    e.preventDefault();
    try {
      playBrilliant();
      const teethArr = newEvolution.teethInvolved
        ? newEvolution.teethInvolved.split(',').map((t) => Number(t.trim()))
        : [];
      await api.post(`/medical-records/patient/${selectedPatientId}/evolutions`, {
        ...newEvolution,
        teethInvolved: teethArr,
      });
      setEvolutionModal(false);
      setNewEvolution({ procedureDescription: '', teethInvolved: '', anesthesiaUsed: '', patientEvolutionState: 'Normal', nextStep: '' });
      fetchRecord(selectedPatientId);
    } catch (err) {
      alert(err.message || 'Erro ao salvar evolução');
    }
  };

  // Adicionar Receita
  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      playBrilliant();
      await api.post(`/medical-records/patient/${selectedPatientId}/prescriptions`, {
        medications: [
          {
            name: newPrescription.medName,
            dosage: newPrescription.dosage,
            frequency: newPrescription.frequency,
            duration: newPrescription.duration,
            instructions: newPrescription.instructions,
          },
        ],
        generalInstructions: newPrescription.generalInstructions,
      });
      setPrescriptionModal(false);
      fetchRecord(selectedPatientId);
    } catch (err) {
      alert(err.message || 'Erro ao emitir receita');
    }
  };

  // Adicionar Atestado
  const handleAddCertificate = async (e) => {
    e.preventDefault();
    try {
      playBrilliant();
      await api.post(`/medical-records/patient/${selectedPatientId}/certificates`, newCertificate);
      setCertificateModal(false);
      fetchRecord(selectedPatientId);
    } catch (err) {
      alert(err.message || 'Erro ao emitir atestado');
    }
  };

  // Adicionar Radiografia
  const handleAddRadiograph = async (e) => {
    e.preventDefault();
    try {
      playBrilliant();
      await api.post(`/medical-records/patient/${selectedPatientId}/radiographs`, newRadio);
      setRadiographModal(false);
      fetchRecord(selectedPatientId);
    } catch (err) {
      alert(err.message || 'Erro ao anexar exame');
    }
  };

  const currentPatient = patients.find((p) => p._id === selectedPatientId);

  return (
    <div className="space-y-6">
      {/* Top Patient Selector */}
      <div className="bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-chess-darker border border-chess-border text-chess-gold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Prontuário Eletrônico do Paciente (PEP)</h3>
            <p className="text-xs text-chess-gray">
              Histórico médico, anamnese, evoluções clínicas, receituário e atestados.
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

      {/* Alerta Médico Crítico do Paciente */}
      {record?.anamnese && (
        <div className="bg-chess-darker border border-chess-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {record.anamnese.hypertension && (
              <span className="px-3 py-1 rounded-lg bg-chess-red/15 border border-chess-red/40 text-chess-red font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> Hipertenso
              </span>
            )}
            {record.anamnese.diabetes && (
              <span className="px-3 py-1 rounded-lg bg-chess-gold/15 border border-chess-gold/40 text-chess-gold font-bold">
                Diabético
              </span>
            )}
            {record.anamnese.allergiesDetails && record.anamnese.allergiesDetails !== 'Nenhuma' && (
              <span className="px-3 py-1 rounded-lg bg-chess-red/20 border border-chess-red text-chess-red font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Alergia: {record.anamnese.allergiesDetails}
              </span>
            )}
            {record.anamnese.isPregnant && (
              <span className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500 text-purple-400 font-bold">
                Gestante
              </span>
            )}
          </div>

          <div className="text-xs text-chess-gray">
            Queixa: <span className="text-white font-medium">{record.anamnese.mainComplaint || 'Não informada'}</span>
          </div>
        </div>
      )}

      {/* Tabs de Navegação no PEP */}
      <div className="flex items-center gap-2 border-b border-chess-border pb-2 overflow-x-auto">
        {[
          { id: 'anamnese', label: 'Anamnese Médica' },
          { id: 'evolucao', label: 'Evoluções Clínicas' },
          { id: 'receitas', label: 'Receituário Digital' },
          { id: 'atestados', label: 'Atestados' },
          { id: 'radiografias', label: 'Exames & Radiografias' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { playMove(); setActiveTab(tab.id); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-chess-green text-white shadow-chess-btn'
                : 'bg-chess-panel text-chess-gray hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Anamnese Médica */}
      {activeTab === 'anamnese' && record && (
        <div className="bg-chess-panel border border-chess-border rounded-2xl p-6 shadow-chess-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-chess-border">
            <h4 className="text-base font-extrabold text-white">Ficha de Anamnese e Histórico Médico</h4>
            <span className="text-xs text-chess-gray">Atualizado pela equipe clínica</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                  Queixa Principal:
                </label>
                <input
                  type="text"
                  defaultValue={record.anamnese.mainComplaint}
                  onBlur={(e) => handleUpdateAnamnese({ mainComplaint: e.target.value })}
                  className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                  Alergias Medicamentosas / Látex:
                </label>
                <input
                  type="text"
                  defaultValue={record.anamnese.allergiesDetails}
                  onBlur={(e) => handleUpdateAnamnese({ allergiesDetails: e.target.value })}
                  className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-chess-red font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                  Medicamentos em Uso Contínuo:
                </label>
                <input
                  type="text"
                  defaultValue={record.anamnese.medicationsInUse}
                  onBlur={(e) => handleUpdateAnamnese({ medicationsInUse: e.target.value })}
                  className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-4 bg-chess-darker p-4 rounded-xl border border-chess-border">
              <span className="text-xs font-bold uppercase text-chess-gold block mb-2">
                Condições Sistêmicas Relevantes:
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { key: 'hypertension', label: 'Hipertensão Arterial' },
                  { key: 'diabetes', label: 'Diabetes Mellitus' },
                  { key: 'cardiacDisease', label: 'Cardiopatia' },
                  { key: 'bleedingDisorder', label: 'Distúrbio de Coagulação' },
                  { key: 'anestheticReaction', label: 'Reação a Anestésico' },
                  { key: 'bruxism', label: 'Bruxismo / DTM' },
                  { key: 'isSmoker', label: 'Fumante / Tabagista' },
                  { key: 'isPregnant', label: 'Gestante' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer text-chess-light">
                    <input
                      type="checkbox"
                      defaultChecked={record.anamnese[item.key]}
                      onChange={(e) => handleUpdateAnamnese({ [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-chess-green focus:ring-0 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Evoluções Clínicas */}
      {activeTab === 'evolucao' && record && (
        <div className="bg-chess-panel border border-chess-border rounded-2xl p-6 shadow-chess-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-chess-border">
            <h4 className="text-base font-extrabold text-white">Evolução Clínica Diária</h4>
            <button
              onClick={() => { playMove(); setEvolutionModal(true); }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold chess-btn-green flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Evolução</span>
            </button>
          </div>

          <div className="space-y-3">
            {record.clinicalEvolutions?.map((ev, idx) => (
              <div key={idx} className="p-4 bg-chess-darker border border-chess-border rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-chess-green">Dr(a). {ev.dentistName}</span>
                    <span className="text-chess-border">•</span>
                    <span className="text-chess-gray">
                      {new Date(ev.date).toLocaleDateString('pt-BR')} às {new Date(ev.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chess-panel text-chess-gold">
                    {ev.patientEvolutionState}
                  </span>
                </div>

                <p className="text-sm text-white font-medium">{ev.procedureDescription}</p>

                {ev.teethInvolved?.length > 0 && (
                  <div className="text-xs text-chess-gray">
                    Dentes envolvidos: <span className="font-mono font-bold text-white">{ev.teethInvolved.join(', ')}</span>
                  </div>
                )}
                {ev.anesthesiaUsed && (
                  <div className="text-xs text-chess-gray">
                    Anestésico utilizado: <span className="text-chess-light">{ev.anesthesiaUsed}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Receituário Digital */}
      {activeTab === 'receitas' && record && (
        <div className="bg-chess-panel border border-chess-border rounded-2xl p-6 shadow-chess-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-chess-border">
            <div>
              <h4 className="text-base font-extrabold text-white">Receituário Digital Odontológico</h4>
              <p className="text-xs text-chess-gray">Prescrições emitidas e assinadas digitalmente</p>
            </div>
            <button
              onClick={() => { playMove(); setPrescriptionModal(true); }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold chess-btn-green flex items-center gap-1.5"
            >
              <Pill className="w-4 h-4" />
              <span>Emitir Receita</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.prescriptions?.map((p, idx) => (
              <div key={idx} className="p-4 bg-chess-darker border border-chess-border rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-chess-border">
                  <span className="text-chess-gray font-mono">
                    {new Date(p.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-chess-green font-bold">Dr(a). {p.dentistName}</span>
                </div>

                <div className="space-y-2">
                  {p.medications?.map((m, mIdx) => (
                    <div key={mIdx} className="text-xs">
                      <div className="text-sm font-bold text-white">{m.name}</div>
                      <div className="text-chess-gold font-mono">{m.dosage} - {m.frequency} ({m.duration})</div>
                      <div className="text-chess-gray italic">{m.instructions}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-chess-border flex items-center justify-between">
                  <span className="text-[11px] text-chess-gray">{p.generalInstructions}</span>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded bg-chess-panel text-chess-gray hover:text-white"
                    title="Imprimir receita"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Atestados */}
      {activeTab === 'atestados' && record && (
        <div className="bg-chess-panel border border-chess-border rounded-2xl p-6 shadow-chess-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-chess-border">
            <h4 className="text-base font-extrabold text-white">Atestados Odontológicos</h4>
            <button
              onClick={() => { playMove(); setCertificateModal(true); }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold chess-btn-green flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Atestado</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.certificates?.map((c, idx) => (
              <div key={idx} className="p-4 bg-chess-darker border border-chess-border rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-chess-border">
                  <span className="font-mono text-chess-gold">CID-10: {c.cidCode}</span>
                  <span className="text-chess-gray">{new Date(c.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {c.daysOff} dia(s) de repouso odontológico
                </div>
                <div className="text-xs text-chess-gray">{c.cidDescription}</div>
                <div className="text-xs text-chess-green font-bold">Assinado: Dr(a). {c.dentistName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Radiografias */}
      {activeTab === 'radiografias' && record && (
        <div className="bg-chess-panel border border-chess-border rounded-2xl p-6 shadow-chess-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-chess-border">
            <h4 className="text-base font-extrabold text-white">Galeria de Exames & Radiografias</h4>
            <button
              onClick={() => { playMove(); setRadiographModal(true); }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold chess-btn-green flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Anexar Exame</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {record.radiographs?.map((r, idx) => (
              <div key={idx} className="bg-chess-darker border border-chess-border rounded-xl overflow-hidden">
                <img src={r.url} alt={r.title} className="w-full h-40 object-cover" />
                <div className="p-3 space-y-1">
                  <div className="text-sm font-bold text-white truncate">{r.title}</div>
                  <div className="text-[11px] text-chess-gray capitalize">{r.type} • {new Date(r.date).toLocaleDateString('pt-BR')}</div>
                  <div className="text-xs text-chess-light mt-1">{r.findings}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Nova Evolução */}
      <Modal
        isOpen={evolutionModal}
        onClose={() => setEvolutionModal(false)}
        title="Nova Evolução Clínica"
        subtitle="Registro em prontuário eletrônico"
      >
        <form onSubmit={handleAddEvolution} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
              Descrição do Procedimento Realizado:
            </label>
            <textarea
              rows="3"
              required
              value={newEvolution.procedureDescription}
              onChange={(e) => setNewEvolution({ ...newEvolution, procedureDescription: e.target.value })}
              placeholder="Ex: Realizada profilaxia e restauração estética dente 16..."
              className="w-full bg-chess-darker border border-chess-border rounded-lg p-2.5 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                Dentes Envolvidos (ex: 16, 26):
              </label>
              <input
                type="text"
                value={newEvolution.teethInvolved}
                onChange={(e) => setNewEvolution({ ...newEvolution, teethInvolved: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">
                Anestésico Utilizado:
              </label>
              <input
                type="text"
                value={newEvolution.anesthesiaUsed}
                onChange={(e) => setNewEvolution({ ...newEvolution, anesthesiaUsed: e.target.value })}
                placeholder="Ex: Articaína 4% 1 tubete"
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Gravar Evolução no Prontuário
          </button>
        </form>
      </Modal>

      {/* Modal Emitir Receita */}
      <Modal
        isOpen={prescriptionModal}
        onClose={() => setPrescriptionModal(false)}
        title="Emitir Receituário Odontológico"
        subtitle="Prescrição de medicamentos"
      >
        <form onSubmit={handleAddPrescription} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Medicamento:</label>
              <input
                type="text"
                required
                value={newPrescription.medName}
                onChange={(e) => setNewPrescription({ ...newPrescription, medName: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Dosagem:</label>
              <input
                type="text"
                required
                value={newPrescription.dosage}
                onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Frequência:</label>
              <input
                type="text"
                required
                value={newPrescription.frequency}
                onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Duração:</label>
              <input
                type="text"
                required
                value={newPrescription.duration}
                onChange={(e) => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Emitir Receita
          </button>
        </form>
      </Modal>

      {/* Modal Emitir Atestado */}
      <Modal
        isOpen={certificateModal}
        onClose={() => setCertificateModal(false)}
        title="Emitir Atestado Odontológico"
        subtitle="Repouso e CID-10"
      >
        <form onSubmit={handleAddCertificate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Dias de Repouso:</label>
              <input
                type="number"
                min="1"
                max="15"
                required
                value={newCertificate.daysOff}
                onChange={(e) => setNewCertificate({ ...newCertificate, daysOff: Number(e.target.value) })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Código CID-10:</label>
              <input
                type="text"
                required
                value={newCertificate.cidCode}
                onChange={(e) => setNewCertificate({ ...newCertificate, cidCode: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Motivo / Descrição:</label>
            <input
              type="text"
              required
              value={newCertificate.cidDescription}
              onChange={(e) => setNewCertificate({ ...newCertificate, cidDescription: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Emitir Atestado
          </button>
        </form>
      </Modal>

      {/* Modal Radiografia */}
      <Modal
        isOpen={radiographModal}
        onClose={() => setRadiographModal(false)}
        title="Anexar Exame Radiológico"
        subtitle="Upload e laudo radiográfico"
      >
        <form onSubmit={handleAddRadiograph} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Título do Exame:</label>
            <input
              type="text"
              required
              value={newRadio.title}
              onChange={(e) => setNewRadio({ ...newRadio, title: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Tipo:</label>
              <select
                value={newRadio.type}
                onChange={(e) => setNewRadio({ ...newRadio, type: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="panoramica">Panorâmica</option>
                <option value="periapical">Periapical</option>
                <option value="interproximal">Bite-wing</option>
                <option value="tomografia">Tomografia Cone Beam</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1">URL da Imagem:</label>
              <input
                type="text"
                value={newRadio.url}
                onChange={(e) => setNewRadio({ ...newRadio, url: e.target.value })}
                className="w-full bg-chess-darker border border-chess-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chess-gray uppercase mb-1">Achados / Laudo:</label>
            <textarea
              rows="2"
              value={newRadio.findings}
              onChange={(e) => setNewRadio({ ...newRadio, findings: e.target.value })}
              className="w-full bg-chess-darker border border-chess-border rounded-lg p-2 text-sm text-white"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black chess-btn-green">
            Salvar Exame no Prontuário
          </button>
        </form>
      </Modal>
    </div>
  );
};

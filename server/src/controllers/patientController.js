const Patient = require('../models/Patient');
const Odontogram = require('../models/Odontogram');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { pick, escapeRegex, checkId, sendNotFound } = require('./shared');

const NOT_FOUND = 'Paciente não encontrado';
const PATIENT_FIELDS = [
  'name', 'cpf', 'rg', 'birthDate', 'gender', 'phone', 'email', 'address', 'healthInsurance',
  'emergencyContact', 'bloodType', 'allergies', 'chronicConditions', 'notes',
];
const MINUTES_PER_QUEUE_POSITION = 12;

const toList = (value) => (Array.isArray(value) ? value.map(String) : []);

const buildAnamnese = ({ complaint, allergies, chronicConditions, medicationsInUse }) => ({
  mainComplaint: complaint,
  allergiesDetails: allergies.length > 0 ? allergies.join(', ') : 'Nenhuma alergia conhecida',
  medicationsInUse,
  hypertension: chronicConditions.some((c) => c.includes('Hipertensão')),
  diabetes: chronicConditions.some((c) => c.includes('Diabetes')),
  cardiacDisease: chronicConditions.some((c) => c.includes('Cardiopatia')),
  bleedingDisorder: chronicConditions.some((c) => c.includes('Coagulopatia') || c.includes('Coagulação')),
});

const getPatients = async (req, res, next) => {
  try {
    const { search, insurance } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const query = { active: true };

    if (search) {
      const pattern = { $regex: escapeRegex(search), $options: 'i' };
      query.$or = [{ name: pattern }, { cpf: pattern }, { phone: pattern }];
    }

    if (insurance && insurance !== 'todos') {
      query['healthInsurance.planName'] = String(insurance);
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), patients });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const patient = await Patient.findById(req.params.id);
    if (!patient) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// Creating a patient also opens their odontogram and medical record.
const createPatient = async (req, res, next) => {
  try {
    const data = pick(req.body, PATIENT_FIELDS);

    if (data.cpf && (await Patient.exists({ cpf: String(data.cpf) }))) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um paciente cadastrado com este CPF.',
      });
    }

    const patient = await Patient.create(data);

    await Odontogram.create({
      patient: patient._id,
      archType: 'adulto',
      teeth: Odontogram.buildAdultTeeth(),
      generalHealthScore: 100,
    });

    const conditions = toList(patient.chronicConditions);
    await MedicalRecord.create({
      patient: patient._id,
      anamnese: {
        mainComplaint: patient.notes || 'Consulta inicial de avaliação odontológica',
        hypertension: conditions.some((c) => c.includes('Hipertensão')),
        diabetes: conditions.some((c) => c.includes('Diabetes')),
        allergiesDetails: patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Nenhuma alergia conhecida',
      },
      clinicalEvolutions: [
        {
          dentistName: req.user.name,
          procedureDescription: 'Cadastro inicial e abertura de prontuário clínico.',
          patientEvolutionState: 'Normal',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Paciente cadastrado com prontuário e odontograma inicializados.',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const patient = await Patient.findByIdAndUpdate(req.params.id, pick(req.body, PATIENT_FIELDS), {
      new: true,
      runValidators: true,
    });
    if (!patient) return sendNotFound(res, NOT_FOUND);

    res.json({
      success: true,
      message: 'Dados do paciente atualizados com sucesso.',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete: the patient is deactivated so clinical history is preserved.
const deletePatient = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const patient = await Patient.findByIdAndUpdate(req.params.id, { active: false });
    if (!patient) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, message: 'Paciente inativado com sucesso.' });
  } catch (error) {
    next(error);
  }
};

const CHAIRS = [
  { number: 1, category: 'cirurgia', terms: ['implante', 'cirurgia', 'siso'] },
  { number: 2, category: 'ortodontia', terms: ['ortodont', 'aparelho', 'estética'] },
];

const pickChair = (procedure) => {
  const text = procedure.toLowerCase();
  return CHAIRS.find((chair) => chair.terms.some((t) => text.includes(t))) || { number: 3, category: 'clinica_geral' };
};

// Public endpoint used by the virtual reception kiosk.
const interactiveCheckin = async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = body.name ? String(body.name) : '';
    const phone = body.phone ? String(body.phone) : '';
    const cpf = body.cpf ? String(body.cpf) : '';
    const complaint = body.complaint ? String(body.complaint) : '';
    const medicationsInUse = body.medicationsInUse ? String(body.medicationsInUse) : 'Nenhum';
    const procedure = body.procedure ? String(body.procedure) : 'Avaliação Odontológica Geral';
    const allergies = toList(body.allergies);
    const chronicConditions = toList(body.chronicConditions);

    const safeCpf = cpf || `TEMP-${Date.now().toString().slice(-6)}`;
    const lookup = [{ cpf: safeCpf }];
    if (phone) lookup.push({ phone });
    let patient = await Patient.findOne({ $or: lookup });

    const anamnese = buildAnamnese({ complaint, allergies, chronicConditions, medicationsInUse });

    if (!patient) {
      patient = await Patient.create({
        name: name || 'Paciente Recepção Virtual',
        cpf: safeCpf,
        birthDate: new Date('2000-01-01'),
        phone: phone || '(95) 99000-0000',
        allergies,
        chronicConditions,
        notes: complaint,
        eloScore: 88,
        chessRank: 'Paciente Novo',
      });

      await MedicalRecord.create({ patient: patient._id, anamnese });
      await Odontogram.create({
        patient: patient._id,
        archType: 'adulto',
        teeth: Odontogram.buildAdultTeeth(),
        generalHealthScore: 90,
      });
    } else {
      if (allergies.length > 0) patient.allergies = [...new Set([...patient.allergies, ...allergies])];
      if (chronicConditions.length > 0) {
        patient.chronicConditions = [...new Set([...patient.chronicConditions, ...chronicConditions])];
      }
      patient.notes = complaint || patient.notes;
      await patient.save();

      const $set = Object.fromEntries(
        Object.entries({ ...anamnese, mainComplaint: complaint || 'Revisão odontológica' }).map(([k, v]) => [
          `anamnese.${k}`,
          v,
        ])
      );
      await MedicalRecord.findOneAndUpdate({ patient: patient._id }, { $set }, { upsert: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const dentist = await User.findOne({ role: { $in: ['admin', 'dentista'] }, active: true });
    const chair = pickChair(procedure);

    const now = new Date();
    const timeSlot = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const appointment = await Appointment.create({
      patient: patient._id,
      dentist: dentist ? dentist._id : undefined,
      chairNumber: chair.number,
      date: today,
      timeSlot,
      durationMinutes: 30,
      procedure,
      category: chair.category,
      status: 'aguardando',
      waitingRoomArrivedAt: now,
      price: 150,
      paid: false,
      notes: `Triagem virtual: ${complaint} | Medicamentos: ${medicationsInUse}`,
    });

    const queuePosition = await Appointment.countDocuments({ date: today, status: 'aguardando' });

    res.status(201).json({
      success: true,
      message: `Check-in confirmado! Você é o número ${queuePosition} na fila.`,
      patient,
      appointment,
      queuePosition,
      estimatedWaitMinutes: queuePosition * MINUTES_PER_QUEUE_POSITION,
      chairNumber: chair.number,
    });
  } catch (error) {
    next(error);
  }
};

const ALLERGY_KEYWORDS = [
  { key: 'Penicilina', terms: ['penicilina', 'amoxicilina', 'benzetacil'] },
  { key: 'Dipirona', terms: ['dipirona', 'novalgina', 'lisador'] },
  { key: 'Anti-inflamatórios (AINEs)', terms: ['anti-inflamatório', 'ibuprofeno', 'cetoprofeno', 'nimesulida', 'aspirina', 'aines'] },
  { key: 'Anestésico Odontológico', terms: ['anestésico', 'anestesia', 'lidocaína', 'mepivacaína'] },
  { key: 'Látex (Luvas)', terms: ['látex', 'latex', 'luva'] },
];

const CONDITION_KEYWORDS = [
  { key: 'Hipertensão (Pressão Alta)', terms: ['pressão alta', 'hipertensão', 'hipertenso', 'hipertensa'] },
  { key: 'Diabetes Mellitus', terms: ['diabetes', 'diabético', 'diabética', 'glicose'] },
  { key: 'Cardiopatia', terms: ['coração', 'cardíaco', 'cardiopatia', 'infarto', 'marca-passo', 'angina'] },
  { key: 'Dificuldade de Coagulação', terms: ['coagulação', 'sangramento', 'hemofilia', 'tomo anticoagulante'] },
  { key: 'Fumante / Tabagista', terms: ['fumo', 'fumante', 'cigarro', 'tabagismo', 'vape'] },
];

const COMPLAINT_KEYWORDS = [
  { terms: ['dor', 'dente doendo', 'sensibilidade'], complaint: 'Dor Aguda / Sensibilidade Dentária' },
  { terms: ['implante', 'carga imediata'], complaint: 'Avaliação para Implante Dentário' },
  { terms: ['aparelho', 'alinhador', 'invisalign'], complaint: 'Ortodontia / Alinhadores Invisíveis' },
  { terms: ['siso', 'extração', 'arrancar'], complaint: 'Cirurgia de Sisos Inclusos' },
  { terms: ['limpeza', 'profilaxia', 'tártaro'], complaint: 'Limpeza e Profilaxia Preventiva' },
  { terms: ['canal', 'endodontia'], complaint: 'Tratamento de Canal em Sessão Única' },
  { terms: ['lente', 'faceta', 'clareamento', 'estética'], complaint: 'Estética Dental e Facetas E-Max' },
];

const URGENCY_TERMS = ['muita dor', 'dor insuportável', 'inchado', 'inchaço', 'sangrando', 'quebrou', 'trauma'];

const KNOWLEDGE_BASE = [
  {
    terms: ['horário', 'horario', 'horas', 'funciona'],
    reply: 'Nosso atendimento regular funciona de Segunda a Sexta das 07:30 às 19:30, e aos Sábados das 08:00 às 13:00. Também temos plantão de emergência 24 horas pelo telefone (95) 99123-4567. Deseja fazer seu check-in para atendimento hoje?',
    suggestions: ['Fazer check-in para hoje', 'Ver localização', 'Falar com dentista'],
  },
  {
    terms: ['onde', 'endereço', 'endereco', 'localização'],
    reply: 'Estamos localizados na Av. Ene Garcez, 1420 - Centro, Boa Vista - RR (em frente à Praça das Águas). Temos estacionamento privativo gratuito para pacientes!',
    suggestions: ['Como chegar', 'Horário de atendimento', 'Fazer meu check-in'],
  },
  {
    terms: ['preço', 'preco', 'quanto custa', 'valor'],
    reply: 'Os valores exatos dependem da avaliação clínica e do elemento dentário analisado. No entanto, nossas consultas com check-up digital iniciam em R$ 150,00 e aceitamos parcelamento em até 12x sem juros no cartão ou 10% de desconto via Pix. Gostaria de iniciar sua triagem agora para ser atendido hoje?',
    suggestions: ['Sim, fazer check-in', 'Aceitam convênio?', 'Conhecer os médicos'],
  },
  {
    terms: ['convênio', 'convenio', 'plano'],
    reply: 'Trabalhamos com atendimentos particulares e temos parcerias com Uniodonto, Bradesco Dental, Amil Dental e SulAmérica. Também emitimos recibos e laudos completos com CID-10 para reembolso junto a qualquer operadora!',
    suggestions: ['Fazer check-in com convênio', 'Ver especialidades', 'Valores particulares'],
  },
  {
    terms: ['roberto', 'diretor'],
    reply: 'O Dr. Roberto Silveira (CRO-RR 4521) é nosso Diretor Clínico e especialista em Implantodontia e Cirurgia Bucomaxilofacial pela USP, pioneiro em implantes de carga imediata e cirurgia guiada por computador sem cortes. Ele atende no Consultório 1.',
    suggestions: ['Agendar com Dr. Roberto', 'Ver outros médicos', 'Fazer check-in'],
  },
  {
    terms: ['mariana', 'invisalign'],
    reply: 'A Dra. Mariana Costa (CRO-RR 5892) é nossa especialista em Ortodontia Contemporânea e Invisalign Top Doctor Platinum, referência em alinhadores invisíveis e estética do sorriso no Consultório 2.',
    suggestions: ['Avaliar alinhadores', 'Ver outros médicos', 'Fazer check-in'],
  },
  {
    terms: ['carlos', 'canal'],
    reply: 'O Dr. Carlos Fontes (CRO-RR 3910) é especialista em Endodontia Microscópica. Ele realiza tratamentos de canal sem dor com microscópio cirúrgico Carl Zeiss, na maioria das vezes em uma única sessão!',
    suggestions: ['Tratamento de canal', 'Estou com dor de dente', 'Fazer check-in'],
  },
  {
    terms: ['beatriz', 'criança', 'infantil'],
    reply: 'A Dra. Beatriz Mendes (CRO-RR 6204) é nossa Odontopediatra e Periodontista, especialista em atendimento infantil humanizado e acolhimento de pacientes com medo de dentista, com opção de sedação com óxido nitroso no Consultório 3.',
    suggestions: ['Atendimento infantil', 'Sedação consciente', 'Fazer check-in'],
  },
  {
    terms: ['tomografia', 'cone beam', 'raio x'],
    reply: 'Nosso Centro de Imagem possui Tomografia Computadorizada Cone Beam 3D e Radiografia Panorâmica Digital HD no próprio local! Você realiza o exame e recebe o corte 3D em minutos sem precisar se deslocar pela cidade.',
    suggestions: ['Preciso de tomografia', 'Fazer check-in', 'Conhecer cirurgias'],
  },
];

const NAME_PATTERN = /(?:meu nome é|me chamo|sou o|sou a|aqui é o|aqui é a|nome:?)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?)/i;
const PHONE_PATTERN = /(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/;
const MEDICATION_PATTERN = /(?:tomo|uso|medicamento|remédio|remedio|medicação):?\s+([A-Za-z0-9\s,]{3,40})/i;

const includesAny = (text, terms) => terms.some((t) => text.includes(t));

const extractName = (message, cleanMsg, history, current) => {
  if (current) return current;

  const match = message.match(NAME_PATTERN);
  if (match) {
    const candidate = match[1].trim().replace(/\b(e|que|gostaria|estou|tenho|sou|quero|favor|pra)\b.*$/i, '').trim();
    return candidate.length >= 2 ? candidate : null;
  }

  const looksLikeBareName =
    history.length === 1 &&
    message.split(' ').length <= 3 &&
    !includesAny(cleanMsg, ['dor', 'quanto', 'olá']);
  return looksLikeBareName ? message.trim() : null;
};

const collectKeys = (catalog, cleanMsg, current) => {
  const result = [...current];
  catalog.forEach(({ key, terms }) => {
    if (includesAny(cleanMsg, terms) && !result.includes(key)) result.push(key);
  });
  return result;
};

// Next triage question for the conversation, or the final confirmation when data is complete.
const nextTriageStep = (data, cleanMsg) => {
  if (!data.name) {
    return {
      reply: 'Olá! Sou a Sofia, assistente virtual e recepcionista da OdontoCheck. Para começarmos seu atendimento, como posso te chamar?',
      suggestions: ['Meu nome é...', 'Gostaria de tirar uma dúvida', 'Ver os médicos da clínica'],
    };
  }
  if (!data.complaint) {
    return {
      reply: `Prazer em te conhecer, ${data.name}! O que te traz à nossa clínica hoje? Você está com alguma dor, gostaria de fazer uma limpeza, avaliar implantes ou alinhar os dentes?`,
      suggestions: ['Dor de dente / Sensibilidade', 'Limpeza / Profilaxia', 'Implantes dentários', 'Alinhadores invisíveis', 'Cirurgia de siso'],
    };
  }
  if (data.allergies.length === 0 && !cleanMsg.includes('nenhuma')) {
    return {
      reply: `Entendido, ${data.name}! Para sua segurança clínica, você tem alergia a algum medicamento, como Penicilina, Dipirona, Anti-inflamatórios, Anestésicos locais ou Látex?`,
      suggestions: ['Não tenho nenhuma alergia', 'Alergia a Penicilina', 'Alergia a Dipirona', 'Alergia a Anti-inflamatórios', 'Alergia a Anestésico'],
    };
  }
  if (data.chronicConditions.length === 0 && !includesAny(cleanMsg, ['nenhum', 'saudável', 'saudavel'])) {
    return {
      reply: 'Anotado! Sobre sua saúde geral e histórico familiar, possui diagnóstico de Pressão Alta, Diabetes, problemas cardíacos ou dificuldade de cicatrização?',
      suggestions: ['Nenhum histórico relevante', 'Hipertensão (Pressão Alta)', 'Diabetes', 'Problema cardíaco', 'Fumante'],
    };
  }

  const allergiesText = data.allergies.length > 0 ? data.allergies.join(', ') : 'Nenhuma';
  const historyText = data.chronicConditions.length > 0 ? data.chronicConditions.join(', ') : 'Nenhum histórico';
  return {
    reply: `Excelente, ${data.name}! Já organizei sua pré-anamnese completa: \n• Procedimento: ${data.complaint}\n• Alergias: ${allergiesText}\n• Histórico de saúde: ${historyText}\n\nPosso confirmar seu check-in e emitir sua senha oficial para a fila de espera agora?`,
    suggestions: ['Sim, confirmar check-in!', 'Corrigir alguma informação', 'Quanto é o tempo de espera?'],
    readyForCheckin: true,
    avatarEmotion: 'celebrating',
  };
};

// Public endpoint: rule-based virtual assistant that collects pre-anamnese data.
const assistantChat = async (req, res, next) => {
  try {
    const body = req.body || {};
    const message = typeof body.message === 'string' ? body.message : '';
    const context = body.context && typeof body.context === 'object' ? body.context : {};
    const history = Array.isArray(body.history) ? body.history : [];
    const cleanMsg = message.toLowerCase().trim();

    const data = {
      name: context.name || null,
      phone: context.phone || null,
      complaint: context.complaint || null,
      allergies: toList(context.allergies),
      chronicConditions: toList(context.chronicConditions),
      medications: context.medications || null,
      urgencyLevel: context.urgencyLevel || 'normal',
    };

    data.name = extractName(message, cleanMsg, history, data.name);

    const phoneMatch = message.match(PHONE_PATTERN);
    if (phoneMatch && !data.phone) data.phone = phoneMatch[0].trim();

    data.allergies = collectKeys(ALLERGY_KEYWORDS, cleanMsg, data.allergies);
    data.chronicConditions = collectKeys(CONDITION_KEYWORDS, cleanMsg, data.chronicConditions);

    const medMatch = message.match(MEDICATION_PATTERN);
    if (medMatch) data.medications = medMatch[1].trim();

    const isUrgent = includesAny(cleanMsg, URGENCY_TERMS);
    if (isUrgent) data.urgencyLevel = 'alta';

    const detected = COMPLAINT_KEYWORDS.find((c) => includesAny(cleanMsg, c.terms));
    if (detected) data.complaint = data.complaint || detected.complaint;

    let response;
    const knowledge = KNOWLEDGE_BASE.find((entry) => includesAny(cleanMsg, entry.terms));

    if (knowledge) {
      response = { reply: knowledge.reply, suggestions: knowledge.suggestions };
    } else if (isUrgent) {
      const greeting = data.name ? `${data.name}! ` : '';
      response = {
        reply: `Sinto muito pelo seu desconforto, ${greeting}Dor e inchaço agudo são prioridades imediatas aqui na clínica. Não coloque compressa quente nem encoste medicamentos diretamente na gengiva. Recomendo que você faça seu check-in agora mesmo para ser encaminhado ao atendimento de emergência com prioridade alta.`,
        suggestions: ['Confirmar check-in de emergência', 'Ver tempo de espera', 'Ligar no plantão'],
      };
    } else {
      response = nextTriageStep(data, cleanMsg);
    }

    res.json({
      success: true,
      reply: response.reply,
      extractedData: data,
      suggestions: response.suggestions,
      readyForCheckin: Boolean(response.readyForCheckin),
      avatarEmotion: response.avatarEmotion || (isUrgent ? 'empathetic' : 'speaking'),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  interactiveCheckin,
  assistantChat,
};

const Patient = require('../models/Patient');
const Odontogram = require('../models/Odontogram');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Listar pacientes com busca e paginação
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res, next) => {
  try {
    const { search, insurance, page = 1, limit = 50 } = req.query;
    const query = { active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (insurance && insurance !== 'todos') {
      query['healthInsurance.planName'] = insurance;
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter detalhes de 1 paciente
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado' });
    }
    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar novo paciente (inicializa Odontograma e PEP automaticamente)
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res, next) => {
  try {
    const { cpf } = req.body;
    const existing = await Patient.findOne({ cpf });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um paciente cadastrado com este CPF.',
      });
    }

    const patient = await Patient.create(req.body);

    // Inicializa Odontograma vazio (com todos os 32 dentes adultos)
    const adultTeeth = [];
    const quadrants = [
      [18, 17, 16, 15, 14, 13, 12, 11],
      [21, 22, 23, 24, 25, 26, 27, 28],
      [48, 47, 46, 45, 44, 43, 42, 41],
      [31, 32, 33, 34, 35, 36, 37, 38],
    ];

    quadrants.flat().forEach((toothNum) => {
      adultTeeth.push({
        toothNumber: toothNum,
        generalCondition: 'higido',
        surfaces: {
          vestibular: { condition: 'higido' },
          lingual: { condition: 'higido' },
          mesial: { condition: 'higido' },
          distal: { condition: 'higido' },
          oclusal: { condition: 'higido' },
        },
        chessTactics: 'best',
        price: 0,
        status: 'higido',
      });
    });

    await Odontogram.create({
      patient: patient._id,
      archType: 'adulto',
      teeth: adultTeeth,
      generalHealthScore: 100,
      tacticalSummary: {
        cariesCount: 0,
        restorationCount: 0,
        rootCanalCount: 0,
        implantCount: 0,
        missingCount: 0,
      },
    });

    // Inicializa PEP (Prontuário Eletrônico)
    await MedicalRecord.create({
      patient: patient._id,
      anamnese: {
        mainComplaint: req.body.notes || 'Consulta inicial de avaliação odontológica',
        hypertension: req.body.chronicConditions?.includes('Hipertensão') || false,
        diabetes: req.body.chronicConditions?.includes('Diabetes') || false,
        allergiesDetails: req.body.allergies?.join(', ') || 'Nenhuma alergia conhecida',
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

// @desc    Atualizar paciente
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado' });
    }

    res.json({
      success: true,
      message: 'Dados do paciente atualizados com sucesso.',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar paciente (soft delete ou remover se admin)
// @route   DELETE /api/patients/:id
// @access  Private (Admin)
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado' });
    }

    patient.active = false;
    await patient.save();

    res.json({
      success: true,
      message: 'Paciente inativado com sucesso.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in Interativo pela Recepção Virtual (Avatar Sofia)
// @route   POST /api/patients/interactive-checkin
// @access  Public / Private
const interactiveCheckin = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const User = require('../models/User');

    const {
      name,
      phone,
      cpf,
      complaint,
      allergies = [],
      chronicConditions = [],
      medicationsInUse = 'Nenhum',
      procedure = 'Avaliação Odontológica Geral',
    } = req.body;

    // Buscar ou cadastrar paciente
    const safeCpf = cpf || `TEMP-${Date.now().toString().slice(-6)}`;
    let patient = await Patient.findOne({ $or: [{ cpf: safeCpf }, { phone }] });

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

      // Inicializa PEP
      await MedicalRecord.create({
        patient: patient._id,
        anamnese: {
          mainComplaint: complaint,
          allergiesDetails: allergies.length > 0 ? allergies.join(', ') : 'Nenhuma alergia',
          medicationsInUse,
          hypertension: chronicConditions.includes('Hipertensão'),
          diabetes: chronicConditions.includes('Diabetes'),
          cardiacDisease: chronicConditions.includes('Cardiopatia'),
          bleedingDisorder: chronicConditions.includes('Coagulopatia'),
        },
      });

      // Inicializa Odontograma
      const adult = [
        18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
        48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
      ];
      const adultTeeth = adult.map((n) => ({
        toothNumber: n,
        generalCondition: 'higido',
        surfaces: {
          vestibular: { condition: 'higido' },
          lingual: { condition: 'higido' },
          mesial: { condition: 'higido' },
          distal: { condition: 'higido' },
          oclusal: { condition: 'higido' },
        },
        chessTactics: 'best',
        price: 0,
        status: 'higido',
      }));
      await Odontogram.create({
        patient: patient._id,
        archType: 'adulto',
        teeth: adultTeeth,
        generalHealthScore: 90,
      });
    } else {
      // Atualiza dados clínicos do paciente existente
      if (allergies.length > 0) patient.allergies = Array.from(new Set([...patient.allergies, ...allergies]));
      if (chronicConditions.length > 0) patient.chronicConditions = Array.from(new Set([...patient.chronicConditions, ...chronicConditions]));
      patient.notes = complaint || patient.notes;
      await patient.save();

      // Atualiza anamnese no PEP
      await MedicalRecord.findOneAndUpdate(
        { patient: patient._id },
        {
          $set: {
            'anamnese.mainComplaint': complaint || 'Revisão odontológica',
            'anamnese.allergiesDetails': allergies.length > 0 ? allergies.join(', ') : 'Nenhuma',
            'anamnese.medicationsInUse': medicationsInUse,
            'anamnese.hypertension': chronicConditions.includes('Hipertensão'),
            'anamnese.diabetes': chronicConditions.includes('Diabetes'),
            'anamnese.cardiacDisease': chronicConditions.includes('Cardiopatia'),
            'anamnese.bleedingDisorder': chronicConditions.includes('Coagulopatia'),
          },
        },
        { upsert: true }
      );
    }

    // Identificar dentista disponível para a consulta de hoje
    const today = new Date().toISOString().split('T')[0];
    const dentist = await User.findOne({ role: { $in: ['admin', 'dentista'] }, active: true });

    // Determina cadeira com base no procedimento
    let chairNumber = 3; // Cadeira 3 padrão (Clínica Geral)
    if (procedure.toLowerCase().includes('implante') || procedure.toLowerCase().includes('cirurgia') || procedure.toLowerCase().includes('siso')) {
      chairNumber = 1;
    } else if (procedure.toLowerCase().includes('ortodont') || procedure.toLowerCase().includes('aparelho') || procedure.toLowerCase().includes('estética')) {
      chairNumber = 2;
    }

    const now = new Date();
    const timeSlot = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Cria agendamento / check-in na sala de espera
    const appointment = await Appointment.create({
      patient: patient._id,
      dentist: dentist ? dentist._id : req.user?._id,
      chairNumber,
      date: today,
      timeSlot,
      durationMinutes: 30,
      procedure: procedure || 'Avaliação Inicial & Triagem',
      category: chairNumber === 1 ? 'cirurgia' : chairNumber === 2 ? 'ortodontia' : 'clinica_geral',
      status: 'aguardando', // Na sala de espera!
      waitingRoomArrivedAt: new Date(),
      price: 150,
      paid: false,
      notes: `Triagem Sofia Avatar: ${complaint} | Meds: ${medicationsInUse}`,
    });

    // Contagem da fila de espera hoje
    const waitingQueue = await Appointment.find({ date: today, status: 'aguardando' });
    const queuePosition = waitingQueue.length;
    const estimatedWaitMinutes = queuePosition * 12;

    res.status(201).json({
      success: true,
      message: `Check-in confirmado! Você é o número ${queuePosition} na fila.`,
      patient,
      appointment,
      queuePosition,
      estimatedWaitMinutes,
      chairNumber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Processador Inteligente de Diálogo da Sofia (Assistente Virtual da Clínica)
// @route   POST /api/patients/assistant-chat
// @access  Public
const assistantChat = async (req, res, next) => {
  try {
    const { message = '', context = {}, history = [] } = req.body;
    const cleanMsg = message.toLowerCase().trim();

    // Extração de dados da mensagem
    const extractedData = {
      name: context.name || null,
      phone: context.phone || null,
      complaint: context.complaint || null,
      allergies: Array.isArray(context.allergies) ? [...context.allergies] : [],
      chronicConditions: Array.isArray(context.chronicConditions) ? [...context.chronicConditions] : [],
      medications: context.medications || null,
      urgencyLevel: context.urgencyLevel || 'normal',
    };

    let reply = '';
    let suggestions = [];
    let readyForCheckin = false;
    let avatarEmotion = 'speaking'; // 'idle', 'speaking', 'empathetic', 'listening', 'thinking', 'celebrating'

    // 1. Extração de Nome
    const nameMatch = message.match(/(?:meu nome é|me chamo|sou o|sou a|aqui é o|aqui é a|nome:?)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?)/i);
    if (nameMatch && !extractedData.name) {
      const candidate = nameMatch[1].trim();
      const cleanCandidate = candidate.replace(/\b(e|que|gostaria|estou|tenho|sou|quero|favor|pra)\b.*$/i, '').trim();
      if (cleanCandidate.length >= 2) {
        extractedData.name = cleanCandidate;
      }
    } else if (!extractedData.name && history.length === 1 && message.split(' ').length <= 3 && !cleanMsg.includes('dor') && !cleanMsg.includes('quanto') && !cleanMsg.includes('olá')) {
      extractedData.name = message.trim();
    }

    // 2. Extração de Telefone
    const phoneMatch = message.match(/(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/);
    if (phoneMatch && !extractedData.phone) {
      extractedData.phone = phoneMatch[0].trim();
    }

    // 3. Extração de Alergias
    const allergyKeywords = [
      { key: 'Penicilina', terms: ['penicilina', 'amoxicilina', 'benzetacil'] },
      { key: 'Dipirona', terms: ['dipirona', 'novalgina', 'lisador'] },
      { key: 'Anti-inflamatórios (AINEs)', terms: ['anti-inflamatório', 'ibuprofeno', 'cetoprofeno', 'nimesulida', 'aspirina', 'aines'] },
      { key: 'Anestésico Odontológico', terms: ['anestésico', 'anestesia', 'lidocaína', 'mepivacaína'] },
      { key: 'Látex (Luvas)', terms: ['látex', 'latex', 'luva'] },
    ];
    for (const item of allergyKeywords) {
      if (item.terms.some((t) => cleanMsg.includes(t)) && !extractedData.allergies.includes(item.key)) {
        extractedData.allergies.push(item.key);
      }
    }

    // 4. Extração de Condições Médicas Crônicas
    const conditionKeywords = [
      { key: 'Hipertensão (Pressão Alta)', terms: ['pressão alta', 'hipertensão', 'hipertenso', 'hipertensa'] },
      { key: 'Diabetes Mellitus', terms: ['diabetes', 'diabético', 'diabética', 'glicose'] },
      { key: 'Cardiopatia', terms: ['coração', 'cardíaco', 'cardiopatia', 'infarto', 'marca-passo', 'angina'] },
      { key: 'Dificuldade de Coagulação', terms: ['coagulação', 'sangramento', 'hemofilia', 'tomo anticoagulante'] },
      { key: 'Fumante / Tabagista', terms: ['fumo', 'fumante', 'cigarro', 'tabagismo', 'vape'] },
    ];
    for (const item of conditionKeywords) {
      if (item.terms.some((t) => cleanMsg.includes(t)) && !extractedData.chronicConditions.includes(item.key)) {
        extractedData.chronicConditions.push(item.key);
      }
    }

    // 5. Extração de Medicamentos
    const medMatch = message.match(/(?:tomo|uso|medicamento|remédio|remedio|medicação):?\s+([A-Za-z0-9\s,]{3,40})/i);
    if (medMatch) {
      extractedData.medications = medMatch[1].trim();
    }

    // 6. Extração de Queixa Clínica e Urgência
    const isUrgent = cleanMsg.includes('muita dor') || cleanMsg.includes('dor insuportável') || cleanMsg.includes('inchado') || cleanMsg.includes('inchaço') || cleanMsg.includes('sangrando') || cleanMsg.includes('quebrou') || cleanMsg.includes('trauma');
    if (isUrgent) {
      extractedData.urgencyLevel = 'alta';
      avatarEmotion = 'empathetic';
    }

    if (cleanMsg.includes('dor') || cleanMsg.includes('dente doendo') || cleanMsg.includes('sensibilidade')) {
      extractedData.complaint = extractedData.complaint || 'Dor Aguda / Sensibilidade Dentária';
    } else if (cleanMsg.includes('implante') || cleanMsg.includes('carga imediata')) {
      extractedData.complaint = extractedData.complaint || 'Avaliação para Implante Dentário';
    } else if (cleanMsg.includes('aparelho') || cleanMsg.includes('alinhador') || cleanMsg.includes('invisalign')) {
      extractedData.complaint = extractedData.complaint || 'Ortodontia / Alinhadores Invisíveis';
    } else if (cleanMsg.includes('siso') || cleanMsg.includes('extração') || cleanMsg.includes('arrancar')) {
      extractedData.complaint = extractedData.complaint || 'Cirurgia de Sisos Inclusos';
    } else if (cleanMsg.includes('limpeza') || cleanMsg.includes('profilaxia') || cleanMsg.includes('tártaro')) {
      extractedData.complaint = extractedData.complaint || 'Limpeza e Profilaxia Preventiva';
    } else if (cleanMsg.includes('canal') || cleanMsg.includes('endodontia')) {
      extractedData.complaint = extractedData.complaint || 'Tratamento de Canal em Sessão Única';
    } else if (cleanMsg.includes('lente') || cleanMsg.includes('faceta') || cleanMsg.includes('clareamento') || cleanMsg.includes('estética')) {
      extractedData.complaint = extractedData.complaint || 'Estética Dental e Facetas E-Max';
    }

    // 7. Respostas Baseadas em Conhecimento da Clínica
    if (cleanMsg.includes('horário') || cleanMsg.includes('horario') || cleanMsg.includes('horas') || cleanMsg.includes('funciona')) {
      reply = 'Nosso atendimento regular funciona de Segunda a Sexta das 07:30 às 19:30, e aos Sábados das 08:00 às 13:00. Também temos plantão de emergência 24 horas pelo telefone (95) 99123-4567. Deseja fazer seu check-in para atendimento hoje?';
      suggestions = ['Fazer check-in para hoje', 'Ver localização', 'Falar com dentista'];
    } else if (cleanMsg.includes('onde') || cleanMsg.includes('endereço') || cleanMsg.includes('endereco') || cleanMsg.includes('localização')) {
      reply = 'Estamos localizados na Av. Ene Garcez, 1420 - Centro, Boa Vista - RR (em frente à Praça das Águas). Temos estacionamento privativo gratuito para pacientes!';
      suggestions = ['Como chegar', 'Horário de atendimento', 'Fazer meu check-in'];
    } else if (cleanMsg.includes('preço') || cleanMsg.includes('preco') || cleanMsg.includes('quanto custa') || cleanMsg.includes('valor')) {
      reply = 'Os valores exatos dependem da avaliação clínica e do elemento dentário analisado. No entanto, nossas consultas com check-up digital iniciam em R$ 150,00 e aceitamos parcelamento em até 12x sem juros no cartão ou 10% de desconto via Pix. Gostaria de iniciar sua triagem agora para ser atendido hoje?';
      suggestions = ['Sim, fazer check-in', 'Aceitam convênio?', 'Conhecer os médicos'];
    } else if (cleanMsg.includes('convênio') || cleanMsg.includes('convenio') || cleanMsg.includes('plano')) {
      reply = 'Trabalhamos com atendimentos particulares e temos parcerias com Uniodonto, Bradesco Dental, Amil Dental e SulAmérica. Também emitimos recibos e laudos completos com CID-10 para reembolso junto a qualquer operadora!';
      suggestions = ['Fazer check-in com convênio', 'Ver especialidades', 'Valores particulares'];
    } else if (cleanMsg.includes('roberto') || cleanMsg.includes('diretor')) {
      reply = 'O Dr. Roberto Silveira (CRO-RR 4521) é nosso Diretor Clínico e especialista em Implantodontia e Cirurgia Bucomaxilofacial pela USP, pioneiro em implantes de carga imediata e cirurgia guiada por computador sem cortes. Ele atende no Consultório 1 (Cadeira Titânio).';
      suggestions = ['Agendar com Dr. Roberto', 'Ver outros médicos', 'Fazer check-in'];
    } else if (cleanMsg.includes('mariana') || cleanMsg.includes('invisalign')) {
      reply = 'A Dra. Mariana Costa (CRO-RR 5892) é nossa especialista em Ortodontia Contemporânea e Invisalign Top Doctor Platinum, referência em alinhadores invisíveis e estética do sorriso no Consultório 2 (Cadeira Ouro).';
      suggestions = ['Avaliar alinhadores', 'Ver outros médicos', 'Fazer check-in'];
    } else if (cleanMsg.includes('carlos') || cleanMsg.includes('canal')) {
      reply = 'O Dr. Carlos Fontes (CRO-RR 3910) é especialista em Endodontia Microscópica. Ele realiza tratamentos de canal sem dor com microscópio cirúrgico Carl Zeiss, na maioria das vezes em uma única sessão!';
      suggestions = ['Tratamento de canal', 'Estou com dor de dente', 'Fazer check-in'];
    } else if (cleanMsg.includes('beatriz') || cleanMsg.includes('criança') || cleanMsg.includes('infantil')) {
      reply = 'A Dra. Beatriz Mendes (CRO-RR 6204) é nossa Odontopediatra e Periodontista, especialista em atendimento infantil humanizado e acolhimento de pacientes com medo de dentista, com opção de sedação com óxido nitroso no Consultório 3.';
      suggestions = ['Atendimento infantil', 'Sedação consciente', 'Fazer check-in'];
    } else if (cleanMsg.includes('tomografia') || cleanMsg.includes('cone beam') || cleanMsg.includes('raio x')) {
      reply = 'Nosso Centro de Imagem possui Tomografia Computadorizada Cone Beam 3D e Radiografia Panorâmica Digital HD no próprio local! Você realiza o exame e recebe o corte 3D em minutos sem precisar se deslocar pela cidade.';
      suggestions = ['Preciso de tomografia', 'Fazer check-in', 'Conhecer cirurgias'];
    } else if (isUrgent) {
      avatarEmotion = 'empathetic';
      const patientGreeting = extractedData.name ? `${extractedData.name}! ` : '';
      reply = `Sinto muito pelo seu desconforto, ${patientGreeting}Dor e inchaço agudo são prioridades imediatas aqui na clínica. Não coloque compressa quente nem encoste medicamentos diretamente na gengiva. Recomendo que você faça seu check-in agora mesmo para ser encaminhado à nossa Cadeira de Emergência com prioridade alta.`;
      suggestions = ['Confirmar check-in de emergência', 'Ver tempo de espera', 'Ligar no plantão'];
    } else {
      // Fluxo Conversacional de Triagem & Check-in
      if (!extractedData.name) {
        reply = 'Olá! Sou a Sofia, assistente virtual e recepcionista da OdontoCheck. Para começarmos seu atendimento, como posso te chamar?';
        suggestions = ['Meu nome é...', 'Gostaria de tirar uma dúvida', 'Ver os médicos da clínica'];
      } else if (!extractedData.complaint) {
        reply = `Prazer em te conhecer, ${extractedData.name}! O que te traz à nossa clínica hoje? Você está com alguma dor, gostaria de fazer uma limpeza, avaliar implantes ou alinhar os dentes?`;
        suggestions = ['Dor de dente / Sensibilidade', 'Limpeza / Profilaxia', 'Implantes dentários', 'Alinhadores invisíveis', 'Cirurgia de siso'];
      } else if (extractedData.allergies.length === 0 && !cleanMsg.includes('nenhuma')) {
        reply = `Entendido, ${extractedData.name}! Para sua segurança clínica, você tem alergia a algum medicamento, como Penicilina, Dipirona, Anti-inflamatórios, Anestésicos locais ou Látex?`;
        suggestions = ['Não tenho nenhuma alergia', 'Alergia a Penicilina', 'Alergia a Dipirona', 'Alergia a Anti-inflamatórios', 'Alergia a Anestésico'];
      } else if (extractedData.chronicConditions.length === 0 && !cleanMsg.includes('nenhum') && !cleanMsg.includes('saudável') && !cleanMsg.includes('saudavel')) {
        reply = `Anotado! Sobre sua saúde geral e histórico familiar, possui diagnóstico de Pressão Alta, Diabetes, problemas cardíacos ou dificuldade de cicatrização?`;
        suggestions = ['Nenhum histórico relevante', 'Hipertensão (Pressão Alta)', 'Diabetes', 'Problema cardíaco', 'Fumante'];
      } else {
        // Todos os dados essenciais coletados!
        readyForCheckin = true;
        avatarEmotion = 'celebrating';
        const allergiesText = extractedData.allergies.length > 0 ? extractedData.allergies.join(', ') : 'Nenhuma';
        const historyText = extractedData.chronicConditions.length > 0 ? extractedData.chronicConditions.join(', ') : 'Nenhum histórico';
        reply = `Excelente, ${extractedData.name}! Já organizei sua pré-anamnese completa: \n• Procedimento: ${extractedData.complaint}\n• Alergias: ${allergiesText}\n• Histórico de saúde: ${historyText}\n\nPosso confirmar seu check-in e emitir sua senha oficial para a fila de espera agora?`;
        suggestions = ['Sim, confirmar check-in!', 'Corrigir alguma informação', 'Quanto é o tempo de espera?'];
      }
    }

    res.json({
      success: true,
      reply,
      extractedData,
      suggestions,
      readyForCheckin,
      avatarEmotion,
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

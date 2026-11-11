const Odontogram = require('../models/Odontogram');
const Patient = require('../models/Patient');
const TreatmentPlan = require('../models/TreatmentPlan');

// Helper para recalcular métricas e score tático de saúde bucal (0 a 100)
const recalculateOdontogramStats = (odontogram) => {
  let caries = 0;
  let restorations = 0;
  let rootCanals = 0;
  let implants = 0;
  let missing = 0;

  odontogram.teeth.forEach((t) => {
    if (t.generalCondition === 'carie') caries++;
    else if (t.generalCondition === 'restauracao') restorations++;
    else if (t.generalCondition === 'canal') rootCanals++;
    else if (t.generalCondition === 'implante') implants++;
    else if (t.generalCondition === 'ausente' || t.generalCondition === 'extracao') missing++;

    // Verifica superfícies
    const surf = t.surfaces;
    if (surf) {
      Object.values(surf).forEach((s) => {
        if (s && s.condition === 'carie' && t.generalCondition !== 'carie') caries++;
      });
    }
  });

  odontogram.tacticalSummary = {
    cariesCount: caries,
    restorationCount: restorations,
    rootCanalCount: rootCanals,
    implantCount: implants,
    missingCount: missing,
  };

  // Cálculo de pontuação de saúde bucal (estilo avaliação de xadrez)
  // Partindo de 100%, subtrai pontos por problemas não tratados
  const penalty = caries * 10 + rootCanals * 5 + missing * 4;
  odontogram.generalHealthScore = Math.max(10, Math.min(100, 100 - penalty));
};

// @desc    Obter odontograma completo do paciente
// @route   GET /api/odontogram/patient/:patientId
// @access  Private
const getOdontogramByPatient = async (req, res, next) => {
  try {
    let odontogram = await Odontogram.findOne({ patient: req.params.patientId })
      .populate('patient', 'name cpf birthDate eloScore')
      .populate('dentist', 'name specialty cro');

    // Se ainda não existir para este paciente, inicializa automaticamente
    if (!odontogram) {
      const allTeeth = [];
      // 32 permanentes
      const adult = [
        18, 17, 16, 15, 14, 13, 12, 11,
        21, 22, 23, 24, 25, 26, 27, 28,
        48, 47, 46, 45, 44, 43, 42, 41,
        31, 32, 33, 34, 35, 36, 37, 38
      ];
      adult.forEach((num) => {
        allTeeth.push({
          toothNumber: num,
          generalCondition: 'higido',
          surfaces: {
            vestibular: { condition: 'higido' },
            lingual: { condition: 'higido' },
            mesial: { condition: 'higido' },
            distal: { condition: 'higido' },
            oclusal: { condition: 'higido' },
          },
          chessTactics: 'best',
          status: 'higido',
        });
      });

      odontogram = await Odontogram.create({
        patient: req.params.patientId,
        dentist: req.user._id,
        archType: 'adulto',
        teeth: allTeeth,
        generalHealthScore: 95,
      });

      odontogram = await Odontogram.findById(odontogram._id)
        .populate('patient', 'name cpf birthDate eloScore')
        .populate('dentist', 'name specialty cro');
    }

    res.json({
      success: true,
      odontogram,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar um dente específico no odontograma
// @route   PUT /api/odontogram/patient/:patientId/tooth/:toothNumber
// @access  Private
const updateTooth = async (req, res, next) => {
  try {
    const { patientId, toothNumber } = req.params;
    const { generalCondition, surfaces, chessTactics, notes, procedureName, price, status } = req.body;

    let odontogram = await Odontogram.findOne({ patient: patientId });
    if (!odontogram) {
      return res.status(404).json({ success: false, message: 'Odontograma não encontrado' });
    }

    const toothIndex = odontogram.teeth.findIndex((t) => t.toothNumber === Number(toothNumber));

    const updatedData = {
      toothNumber: Number(toothNumber),
      generalCondition: generalCondition || 'higido',
      surfaces: surfaces || {
        vestibular: { condition: 'higido' },
        lingual: { condition: 'higido' },
        mesial: { condition: 'higido' },
        distal: { condition: 'higido' },
        oclusal: { condition: 'higido' },
      },
      chessTactics: chessTactics || (generalCondition === 'carie' ? 'blunder' : generalCondition === 'implante' ? 'brilliant' : 'best'),
      notes: notes || '',
      procedureName: procedureName || '',
      price: price || 0,
      status: status || (generalCondition === 'higido' ? 'higido' : 'necessita_tratamento'),
      lastUpdated: new Date(),
    };

    if (toothIndex > -1) {
      odontogram.teeth[toothIndex] = updatedData;
    } else {
      odontogram.teeth.push(updatedData);
    }

    odontogram.dentist = req.user._id;
    recalculateOdontogramStats(odontogram);

    await odontogram.save();

    res.json({
      success: true,
      message: `Dente #${toothNumber} atualizado no tabuleiro tático.`,
      odontogram,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Gerar orçamento automático a partir dos dentes que necessitam tratamento no odontograma
// @route   POST /api/odontogram/patient/:patientId/generate-budget
// @access  Private
const generateTreatmentPlanFromOdontogram = async (req, res, next) => {
  try {
    const odontogram = await Odontogram.findOne({ patient: req.params.patientId });
    if (!odontogram) {
      return res.status(404).json({ success: false, message: 'Odontograma não encontrado' });
    }

    const procedurePriceMap = {
      carie: { name: 'Restauração Resina Fotopolimerizável', price: 180, category: 'Dentística' },
      canal: { name: 'Tratamento Endodôntico (Canal)', price: 650, category: 'Endodontia' },
      coroa: { name: 'Coroa Cerâmica Metal-Free / Zircônia', price: 1200, category: 'Prótese' },
      implante: { name: 'Implante Dentário Cone Morse + Cicatrizador', price: 2200, category: 'Implantodontia' },
      extracao: { name: 'Exodontia Simples / Dente Retido', price: 250, category: 'Cirurgia' },
      tartaro: { name: 'Raspagem Subgengival e Profilaxia', price: 160, category: 'Periodontia' },
      ortodontia: { name: 'Manutenção / Instalação Ortodôntica', price: 200, category: 'Ortodontia' },
    };

    const items = [];
    let subtotal = 0;

    odontogram.teeth.forEach((t) => {
      if (['carie', 'canal', 'coroa', 'implante', 'extracao', 'tartaro'].includes(t.generalCondition)) {
        const proc = procedurePriceMap[t.generalCondition];
        const price = t.price > 0 ? t.price : proc.price;
        items.push({
          toothNumber: t.toothNumber,
          procedureName: `${proc.name} (Dente ${t.toothNumber})`,
          category: proc.category,
          unitPrice: price,
          quantity: 1,
          total: price,
          status: 'a_fazer',
        });
        subtotal += price;
      }
    });

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Todos os dentes estão hígidos! Nenhum procedimento pendente para orçar.',
      });
    }

    const plan = await TreatmentPlan.create({
      patient: req.params.patientId,
      dentist: req.user._id,
      title: `Plano Tático Odontológico - ${new Date().toLocaleDateString('pt-BR')}`,
      items,
      subtotal,
      discountPercentage: 5,
      discountAmount: (subtotal * 5) / 100,
      totalAmount: subtotal * 0.95,
      status: 'pendente',
      notes: 'Orçamento gerado diretamente a partir do diagnóstico do Odontograma.',
    });

    res.status(201).json({
      success: true,
      message: 'Plano de tratamento gerado com sucesso!',
      treatmentPlan: plan,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOdontogramByPatient,
  updateTooth,
  generateTreatmentPlanFromOdontogram,
};

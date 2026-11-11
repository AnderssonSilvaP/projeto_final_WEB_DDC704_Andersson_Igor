const Odontogram = require('../models/Odontogram');
const Patient = require('../models/Patient');
const TreatmentPlan = require('../models/TreatmentPlan');
const { checkId, sendNotFound, sendBadRequest } = require('./shared');

const PATIENT_NOT_FOUND = 'Paciente não encontrado';
const ODONTOGRAM_NOT_FOUND = 'Odontograma não encontrado';
const PATIENT_FIELDS = 'name cpf birthDate eloScore';
const BILLABLE_CONDITIONS = ['carie', 'canal', 'coroa', 'implante', 'extracao', 'tartaro'];
const DISCOUNT_PERCENTAGE = 5;
const CONDITIONS = Odontogram.schema.path('teeth').schema.path('generalCondition').enumValues;

const PROCEDURE_CATALOG = {
  carie: { name: 'Restauração Resina Fotopolimerizável', price: 180, category: 'Dentística' },
  canal: { name: 'Tratamento Endodôntico (Canal)', price: 650, category: 'Endodontia' },
  coroa: { name: 'Coroa Cerâmica Metal-Free / Zircônia', price: 1200, category: 'Prótese' },
  implante: { name: 'Implante Dentário Cone Morse + Cicatrizador', price: 2200, category: 'Implantodontia' },
  extracao: { name: 'Exodontia Simples / Dente Retido', price: 250, category: 'Cirurgia' },
  tartaro: { name: 'Raspagem Subgengival e Profilaxia', price: 160, category: 'Periodontia' },
};

const DEFAULT_SURFACES = () => ({
  vestibular: { condition: 'higido' },
  lingual: { condition: 'higido' },
  mesial: { condition: 'higido' },
  distal: { condition: 'higido' },
  oclusal: { condition: 'higido' },
});

// Penalty-based oral health score (0-100): untreated problems lower it.
const recalculateOdontogramStats = (odontogram) => {
  let caries = 0;
  let restorations = 0;
  let rootCanals = 0;
  let implants = 0;
  let missing = 0;

  odontogram.teeth.forEach((tooth) => {
    const condition = tooth.generalCondition;
    if (condition === 'carie') caries++;
    else if (condition === 'restauracao') restorations++;
    else if (condition === 'canal') rootCanals++;
    else if (condition === 'implante') implants++;
    else if (condition === 'ausente' || condition === 'extracao') missing++;

    if (tooth.surfaces && condition !== 'carie') {
      Object.values(tooth.surfaces).forEach((surface) => {
        if (surface && surface.condition === 'carie') caries++;
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

  const penalty = caries * 10 + rootCanals * 5 + missing * 4;
  odontogram.generalHealthScore = Math.max(10, Math.min(100, 100 - penalty));
};

const defaultTactics = (condition) => {
  if (condition === 'carie') return 'blunder';
  if (condition === 'implante') return 'brilliant';
  return 'best';
};

const getOdontogramByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    if (!checkId(res, patientId, PATIENT_NOT_FOUND)) return;

    let odontogram = await Odontogram.findOne({ patient: patientId });

    if (!odontogram) {
      if (!(await Patient.exists({ _id: patientId }))) return sendNotFound(res, PATIENT_NOT_FOUND);

      odontogram = await Odontogram.create({
        patient: patientId,
        dentist: req.user._id,
        archType: 'adulto',
        teeth: Odontogram.buildAdultTeeth(),
        generalHealthScore: 95,
      });
    }

    odontogram = await Odontogram.findById(odontogram._id)
      .populate('patient', PATIENT_FIELDS)
      .populate('dentist', 'name specialty cro');

    res.json({ success: true, odontogram });
  } catch (error) {
    next(error);
  }
};

const updateTooth = async (req, res, next) => {
  try {
    const { patientId, toothNumber } = req.params;
    if (!checkId(res, patientId, PATIENT_NOT_FOUND)) return;

    const number = Number(toothNumber);
    if (!Number.isInteger(number) || number < 11 || number > 85) {
      return sendBadRequest(res, 'Número do dente inválido.');
    }

    const { generalCondition = 'higido', surfaces, chessTactics, notes, procedureName, price, status } = req.body;
    if (!CONDITIONS.includes(generalCondition)) {
      return sendBadRequest(res, 'Condição do dente inválida.');
    }

    const odontogram = await Odontogram.findOne({ patient: patientId });
    if (!odontogram) return sendNotFound(res, ODONTOGRAM_NOT_FOUND);

    const updated = {
      toothNumber: number,
      generalCondition,
      surfaces: surfaces || DEFAULT_SURFACES(),
      chessTactics: chessTactics || defaultTactics(generalCondition),
      notes: notes || '',
      procedureName: procedureName || '',
      price: Number(price) || 0,
      status: status || (generalCondition === 'higido' ? 'higido' : 'necessita_tratamento'),
      lastUpdated: new Date(),
    };

    const index = odontogram.teeth.findIndex((t) => t.toothNumber === number);
    if (index > -1) odontogram.teeth[index] = updated;
    else odontogram.teeth.push(updated);

    odontogram.dentist = req.user._id;
    recalculateOdontogramStats(odontogram);
    await odontogram.save();

    res.json({
      success: true,
      message: `Dente #${number} atualizado no odontograma.`,
      odontogram,
    });
  } catch (error) {
    next(error);
  }
};

const generateTreatmentPlanFromOdontogram = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    if (!checkId(res, patientId, PATIENT_NOT_FOUND)) return;

    const odontogram = await Odontogram.findOne({ patient: patientId });
    if (!odontogram) return sendNotFound(res, ODONTOGRAM_NOT_FOUND);

    const items = odontogram.teeth
      .filter((t) => BILLABLE_CONDITIONS.includes(t.generalCondition))
      .map((t) => {
        const procedure = PROCEDURE_CATALOG[t.generalCondition];
        const price = t.price > 0 ? t.price : procedure.price;
        return {
          toothNumber: t.toothNumber,
          procedureName: `${procedure.name} (Dente ${t.toothNumber})`,
          category: procedure.category,
          unitPrice: price,
          quantity: 1,
          total: price,
          status: 'a_fazer',
        };
      });

    if (items.length === 0) {
      return sendBadRequest(res, 'Todos os dentes estão hígidos. Nenhum procedimento pendente para orçar.');
    }

    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const discountAmount = (subtotal * DISCOUNT_PERCENTAGE) / 100;

    const plan = await TreatmentPlan.create({
      patient: patientId,
      dentist: req.user._id,
      title: `Plano de Tratamento - ${new Date().toLocaleDateString('pt-BR')}`,
      items,
      subtotal,
      discountPercentage: DISCOUNT_PERCENTAGE,
      discountAmount,
      totalAmount: subtotal - discountAmount,
      status: 'pendente',
      notes: 'Orçamento gerado a partir do diagnóstico do odontograma.',
    });

    res.status(201).json({
      success: true,
      message: 'Plano de tratamento gerado com sucesso.',
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

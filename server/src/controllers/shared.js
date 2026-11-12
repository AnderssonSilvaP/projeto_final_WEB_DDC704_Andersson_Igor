const Patient = require('../models/Patient');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pick = (source, fields) => {
  const result = {};
  fields.forEach((field) => {
    if (source && source[field] !== undefined) result[field] = source[field];
  });
  return result;
};

const isValidId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const checkId = (res, id, message = 'Registro não encontrado.') => {
  if (isValidId(id)) return true;
  res.status(404).json({ success: false, message });
  return false;
};

async function ensurePatientForUser(user, extra = {}) {
  if (!user) return null;
  const email = user.email ? String(user.email).toLowerCase().trim() : '';

  let patient = await Patient.findOne({
    $or: [
      { user: user._id },
      ...(email ? [{ email }] : []),
      ...(extra.cpf ? [{ cpf: String(extra.cpf).trim() }] : []),
    ],
  });

  if (patient) {
    if (!patient.user) {
      patient.user = user._id;
      await patient.save();
    }
    return patient;
  }

  patient = await Patient.create({
    user: user._id,
    name: String(extra.name || user.name || 'Paciente').trim(),
    cpf: extra.cpf ? String(extra.cpf).trim() : `000.${Date.now().toString().slice(-6)}-00`,
    phone: extra.phone || user.phone || '(95) 99100-0000',
    emergencyContact: extra.emergencyContact ? String(extra.emergencyContact).trim() : '',
    email,
    birthDate: extra.birthDate ? new Date(extra.birthDate) : new Date('1995-01-01'),
    gender: extra.gender || 'Não informado',
    cep: extra.cep ? String(extra.cep).trim() : '',
    address: extra.address ? String(extra.address).trim() : '',
    city: extra.city ? String(extra.city).trim() : 'Boa Vista',
    state: extra.state ? String(extra.state).trim().toUpperCase() : 'RR',
    healthInsurance: extra.healthInsurance || 'Particular',
    insuranceNumber: extra.insuranceNumber ? String(extra.insuranceNumber).trim() : '',
    allergies: extra.allergies || '',
  });

  return patient;
}

module.exports = { escapeRegex, pick, isValidId, checkId, ensurePatientForUser };

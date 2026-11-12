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

module.exports = { escapeRegex, pick, isValidId, checkId };

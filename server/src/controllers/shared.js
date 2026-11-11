const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pick = (source, fields) => {
  const result = {};
  fields.forEach((field) => {
    if (source && source[field] !== undefined) result[field] = source[field];
  });
  return result;
};

const isValidId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const newReceiptNumber = () =>
  `REC-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

const enumValues = (Model, path) => Model.schema.path(path).enumValues;

const sendNotFound = (res, message) =>
  res.status(404).json({ success: false, message: message });

const sendBadRequest = (res, message) => res.status(400).json({ success: false, message });

// Responds 404 and returns false when the id param is not a valid ObjectId.
const checkId = (res, id, message) => {
  if (isValidId(id)) return true;
  sendNotFound(res, message);
  return false;
};

module.exports = { escapeRegex, pick, newReceiptNumber, enumValues, isValidId, checkId, sendNotFound, sendBadRequest };

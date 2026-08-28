// Input validators for FarmDirect REST API

const validateRegistration = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) errors.push('Name is required');
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) errors.push('Valid email is required');
  if (!data.password || data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (!data.role) errors.push('Role is required');
  return { isValid: errors.length === 0, errors };
};

const validateProduct = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) errors.push('Product name is required');
  if (data.farmerPrice === undefined || data.farmerPrice <= 0) errors.push('Valid positive farmer price is required');
  if (!data.unit) errors.push('Unit is required (e.g. kg, ton, quintal)');
  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateRegistration,
  validateProduct,
};

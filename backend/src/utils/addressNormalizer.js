const crypto = require('crypto');

/**
 * Common abbreviations in Indian addresses and their standardized forms
 */
const ABBREVIATION_MAP = {
  'st': 'street',
  'rd': 'road',
  'ave': 'avenue',
  'av': 'avenue',
  'apt': 'flat',
  'fl': 'floor',
  'flr': 'floor',
  'no': 'no',
  '#': 'no',
  'ngr': 'nagar',
  'col': 'colony',
  'ext': 'extension',
  'extn': 'extension',
  'mkt': 'market',
  'mn': 'main',
  'lyt': 'layout',
  'bldg': 'building',
  'hno': 'house',
  'dno': 'door',
  'opp': 'opposite',
  'nr': 'near',
  'adj': 'adjacent',
  'tn': 'tamil nadu',
};

/**
 * Standardizes raw text by removing punctuation, normalizing spaces and resolving abbreviations
 */
function cleanAndNormalizeTokens(text) {
  if (!text || typeof text !== 'string') return '';

  // Replace hash and door prefixes with 'no'
  let preProcessed = text
    .toLowerCase()
    .replace(/#/g, ' no ')
    .replace(/\bd\s*no\b/gi, ' door no ')
    .replace(/\bh\s*no\b/gi, ' house no ')
    .replace(/\bfl\s*no\b/gi, ' flat no ');

  // Lowercase and replace non-alphanumeric with spaces (keeping numbers and letters)
  const cleaned = preProcessed
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned.split(' ').map((token) => {
    return ABBREVIATION_MAP[token] || token;
  });

  return tokens.join(' ');
}

/**
 * Normalizes 6-digit Indian PIN codes
 */
function normalizePincode(pincode) {
  if (!pincode) return '';
  const digits = String(pincode).replace(/\D/g, '');
  return digits.length === 6 ? digits : digits;
}

/**
 * Extracts and standardizes house/door/flat number if available
 */
function extractUnitOrFlat(addressLine1, addressLine2) {
  const combined = `${addressLine1 || ''} ${addressLine2 || ''}`.trim();
  // Look for patterns like "Flat 102", "No 42", "Door 12B", "12/A", "Plot 5"
  const match = combined.match(/\b(flat|apt|unit|door|d\s*no|h\s*no|no|plot)?\s*([0-9]+[a-z]?(\/[0-9]+[a-z]?)?)\b/i);
  if (match) {
    return cleanAndNormalizeTokens(match[0]);
  }
  return '';
}

/**
 * Produces normalized address components and a cryptographic SHA-256 fingerprint
 * @param {Object} addressObj - { addressLine1, addressLine2, city, district, state, pincode }
 * @returns {Object} { normalizedAddress, fingerprint, unitOrFlat, street, city, state, pincode }
 */
function normalizeAddress(addressObj = {}) {
  const line1 = cleanAndNormalizeTokens(addressObj.addressLine1 || '');
  const line2 = cleanAndNormalizeTokens(addressObj.addressLine2 || '');
  const city = cleanAndNormalizeTokens(addressObj.city || '');
  const district = cleanAndNormalizeTokens(addressObj.district || '');
  const state = cleanAndNormalizeTokens(addressObj.state || 'tamil nadu');
  const pincode = normalizePincode(addressObj.pincode || '');

  const unitOrFlat = extractUnitOrFlat(addressObj.addressLine1, addressObj.addressLine2);

  // Combine components into a canonical normalized address string
  // Structure: [line1] [line2] [city] [district] [state] [pincode]
  const addressParts = [line1, line2, city, district, state, pincode].filter(Boolean);
  const normalizedAddress = addressParts.join(' ').replace(/\s+/g, ' ').trim();

  // Create SHA-256 fingerprint
  const fingerprint = crypto
    .createHash('sha256')
    .update(normalizedAddress)
    .digest('hex');

  return {
    normalizedAddress,
    fingerprint,
    unitOrFlat: unitOrFlat || null,
    street: line1 || null,
    city: addressObj.city?.trim() || city,
    district: addressObj.district?.trim() || district || null,
    state: addressObj.state?.trim() || 'Tamil Nadu',
    pincode,
  };
}

module.exports = {
  normalizeAddress,
  cleanAndNormalizeTokens,
  normalizePincode,
  extractUnitOrFlat,
};

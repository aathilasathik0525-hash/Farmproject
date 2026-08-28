/**
 * Multilingual Product Voice Parser for FarmDirect
 * Extracts product name, category, quantity, unit, price, quality, and organic status
 * from natural spoken input in Tamil, English, Hindi, Telugu, Kannada, Malayalam, Marathi, and Bengali.
 */

// Script ranges for Indian languages
export const SCRIPT_DETECTION = {
  tamil: /[\u0B80-\u0BFF]/,
  devanagari: /[\u0900-\u097F]/, // Hindi / Marathi
  telugu: /[\u0C00-\u0C7F]/,
  kannada: /[\u0C80-\u0CFF]/,
  malayalam: /[\u0D00-\u0D7F]/,
  bengali: /[\u0980-\u09FF]/,
  latin: /[a-zA-Z]/,
};

// Language metadata mapping
export const LANGUAGE_META = {
  'ta-IN': { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta-IN' },
  'en-IN': { name: 'English', nativeName: 'English', code: 'en-IN' },
  'hi-IN': { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN' },
  'te-IN': { name: 'Telugu', nativeName: 'తెలుగు', code: 'te-IN' },
  'kn-IN': { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn-IN' },
  'ml-IN': { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml-IN' },
  'mr-IN': { name: 'Marathi', nativeName: 'मराठी', code: 'mr-IN' },
  'bn-IN': { name: 'Bengali', nativeName: 'বাংলা', code: 'bn-IN' },
};

/**
 * Detect language from text using unicode script analysis and keywords
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    return { language: 'en-IN', languageName: 'English', confidence: 0.5 };
  }

  const str = text.trim();

  if (SCRIPT_DETECTION.tamil.test(str)) {
    return { language: 'ta-IN', languageName: 'Tamil', nativeName: 'தமிழ்', confidence: 0.95 };
  }
  if (SCRIPT_DETECTION.telugu.test(str)) {
    return { language: 'te-IN', languageName: 'Telugu', nativeName: 'తెలుగు', confidence: 0.95 };
  }
  if (SCRIPT_DETECTION.kannada.test(str)) {
    return { language: 'kn-IN', languageName: 'Kannada', nativeName: 'ಕನ್ನಡ', confidence: 0.95 };
  }
  if (SCRIPT_DETECTION.malayalam.test(str)) {
    return { language: 'ml-IN', languageName: 'Malayalam', nativeName: 'മലയാളം', confidence: 0.95 };
  }
  if (SCRIPT_DETECTION.bengali.test(str)) {
    return { language: 'bn-IN', languageName: 'Bengali', nativeName: 'বাংলা', confidence: 0.95 };
  }
  if (SCRIPT_DETECTION.devanagari.test(str)) {
    // Check for Marathi-specific words
    if (/\b(टोमॅटो|कांदा|बटाटा|रुपये|आहे|नाही|होय)\b/i.test(str)) {
      return { language: 'mr-IN', languageName: 'Marathi', nativeName: 'मराठी', confidence: 0.9 };
    }
    return { language: 'hi-IN', languageName: 'Hindi', nativeName: 'हिन्दी', confidence: 0.95 };
  }

  // Check for Tamil / Hindi / Telugu written in English transliteration
  const lower = str.toLowerCase();
  if (/\b(thakkali|thakkali|venkayam|urulaikizhangu|kilo|roobai|irukku|aam|serkavum)\b/i.test(lower)) {
    return { language: 'ta-IN', languageName: 'Tamil (Transliterated)', nativeName: 'தமிழ்', confidence: 0.85 };
  }
  if (/\b(tamatar|pyaaz|aalu|chawal|rupaye|hai|haan|jodo)\b/i.test(lower)) {
    return { language: 'hi-IN', languageName: 'Hindi (Transliterated)', nativeName: 'हिन्दी', confidence: 0.85 };
  }

  return { language: 'en-IN', languageName: 'English', nativeName: 'English', confidence: 0.8 };
}

// Agricultural commodity dictionary across Indian languages
export const AGRICULTURAL_COMMODITIES = [
  {
    canonical: 'Tomato',
    tamil: 'தக்காளி',
    hindi: 'टमाटर',
    telugu: 'టమోటా',
    kannada: 'ಟೊಮೆಟೊ',
    malayalam: 'തക്കാളി',
    marathi: 'टोमॅटो',
    bengali: 'টমেটো',
    categorySlug: 'vegetables',
    icon: '🍅',
    defaultUnit: 'kg',
    aliases: ['tomatoes', 'tomato', 'நாட்டு தக்காளி', 'நாட்டுக் தக்காளி', 'தக்காளி பழம்', 'tamatar', 'thakkali', 'tamata', 'tamatar'],
  },
  {
    canonical: 'Onion',
    tamil: 'வெங்காயம்',
    hindi: 'प्याज',
    telugu: 'ఉల్లిపాయ',
    kannada: 'ಈರುಳ್ಳಿ',
    malayalam: 'സവാള',
    marathi: 'कांदा',
    bengali: 'পেঁয়াজ',
    categorySlug: 'vegetables',
    icon: '🧅',
    defaultUnit: 'kg',
    aliases: ['onions', 'onion', 'shallots', 'சின்ன வெங்காயம்', 'பெரிய வெங்காயம்', 'pyaaz', 'kanda', 'vengayam'],
  },
  {
    canonical: 'Potato',
    tamil: 'உருளைக்கிழங்கு',
    hindi: 'आलू',
    telugu: 'బంగాళాదుంప',
    kannada: 'ಆಲೂಗಡ್ಡೆ',
    malayalam: 'ഉരുളക്കിഴങ്ങ്',
    marathi: 'बटाटा',
    bengali: 'আলু',
    categorySlug: 'vegetables',
    icon: '🥔',
    defaultUnit: 'kg',
    aliases: ['potatoes', 'potato', 'உருளை', 'aalu', 'aloo', 'batata', 'urulaikizhangu'],
  },
  {
    canonical: 'Rice / Paddy',
    tamil: 'அரிசி / நெல்',
    hindi: 'चावल / धान',
    telugu: 'బియ్యం / వరి',
    kannada: 'ಅಕ್ಕಿ / ಭತ್ತ',
    malayalam: 'അരി / നെല്ല്',
    marathi: 'तांदूळ',
    bengali: 'চাল / ধান',
    categorySlug: 'grains',
    icon: '🌾',
    defaultUnit: 'quintal',
    aliases: ['rice', 'paddy', 'ponni rice', 'பொன்னி அரிசி', 'பச்சரிசி', 'புழுங்கல் அரிசி', 'நெல்', 'chawal', 'dhan', 'arisi', 'nel'],
  },
  {
    canonical: 'Wheat',
    tamil: 'கோதுமை',
    hindi: 'गेहूं',
    telugu: 'గోధుమలు',
    kannada: 'ಗೋಧಿ',
    malayalam: 'ഗോതമ്പ്',
    marathi: 'गहू',
    bengali: 'গম',
    categorySlug: 'grains',
    icon: '🌾',
    defaultUnit: 'quintal',
    aliases: ['wheat', 'gehu', 'godhumai', 'godhuma'],
  },
  {
    canonical: 'Banana',
    tamil: 'வாழைப்பழம்',
    hindi: 'केला',
    telugu: 'అరటిపండు',
    kannada: 'ಬಾಳೆಹಣ್ಣು',
    malayalam: 'വാഴപ്പഴം',
    marathi: 'केळी',
    bengali: 'কলা',
    categorySlug: 'fruits',
    icon: '🍌',
    defaultUnit: 'dozen',
    aliases: ['banana', 'bananas', 'வாழைக்காய்', 'நேந்திரன்', 'செவ்வாழை', 'kela', 'valaippazham', 'arati'],
  },
  {
    canonical: 'Mango',
    tamil: 'மாம்பழம்',
    hindi: 'आम',
    telugu: 'మామిడిపండు',
    kannada: 'ಮಾವಿನಹಣ್ಣು',
    malayalam: 'മാമ്പഴം',
    marathi: 'आंबा',
    bengali: 'আম',
    categorySlug: 'fruits',
    icon: '🥭',
    defaultUnit: 'kg',
    aliases: ['mango', 'mangoes', 'alphonso', 'பங்கனபள்ளி', 'அல்போன்சா', 'aam', 'mampazham', 'mamidi'],
  },
  {
    canonical: 'Green Chilli',
    tamil: 'பச்சை மிளகாய்',
    hindi: 'हरी मिर्च',
    telugu: 'పచ్చి మిరపకాయ',
    kannada: 'ಹಸಿ ಮೆಣಸಿನಕಾಯಿ',
    malayalam: 'പച്ചമുളക്',
    marathi: 'हिरवी मिरची',
    bengali: 'কাঁচা লঙ্কা',
    categorySlug: 'spices',
    icon: '🌶️',
    defaultUnit: 'kg',
    aliases: ['chilli', 'chillies', 'green chilli', 'மிளகாய்', 'mirch', 'milagai', 'mirapakaya'],
  },
  {
    canonical: 'Garlic',
    tamil: 'பூண்டு',
    hindi: 'लहसुन',
    telugu: 'వెల్లుల్లి',
    kannada: 'ಬೆಳ್ಳುಳ್ಳಿ',
    malayalam: 'വെളുത്തുള്ളി',
    marathi: 'लसूण',
    bengali: 'রসুন',
    categorySlug: 'spices',
    icon: '🧄',
    defaultUnit: 'kg',
    aliases: ['garlic', 'மலைப்பூண்டு', 'lahsun', 'poondu', 'vellulli'],
  },
  {
    canonical: 'Ginger',
    tamil: 'இஞ்சி',
    hindi: 'अदरक',
    telugu: 'అల్లం',
    kannada: 'ಶುಂಠಿ',
    malayalam: 'ഇഞ്ചി',
    marathi: 'आले',
    bengali: 'আদা',
    categorySlug: 'spices',
    icon: '🫚',
    defaultUnit: 'kg',
    aliases: ['ginger', 'adrak', 'inchi', 'allam'],
  },
  {
    canonical: 'Turmeric',
    tamil: 'மஞ்சள்',
    hindi: 'हल्दी',
    telugu: 'పసుపు',
    kannada: 'ಅರಿಶಿನ',
    malayalam: 'മഞ്ഞൾ',
    marathi: 'हळद',
    bengali: 'হলুদ',
    categorySlug: 'spices',
    icon: '🫚',
    defaultUnit: 'kg',
    aliases: ['turmeric', 'ஈரோடு மஞ்சள்', 'haldi', 'manjal', 'pasupu'],
  },
  {
    canonical: 'Coconut',
    tamil: 'தேங்காய்',
    hindi: 'नारियल',
    telugu: 'కొబ్బరికాయ',
    kannada: 'ತೆಂಗಿನಕಾಯಿ',
    malayalam: 'തേങ്ങ',
    marathi: 'नारळ',
    bengali: 'নারকেল',
    categorySlug: 'other',
    icon: '🥥',
    defaultUnit: 'piece',
    aliases: ['coconut', 'coconuts', 'தேங்காய்', 'nariyal', 'thengai', 'kobbari'],
  },
  {
    canonical: 'Brinjal / Eggplant',
    tamil: 'கத்தரிக்காய்',
    hindi: 'बैंगन',
    telugu: 'వంకాయ',
    kannada: 'ಬದನೆಕಾಯಿ',
    malayalam: 'വഴുതനങ്ങ',
    marathi: 'वांगी',
    bengali: 'বেগুন',
    categorySlug: 'vegetables',
    icon: '🍆',
    defaultUnit: 'kg',
    aliases: ['brinjal', 'eggplant', 'aubergine', 'கத்தரி', 'baingan', 'kathirikai', 'vankaya'],
  },
  {
    canonical: 'Carrot',
    tamil: 'கேரட்',
    hindi: 'गाजर',
    telugu: 'క్యారెట్',
    kannada: 'ಕ್ಯಾರೆಟ್',
    malayalam: 'കാരറ്റ്',
    marathi: 'गाजर',
    bengali: 'গাজর',
    categorySlug: 'vegetables',
    icon: '🥕',
    defaultUnit: 'kg',
    aliases: ['carrot', 'carrots', 'ஊட்டி கேரட்', 'gajar'],
  },
];

// Multilingual word numbers dictionary
const NUMBER_WORDS = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000,
  // Tamil
  'ஒன்று': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5, 'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10,
  'இருபது': 20, 'இருபத்தைந்து': 25, 'முப்பது': 30, 'முப்பத்தைந்து': 35, 'நாற்பது': 40, 'ஐம்பது': 50, 'அறுபது': 60, 'எழுபது': 70, 'எண்பது': 80, 'தொண்ணூறு': 90,
  'நூறு': 100, 'இருநூறு': 200, 'ஐந்நூறு': 500, 'ஆயிரம்': 1000,
  // Hindi
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'पैंतीस': 35, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90,
  'सौ': 100, 'दो सौ': 200, 'पांच सौ': 500, 'हजार': 1000,
};

// Unit patterns
const UNIT_PATTERNS = [
  { unit: 'kg', patterns: [/கிலோ/i, /கிலோகிராம்/i, /கிலோக்கள்/i, /किलो/i, /कि\.ग्रा/i, /केजी/i, /\bkg\b/i, /\bkgs\b/i, /\bkilo\b/i, /\bkilos\b/i, /\bkilogram\b/i, /\bkilograms\b/i, /కిలో/i, /ಕೆಜಿ/i, /കിലോ/i] },
  { unit: 'quintal', patterns: [/குவிண்டால்/i, /क्विंटल/i, /\bquintal\b/i, /\bquintals\b/i, /క్వింటాల్/i, /ക്വിന്റൽ/i] },
  { unit: 'tonne', patterns: [/டன்/i, /टन/i, /\bton\b/i, /\btons\b/i, /\btonne\b/i, /\btonnes\b/i, /టన్ను/i] },
  { unit: 'piece', patterns: [/எண்ணிக்கை/i, /துண்டு/i, /पीस/i, /नग/i, /\bpiece\b/i, /\bpieces\b/i, /\bnos\b/i] },
  { unit: 'dozen', patterns: [/டஜன்/i, /दर्जन/i, /\bdozen\b/i] },
  { unit: 'crate', patterns: [/பெட்டி/i, /கிரேட்/i, /पेटी/i, /क्रेट/i, /\bcrate\b/i, /\bcrates\b/i, /\bbox\b/i, /\bbag\b/i, /\bbags\b/i, /மூட்டை/i] },
];

/**
 * Extract number from text or word representation
 */
function extractNumberFromText(str) {
  if (!str) return null;
  // Match standard numbers (including decimals e.g. 100, 30.5)
  const digitMatch = str.match(/\b\d+(\.\d+)?\b/);
  if (digitMatch) {
    return parseFloat(digitMatch[0]);
  }

  // Check word numbers
  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    if (str.includes(word)) {
      return val;
    }
  }
  return null;
}

/**
 * Extract matched commodity
 */
function extractCommodity(text, lang) {
  const clean = text.toLowerCase();

  for (const item of AGRICULTURAL_COMMODITIES) {
    // Check aliases
    for (const alias of item.aliases) {
      if (clean.includes(alias.toLowerCase())) {
        return item;
      }
    }
    // Check canonical & regional names
    if (clean.includes(item.canonical.toLowerCase()) ||
        (item.tamil && clean.includes(item.tamil.toLowerCase())) ||
        (item.hindi && clean.includes(item.hindi.toLowerCase())) ||
        (item.telugu && clean.includes(item.telugu.toLowerCase())) ||
        (item.kannada && clean.includes(item.kannada.toLowerCase())) ||
        (item.malayalam && clean.includes(item.malayalam.toLowerCase())) ||
        (item.marathi && clean.includes(item.marathi.toLowerCase())) ||
        (item.bengali && clean.includes(item.bengali.toLowerCase()))) {
      return item;
    }
  }
  return null;
}

/**
 * Extract measurement unit
 */
function extractUnit(text) {
  for (const { unit, patterns } of UNIT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return unit;
      }
    }
  }
  return null;
}

/**
 * Extract price per unit from text
 * Handles: ₹30, 30 rupees, 30 ரூபாய், ஒரு கிலோ 30, 30 रुपये, per kg 30, etc.
 */
function extractPrice(text, detectedUnit) {
  // Regex 1: Explicit currency symbol or words e.g. ₹30, 30 rupees, 30 rs, 30 ரூபாய், 30 रुपये
  const currencyPatterns = [
    /[₹]\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:rupees|rupee|rs|inr|ரூபாய்|ரூ|रुपये|रुपए|రూపాయలు|రూ|ರೂಪಾಯಿ|രൂപ|টাকা)/i,
    /(?:விலை|rate|price|cost|दाम|दर|ధర|ಬೆಲೆ|വില)\s*(?:is|₹|:|-)?\s*(\d+(?:\.\d+)?)/i,
    /(?:ஒரு|ஒரு\s*கிலோ|प्रति\s*किलो|per\s*kg|per\s*unit)\s*(\d+(?:\.\d+)?)\s*(?:ரூபாய்|रुपये|rupees|rs)?/i,
  ];

  for (const pat of currencyPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (val > 0) return val;
    }
  }

  // Regex 2: Look for sentence structure like "100 kilos at 30" or "100 கிலோ ... 30 ரூபாய்"
  const priceAfterAt = text.match(/\bat\s*(\d+(?:\.\d+)?)/i);
  if (priceAfterAt && priceAfterAt[1]) {
    return parseFloat(priceAfterAt[1]);
  }

  return null;
}

/**
 * Extract quantity from text
 * Handles: 100 kg, 100 kilos, 100 கிலோ, 100 tonnes, etc.
 */
function extractQuantity(text, unit) {
  // Pattern 1: Number immediately preceding unit e.g. "100 kilos", "100 கிலோ", "100 kg"
  const unitRegexes = [
    /(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos|kilogram|kilograms|கிலோ|கிலோகிராம்|किलो|केजी|క్వింటాల్|டன்|ton|tonne|quintal|piece|pieces|டஜன்|dozen|பெட்டி|crate)/i,
    /(?:have|got|என்னிடம்|உள்ளது|இருக்கு|है|ఉంది)\s*(\d+(?:\.\d+)?)/i,
  ];

  for (const reg of unitRegexes) {
    const match = text.match(reg);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (val > 0) return val;
    }
  }

  // If the whole text is just a number (e.g. farmer asked "What quantity?" -> replies "100" or "150 kilos")
  const loneNumber = extractNumberFromText(text);
  if (loneNumber !== null && loneNumber > 0) {
    return loneNumber;
  }

  return null;
}

/**
 * Check if the text is an affirmation / confirmation
 * Strips punctuation before matching so "ஆம், சேர்க்கவும்." works correctly.
 */
export function isConfirmation(text) {
  if (!text) return false;
  // Strip common punctuation then normalize whitespace
  const clean = text.replace(/[,\.!?;:।、。]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

  const confirmWords = [
    // English
    'yes', 'yeah', 'yep', 'confirm', 'add', 'add it', 'sure', 'okay', 'ok', 'correct', 'proceed', 'save', 'done', 'fine', 'right', 'yes please', 'yes add',
    // Tamil
    'ஆம்', 'ஆமாம்', 'சரி', 'சேர்க்கவும்', 'சேர்', 'உறுதி', 'சரிதான்', 'ஓகே', 'சேர்க்க', 'ஆமா', 'சரிங்க', 'பண்ணுங்க',
    'ஆம் சேர்க்கவும்', 'சரி சேர்க்கவும்', 'சேர்த்து விடுங்கள்',
    // Hindi
    'हाँ', 'हां', 'सही है', 'जोड़ें', 'जोड़ दो', 'पुष्टि करें', 'ठीक है', 'हाँ जोड़ें', 'हाँ जोड़ दो', 'हाँ जी',
    // Telugu
    'అవును', 'సరే', 'జోడించు', 'ఖరారు చేయి', 'కరెక్ట్',
    // Kannada
    'ಹೌದು', 'ಸರಿ', 'ಸೇರಿಸಿ', 'ಖಚಿತಪಡಿಸಿ',
    // Malayalam
    'അതെ', 'ശരി', 'ചേർക്കുക', 'ഉറപ്പാക്കുക',
    // Marathi
    'हो', 'बरोबर', 'जोडा', 'नक्की', 'होय',
    // Bengali
    'হ্যাঁ', 'ঠিক আছে', 'যোগ করুন', 'নিশ্চিত',
  ];

  return confirmWords.some((w) => clean === w || clean.startsWith(w + ' ') || clean.endsWith(' ' + w) || clean.includes(w));
}

/**
 * Check if the text is a rejection / negation
 */
export function isNegation(text) {
  if (!text) return false;
  const clean = text.trim().toLowerCase();

  const negationWords = [
    // English
    'no', 'nope', 'wrong', 'cancel', 'not that', 'stop', 'dont add', 'do not add',
    // Tamil
    'இல்லை', 'வேண்டாம்', 'தவறு', 'மாற்று', 'மாற்றவும்', 'நிறுத்து', 'இல்ல', 'வேண்டா',
    // Hindi
    'नहीं', 'ना', 'गलत है', 'बदलो', 'रद्द करें', 'मत जोड़ो',
    // Telugu
    'కాదు', 'వద్దు', 'తప్పు', 'మార్చు',
    // Kannada
    'ಇಲ್ಲ', 'ಬೇಡ', 'ತಪ್ಪು', 'ಬದಲಾಯಿಸಿ',
    // Malayalam
    'അല്ല', 'വേണ്ട', 'തെറ്റാണ്', 'മാറ്റുക',
    // Marathi
    'नाही', 'नको', 'चूक', 'बदला',
    // Bengali
    'না', 'ভুল', 'বাতিল', 'পরিবর্তন করুন',
  ];

  return negationWords.some((w) => clean === w || clean.startsWith(w + ' ') || clean.endsWith(' ' + w));
}

/**
 * Detect which slot the farmer is attempting to correct
 * Returns: 'quantity' | 'price' | 'product' | 'unit' | null
 */
export function detectCorrectionSlot(text) {
  const clean = text.toLowerCase();

  // Check quantity correction e.g. "No, 150 kilos" or "150 kg" or "அளவு 150"
  if (/\b(kilo|kilos|kg|quintal|tonne|கிலோ|குவிண்டால்|டன்|किलो|केजी)\b/i.test(clean) ||
      /\b(quantity|அளவு|मात्रा|పరిమాణం)\b/i.test(clean) ||
      /^(?:no,?\s*)?\d+\s*(?:kg|kilos|கிலோ|किलो)?$/i.test(clean)) {
    const qty = extractNumberFromText(clean);
    if (qty) return { slot: 'quantity', value: qty };
  }

  // Check price correction e.g. "Price 35 rupees" or "₹35" or "விலை 35"
  if (/\b(price|rate|rupees|rs|ரூபாய்|விலை|दाम|रुपये|ధర)\b/i.test(clean) ||
      /^(?:no,?\s*)?(?:₹|rs\.?\s*)?\d+(?:\.\d+)?\s*(?:rupees|rs|ரூபாய்|रुपये)?$/i.test(clean)) {
    const price = extractNumberFromText(clean);
    if (price) return { slot: 'farmerPrice', value: price };
  }

  // Check commodity correction
  const commodity = extractCommodity(text, 'auto');
  if (commodity) {
    return { slot: 'product', value: commodity };
  }

  return null;
}

/**
 * Main Product Voice Parser
 * Takes raw voice text & optional current conversation context
 * Returns structured extracted data and missing slots.
 */
export function parseProductVoiceInput(text, options = {}) {
  const { currentProduct = {}, activeLanguage = 'auto' } = options;

  if (!text || typeof text !== 'string') {
    return {
      success: false,
      extracted: currentProduct,
      missingFields: ['productName', 'quantity', 'farmerPrice'],
      language: activeLanguage,
    };
  }

  const detectedLang = activeLanguage === 'auto' ? detectLanguage(text) : { language: activeLanguage, languageName: LANGUAGE_META[activeLanguage]?.name || 'English' };
  const lang = detectedLang.language;

  // Clone existing product slots
  const extracted = {
    name: currentProduct.name || '',
    commodityKey: currentProduct.commodityKey || '',
    categoryId: currentProduct.categoryId || '',
    categorySlug: currentProduct.categorySlug || '',
    description: currentProduct.description || '',
    unit: currentProduct.unit || 'kg',
    quantity: currentProduct.quantity || null,
    farmerPrice: currentProduct.farmerPrice || null,
    qualityGrade: currentProduct.qualityGrade || 'A',
    isOrganic: currentProduct.isOrganic !== undefined ? currentProduct.isOrganic : true,
    harvestDate: currentProduct.harvestDate || new Date().toISOString().split('T')[0],
  };

  // 1. Extract commodity if present
  const commodity = extractCommodity(text, lang);
  if (commodity) {
    extracted.commodityKey = commodity.canonical;
    extracted.categorySlug = commodity.categorySlug;
    // Set localized friendly display name
    if (lang === 'ta-IN' && commodity.tamil) {
      extracted.name = `Farm Fresh ${commodity.canonical} (${commodity.tamil})`;
      extracted.description = `Fresh harvest of ${commodity.canonical} (${commodity.tamil}) directly from verified farmer fields.`;
    } else if (lang === 'hi-IN' && commodity.hindi) {
      extracted.name = `Farm Fresh ${commodity.canonical} (${commodity.hindi})`;
      extracted.description = `Fresh harvest of ${commodity.canonical} (${commodity.hindi}) directly from farmer fields.`;
    } else {
      extracted.name = `Farm Fresh ${commodity.canonical}`;
      extracted.description = `Fresh harvest of high quality ${commodity.canonical} directly from verified farm.`;
    }
    extracted.unit = commodity.defaultUnit || 'kg';
  }

  // 2. Extract unit if explicitly mentioned
  const explicitUnit = extractUnit(text);
  if (explicitUnit) {
    extracted.unit = explicitUnit;
  }

  // 3. Extract price
  const price = extractPrice(text, extracted.unit);
  if (price !== null && price > 0) {
    extracted.farmerPrice = price;
  }

  // 4. Extract quantity
  const qty = extractQuantity(text, extracted.unit, price);
  if (qty !== null && qty > 0) {
    extracted.quantity = qty;
  }

  // If text contains 2 numbers e.g. "100 kilos at 30" or "100 கிலோ ... 30 ரூபாய்"
  const numbers = text.match(/\b\d+(\.\d+)?\b/g);
  if (numbers && numbers.length >= 2) {
    const n1 = parseFloat(numbers[0]);
    const n2 = parseFloat(numbers[1]);
    // Usually the larger or first number before unit is quantity, and second is price
    if (!extracted.quantity) extracted.quantity = n1;
    if (!extracted.farmerPrice) extracted.farmerPrice = n2;
  }

  // Determine missing fields required by FarmDirect API
  const missingFields = [];
  if (!extracted.name && !extracted.commodityKey) missingFields.push('productName');
  if (!extracted.quantity || extracted.quantity <= 0) missingFields.push('quantity');
  if (!extracted.farmerPrice || extracted.farmerPrice <= 0) missingFields.push('farmerPrice');

  return {
    success: true,
    extracted,
    missingFields,
    isComplete: missingFields.length === 0,
    language: lang,
    languageName: detectedLang.languageName,
    rawText: text,
  };
}

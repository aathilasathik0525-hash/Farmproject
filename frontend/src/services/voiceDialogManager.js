/**
 * Voice Dialog Manager for FarmDirect Multilingual Voice Assistant
 * Implements conversation state machine and generates natural, localized prompts
 * for Indian languages: Tamil, English, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali.
 */

export const DIALOG_STATES = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  ASKING_PRODUCT: 'ASKING_PRODUCT',
  ASKING_QUANTITY: 'ASKING_QUANTITY',
  ASKING_PRICE: 'ASKING_PRICE',
  CONFIRMING: 'CONFIRMING',
  CORRECTING: 'CORRECTING',
  CREATING: 'CREATING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

// Localized prompt templates for each supported language
const DIALOG_TEMPLATES = {
  'ta-IN': {
    welcome: 'வணக்கம் விவசாயி! நீங்கள் விற்க விரும்பும் பயிர், அளவு மற்றும் விலையை சொல்லுங்கள்.',
    askProduct: 'நீங்கள் என்ன விளைபொருளை விற்க விரும்புகிறீர்கள்?',
    askQuantity: (product) => `உங்களிடம் எத்தனை அளவு ${product || 'பயிர்'} உள்ளது?`,
    askPrice: (product, unit = 'கிலோ') => `ஒரு ${unit} ${product || 'விளைபொருளுக்கு'} உங்கள் விற்பனை விலை என்ன?`,
    confirmProduct: (product, qty, unit, price) =>
      `${qty} ${unit} ${product}-ஐ ஒரு ${unit} ₹${price} விலையில் சேர்க்கவா?`,
    confirmCorrection: (product, qty, unit, price) =>
      `சரி. ${qty} ${unit} ${product}-ஐ ஒரு ${unit} ₹${price} விலையில் சேர்க்கவா?`,
    success: (product, qty, unit) =>
      `${product} ${qty} ${unit} வெற்றிகரமாக சந்தையில் சேர்க்கப்பட்டது.`,
    unclear: 'உங்கள் குரலை தெளிவாக கேட்கவில்லை. தயவுசெய்து மீண்டும் சொல்லுங்கள்.',
    error: 'மன்னிக்கவும், பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    canceled: 'சரி, இந்த பதிவு ரத்து செய்யப்பட்டது.',
  },
  'en-IN': {
    welcome: 'Hello Farmer! Please tell me what crop you have, its quantity, and your selling price.',
    askProduct: 'What agricultural produce would you like to list?',
    askQuantity: (product) => `What quantity of ${product || 'produce'} do you have?`,
    askPrice: (product, unit = 'kg') => `What is your selling price per ${unit}?`,
    confirmProduct: (product, qty, unit, price) =>
      `You are adding ${qty} ${unit} of ${product} at ₹${price} per ${unit}. Shall I add this product?`,
    confirmCorrection: (product, qty, unit, price) =>
      `Okay. ${qty} ${unit} of ${product} at ₹${price} per ${unit}. Shall I add it?`,
    success: (product, qty, unit) =>
      `${product}, ${qty} ${unit}, successfully added to the marketplace.`,
    unclear: "I couldn't understand that clearly. Please try again.",
    error: 'Sorry, an error occurred. Please try again.',
    canceled: 'Product listing canceled.',
  },
  'hi-IN': {
    welcome: 'नमस्ते किसान भाई! आप कौन सी फसल, कितनी मात्रा और किस भाव में बेचना चाहते हैं?',
    askProduct: 'आप कौन सी कृषि उपज बेचना चाहते हैं?',
    askQuantity: (product) => `आपके पास कितनी मात्रा में ${product || 'फसल'} है?`,
    askPrice: (product, unit = 'किलो') => `प्रति ${unit} आपका विक्रय मूल्य क्या है?`,
    confirmProduct: (product, qty, unit, price) =>
      `क्या मैं ₹${price} प्रति ${unit} की दर से ${qty} ${unit} ${product} जोड़ दूँ?`,
    confirmCorrection: (product, qty, unit, price) =>
      `ठीक है। ₹${price} प्रति ${unit} की दर से ${qty} ${unit} ${product}। क्या मैं इसे जोड़ दूँ?`,
    success: (product, qty, unit) =>
      `${product} ${qty} ${unit} सफलतापूर्वक मंडी में जोड़ दिया गया है।`,
    unclear: 'मुझे स्पष्ट रूप से समझ नहीं आया। कृपया दोबारा कहें।',
    error: 'क्षमा करें, कोई त्रुटि हुई। कृपया पुन: प्रयास करें।',
    canceled: 'उत्पाद जोड़ना रद्द कर दिया गया।',
  },
  'te-IN': {
    welcome: 'నమస్కారం రైతు మిత్రమా! మీరు విక్రయించాలనుకుంటున్న పంట, పరిమాణం మరియు ధరను చెప్పండి.',
    askProduct: 'మీరు ఏ వ్యవసాయ పంటను జోడించాలనుకుంటున్నారు?',
    askQuantity: (product) => `మీ వద్ద ఎంత పరిమాణంలో ${product || 'పంట'} ఉంది?`,
    askPrice: (product, unit = 'కిలో') => `ఒక ${unit}కి మీ విక్రయ ధర ఎంత?`,
    confirmProduct: (product, qty, unit, price) =>
      `మీరు ${qty} ${unit} ${product}ను ₹${price} ధరకు జోడించాలనుకుంటున్నారా?`,
    confirmCorrection: (product, qty, unit, price) =>
      `సరే. ${qty} ${unit} ${product}ను ₹${price} ధరకు జోడించనా?`,
    success: (product, qty, unit) =>
      `${product} ${qty} ${unit} విజయవంతంగా జోడించబడింది.`,
    unclear: 'నాకు సరిగ్గా అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పండి.',
    error: 'లోపం జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    canceled: 'రద్దు చేయబడింది.',
  },
  'kn-IN': {
    welcome: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಿಮ್ಮ ಬೆಳೆ, ಪ್ರಮಾಣ ಮತ್ತು ಮಾರಾಟ ಬೆಲೆಯನ್ನು ತಿಳಿಸಿ.',
    askProduct: 'ನೀವು ಯಾವ ಬೆಳೆಯನ್ನು ಮಾರಾಟ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?',
    askQuantity: (product) => `ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಪ್ರಮಾಣದ ${product || 'ಬೆಳೆ'} ಇದೆ?`,
    askPrice: (product, unit = 'ಕೆಜಿ') => `ಪ್ರತಿ ${unit}ಗೆ ನಿಮ್ಮ ಮಾರಾಟ ಬೆಲೆ ಎಷ್ಟು?`,
    confirmProduct: (product, qty, unit, price) =>
      `${qty} ${unit} ${product} ಅನ್ನು ₹${price} ದರದಲ್ಲಿ ಸೇರಿಸಲೇ?`,
    confirmCorrection: (product, qty, unit, price) =>
      `ಸರಿ. ${qty} ${unit} ${product} ಅನ್ನು ₹${price} ದರದಲ್ಲಿ ಸೇರಿಸಲೇ?`,
    success: (product, qty, unit) =>
      `${product} ${qty} ${unit} ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.`,
    unclear: 'ನನಗೆ ಸ್ಪಷ್ಟವಾಗಿ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.',
    error: 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    canceled: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.',
  },
  'ml-IN': {
    welcome: 'നമസ്കാരം കർഷക സുഹൃത്തേ! നിങ്ങളുടെ വിള, അളവ്, വില എന്നിവ പറയുക.',
    askProduct: 'ഏത് വിളയാണ് വിൽക്കാൻ ആഗ്രഹിക്കുന്നത്?',
    askQuantity: (product) => `നിങ്ങളുടെ പക്കൽ എത്ര ${product || 'വിള'} ഉണ്ട്?`,
    askPrice: (product, unit = 'കിലോ') => `ഒരു ${unit} ന് നിങ്ങളുടെ വില എത്രയാണ്?`,
    confirmProduct: (product, qty, unit, price) =>
      `${qty} ${unit} ${product} ₹${price} നിരക്കിൽ ചേർക്കണോ?`,
    confirmCorrection: (product, qty, unit, price) =>
      `ശരി. ${qty} ${unit} ${product} ₹${price} നിരക്കിൽ ചേർക്കണോ?`,
    success: (product, qty, unit) =>
      `${product} ${qty} ${unit} വിജയകരമായി ചേർത്തു.`,
    unclear: 'വ്യക്തമായി മനസ്സിലായില്ല. ദയവായി വീണ്ടും പറയുക.',
    error: 'ഒരു പിശക് സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.',
    canceled: 'റദ്ദാക്കി.',
  },
  'mr-IN': {
    welcome: 'नमस्कार शेतकरी मित्र! आपले पीक, प्रमाण आणि विक्री किंमत सांगा.',
    askProduct: 'तुम्हाला कोणते शेतमाल विकायचे आहे?',
    askQuantity: (product) => `तुमच्याकडे किती ${product || 'पीक'} आहे?`,
    askPrice: (product, unit = 'किलो') => `प्रति ${unit} तुमची किंमत काय आहे?`,
    confirmProduct: (product, qty, unit, price) =>
      `₹${price} प्रति ${unit} दराने ${qty} ${unit} ${product} जोडू का?`,
    confirmCorrection: (product, qty, unit, price) =>
      `ठीक आहे. ₹${price} प्रति ${unit} दराने ${qty} ${unit} ${product} जोडू का?`,
    success: (product, qty, unit) =>
      `${product} ${qty} ${unit} यशस्वीरित्या जोडले गेले आहे.`,
    unclear: 'मला स्पष्ट समजले नाही. कृपया पुन्हा सांगा.',
    error: 'त्रुटी आढळली. कृपया पुन्हा प्रयत्न करा.',
    canceled: 'रद्द केले.',
  },
  'bn-IN': {
    welcome: 'নমস্কার কৃষক ভাই! আপনি কোন ফসল, কত পরিমাণ এবং কি দামে বিক্রি করতে চান?',
    askProduct: 'আপনি কোন কৃষি পণ্য যুক্ত করতে চান?',
    askQuantity: (product) => `আপনার কাছে কত পরিমাণ ${product || 'ফসল'} আছে?`,
    askPrice: (product, unit = 'কেজি') => `প্রতি ${unit} আপনার বিক্রয় মূল্য কত?`,
    confirmProduct: (product, qty, unit, price) =>
      `₹${price} প্রতি ${unit} হিসেবে ${qty} ${unit} ${product} যোগ করব?`,
    confirmCorrection: (product, qty, unit, price) =>
      `ঠিক আছে। ₹${price} প্রতি ${unit} হিসেবে ${qty} ${unit} ${product} যোগ করব?`,
    success: (product, qty, unit) =>
      `${product} ${qty} ${unit} সফলভাবে যোগ করা হয়েছে।`,
    unclear: 'আমি পরিষ্কার বুঝতে পারিনি। অনুগ্রহ করে আবার বলুন।',
    error: 'ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    canceled: 'বাতিল করা হয়েছে।',
  },
};

/**
 * Get localized dialog responses
 */
export function getDialogResponse(type, lang = 'en-IN', params = {}) {
  const langTemplates = DIALOG_TEMPLATES[lang] || DIALOG_TEMPLATES['en-IN'];
  const template = langTemplates[type] || DIALOG_TEMPLATES['en-IN'][type];

  if (typeof template === 'function') {
    return template(params.product, params.quantity, params.unit, params.price);
  }
  return template || '';
}

/**
 * Helper to determine user-friendly commodity label in target language
 */
export function getFriendlyCommodityName(commodityKey, lang) {
  if (!commodityKey) return '';
  if (lang === 'ta-IN') {
    const map = {
      Tomato: 'தக்காளி',
      Onion: 'வெங்காயம்',
      Potato: 'உருளைக்கிழங்கு',
      'Rice / Paddy': 'அரிசி / நெல்',
      Wheat: 'கோதுமை',
      Banana: 'வாழைப்பழம்',
      Mango: 'மாம்பழம்',
      'Green Chilli': 'பச்சை மிளகாய்',
      Garlic: 'பூண்டு',
      Ginger: 'இஞ்சி',
      Turmeric: 'மஞ்சள்',
      Coconut: 'தேங்காய்',
      'Brinjal / Eggplant': 'கத்தரிக்காய்',
      Carrot: 'கேரட்',
    };
    return map[commodityKey] || commodityKey;
  }
  if (lang === 'hi-IN') {
    const map = {
      Tomato: 'टमाटर',
      Onion: 'प्याज',
      Potato: 'आलू',
      'Rice / Paddy': 'चावल / धान',
      Wheat: 'गेहूं',
      Banana: 'केला',
      Mango: 'आम',
      'Green Chilli': 'हरी मिर्च',
      Garlic: 'लहसुन',
      Ginger: 'अदरक',
      Turmeric: 'हल्दी',
      Coconut: 'नारियल',
      'Brinjal / Eggplant': 'बैंगन',
      Carrot: 'गाजर',
    };
    return map[commodityKey] || commodityKey;
  }
  return commodityKey;
}

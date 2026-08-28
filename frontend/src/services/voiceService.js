/**
 * Multilingual Voice Service for FARMDirect
 * Implements Web Speech API (SpeechRecognition) & SpeechSynthesis (TTS)
 * with precise voice selection for Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali & English
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect (தானியங்கு / स्वचालित)', script: 'Multilingual' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', script: 'Tamil', flag: '🌾', langName: 'Tamil' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', script: 'Devanagari', flag: '🇮🇳', langName: 'Hindi' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', script: 'Telugu', flag: '🇮🇳', langName: 'Telugu' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', script: 'Kannada', flag: '🇮🇳', langName: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)', script: 'Malayalam', flag: '🇮🇳', langName: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi (मराठी)', script: 'Devanagari', flag: '🇮🇳', langName: 'Marathi' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)', script: 'Bengali', flag: '🇮🇳', langName: 'Bengali' },
  { code: 'en-IN', name: 'English (India)', script: 'Latin', flag: '🇮🇳', langName: 'English' },
];

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.availableVoices = [];
    this.loadVoices();
  }

  loadVoices() {
    if (!this.synthesis) return;
    this.availableVoices = this.synthesis.getVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.availableVoices = this.synthesis.getVoices();
      };
    }
  }

  getVoices() {
    if (!this.synthesis) return [];
    if (!this.availableVoices || this.availableVoices.length === 0) {
      this.availableVoices = this.synthesis.getVoices();
    }
    return this.availableVoices;
  }

  isSpeechRecognitionSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  isSpeechSynthesisSupported() {
    if (typeof window === 'undefined') return false;
    return !!window.speechSynthesis;
  }

  /**
   * Find matching voice for a language code
   * Priority:
   * 1. Exact BCP-47 match (e.g. 'ta-IN')
   * 2. Prefix match (e.g. 'ta')
   * 3. Name match (e.g. includes 'Tamil')
   * 4. Regional Indian English voice ('en-IN')
   */
  findVoice(langCode) {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const normalizedCode = (langCode || 'ta-IN').toLowerCase().replace('_', '-');
    const primary = normalizedCode.split('-')[0];

    const langEntry = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === normalizedCode);
    const langKeyword = langEntry?.langName?.toLowerCase();

    // 1. Exact match
    let match = voices.find(
      (v) => v.lang && v.lang.toLowerCase().replace('_', '-') === normalizedCode
    );
    if (match) return { voice: match, isNative: true };

    // 2. Prefix match
    match = voices.find(
      (v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(primary)
    );
    if (match) return { voice: match, isNative: true };

    // 3. Name match in voice name
    if (langKeyword) {
      match = voices.find((v) => v.name && v.name.toLowerCase().includes(langKeyword));
      if (match) return { voice: match, isNative: true };
    }

    // 4. Regional Indian voice fallback
    match = voices.find(
      (v) =>
        v.lang &&
        (v.lang.toLowerCase().replace('_', '-') === 'en-in' ||
          v.name.toLowerCase().includes('india'))
    );
    if (match) return { voice: match, isNative: primary === 'en' };

    // 5. Default voice
    return { voice: voices[0] || null, isNative: false };
  }

  hasNativeVoice(langCode) {
    const res = this.findVoice(langCode);
    return res ? res.isNative : false;
  }

  /**
   * Start microphone listening
   */
  startListening({ lang = 'ta-IN', onStart, onResult, onError, onEnd }) {
    if (this.isListening) {
      this.stopListening();
    }

    if (!this.isSpeechRecognitionSupported()) {
      if (onError)
        onError(
          new Error(
            'Speech recognition is not supported in this browser. You can use direct voice simulation or text input.'
          )
        );
      return false;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = lang === 'auto' ? 'ta-IN' : lang;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const text = finalTranscript.trim() || interimTranscript.trim();
        const isFinal = !!finalTranscript.trim();
        if (onResult) onResult({ transcript: text, isFinal, rawEvent: event });
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        let errorMessage = event.error || 'Voice recognition error';
        if (event.error === 'not-allowed') {
          errorMessage =
            'Microphone permission denied. Please allow microphone access or use voice test chips.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please speak closer to the microphone.';
        }
        if (onError) onError(new Error(errorMessage));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    this.isListening = false;
  }

  /**
   * Speak response using SpeechSynthesis with proper language selection
   */
  speak(text, lang = 'ta-IN', onStart, onEnd) {
    if (!this.synthesis || !text) {
      if (onEnd) setTimeout(onEnd, 200);
      return;
    }

    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang === 'auto' ? 'ta-IN' : lang;
    utterance.lang = targetLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const matched = this.findVoice(targetLang);
    if (matched && matched.voice) {
      utterance.voice = matched.voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      if (onEnd) onEnd(e);
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Languages,
  ArrowRight,
  Send,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { voiceService, SUPPORTED_LANGUAGES } from '../../services/voiceService';
import {
  parseProductVoiceInput,
  detectLanguage,
  isConfirmation,
  isNegation,
  detectCorrectionSlot,
  LANGUAGE_META,
} from '../../services/productVoiceParser';
import {
  DIALOG_STATES,
  getDialogResponse,
  getFriendlyCommodityName,
} from '../../services/voiceDialogManager';
import { createProductApi, getCategoriesApi } from '../../api/endpoints';
import '../../styles/voiceAssistant.css';

export const VoiceProductAssistant = ({ onProductCreated, onApplyToForm, initialCategories = [] }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedLang, setSelectedLang] = useState('auto');
  const [activeLang, setActiveLang] = useState('en-IN');
  const [dialogState, setDialogState] = useState(DIALOG_STATES.IDLE);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [manualInputText, setManualInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successProduct, setSuccessProduct] = useState(null);

  // Extracted product slots
  const [productSlots, setProductSlots] = useState({
    name: '',
    commodityKey: '',
    categoryId: '',
    categorySlug: 'vegetables',
    description: '',
    unit: 'kg',
    quantity: null,
    farmerPrice: null,
    qualityGrade: 'A',
    isOrganic: true,
    harvestDate: new Date().toISOString().split('T')[0],
  });

  // Conversation history
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      text: 'வணக்கம் / Hello Farmer! 🎙️ Speak naturally to list your produce: crop name, quantity & price.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const timelineEndRef = useRef(null);

  // Load categories if not provided
  useEffect(() => {
    if (categories.length === 0) {
      getCategoriesApi()
        .then((res) => {
          if (res?.data) setCategories(res.data);
        })
        .catch((err) => console.error('Failed to load categories in voice assistant:', err));
    }
  }, [categories.length]);

  // Scroll chat timeline to bottom on new message
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSpeaking, isListening]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, []);

  /**
   * Add message to chat log
   */
  const addChatMessage = (sender, text) => {
    setChatMessages((prev) => [
      ...prev,
      {
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const [lastAssistantMsg, setLastAssistantMsg] = useState({
    text: 'வணக்கம் / Hello Farmer! Speak naturally to list your produce: crop name, quantity and price.',
    lang: 'ta-IN',
  });

  /**
   * Speak a localized response
   */
  const speakResponse = (text, langToUse = activeLang, onFinished) => {
    setIsSpeaking(true);
    setLastAssistantMsg({ text, lang: langToUse });
    addChatMessage('assistant', text);

    voiceService.speak(
      text,
      langToUse,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        if (onFinished) onFinished();
      }
    );
  };

  /**
   * Replay last assistant response in the same language
   */
  const handleReplayResponse = () => {
    if (!lastAssistantMsg?.text) return;
    setIsSpeaking(true);
    voiceService.speak(
      lastAssistantMsg.text,
      lastAssistantMsg.lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  /**
   * Start microphone listening
   */
  const handleStartListening = () => {
    setErrorMessage('');
    const langToUse = selectedLang === 'auto' ? activeLang : selectedLang;

    const started = voiceService.startListening({
      lang: langToUse,
      onStart: () => {
        setIsListening(true);
        setDialogState(DIALOG_STATES.LISTENING);
        setLiveTranscript('');
      },
      onResult: ({ transcript, isFinal }) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim()) {
          voiceService.stopListening();
          setIsListening(false);
          processUserInput(transcript);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err.message);
        setDialogState(DIALOG_STATES.ERROR);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started && !voiceService.isSpeechRecognitionSupported()) {
      setErrorMessage(
        'Speech recognition not available in this browser. You can click the voice test sample chips or type to speak!'
      );
    }
  };

  /**
   * Stop microphone
   */
  const handleStopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    if (liveTranscript.trim()) {
      processUserInput(liveTranscript);
    } else {
      setDialogState(DIALOG_STATES.IDLE);
    }
  };

  /**
   * Stop speaking
   */
  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  /**
   * Core Natural Language Dialogue Processing Logic
   */
  const processUserInput = async (text) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    setLiveTranscript('');
    addChatMessage('farmer', cleanText);
    setDialogState(DIALOG_STATES.PROCESSING);

    // 1. Language detection
    const detected = selectedLang === 'auto' ? detectLanguage(cleanText) : { language: selectedLang, languageName: LANGUAGE_META[selectedLang]?.name || 'English' };
    const lang = detected.language;
    setActiveLang(lang);

    // 2. Handle Confirmation State
    if (dialogState === DIALOG_STATES.CONFIRMING) {
      if (isConfirmation(cleanText)) {
        await executeProductCreation(productSlots, lang);
        return;
      }
      if (isNegation(cleanText)) {
        // Farmer wants to correct or cancel
        const correction = detectCorrectionSlot(cleanText);
        if (correction) {
          handleSlotCorrection(correction, lang);
          return;
        }
        const cancelMsg = getDialogResponse('canceled', lang);
        speakResponse(cancelMsg, lang);
        setDialogState(DIALOG_STATES.IDLE);
        return;
      }
      // Check if user spoke a correction directly without saying "no"
      const directCorrection = detectCorrectionSlot(cleanText);
      if (directCorrection) {
        handleSlotCorrection(directCorrection, lang);
        return;
      }
    }

    // 3. Handle specific missing slot prompts
    if (dialogState === DIALOG_STATES.ASKING_QUANTITY) {
      const parsed = parseProductVoiceInput(cleanText, { currentProduct: productSlots, activeLanguage: lang });
      if (parsed.extracted.quantity) {
        const updated = { ...productSlots, quantity: parsed.extracted.quantity };
        if (parsed.extracted.unit) updated.unit = parsed.extracted.unit;
        if (parsed.extracted.farmerPrice) updated.farmerPrice = parsed.extracted.farmerPrice;
        setProductSlots(updated);
        checkNextDialogueStep(updated, lang);
        return;
      }
    }

    if (dialogState === DIALOG_STATES.ASKING_PRICE) {
      const parsed = parseProductVoiceInput(cleanText, { currentProduct: productSlots, activeLanguage: lang });
      if (parsed.extracted.farmerPrice) {
        const updated = { ...productSlots, farmerPrice: parsed.extracted.farmerPrice };
        if (parsed.extracted.quantity) updated.quantity = parsed.extracted.quantity;
        setProductSlots(updated);
        checkNextDialogueStep(updated, lang);
        return;
      }
    }

    // 4. General Intent & Slot Extraction
    const parsed = parseProductVoiceInput(cleanText, { currentProduct: productSlots, activeLanguage: lang });
    const updated = { ...productSlots, ...parsed.extracted };

    // Auto-map category ID if slug is known
    if (updated.categorySlug && categories.length > 0) {
      const matchedCat = categories.find(
        (c) => c.slug.toLowerCase() === updated.categorySlug.toLowerCase() || c.name.toLowerCase() === updated.categorySlug.toLowerCase()
      );
      if (matchedCat) {
        updated.categoryId = matchedCat.id;
      } else if (!updated.categoryId) {
        updated.categoryId = categories[0].id;
      }
    } else if (!updated.categoryId && categories.length > 0) {
      updated.categoryId = categories[0].id;
    }

    setProductSlots(updated);
    checkNextDialogueStep(updated, lang);
  };

  /**
   * Handle correction of specific slot
   */
  const handleSlotCorrection = (correction, lang) => {
    const updated = { ...productSlots };
    if (correction.slot === 'quantity') {
      updated.quantity = correction.value;
    } else if (correction.slot === 'farmerPrice') {
      updated.farmerPrice = correction.value;
    } else if (correction.slot === 'product') {
      updated.commodityKey = correction.value.canonical;
      updated.categorySlug = correction.value.categorySlug;
      updated.name = lang === 'ta-IN' ? `Farm Fresh ${correction.value.canonical} (${correction.value.tamil})` : `Farm Fresh ${correction.value.canonical}`;
    }
    setProductSlots(updated);

    const friendlyName = getFriendlyCommodityName(updated.commodityKey || updated.name, lang);
    const confirmPrompt = getDialogResponse('confirmCorrection', lang, {
      product: friendlyName,
      quantity: updated.quantity,
      unit: updated.unit,
      price: updated.farmerPrice,
    });

    setDialogState(DIALOG_STATES.CONFIRMING);
    speakResponse(confirmPrompt, lang);
  };

  /**
   * Determine next dialog step based on missing required slots
   */
  const checkNextDialogueStep = (slots, lang) => {
    const friendlyName = getFriendlyCommodityName(slots.commodityKey || slots.name, lang);

    if (!slots.name && !slots.commodityKey) {
      setDialogState(DIALOG_STATES.ASKING_PRODUCT);
      const prompt = getDialogResponse('askProduct', lang);
      speakResponse(prompt, lang);
      return;
    }

    if (!slots.quantity || slots.quantity <= 0) {
      setDialogState(DIALOG_STATES.ASKING_QUANTITY);
      const prompt = getDialogResponse('askQuantity', lang, { product: friendlyName });
      speakResponse(prompt, lang);
      return;
    }

    if (!slots.farmerPrice || slots.farmerPrice <= 0) {
      setDialogState(DIALOG_STATES.ASKING_PRICE);
      const prompt = getDialogResponse('askPrice', lang, { product: friendlyName, unit: slots.unit });
      speakResponse(prompt, lang);
      return;
    }

    // All mandatory slots present -> Ask confirmation
    setDialogState(DIALOG_STATES.CONFIRMING);
    const confirmPrompt = getDialogResponse('confirmProduct', lang, {
      product: friendlyName,
      quantity: slots.quantity,
      unit: slots.unit,
      price: slots.farmerPrice,
    });
    speakResponse(confirmPrompt, lang);
  };

  /**
   * Execute actual API call via existing createProductApi
   */
  const executeProductCreation = async (slots, lang) => {
    setDialogState(DIALOG_STATES.CREATING);
    setErrorMessage('');

    try {
      // Find valid category ID
      let categoryIdToUse = slots.categoryId;
      if (!categoryIdToUse && categories.length > 0) {
        const matched = categories.find((c) => c.slug === slots.categorySlug);
        categoryIdToUse = matched ? matched.id : categories[0].id;
      }

      const payload = {
        name: slots.name || `Farm Fresh ${slots.commodityKey || 'Produce'}`,
        categoryId: categoryIdToUse,
        description:
          slots.description ||
          `Direct farm harvest of ${slots.name || slots.commodityKey} with 100% price transparency.`,
        unit: slots.unit || 'kg',
        farmerPrice: parseFloat(slots.farmerPrice),
        quantity: parseFloat(slots.quantity),
        qualityGrade: slots.qualityGrade || 'A',
        isOrganic: Boolean(slots.isOrganic),
        harvestDate: slots.harvestDate || new Date().toISOString().split('T')[0],
      };

      const response = await createProductApi(payload);
      setSuccessProduct(response?.data || payload);
      setDialogState(DIALOG_STATES.SUCCESS);

      // Localized voice celebration
      const friendlyName = getFriendlyCommodityName(slots.commodityKey || slots.name, lang);
      const successPrompt = getDialogResponse('success', lang, {
        product: friendlyName,
        quantity: slots.quantity,
        unit: slots.unit,
      });

      speakResponse(successPrompt, lang, () => {
        if (onProductCreated) {
          onProductCreated(response?.data || payload);
        }
      });
    } catch (err) {
      console.error('Product creation error:', err);
      const errMsg = err.message || 'Failed to list product to marketplace';
      setErrorMessage(errMsg);
      setDialogState(DIALOG_STATES.ERROR);
      speakResponse(getDialogResponse('error', lang), lang);
    }
  };

  /**
   * Reset the voice assistant state
   */
  const handleReset = () => {
    voiceService.stopListening();
    voiceService.stopSpeaking();
    setIsListening(false);
    setIsSpeaking(false);
    setDialogState(DIALOG_STATES.IDLE);
    setLiveTranscript('');
    setErrorMessage('');
    setSuccessProduct(null);
    setProductSlots({
      name: '',
      commodityKey: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      categorySlug: 'vegetables',
      description: '',
      unit: 'kg',
      quantity: null,
      farmerPrice: null,
      qualityGrade: 'A',
      isOrganic: true,
      harvestDate: new Date().toISOString().split('T')[0],
    });
  };

  /**
   * Apply extracted slots to manual form
   */
  const handleTransferToForm = () => {
    if (onApplyToForm) {
      onApplyToForm(productSlots);
    }
  };

  const farmerPriceNum = parseFloat(productSlots.farmerPrice) || 0;
  const estimatedCustomerPrice = farmerPriceNum + 9;

  return (
    <div className={`voice-assistant-card ${isListening ? 'is-listening' : ''} ${isSpeaking ? 'is-speaking' : ''}`}>
      {/* ── Header ── */}
      <div className="voice-assistant-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="voice-title-badge">
            <Sparkles size={14} /> Multilingual Voice Assistant
          </div>
          <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
            {dialogState === DIALOG_STATES.SUCCESS
              ? '✅ Product Created'
              : dialogState === DIALOG_STATES.CONFIRMING
              ? '⏳ Awaiting Voice Confirmation'
              : dialogState === DIALOG_STATES.CREATING
              ? '⚡ Publishing to Marketplace...'
              : '🎙️ Speak to list produce'}
          </span>
        </div>

        {/* Language Selector */}
        <div className="voice-lang-selector">
          <Languages size={16} color="#16a34a" />
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value);
              if (e.target.value !== 'auto') {
                setActiveLang(e.target.value);
              }
            }}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag || '🌐'} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successProduct && (
        <div
          style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            border: '1.5px solid #86efac',
            color: '#14532d',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={22} color="#16a34a" />
          <div>
            🎉 <strong>{successProduct.name}</strong> ({successProduct.quantity || productSlots.quantity} {successProduct.unit || productSlots.unit}) listed successfully at ₹{successProduct.farmerPrice || productSlots.farmerPrice}/{successProduct.unit || productSlots.unit}!
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#991b1b',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* ── Main Voice Microphone Hub ── */}
      <div className="mic-control-center">
        <div className="mic-button-wrapper">
          {isListening && <div className="mic-pulse-ring" />}
          {isSpeaking && <div className="mic-pulse-ring speaking" />}

          <button
            type="button"
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`mic-btn-main ${isListening ? 'is-active' : isSpeaking ? 'is-speaking' : ''}`}
            aria-label={isListening ? 'Stop Listening' : 'Start Voice Input'}
            title={isListening ? 'Click to stop' : 'Click to speak'}
          >
            {isListening ? <MicOff size={34} /> : isSpeaking ? <Volume2 size={34} /> : <Mic size={34} />}
          </button>
        </div>

        <div className="mic-status-label">
          {isListening ? (
            <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Radio size={16} className="animate-pulse" /> 🎙️ Listening... (பேசுங்கள்)
            </span>
          ) : isSpeaking ? (
            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Volume2 size={16} /> 🔊 Speaking... (உரையாடுகிறது)
            </span>
          ) : dialogState === DIALOG_STATES.PROCESSING ? (
            <span style={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Sparkles size={16} className="animate-spin" /> 🧠 Processing...
            </span>
          ) : (
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>
              Ready • Tap Microphone to Speak
            </span>
          )}
        </div>

        {/* Live waveform indicator */}
        {(isListening || isSpeaking) && (
          <div className="voice-waveform">
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
          </div>
        )}

        <div className="mic-subtext">
          Supports Tamil (தமிழ்), English, Hindi (हिन्दी), Telugu (తెలుగు), Kannada, Malayalam, Marathi & Bengali
        </div>

        {/* Voice control buttons: Replay & Stop */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleReplayResponse}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem', gap: '0.35rem', background: '#ffffff' }}
            title="Replay the last assistant message in native language"
          >
            <Volume2 size={14} color="#16a34a" /> 🔊 Replay Response
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={handleStopSpeaking}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', gap: '0.35rem', color: '#dc2626' }}
            >
              <VolumeX size={14} /> Stop Voice Audio
            </button>
          )}
        </div>
      </div>

      {/* ── Conversation Timeline ── */}
      <div className="voice-chat-timeline">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender}`}>
            <div className="chat-bubble-speaker">
              {msg.sender === 'farmer' ? '👨‍🌾 You (Farmer)' : '🎙️ FarmDirect Assistant'}
              <span style={{ marginLeft: 'auto', fontWeight: 400, opacity: 0.7 }}>{msg.timestamp}</span>
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        {liveTranscript && (
          <div className="chat-bubble farmer" style={{ opacity: 0.8, fontStyle: 'italic' }}>
            <div className="chat-bubble-speaker">🎙️ Hearing you...</div>
            <div>{liveTranscript}</div>
          </div>
        )}
        <div ref={timelineEndRef} />
      </div>

      {/* ── Manual Voice/Text Input bar ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manualInputText.trim()) {
            processUserInput(manualInputText);
            setManualInputText('');
          }
        }}
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}
      >
        <input
          type="text"
          placeholder="Or type what you speak (e.g. 'என்னிடம் 100 கிலோ தக்காளி இருக்கு' or '100 kg tomato at 30 rs')..."
          value={manualInputText}
          onChange={(e) => setManualInputText(e.target.value)}
          className="input-field"
          style={{ flex: 1, fontSize: '0.88rem' }}
        />
        <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <Send size={16} /> Send
        </button>
      </form>

      {/* ── Extracted Produce Slots Card ── */}
      <div className="extracted-slots-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
            🌾 Real-Time Extracted Produce Information
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Detected: <strong>{LANGUAGE_META[activeLang]?.name || activeLang}</strong>
          </span>
        </div>

        <div className="slots-grid">
          {/* Produce Name */}
          <div className={`slot-item ${productSlots.name || productSlots.commodityKey ? 'filled' : 'missing'}`}>
            <span className="slot-label">Product Name</span>
            <span className="slot-value highlight">
              {productSlots.commodityKey || productSlots.name || '— Waiting for voice —'}
            </span>
          </div>

          {/* Quantity */}
          <div className={`slot-item ${productSlots.quantity ? 'filled' : 'missing'}`}>
            <span className="slot-label">Harvest Quantity</span>
            <span className="slot-value">
              {productSlots.quantity ? `${productSlots.quantity} ${productSlots.unit}` : '— Missing —'}
            </span>
          </div>

          {/* Farmer Selling Price */}
          <div className={`slot-item ${productSlots.farmerPrice ? 'filled' : 'missing'}`}>
            <span className="slot-label">Your Selling Price</span>
            <span className="slot-value" style={{ color: '#15803d' }}>
              {productSlots.farmerPrice ? `₹${productSlots.farmerPrice}/${productSlots.unit}` : '— Missing —'}
            </span>
          </div>

          {/* Quality & Organic */}
          <div className="slot-item filled">
            <span className="slot-label">Quality & Grade</span>
            <span className="slot-value" style={{ fontSize: '0.85rem' }}>
              Grade {productSlots.qualityGrade} • {productSlots.isOrganic ? '🌿 Organic' : 'Standard'}
            </span>
          </div>
        </div>

        {/* Live Transparent Price Preview */}
        {productSlots.farmerPrice && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              fontSize: '0.8rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              Direct Farmer Price: <strong>₹{farmerPriceNum}/{productSlots.unit}</strong> (+₹9 FPO/Logistics)
            </span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>
              Marketplace Price: ₹{estimatedCustomerPrice}/{productSlots.unit}
            </span>
          </div>
        )}
      </div>

      {/* ── Quick Test Chips ── */}
      <div className="voice-test-chips">
        <div className="chips-title">
          <HelpCircle size={14} /> Quick One-Click Voice Test Phrases (Tap to simulate speaking):
        </div>

        <div className="chips-list">
          <button
            type="button"
            className="test-chip-btn"
            onClick={() => processUserInput('என்னிடம் 100 கிலோ தக்காளி இருக்கு. ஒரு கிலோ 30 ரூபாய்.')}
          >
            🌾 Tamil Full: "என்னிடம் 100 கிலோ தக்காளி இருக்கு. ஒரு கிலோ 30 ரூபாய்."
          </button>

          <button
            type="button"
            className="test-chip-btn"
            onClick={() => processUserInput('I have 100 kilograms of tomatoes at 30 rupees per kilogram.')}
          >
            🇮🇳 English Full: "I have 100 kilograms of tomatoes at 30 rupees per kilogram."
          </button>

          <button
            type="button"
            className="test-chip-btn"
            onClick={() => processUserInput('என்னிடம் தக்காளி இருக்கு')}
          >
            🌾 Tamil Partial: "என்னிடம் தக்காளி இருக்கு" (Missing Qty & Price)
          </button>

          <button
            type="button"
            className="test-chip-btn"
            onClick={() => processUserInput('I have 100 kilos of tomatoes')}
          >
            🇮🇳 English Partial: "I have 100 kilos of tomatoes" (Missing Price)
          </button>

          <button
            type="button"
            className="test-chip-btn"
            onClick={() => processUserInput('No, 150 kilos.')}
          >
            🔄 Correction Test: "No, 150 kilos."
          </button>

          <button
            type="button"
            className="test-chip-btn"
            onClick={() => processUserInput('ஆம், சேர்க்கவும்.')}
          >
            ✅ Tamil Voice Confirm: "ஆம், சேர்க்கவும்."
          </button>

          <button
            type="button"
            className="test-chip-btn"
            onClick={() => processUserInput('Yes')}
          >
            ✅ English Voice Confirm: "Yes"
          </button>
        </div>
      </div>

      {/* ── Confirmation / Action Controls ── */}
      <div className="voice-actions-bar">
        <button type="button" onClick={handleReset} className="voice-btn-cancel">
          <RotateCcw size={14} /> Reset / Start New
        </button>

        {dialogState === DIALOG_STATES.CONFIRMING && (
          <>
            <button
              type="button"
              onClick={() => processUserInput('No, change quantity')}
              className="voice-btn-correct"
            >
              🎙️ No / Correct (மாற்று)
            </button>

            <button
              type="button"
              onClick={() => executeProductCreation(productSlots, activeLang)}
              className="voice-btn-confirm"
            >
              <CheckCircle2 size={18} /> Confirm & Publish (ஆம், சேர்)
            </button>
          </>
        )}

        {dialogState !== DIALOG_STATES.CONFIRMING && productSlots.name && productSlots.farmerPrice && (
          <button
            type="button"
            onClick={handleTransferToForm}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowRight size={14} /> Fill Into Form Below
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceProductAssistant;

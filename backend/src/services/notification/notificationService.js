// Multilingual Notification Service
// Supports dynamic templates in Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali & English
// Triggers In-App, SMS, and automated Voice IVR alerts derived directly from DB orders

const prisma = require('../../config/database');

// ── Multi-Language Template Engine ──────────────────────────────────────────────

const MULTILINGUAL_TEMPLATES = {
  'ta-IN': {
    langName: 'Tamil',
    smsTitle: 'புதிய ஆர்டர் வந்துள்ளது',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect புதிய ஆர்டர்:\nஆர்டர் #${orderNumber}\n${itemsText}\nமொத்தம்: ₹${totalAmount}\nஆர்டரை உறுதிப்படுத்த 1, நிராகரிக்க 2 அழுத்தவும்.`,
    voiceTitle: 'தானியங்கி குரல் அழைப்பு (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `வணக்கம் ${farmerName}. FARMDirect தானியங்கி ஆர்டர் அறிவிப்பு. புதிய ஆர்டர் #${orderNumber} வந்துள்ளது. ${itemsSummary}. உங்கள் மொத்த தொகை ${totalAmount} ரூபாய். இந்த ஆர்டரை ஏற்க 1 அழுத்தவும். நிராகரிக்க 2 அழுத்தவும்.`,
  },
  'hi-IN': {
    langName: 'Hindi',
    smsTitle: 'नया ऑर्डर प्राप्त हुआ',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect नया ऑर्डर:\nऑर्डर #${orderNumber}\n${itemsText}\nकुल: ₹${totalAmount}\nऑर्डर स्वीकार करने के लिए 1, अस्वीकार करने के लिए 2 भेजें।`,
    voiceTitle: 'स्वचालित वॉइस कॉल (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `नमस्ते ${farmerName}। FARMDirect स्वचालित ऑर्डर सूचना। आपको नया ऑर्डर #${orderNumber} मिला है। ${itemsSummary}। कुल राशि ${totalAmount} रुपये। इस ऑर्डर को स्वीकार करने के लिए 1 दबाएं। अस्वीकार करने के लिए 2 दबाएं।`,
  },
  'te-IN': {
    langName: 'Telugu',
    smsTitle: 'కొత్త ఆర్డర్ వచ్చింది',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect కొత్త ఆర్డర్:\nఆర్డర్ #${orderNumber}\n${itemsText}\nమొత్తం: ₹${totalAmount}\nఆర్డర్ నిర్ధారించడానికి 1, తిరస్కరించడానికి 2 నొక్కండి.`,
    voiceTitle: 'ఆటోమేటెడ్ వాయిస్ కాల్ (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `నమస్కారం ${farmerName}. FARMDirect ఆటోమేటెడ్ ఆర్డర్ నోటిఫికేషన్. మీకు కొత్త ఆర్డర్ #${orderNumber} వచ్చింది. ${itemsSummary}. మొత్తం విలువ ${totalAmount} రూపాయలు. ఈ ఆర్డర్‌ను ఆమోదించడానికి 1 నొక్కండి. తిరస్కరించడానికి 2 నొక్కండి.`,
  },
  'kn-IN': {
    langName: 'Kannada',
    smsTitle: 'ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect ಹೊಸ ಆರ್ಡರ್:\nಆರ್ಡರ್ #${orderNumber}\n${itemsText}\nಒಟ್ಟು: ₹${totalAmount}\nಆರ್ಡರ್ ಖಚಿತಪಡಿಸಲು 1, ತಿರಸ್ಕರಿಸಲು 2 ಒತ್ತಿರಿ.`,
    voiceTitle: 'ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ಕರೆ (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `ನಮಸ್ಕಾರ ${farmerName}. FARMDirect ಸ್ವಯಂಚಾಲಿತ ಆರ್ಡರ್ ಸೂಚನೆ. ನಿಮಗೆ ಹೊಸ ಆರ್ಡರ್ #${orderNumber} ಬಂದಿದೆ. ${itemsSummary}. ಒಟ್ಟು ಮೊತ್ತ ${totalAmount} ರೂಪಾಯಿ. ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಲು 1 ಒತ್ತಿರಿ. ತಿರಸ್ಕರಿಸಲು 2 ಒತ್ತಿರಿ.`,
  },
  'ml-IN': {
    langName: 'Malayalam',
    smsTitle: 'പുതിയ ഓർഡർ ലഭിച്ചു',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect പുതിയ ഓർഡർ:\nഓർഡർ #${orderNumber}\n${itemsText}\nആകെ: ₹${totalAmount}\nഓർഡർ സ്ഥിരീകരിക്കാൻ 1, നിരസിക്കാൻ 2 അമർത്തുക.`,
    voiceTitle: 'ഓട്ടോമേറ്റഡ് വോയ്‌സ് കോൾ (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `നമസ്കാരം ${farmerName}. FARMDirect ഓട്ടോമേറ്റഡ് ഓർഡർ അറിയിപ്പ്. പുതിയ ഓർഡർ #${orderNumber} ലഭിച്ചു. ${itemsSummary}. ആകെ തുക ${totalAmount} രൂപ. ഓർഡർ സ്ഥിരീകരിക്കാൻ 1 അമർത്തുക. നിരസിക്കാൻ 2 അമർത്തുക.`,
  },
  'mr-IN': {
    langName: 'Marathi',
    smsTitle: 'नवीन ऑर्डर मिळाली',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect नवीन ऑर्डर:\nऑर्डर #${orderNumber}\n${itemsText}\nएकूण: ₹${totalAmount}\nऑर्डर स्वीकारण्यासाठी 1, नाकारण्यासाठी 2 पाठवा.`,
    voiceTitle: 'स्वयंचलित व्हॉइस कॉल (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `नमस्कार ${farmerName}. FARMDirect स्वयंचलित ऑर्डर सूचना. तुम्हाला नवीन ऑर्डर #${orderNumber} मिळाली आहे. ${itemsSummary}. एकूण रक्कम ${totalAmount} रुपये. ऑर्डर स्वीकारण्यासाठी 1 दाबा. नाकारण्यासाठी 2 दाबा.`,
  },
  'bn-IN': {
    langName: 'Bengali',
    smsTitle: 'নতুন অর্ডার এসেছে',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect নতুন অর্ডার:\nঅর্ডার #${orderNumber}\n${itemsText}\nমোট: ₹${totalAmount}\nঅর্ডার নিশ্চিত করতে 1, প্রত্যাখ্যান করতে 2 টিপুন।`,
    voiceTitle: 'স্বয়ংক্রিয় ভয়েস কল (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `নমস্কার ${farmerName}। FARMDirect স্বয়ংক্রিয় অর্ডার বিজ্ঞপ্তি। নতুন অর্ডার #${orderNumber} এসেছে। ${itemsSummary}। মোট মূল্য ${totalAmount} টাকা। অর্ডার নিশ্চিত করতে 1 টিপুন। প্রত্যাখ্যান করতে 2 টিপুন।`,
  },
  'en-IN': {
    langName: 'English (India)',
    smsTitle: 'New Order Received',
    smsBody: ({ orderNumber, itemsText, totalAmount }) =>
      `FARMDirect Order Alert:\nOrder #${orderNumber}\n${itemsText}\nTotal: ₹${totalAmount}\nReply 1 to confirm harvest availability, 2 to reject.`,
    voiceTitle: 'Automated Voice Call (IVR)',
    voiceScript: ({ farmerName, orderNumber, itemsSummary, totalAmount }) =>
      `Hello ${farmerName}. This is an automated FARMDirect order notification. You have received a new order #${orderNumber}. ${itemsSummary}. Total farmer payout is ${totalAmount} rupees. Press 1 on your keypad to confirm harvest availability. Press 2 to reject.`,
  },
};

// ── Providers ──────────────────────────────────────────────────────────────────

class MockSMSProvider {
  async send(phone, message, lang) {
    console.log(`\n==================================================`);
    console.log(`[SMS SIMULATION] Delivered to Farmer Phone: ${phone} (Language: ${lang})`);
    console.log(`--------------------------------------------------`);
    console.log(message);
    console.log(`==================================================\n`);
    return { success: true, provider: 'mock_sms', messageId: `sms_${Date.now()}` };
  }
}

class MockVoiceProvider {
  async call(phone, script, lang) {
    console.log(`\n==================================================`);
    console.log(`[VOICE CALL SIMULATION] Dialing Farmer Phone: ${phone} (Language: ${lang})`);
    console.log(`--------------------------------------------------`);
    console.log(script);
    console.log(`==================================================\n`);
    return { success: true, provider: 'mock_voice', callId: `call_${Date.now()}` };
  }
}

const smsProvider = new MockSMSProvider();
const voiceProvider = new MockVoiceProvider();

// ── Notification Helpers ────────────────────────────────────────────────────────

async function createNotification({
  userId,
  orderId = null,
  senderId = null,
  channel,
  title,
  message,
  messageTamil = null,
  language = 'ta-IN',
  metadata = null,
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      orderId,
      senderId,
      channel,
      title,
      message,
      messageTamil,
      language,
      metadata: metadata ? JSON.stringify(metadata) : null,
      status: 'PENDING',
    },
  });
  return notification;
}

async function sendNotification(notification) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      include: { farmerProfile: true },
    });
    if (!user) return;

    const phone = user.phone;
    const lang = notification.language || user.farmerProfile?.preferredLanguage || user.preferredLanguage || 'ta-IN';
    let result = null;

    if (notification.channel === 'SMS') {
      result = await smsProvider.send(phone, notification.message, lang);
    } else if (notification.channel === 'VOICE') {
      result = await voiceProvider.call(phone, notification.message, lang);
    }

    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return result;
  } catch (err) {
    console.error('Notification delivery error:', err);
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'FAILED' },
    });
  }
}

// ── Event Handlers ────────────────────────────────────────────────────────────

// Trigger automated alerts when an order is placed
async function notifyNewOrder(order) {
  const orderWithDetails = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              farmer: {
                include: { user: true },
              },
            },
          },
        },
      },
      buyer: { include: { user: true } },
    },
  });

  if (!orderWithDetails || !orderWithDetails.items?.length) return;

  // Group items by owning farmer (with single-farmer orders, exactly 1 farmer will be processed)
  const farmersMap = new Map();

  for (const item of orderWithDetails.items) {
    const farmer = item.product.farmer;
    if (!farmer || !farmer.user) continue;

    if (!farmersMap.has(farmer.id)) {
      farmersMap.set(farmer.id, {
        farmer,
        items: [],
      });
    }
    farmersMap.get(farmer.id).items.push(item);
  }

  // Send alerts to ONLY the farmer(s) owning the items in this specific order
  for (const [farmerId, { farmer, items }] of farmersMap.entries()) {
    const farmerUser = farmer.user;
    const lang = farmer.preferredLanguage || farmerUser.preferredLanguage || 'ta-IN';
    const templates = MULTILINGUAL_TEMPLATES[lang] || MULTILINGUAL_TEMPLATES['ta-IN'];

    const totalFarmerAmount = items.reduce((sum, i) => sum + i.totalFarmerAmount, 0);

    const itemsTextLines = items
      .map((i) => `${i.product.name}: ${i.quantity} ${i.unit} @ ₹${i.farmerPrice}/${i.unit}`)
      .join('\n');

    const itemsSummarySpeech = items
      .map((i) => `${i.product.name} ${i.quantity} ${i.unit}`)
      .join(', ');

    const templateData = {
      farmerName: farmerUser.name,
      orderNumber: orderWithDetails.orderNumber,
      itemsText: itemsTextLines,
      itemsSummary: itemsSummarySpeech,
      totalAmount: totalFarmerAmount.toFixed(0),
    };

    const smsMessage = templates.smsBody(templateData);
    const voiceScript = templates.voiceScript(templateData);

    // 1. In-App Notification
    const inAppNotif = await createNotification({
      userId: farmerUser.id,
      orderId: order.id,
      channel: 'IN_APP',
      title: templates.smsTitle,
      message: smsMessage,
      messageTamil: MULTILINGUAL_TEMPLATES['ta-IN'].smsBody(templateData),
      language: lang,
      metadata: {
        orderNumber: orderWithDetails.orderNumber,
        itemsCount: items.length,
        totalFarmerAmount,
      },
    });
    await sendNotification(inAppNotif);

    // 2. SMS Notification
    const smsNotif = await createNotification({
      userId: farmerUser.id,
      orderId: order.id,
      channel: 'SMS',
      title: templates.smsTitle,
      message: smsMessage,
      language: lang,
      metadata: { phone: farmerUser.phone, orderNumber: orderWithDetails.orderNumber },
    });
    await sendNotification(smsNotif);

    // 3. Automated Voice IVR Notification
    const voiceNotif = await createNotification({
      userId: farmerUser.id,
      orderId: order.id,
      channel: 'VOICE',
      title: templates.voiceTitle,
      message: voiceScript,
      language: lang,
      metadata: {
        phone: farmerUser.phone,
        orderNumber: orderWithDetails.orderNumber,
        dtmfSupported: true,
      },
    });
    await sendNotification(voiceNotif);
  }
}

// Trigger status updates
async function notifyOrderStatusChange(order, newStatus) {
  const orderFull = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      buyer: { include: { user: true } },
    },
  });
  if (!orderFull || !orderFull.buyer) return;

  const statusMessages = {
    FARMER_CONFIRMED: 'Your order has been confirmed by the farmer and scheduled for aggregation.',
    FARMER_REJECTED: 'Produce for your order was unavailable and has been cancelled by the farmer.',
    FPO_ASSIGNED: 'Your order has been assigned to the regional FPO hub.',
    COLLECTION_SCHEDULED: 'Produce pickup has been scheduled from the farm gate.',
    COLLECTED: 'Produce has been collected from the farm and weighed at aggregation center.',
    PACKED: 'Your order has been graded and packed in eco-ventilated crates.',
    IN_TRANSIT: 'Your order is currently in transit to destination.',
    OUT_FOR_DELIVERY: 'Your order is out for delivery today!',
    DELIVERED: 'Your order has been successfully delivered!',
    CANCELLED: 'Your order has been cancelled.',
  };

  const message = statusMessages[newStatus] || `Order status updated to ${newStatus}`;

  const notif = await createNotification({
    userId: orderFull.buyer.userId,
    orderId: order.id,
    channel: 'IN_APP',
    title: `Order #${orderFull.orderNumber} Status: ${newStatus.replace(/_/g, ' ')}`,
    message,
    language: 'en-IN',
  });
  await sendNotification(notif);
}

module.exports = {
  createNotification,
  sendNotification,
  notifyNewOrder,
  notifyOrderStatusChange,
  MULTILINGUAL_TEMPLATES,
};

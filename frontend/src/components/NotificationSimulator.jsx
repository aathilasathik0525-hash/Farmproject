import React, { useState } from 'react';
import {
  Smartphone,
  PhoneCall,
  MessageSquare,
  Building2,
  CheckCircle2,
  XCircle,
  Volume2,
  Radio,
  Send,
} from 'lucide-react';
import { simulateNotificationApi, updateOrderStatusApi } from '../api/endpoints';

export const NotificationSimulator = ({
  orderId,
  orderNumber = 'FD-1001',
  productName = 'Country Tomatoes',
  quantity = '100 kg',
  farmerPrice = '₹25/kg',
  totalAmount = '₹2,500',
  onStatusUpdated,
}) => {
  const [activeTab, setActiveTab] = useState('sms'); // sms, voice, fpo
  const [lang, setLang] = useState('ta'); // ta (Tamil) or en (English)
  const [actionState, setActionState] = useState(null); // 'confirmed', 'rejected'
  const [loading, setLoading] = useState(false);

  const englishSMS = `New Order Received:\nOrder #${orderNumber}\n${productName}: ${quantity}\nFarmer Price: ${farmerPrice}\nTotal: ${totalAmount}\nPlease confirm availability.`;

  const tamilSMS = `புதிய ஆர்டர் வந்துள்ளது.\nஆர்டர் #${orderNumber}\n${productName}: ${quantity}\nவிலை: ${farmerPrice}\nமொத்தம்: ${totalAmount}\nஆர்டரை உறுதிப்படுத்த 1 அழுத்தவும்.`;

  const englishVoice = `Automated Voice Call (IVR):\n"Hello Ravi Kumar, you have received a new order for ${quantity} of ${productName} at your price of ${farmerPrice}. Press 1 to confirm harvest, Press 2 to decline."`;

  const tamilVoice = `தானியங்கி குரல் அழைப்பு (IVR):\n"வணக்கம் ரவி குமார், உங்களுக்கு ${quantity} ${productName} ஆர்டர் வந்துள்ளது. உங்கள் விலை ${farmerPrice}. அறுவடையை உறுதிப்படுத்த 1 அழுத்தவும், நிராகரிக்க 2 அழுத்தவும்."`;

  const handleFarmerAction = async (status) => {
    if (!orderId) {
      setActionState(status === 'FARMER_CONFIRMED' ? 'confirmed' : 'rejected');
      return;
    }

    try {
      setLoading(true);
      await updateOrderStatusApi(orderId, status, `Farmer responded via IVR/SMS: ${status}`);
      setActionState(status === 'FARMER_CONFIRMED' ? 'confirmed' : 'rejected');
      if (onStatusUpdated) onStatusUpdated(status);
    } catch (err) {
      console.error('Order status update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid var(--primary-300)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.12)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              background: 'var(--primary-100)',
              color: 'var(--primary-800)',
              padding: '0.45rem',
              borderRadius: '8px',
            }}
          >
            <Radio size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
              Non-Smartphone Farmer Dispatch Center
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Farmers receive automated Voice IVR and SMS in their local language
            </span>
          </div>
        </div>

        {/* Language switch */}
        <div
          style={{
            display: 'flex',
            background: 'var(--slate-100)',
            padding: '0.2rem',
            borderRadius: '6px',
          }}
        >
          <button
            onClick={() => setLang('ta')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: lang === 'ta' ? '#ffffff' : 'transparent',
              color: lang === 'ta' ? 'var(--primary-700)' : 'var(--slate-600)',
              boxShadow: lang === 'ta' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            தமிழ் (Tamil)
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: lang === 'en' ? '#ffffff' : 'transparent',
              color: lang === 'en' ? 'var(--primary-700)' : 'var(--slate-600)',
              boxShadow: lang === 'en' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            English
          </button>
        </div>
      </div>

      {/* Simulated Channel Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--slate-200)',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('sms')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeTab === 'sms' ? 'var(--primary-50)' : 'transparent',
            color: activeTab === 'sms' ? 'var(--primary-700)' : 'var(--slate-600)',
            border: activeTab === 'sms' ? '1px solid var(--primary-200)' : '1px solid transparent',
          }}
        >
          <MessageSquare size={16} /> SMS Alert <span className="badge badge-green">Sent ✓</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeTab === 'voice' ? 'var(--primary-50)' : 'transparent',
            color: activeTab === 'voice' ? 'var(--primary-700)' : 'var(--slate-600)',
            border: activeTab === 'voice' ? '1px solid var(--primary-200)' : '1px solid transparent',
          }}
        >
          <PhoneCall size={16} /> Voice Call (IVR) <span className="badge badge-green">Triggered ✓</span>
        </button>

        <button
          onClick={() => setActiveTab('fpo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeTab === 'fpo' ? 'var(--primary-50)' : 'transparent',
            color: activeTab === 'fpo' ? 'var(--primary-700)' : 'var(--slate-600)',
            border: activeTab === 'fpo' ? '1px solid var(--primary-200)' : '1px solid transparent',
          }}
        >
          <Building2 size={16} /> FPO Notified <span className="badge badge-blue">Synced ✓</span>
        </button>
      </div>

      {/* Simulated Phone Screen */}
      <div
        style={{
          background: activeTab === 'voice' ? '#1e293b' : '#0f172a',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          marginBottom: '1.25rem',
          whiteSpace: 'pre-line',
          position: 'relative',
          border: '2px solid #334155',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
            paddingBottom: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <span>{activeTab === 'voice' ? '📞 INCOMING CALL: +91 800-FARMDIRECT' : '💬 SMS: MSG91-FARMDIRECT'}</span>
          <span>LIVE SIMULATION</span>
        </div>

        {activeTab === 'sms' && (lang === 'ta' ? tamilSMS : englishSMS)}
        {activeTab === 'voice' && (lang === 'ta' ? tamilVoice : englishVoice)}
        {activeTab === 'fpo' &&
          `FPO Automated Dispatch Log:\nOrder #${orderNumber} registered with Trichy Central Cooperative.\nAssigned to Field Officer K. Balasubramanian for farm-gate weighment.`}
      </div>

      {/* Action Buttons for Farmer Response */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {actionState === 'confirmed' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#166534',
              background: '#dcfce7',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              width: '100%',
            }}
          >
            <CheckCircle2 size={20} /> Order Confirmed by Farmer (IVR Option 1 Selected). FPO Aggregation Triggered!
          </div>
        ) : actionState === 'rejected' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#991b1b',
              background: '#fee2e2',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              width: '100%',
            }}
          >
            <XCircle size={20} /> Order Rejected (Stock unavailable). Inventory Returned.
          </div>
        ) : (
          <>
            <button
              onClick={() => handleFarmerAction('FARMER_CONFIRMED')}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <CheckCircle2 size={18} /> Confirm Order (Press 1 / Reply YES)
            </button>

            <button
              onClick={() => handleFarmerAction('FARMER_REJECTED')}
              disabled={loading}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              <XCircle size={18} /> Reject Order (Press 2 / Reply NO)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

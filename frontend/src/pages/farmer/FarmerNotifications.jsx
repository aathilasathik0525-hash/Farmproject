import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { getNotificationsApi, markNotificationReadApi } from '../../api/endpoints';
import {
  Bell,
  PhoneCall,
  MessageSquare,
  Building2,
  CheckCircle2,
  RefreshCw,
  Globe,
} from 'lucide-react';

export const FarmerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('both'); // both, ta, en

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsApi();
      if (res?.data) setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              SMS & Voice Notification History
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Simulated mobile dispatch logs sent to your registered phone in English & தமிழ் (Tamil)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedLang(selectedLang === 'ta' ? 'both' : 'ta')}
              className="btn btn-secondary btn-sm"
            >
              <Globe size={14} /> {selectedLang === 'ta' ? 'Showing Tamil' : 'Toggle Tamil Only'}
            </button>
            <button onClick={fetchNotifs} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-500)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div>Loading notification history...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Bell size={40} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No notifications received yet</h3>
            <p style={{ color: 'var(--slate-600)' }}>
              New orders will trigger SMS and IVR voice call dispatches automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderLeft:
                    n.channel === 'VOICE'
                      ? '4px solid #8b5cf6'
                      : n.channel === 'SMS'
                      ? '4px solid var(--primary-600)'
                      : '4px solid #0ea5e9',
                  background: n.isRead ? '#ffffff' : 'var(--primary-50)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {n.channel === 'VOICE' ? (
                      <PhoneCall size={18} color="#8b5cf6" />
                    ) : n.channel === 'SMS' ? (
                      <MessageSquare size={18} color="var(--primary-600)" />
                    ) : (
                      <Building2 size={18} color="#0ea5e9" />
                    )}
                    <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>{n.title}</strong>
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                      {n.channel} {n.status} ✓
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Message Content */}
                <div
                  style={{
                    background: 'var(--slate-900)',
                    color: '#f8fafc',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.5',
                    margin: '0.5rem 0',
                  }}
                >
                  {selectedLang === 'ta' && n.messageTamil
                    ? n.messageTamil
                    : selectedLang === 'en'
                    ? n.message
                    : `${n.message}\n\n[தமிழ் வடிவம்]:\n${n.messageTamil || n.message}`}
                </div>

                {!n.isRead && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}
                    >
                      Mark as Acknowledged
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const DemoBanner = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleSwitch = async (roleKey, targetPath) => {
    try {
      setLoadingRole(roleKey);
      await loginAsDemo(roleKey);
      navigate(targetPath);
    } catch (err) {
      console.error('Demo login switch error:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <aside aria-label="Demo Mode Switcher" style={{
      background: 'linear-gradient(90deg, #052e16 0%, #14532d 100%)',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
      borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          background: 'rgba(34, 197, 94, 0.25)',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '0.75rem',
          color: '#86efac',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <Sparkles size={12} /> SIH26033 LIVE DEMO MODE
        </span>
        <span style={{ color: '#dcfce7', opacity: 0.9 }}>
          {user ? (
            <>Logged in as: <strong style={{ color: '#ffffff' }}>{user.name}</strong> ({user.role === 'BUYER' ? 'CUSTOMER' : user.role})</>
          ) : (
            'Select a demo role to test full platform workflow:'
          )}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleSwitch('FARMER', '/farmer')}
          disabled={loadingRole === 'FARMER'}
          style={{
            background: user?.role === 'FARMER' ? '#22c55e' : 'rgba(255,255,255,0.12)',
            color: user?.role === 'FARMER' ? '#052e16' : '#ffffff',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          👨‍🌾 Farmer Demo
        </button>

        <button
          onClick={() => handleSwitch('BUYER', '/marketplace')}
          disabled={loadingRole === 'BUYER'}
          style={{
            background: (user?.role === 'BUYER' || user?.role === 'CUSTOMER') ? '#22c55e' : 'rgba(255,255,255,0.12)',
            color: (user?.role === 'BUYER' || user?.role === 'CUSTOMER') ? '#052e16' : '#ffffff',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          🛒 Customer Demo
        </button>

        <button
          onClick={() => handleSwitch('FPO', '/fpo')}
          disabled={loadingRole === 'FPO'}
          style={{
            background: user?.role === 'FPO' ? '#22c55e' : 'rgba(255,255,255,0.12)',
            color: user?.role === 'FPO' ? '#052e16' : '#ffffff',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          🏢 FPO Demo
        </button>

        <button
          onClick={() => handleSwitch('LOGISTICS', '/admin/shipments')}
          disabled={loadingRole === 'LOGISTICS'}
          style={{
            background: user?.role === 'LOGISTICS' ? '#22c55e' : 'rgba(255,255,255,0.12)',
            color: user?.role === 'LOGISTICS' ? '#052e16' : '#ffffff',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          🚚 Logistics Demo
        </button>

        <button
          onClick={() => handleSwitch('ADMIN', '/admin')}
          disabled={loadingRole === 'ADMIN'}
          style={{
            background: user?.role === 'ADMIN' ? '#22c55e' : 'rgba(255,255,255,0.12)',
            color: user?.role === 'ADMIN' ? '#052e16' : '#ffffff',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          👑 Admin Demo
        </button>
      </div>
    </aside>
  );
};

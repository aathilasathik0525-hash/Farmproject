import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Truck, Scale, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Col 1 */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#ffffff',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  background: 'var(--primary-600)',
                  color: '#ffffff',
                  padding: '0.4rem',
                  borderRadius: '8px',
                }}
              >
                <Sprout size={20} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                }}
              >
                FarmDirect
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#cbd5e1' }}>
              Direct farmer-to-buyer agricultural marketplace and supply-chain coordination
              platform for Smart India Hackathon (SIH26033).
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#4ade80',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Award size={14} /> Problem Statement: SIH26033
            </div>
          </div>

          {/* Col 2: Core Pillars */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Platform Pillars
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scale size={15} color="#22c55e" /> 100% Direct Farmer Pricing
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={15} color="#22c55e" /> Verified FPO Aggregation
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={15} color="#22c55e" /> Coordinated Farm-Gate Logistics
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sprout size={15} color="#22c55e" /> Non-Smartphone Voice/SMS Alerts
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Quick Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Link to="/marketplace" style={{ color: '#cbd5e1' }}>Direct Marketplace</Link>
              <Link to="/impact" style={{ color: '#cbd5e1' }}>Impact & Price Comparison</Link>
              <Link to="/login" style={{ color: '#cbd5e1' }}>Interactive Role Demos</Link>
              <Link to="/register" style={{ color: '#cbd5e1' }}>Farmer Onboarding</Link>
            </div>
          </div>

          {/* Col 4: Regional Pilot */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Pilot Region
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              Tamil Nadu Delta & Southern Agri Corridors (Trichy, Madurai, Thanjavur, Salem, Coimbatore).
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem' }}>
              Supports English & தமிழ் (Tamil) Voice / SMS notifications.
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
          }}
        >
          <div>© {new Date().getFullYear()} FarmDirect • SIH26033 Production MVP</div>
          <div style={{ color: '#64748b' }}>
            Built with React, Node.js, Express & Prisma
          </div>
        </div>
      </div>
    </footer>
  );
};

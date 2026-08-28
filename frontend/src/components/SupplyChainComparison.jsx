import React from 'react';
import { ArrowRight, CheckCircle2, XCircle, TrendingDown, TrendingUp } from 'lucide-react';

export const SupplyChainComparison = () => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--slate-200)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>
          SIH26033 Problem & Solution Architecture
        </span>
        <h2 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
          Eliminating Multiple Intermediary Cuts
        </h2>
        <p style={{ color: 'var(--slate-600)', maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
          Compare the bloated multi-tiered traditional agricultural distribution against
          FarmDirect’s coordinated direct supply chain.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Traditional Model */}
        <div
          style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <XCircle size={22} color="#dc2626" />
              <h3 style={{ fontSize: '1.15rem', color: '#991b1b' }}>Traditional Supply Chain</h3>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              5+ Middlemen
            </span>
          </div>

          {/* Steps */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.8rem', borderRadius: '6px' }}>
              <span>👨‍🌾 Farmer</span>
              <strong style={{ color: '#dc2626' }}>Receives ₹14/kg</strong>
            </div>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>↓ Local Commission Agent (+₹3)</div>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>↓ APMC Mandi Wholesaler (+₹6)</div>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>↓ Secondary Distributor (+₹8)</div>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>↓ Local Retail Vendor (+₹14)</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.8rem', borderRadius: '6px' }}>
              <span>🛒 Consumer / Buyer</span>
              <strong style={{ color: '#991b1b' }}>Pays ₹45/kg</strong>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px dashed #fca5a5',
              paddingTop: '0.85rem',
              fontSize: '0.85rem',
              color: '#7f1d1d',
            }}
          >
            ❌ <strong>Farmer gets only ~31%</strong> of what the consumer pays. Middlemen pocket 69% of value.
          </div>
        </div>

        {/* FarmDirect Model */}
        <div
          style={{
            background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid var(--primary-500)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={22} color="#16a34a" />
              <h3 style={{ fontSize: '1.15rem', color: '#166534' }}>FarmDirect Direct Platform</h3>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#bbf7d0',
                color: '#14532d',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              Zero Middlemen
            </span>
          </div>

          {/* Steps */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--primary-300)' }}>
              <span>👨‍🌾 Farmer (Price Maker)</span>
              <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>Receives ₹25/kg (+78% More)</strong>
            </div>
            <div style={{ textAlign: 'center', color: '#166534', fontWeight: 600 }}>
              ↓ Coordinated FPO Aggregation & Direct Logistics (+₹9 Transparent Costs)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--primary-300)' }}>
              <span>🛒 Consumer / Buyer</span>
              <strong style={{ color: '#15803d', fontSize: '0.95rem' }}>Pays ₹34/kg (24% Cheaper)</strong>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px dashed #86efac',
              paddingTop: '0.85rem',
              fontSize: '0.85rem',
              color: '#14532d',
            }}
          >
            ✅ <strong>Farmer gets ~74% of consumer spend</strong> directly into bank account with complete price control.
          </div>
        </div>
      </div>
    </div>
  );
};

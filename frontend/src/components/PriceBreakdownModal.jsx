import React from 'react';
import { X, CheckCircle, ArrowDown, ShieldCheck, HelpCircle } from 'lucide-react';

export const PriceBreakdownModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const b = product.priceBreakdown || {
    farmerPrice: product.farmerPrice || 25,
    collectionCharge: 1,
    packagingCharge: 2,
    transportCharge: 5,
    platformFee: 1,
    totalCharges: 9,
    customerPrice: (product.farmerPrice || 25) + 9,
  };

  const farmerPercentage = Math.round((b.farmerPrice / b.customerPrice) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--slate-200)',
            paddingBottom: '0.75rem',
          }}
        >
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.25rem' }}>
              100% Price Transparency
            </span>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--slate-900)' }}>
              Transparent Price Journey
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--slate-100)',
              borderRadius: '50%',
              padding: '0.4rem',
              color: 'var(--slate-600)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Callout */}
        <div
          style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '1.05rem' }}>
              {product.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Farmer: <strong>{product.farmer?.user?.name || 'Ravi Kumar'}</strong> ({product.farmer?.village || 'Lalgudi'}, {product.farmer?.district || 'Trichy'})
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>
              Final Buyer Price
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)' }}>
              ₹{b.customerPrice.toFixed(0)}/{product.unit || 'kg'}
            </span>
          </div>
        </div>

        {/* Visual Price Journey Stack */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* 1. Farmer Base */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid var(--primary-500)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'var(--primary-600)',
                  color: '#ffffff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                1
              </div>
              <div>
                <strong style={{ color: 'var(--primary-900)', fontSize: '0.95rem' }}>
                  FARMER'S DIRECT PRICE
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Set directly by farmer ({farmerPercentage}% of final price)
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--primary-700)',
              }}
            >
              ₹{b.farmerPrice.toFixed(0)}/{product.unit || 'kg'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.3rem 0', color: 'var(--slate-400)' }}>
            <ArrowDown size={18} />
          </div>

          {/* 2. Collection */}
          <div className="price-step-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'var(--slate-200)',
                  color: 'var(--slate-700)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>FPO Farm Gate Collection</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Weighing & village aggregation hub</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
              + ₹{b.collectionCharge.toFixed(0)}/{product.unit || 'kg'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0', color: 'var(--slate-400)' }}>
            <ArrowDown size={16} />
          </div>

          {/* 3. Packaging */}
          <div className="price-step-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'var(--slate-200)',
                  color: 'var(--slate-700)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Grading & Eco-Packaging</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Ventilated crates & sorting</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
              + ₹{b.packagingCharge.toFixed(0)}/{product.unit || 'kg'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0', color: 'var(--slate-400)' }}>
            <ArrowDown size={16} />
          </div>

          {/* 4. Transportation */}
          <div className="price-step-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'var(--slate-200)',
                  color: 'var(--slate-700)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                4
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Transportation & Logistics</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Direct vehicle transit to city hub</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
              + ₹{b.transportCharge.toFixed(0)}/{product.unit || 'kg'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0', color: 'var(--slate-400)' }}>
            <ArrowDown size={16} />
          </div>

          {/* 5. Platform Fee */}
          <div className="price-step-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'var(--slate-200)',
                  color: 'var(--slate-700)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                5
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>FarmDirect Coordination Fee</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>SMS/Voice IVR dispatch & tech ops</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
              + ₹{b.platformFee.toFixed(0)}/{product.unit || 'kg'}
            </span>
          </div>
        </div>

        {/* Clear Guarantee Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.1rem',
            fontSize: '0.85rem',
            color: '#166534',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Direct Earning Guarantee:</strong> Farmer receives the exact base price of{' '}
            <strong>₹{b.farmerPrice.toFixed(0)}/{product.unit || 'kg'}</strong>. All supply-chain
            costs are shown transparently with zero hidden middlemen cuts.
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Understood • Close Breakdown
        </button>
      </div>
    </div>
  );
};

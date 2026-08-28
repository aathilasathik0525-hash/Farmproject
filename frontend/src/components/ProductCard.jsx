import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PriceBreakdownModal } from './PriceBreakdownModal';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  ShoppingCart,
  Check,
} from 'lucide-react';

const CATEGORY_EMOJIS = {
  vegetables: '🍅',
  fruits: '🍌',
  grains: '🌾',
  pulses: '🫘',
  spices: '🌶️',
  other: '📦',
};

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(10); // default 10kg wholesale/direct batch

  const b = product.priceBreakdown || {
    farmerPrice: product.farmerPrice,
    customerPrice: product.farmerPrice + 9,
  };

  const emoji = CATEGORY_EMOJIS[product.category?.slug] || '🌱';

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, Number(qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div
        className="card card-interactive"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          padding: '0',
          position: 'relative',
        }}
      >
        {/* Top Product Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            padding: '1.75rem 1.25rem',
            textAlign: 'center',
            position: 'relative',
            borderBottom: '1px solid var(--slate-200)',
          }}
        >
          <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.5rem' }}>
            {emoji}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            {product.isOrganic && (
              <span className="badge badge-green">
                <Sparkles size={11} /> Organic
              </span>
            )}
            <span className="badge badge-blue">Grade {product.qualityGrade}</span>
          </div>

          <span
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--slate-500)',
              background: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--slate-200)',
            }}
          >
            Stock: {product.availableStock || product.inventory?.availableQty || 0} {product.unit}
          </span>
        </div>

        {/* Card Body */}
        <div
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--slate-500)',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '0.25rem',
              }}
            >
              {product.category?.name || 'Produce'}
            </div>

            <Link to={`/marketplace/product/${product.id}`}>
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--slate-900)',
                  marginBottom: '0.5rem',
                  lineHeight: '1.3',
                }}
              >
                {product.name}
              </h3>
            </Link>

            {/* Farmer Info Line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                color: 'var(--slate-600)',
                marginBottom: '0.35rem',
              }}
            >
              <ShieldCheck size={16} color="#16a34a" />
              <span>
                Farmer: <strong>{product.farmer?.user?.name || 'Ravi Kumar'}</strong>
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--slate-500)',
                marginBottom: '1rem',
              }}
            >
              <MapPin size={14} />
              <span>
                {product.farmer?.village || 'Lalgudi'}, {product.farmer?.district || 'Trichy'}
              </span>
            </div>

            {/* Dual Price Callout Box */}
            <div
              style={{
                background: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.35rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#15803d',
                    textTransform: 'uppercase',
                  }}
                >
                  Farmer's Direct Price:
                </span>
                <strong style={{ color: '#15803d', fontSize: '1rem' }}>
                  ₹{b.farmerPrice.toFixed(0)}/{product.unit}
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed var(--slate-300)',
                  paddingTop: '0.35rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                  Final Buyer Price:
                </span>
                <strong style={{ color: 'var(--slate-900)', fontSize: '1.15rem' }}>
                  ₹{b.customerPrice.toFixed(0)}/{product.unit}
                </strong>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  color: 'var(--primary-700)',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Info size={13} /> View Transparent Breakdown
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: '70px' }}>
              <input
                type="number"
                min="1"
                max="5000"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field"
                style={{ padding: '0.45rem', fontSize: '0.85rem', textAlign: 'center' }}
                title="Quantity in kg"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className={`btn ${added ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              style={{ flex: 1 }}
            >
              {added ? (
                <>
                  <Check size={16} /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> Buy {qty} {product.unit}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <PriceBreakdownModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

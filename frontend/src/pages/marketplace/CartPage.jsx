import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
  Store,
} from 'lucide-react';

export const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalFarmerAmount,
    totalCollectionCharges,
    totalPackagingCharges,
    totalTransportCharges,
    totalPlatformFees,
    totalIntermediaryCharges,
    totalAmount,
  } = useCart();

  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '80vh', padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div
            className="card"
            style={{ padding: '3.5rem 2rem', borderRadius: 'var(--radius-xl)' }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                background: 'var(--primary-50)',
                color: 'var(--primary-700)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <ShoppingCart size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              Your Cart is Empty
            </h2>
            <p style={{ color: 'var(--slate-600)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Explore fresh farm-gate harvest batches directly from verified farmers across Tamil Nadu.
            </p>
            <Link to="/marketplace" className="btn btn-primary btn-lg">
              <Store size={18} /> Browse Farm Produce
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
            Your Cart ({cart.length} Products)
          </h1>
          <button
            onClick={clearCart}
            style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Trash2 size={15} /> Clear All
          </button>
        </div>

        <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start', gap: '2rem' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map(({ product, quantity }) => {
              const b = product.priceBreakdown || {
                farmerPrice: product.farmerPrice,
                customerPrice: product.farmerPrice + 9,
              };

              return (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        background: 'var(--primary-50)',
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {product.category?.slug === 'fruits'
                        ? '🍌'
                        : product.category?.slug === 'grains'
                        ? '🌾'
                        : product.category?.slug === 'spices'
                        ? '🌶️'
                        : '🍅'}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', marginBottom: '0.2rem' }}>
                        {product.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                        Farmer: <strong>{product.farmer?.user?.name || 'Ravi Kumar'}</strong> ({product.farmer?.village || 'Lalgudi'})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, marginTop: '0.2rem' }}>
                        Farmer Price: ₹{b.farmerPrice}/{product.unit} (Direct)
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 5)}
                      style={{
                        background: 'var(--slate-100)',
                        border: '1px solid var(--slate-300)',
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      min="1"
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                      style={{
                        width: '60px',
                        textAlign: 'center',
                        fontWeight: 700,
                        padding: '0.3rem',
                        borderRadius: '6px',
                        border: '1px solid var(--slate-300)',
                      }}
                    />

                    <button
                      onClick={() => updateQuantity(product.id, quantity + 5)}
                      style={{
                        background: 'var(--slate-100)',
                        border: '1px solid var(--slate-300)',
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={14} />
                    </button>

                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{product.unit}</span>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      ₹{(b.customerPrice * quantity).toLocaleString('en-IN')}
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transparent Order Summary Breakdown */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              Transparent Price Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#166534' }}>👨‍🌾 Farmer Direct Payout:</span>
                <strong style={{ color: '#166534' }}>₹{totalFarmerAmount.toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.65rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Coordinated Service Charges
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)', marginBottom: '0.25rem' }}>
                  <span>+ FPO Village Collection:</span>
                  <span>₹{totalCollectionCharges.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)', marginBottom: '0.25rem' }}>
                  <span>+ Grading & Eco-Crates:</span>
                  <span>₹{totalPackagingCharges.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)', marginBottom: '0.25rem' }}>
                  <span>+ Dedicated Transportation:</span>
                  <span>₹{totalTransportCharges.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                  <span>+ FarmDirect Platform Fee:</span>
                  <span>₹{totalPlatformFees.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '2px solid var(--slate-900)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                  Total Final Amount:
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary-800)' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                margin: '1.25rem 0',
                fontSize: '0.8rem',
                color: '#166534',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Zero Commission Policy:</strong> Farmers receive 100% of their listed price without hidden cuts.
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

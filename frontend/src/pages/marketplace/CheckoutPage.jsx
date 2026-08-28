import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrderApi, validateCheckoutApi } from '../../api/endpoints';
import {
  MapPin,
  CreditCard,
  Lock,
  LogIn,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowDownCircle,
} from 'lucide-react';

export const CheckoutPage = () => {
  const { cart, currentFarmer, totalFarmerAmount, totalAmount, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState({
    label: 'Home',
    addressLine1: '12, Anna Nagar',
    addressLine2: 'Near Bus Stand',
    city: 'Madurai',
    district: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625020',
  });

  // Sync with user's saved profile address if available
  useEffect(() => {
    const saved = user?.buyerProfile?.addresses?.[0];
    if (saved) {
      setDeliveryAddress({
        label: saved.label || 'Home',
        addressLine1: saved.addressLine1 || '',
        addressLine2: saved.addressLine2 || '',
        city: saved.city || '',
        district: saved.district || '',
        state: saved.state || 'Tamil Nadu',
        pincode: saved.pincode || '',
      });
    }
  }, [user]);

  const [notes, setNotes] = useState('Standard crate packaging for fresh produce.');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  // Purchase Restriction & Quota State
  const [quotaValidation, setQuotaValidation] = useState(null);

  const handleAddressChange = (e) => {
    setDeliveryAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Run backend quota validation whenever cart or address updates
  const runQuotaValidation = useCallback(async () => {
    if (!isAuthenticated || cart.length === 0) return;

    try {
      setValidating(true);
      const itemsPayload = cart.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
        unit: product.unit || 'kg',
      }));

      const res = await validateCheckoutApi({
        items: itemsPayload,
        deliveryAddress,
      });

      if (res.data?.success) {
        setQuotaValidation(res.data);
      }
    } catch (err) {
      console.error('[QUOTA VALIDATION ERROR]:', err);
    } finally {
      setValidating(false);
    }
  }, [cart, deliveryAddress, isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runQuotaValidation();
    }, 400);
    return () => clearTimeout(timer);
  }, [runQuotaValidation]);

  // Quick action: Reduce cart item quantity to allowed quantity
  const handleReduceQuantity = (productId, allowedQuantity) => {
    updateQuantity(productId, allowedQuantity);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Please log in with your customer account to place this order.');
      return;
    }

    if (user?.role !== 'BUYER' && user?.role !== 'CUSTOMER') {
      setError('Orders can only be placed from a Customer/Buyer account.');
      return;
    }

    if (quotaValidation && !quotaValidation.allowed) {
      setError(
        quotaValidation.bannerMessage ||
          'Please reduce item quantities to meet your delivery address purchase quota before submitting.'
      );
      return;
    }

    try {
      setLoading(true);

      const itemsPayload = cart.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }));

      const res = await createOrderApi({
        items: itemsPayload,
        deliveryAddress,
        notes,
      });

      if (res?.data?.id) {
        clearCart();
        navigate(`/customer/orders/${res.data.id}`);
      } else {
        throw new Error('Order creation did not return order ID');
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Browse Farm Produce
        </Link>
      </div>
    );
  }

  const isRestricted = quotaValidation && !quotaValidation.allowed;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', margin: '0 0 0.4rem 0' }}>
            Direct Farm Checkout
          </h1>
          {currentFarmer && (
            <div style={{ fontSize: '0.95rem', color: 'var(--slate-600)' }}>
              Direct order from: <strong style={{ color: '#166534' }}>{currentFarmer.name}</strong>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={18} />
            <div>{error}</div>
          </div>
        )}

        {/* Purchase Limit Alert Banner with 1-Click Action */}
        {quotaValidation && !quotaValidation.allowed && (
          <div
            style={{
              background: '#fffbeb',
              border: '1.5px solid #f59e0b',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldAlert size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.35rem 0', color: '#92400e', fontSize: '1rem' }}>
                  Purchase Limit Applied
                </h4>
                <p style={{ margin: '0 0 0.75rem 0', color: '#b45309', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  {quotaValidation.bannerMessage ||
                    'Your monthly purchase limit for this produce has been reached. Based on previous orders associated with this delivery address, quantity restrictions are in effect.'}
                </p>

                {/* Per-item restriction actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {quotaValidation.itemsEvaluation
                    .filter((item) => item.status === 'PARTIAL_ALLOW' || item.status === 'RESTRICTED')
                    .map((item) => {
                      const cartItem = cart.find((c) => c.product.id === item.productId);
                      return (
                        <div
                          key={item.productId}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #fed7aa',
                            borderRadius: '6px',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#78350f', fontSize: '0.9rem' }}>
                              {cartItem?.product?.name || 'Produce'}:
                            </strong>{' '}
                            <span style={{ fontSize: '0.85rem', color: '#92400e' }}>
                              Requested <strong>{item.requestedQuantity} {item.unit}</strong> → Available:{' '}
                              <strong style={{ color: item.allowedQuantity > 0 ? '#166534' : '#dc2626' }}>
                                {item.allowedQuantity} {item.unit}
                              </strong>
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '2px' }}>
                              {item.message}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {item.allowedQuantity > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleReduceQuantity(item.productId, item.allowedQuantity)}
                                className="btn btn-primary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                              >
                                <ArrowDownCircle size={14} /> Reduce to {item.allowedQuantity} {item.unit}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReduceQuantity(item.productId, 0)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.8rem' }}
                              >
                                Remove Item
                              </button>
                            )}
                            <Link to="/cart" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
                              Cancel
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quota Cleared Info Banner */}
        {quotaValidation && quotaValidation.allowed && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#166534',
            }}
          >
            <ShieldCheck size={18} color="#16a34a" />
            <div>
              <strong>Consumer Quota Verified:</strong> All items in your cart are within permitted limits for your verified identity and delivery address.
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div
            className="card"
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1.5px solid #fed7aa',
              background: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <strong style={{ color: '#9a3412', fontSize: '1rem' }}>Customer Login Required</strong>
              <div style={{ fontSize: '0.85rem', color: '#7c2d12', marginTop: '0.2rem' }}>
                Please log in with your registered customer email to complete your order.
              </div>
            </div>
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={15} /> Log In / Register
            </Link>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start', gap: '2rem' }}>
            {/* Left: Delivery Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Delivery Address Card */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={20} color="var(--primary-600)" />
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                      Destination Delivery Address
                    </h3>
                  </div>
                  {validating && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Checking quotas...
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Address Line 1 (Flat / House No. & Street)</label>
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    placeholder="e.g. 12, Anna Nagar"
                    value={deliveryAddress.addressLine1}
                    onChange={handleAddressChange}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Address Line 2 / Landmark (Optional)</label>
                  <input
                    type="text"
                    name="addressLine2"
                    placeholder="e.g. Near Panagal Park"
                    value={deliveryAddress.addressLine2 || ''}
                    onChange={handleAddressChange}
                    className="input-field"
                  />
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">City / Town</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">District</label>
                    <input
                      type="text"
                      name="district"
                      required
                      value={deliveryAddress.district}
                      onChange={handleAddressChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">PIN Code</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength="6"
                      value={deliveryAddress.pincode}
                      onChange={handleAddressChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Order / Handling Notes (Optional)</label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="textarea-field"
                  />
                </div>
              </div>

              {/* Payment Mode Card */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <CreditCard size={20} color="var(--primary-600)" />
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                    Payment Mode
                  </h3>
                </div>

                <div
                  style={{
                    background: 'var(--primary-50)',
                    border: '1.5px solid var(--primary-300)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--primary-900)', fontSize: '0.95rem' }}>
                      FarmDirect Direct Settlement
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      Farmer receives 100% direct payout upon harvest confirmation
                    </div>
                  </div>
                  <span className="badge badge-green">Direct Settlement</span>
                </div>
              </div>
            </div>

            {/* Right: Review & Confirmation */}
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '120px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
                Order Summary
              </h3>

              {currentFarmer && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.85rem',
                    color: '#166534',
                    marginBottom: '1rem',
                  }}
                >
                  👨‍🌾 Farmer: <strong>{currentFarmer.name}</strong>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-700)' }}>
                    <span>{product.name} ({quantity} {product.unit})</span>
                    <strong>₹{((product.priceBreakdown?.customerPrice || product.farmerPrice + 9) * quantity).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#166534', fontWeight: 700 }}>Direct to Farmer:</span>
                  <strong style={{ color: '#166534' }}>₹{totalFarmerAmount.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.75rem', borderTop: '2px solid var(--slate-900)', paddingTop: '0.5rem' }}>
                  <span>Total to Pay:</span>
                  <span style={{ color: 'var(--primary-700)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isAuthenticated || isRestricted}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {loading ? 'Creating Order in Database...' : isRestricted ? (
                  'Purchase Limit Exceeded'
                ) : (
                  <>
                    <Lock size={16} /> Place Order (₹{totalAmount.toLocaleString('en-IN')})
                  </>
                )}
              </button>

              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textAlign: 'center', marginTop: '0.75rem' }}>
                Order creation immediately triggers native-language SMS & Voice IVR alerts to the farmer.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

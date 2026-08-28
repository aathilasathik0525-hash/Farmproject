import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByIdApi, updateOrderStatusApi } from '../../api/endpoints';
import { OrderTimeline } from '../../components/OrderTimeline';
import {
  ArrowLeft,
  Truck,
  Phone,
  ShieldCheck,
  Building2,
  RefreshCw,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderByIdApi(id);
      if (res?.data) setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Quick state progression helper for hackathon demo flow!
  const handleQuickAdvance = async (nextStatus, note) => {
    try {
      setAdvancing(true);
      await updateOrderStatusApi(order.id, nextStatus, note);
      await fetchOrder();
    } catch (err) {
      console.error('Quick advance failed:', err);
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--slate-500)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
        <div>Tracking live order state from database...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link
            to="/customer/orders"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          <button onClick={fetchOrder} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh Live Status
          </button>
        </div>

        {/* Hackathon Quick Advance Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#86efac" />
            <div>
              <strong style={{ fontSize: '0.9rem' }}>SIH Hackathon Demo Flow Helper:</strong>
              <div style={{ fontSize: '0.75rem', color: '#bbf7d0' }}>
                Advance order status step-by-step to test real-time timeline & database state sync
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {order.status === 'PENDING_FARMER_CONFIRMATION' && (
              <button
                onClick={() => handleQuickAdvance('FARMER_CONFIRMED', 'Farmer confirmed harvest availability')}
                disabled={advancing}
                className="btn btn-sm btn-primary"
              >
                1. Farmer Confirm
              </button>
            )}

            {order.status === 'FARMER_CONFIRMED' && (
              <button
                onClick={() => handleQuickAdvance('FPO_ASSIGNED', 'Trichy FPO assigned collection batch')}
                disabled={advancing}
                className="btn btn-sm btn-primary"
              >
                2. FPO Assign
              </button>
            )}

            {order.status === 'FPO_ASSIGNED' && (
              <button
                onClick={() => handleQuickAdvance('COLLECTED', 'Produce collected at farm gate')}
                disabled={advancing}
                className="btn btn-sm btn-primary"
              >
                3. Mark Collected
              </button>
            )}

            {order.status === 'COLLECTED' && (
              <button
                onClick={() => handleQuickAdvance('PACKED', 'Produce sorted and packed at hub')}
                disabled={advancing}
                className="btn btn-sm btn-primary"
              >
                4. Mark Packed
              </button>
            )}

            {order.status === 'PACKED' && (
              <button
                onClick={() => handleQuickAdvance('IN_TRANSIT', 'Dispatched on highway via Vehicle TN-45-AZ-2345')}
                disabled={advancing}
                className="btn btn-sm btn-primary"
              >
                5. Mark In Transit
              </button>
            )}

            {order.status === 'IN_TRANSIT' && (
              <button
                onClick={() => handleQuickAdvance('OUT_FOR_DELIVERY', 'Van out for local delivery in Chennai')}
                disabled={advancing}
                className="btn btn-sm btn-primary"
              >
                6. Out for Delivery
              </button>
            )}

            {order.status === 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => handleQuickAdvance('DELIVERED', 'Produce delivered to buyer. Earnings settled.')}
                disabled={advancing}
                className="btn btn-sm btn-primary"
              >
                7. Mark Delivered & Settle
              </button>
            )}
          </div>
        </div>

        <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start', gap: '2rem' }}>
          {/* Main Visual 10-Step Timeline */}
          <div>
            <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
          </div>

          {/* Right Column: Order Details & Logistics Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Order Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Order Details
                </span>
                <strong style={{ color: 'var(--slate-900)' }}>#{order.orderNumber}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                      {item.quantity} {item.unit} @ ₹{item.customerPrice}/{item.unit}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                      Farmer Price: ₹{item.farmerPrice}/{item.unit} (Direct)
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '2px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>
                  <span>Farmer Payout:</span>
                  <span>₹{order.totalFarmerAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.4rem' }}>
                  <span>Total Paid:</span>
                  <span style={{ color: 'var(--primary-700)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <MapPin size={18} color="var(--primary-600)" />
                <h4 style={{ fontSize: '1rem' }}>Destination Address</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                {order.deliveryAddress ? (
                  <>
                    {order.deliveryAddress.addressLine1}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.district}<br />
                    PIN: {order.deliveryAddress.pincode}
                  </>
                ) : (
                  'Chennai Distribution Hub'
                )}
              </p>
            </div>

            {/* Logistics & Vehicle Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Truck size={18} color="var(--primary-600)" />
                <h4 style={{ fontSize: '1rem' }}>Logistics Fleet Coordination</h4>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Fleet: <strong>Tamil Nadu Agri Express Logistics</strong></div>
                <div>Vehicle: <strong>TN-45-AZ-2345 (5.5T Truck)</strong></div>
                <div>Driver: <strong>P. Murugesan (+91 98940 33445)</strong></div>
                <div>Origin: <strong>Trichy Central Hub</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

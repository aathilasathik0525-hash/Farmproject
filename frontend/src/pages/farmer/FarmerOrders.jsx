import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { getOrdersApi, updateOrderStatusApi } from '../../api/endpoints';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Truck,
  MapPin,
} from 'lucide-react';

export const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrdersApi();
      if (res?.data) setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId, status) => {
    try {
      setActionLoading(orderId);
      await updateOrderStatusApi(
        orderId,
        status,
        status === 'FARMER_CONFIRMED'
          ? 'Farmer confirmed harvest availability'
          : 'Farmer indicated stock unavailability'
      );
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              Incoming Farm Orders
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Confirm produce availability for scheduled FPO collection
            </p>
          </div>

          <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-500)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div>Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <ShoppingBag size={40} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No orders at this time</h3>
            <p style={{ color: 'var(--slate-600)' }}>
              When buyers purchase your listed produce, orders will appear here for confirmation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => {
              const isPending = order.status === 'PENDING_FARMER_CONFIRMATION';

              return (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderLeft: isPending ? '4px solid #f59e0b' : '4px solid var(--primary-600)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                          Order #{order.orderNumber}
                        </strong>
                        <span className={`badge ${isPending ? 'badge-amber' : 'badge-green'}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        Placed on {new Date(order.placedAt).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>
                        Your Direct Payout
                      </span>
                      <strong style={{ fontSize: '1.35rem', color: '#166534' }}>
                        ₹{order.totalFarmerAmount?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    {order.items?.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <div>
                          <strong>{item.product?.name}</strong> • Quantity: <strong>{item.quantity} {item.unit}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                            Your price: ₹{item.farmerPrice}/{item.unit}
                          </div>
                        </div>
                        <strong style={{ color: '#166534' }}>
                          ₹{item.totalFarmerAmount?.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Action row */}
                  {isPending ? (
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleAction(order.id, 'FARMER_REJECTED')}
                        disabled={actionLoading === order.id}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={16} /> Reject (Stock Unavailable)
                      </button>

                      <button
                        onClick={() => handleAction(order.id, 'FARMER_CONFIRMED')}
                        disabled={actionLoading === order.id}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={16} /> Confirm Availability
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span>Confirmed by you. Assigned to FPO collection hub.</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>Destination: {order.deliveryAddress?.city || 'Chennai'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

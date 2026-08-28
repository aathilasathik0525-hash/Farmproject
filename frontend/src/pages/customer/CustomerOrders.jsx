import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersApi } from '../../api/endpoints';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  Truck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrdersApi();
      if (res?.data) setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              My FarmDirect Orders
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Track farm-to-door delivery status and transparent receipts
            </p>
          </div>

          <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-500)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div>Loading your order history...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <ShoppingBag size={40} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No orders placed yet</h3>
            <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
              Discover farm-fresh vegetables, fruits, and grains directly from farmers.
            </p>
            <Link to="/marketplace" className="btn btn-primary">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--slate-200)',
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                        Order #{order.orderNumber}
                      </strong>
                      <span className="badge badge-green">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      Placed on {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <Link
                    to={`/customer/orders/${order.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <Truck size={15} /> Track Journey <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div>
                        <strong>{item.product?.name}</strong> • {item.quantity} {item.unit}
                        <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                          Farmer: {item.product?.farmer?.user?.name} (Direct price: ₹{item.farmerPrice}/{item.unit})
                        </div>
                      </div>
                      <strong>₹{item.totalCustomerAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>

                {/* Footer total */}
                <div
                  style={{
                    borderTop: '1px solid var(--slate-200)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ color: 'var(--slate-600)' }}>
                    Delivery: {order.deliveryAddress?.city || 'Chennai, Tamil Nadu'}
                  </div>
                  <div>
                    Total Paid:{' '}
                    <strong style={{ fontSize: '1.15rem', color: 'var(--primary-700)' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

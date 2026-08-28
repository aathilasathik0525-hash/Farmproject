import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { NotificationSimulator } from '../../components/NotificationSimulator';
import { getFarmerDashboardApi } from '../../api/endpoints';
import {
  Package,
  Boxes,
  Clock,
  CheckCircle2,
  IndianRupee,
  PlusCircle,
  Bell,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const FarmerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getFarmerDashboardApi();
      if (res?.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    totalProducts: 2,
    totalStock: 1300,
    pendingOrders: 1,
    completedOrders: 3,
    totalEarnings: 4000,
    paidEarnings: 1500,
    pendingEarnings: 2500,
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
                Farmer Dashboard
              </h1>
              <span className="badge badge-green">
                <ShieldCheck size={13} /> Verified Farm
              </span>
            </div>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Welcome back, <strong>{data?.farmer?.user?.name || 'Ravi Kumar'}</strong> ({data?.farmer?.village || 'Lalgudi'}, {data?.farmer?.district || 'Trichy'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchDashboard} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/farmer/add-product" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> List New Produce
            </Link>
          </div>
        </div>

        {/* 6 Key Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Listed Products</span>
              <Package size={18} color="var(--primary-600)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {stats.totalProducts}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Active in Marketplace</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Available Stock</span>
              <Boxes size={18} color="var(--primary-600)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {stats.totalStock.toLocaleString('en-IN')} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Ready for harvest & collection</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending Orders</span>
              <Clock size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706' }}>
              {stats.pendingOrders}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Awaiting farmer confirmation</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Earnings</span>
              <IndianRupee size={18} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
              ₹{stats.totalEarnings.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>100% direct farmer pricing</span>
          </div>
        </div>

        {/* Non-Smartphone Live Notification Center Simulation Box */}
        <div style={{ marginBottom: '2.5rem' }}>
          <NotificationSimulator
            orderNumber="FD-1001"
            productName="Farm Fresh Country Tomatoes"
            quantity="100 kg"
            farmerPrice="₹25/kg"
            totalAmount="₹2,500"
            onStatusUpdated={fetchDashboard}
          />
        </div>

        {/* Two Column Layout: Recent Orders & Listed Products */}
        <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
          {/* Recent Incoming Orders */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                Incoming Customer Orders
              </h3>
              <Link to="/farmer/orders" style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {data?.recentOrders?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                No active orders at this moment.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data?.recentOrders?.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.9rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>Order #{order.orderNumber}</strong>
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--slate-600)' }}>
                      Buyer: <strong>{order.buyer?.user?.name || 'Priya Sundaram'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px dashed var(--slate-200)', paddingTop: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#166534', fontWeight: 600 }}>Your Direct Earning:</span>
                      <strong style={{ color: '#166534' }}>₹{order.totalFarmerAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Listed Products Snapshot */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                Your Active Listings
              </h3>
              <Link to="/farmer/products" style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                Manage All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data?.products?.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Stock: {prod.inventory?.availableQty || 0} {prod.unit} • Grade {prod.qualityGrade}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#166534', fontSize: '1.05rem' }}>
                      ₹{prod.farmerPrice}/{prod.unit}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Your Base Price</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

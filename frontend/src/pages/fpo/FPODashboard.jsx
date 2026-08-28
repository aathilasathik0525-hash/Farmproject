import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { getFPOsApi, getOrdersApi } from '../../api/endpoints';
import {
  Building2,
  Users,
  Layers,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  Boxes,
} from 'lucide-react';

export const FPODashboard = () => {
  const [fpos, setFpos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fpoRes, ordersRes] = await Promise.all([
        getFPOsApi(),
        getOrdersApi(),
      ]);
      if (fpoRes?.data) setFpos(fpoRes.data);
      if (ordersRes?.data) setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load FPO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const primaryFPO = fpos[0] || {
    name: 'Trichy Farmer Producer Company Ltd.',
    district: 'Trichy',
    registrationNumber: 'FPO-TN-TR-2021-084',
    contactPhone: '+91 98421 12345',
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
                FPO & Field Officer Coordination Hub
              </h1>
              <span className="badge badge-green">
                <Building2 size={13} /> Active Cluster
              </span>
            </div>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Managing: <strong>{primaryFPO.name}</strong> ({primaryFPO.district} Region)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchData} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/fpo/aggregation" className="btn btn-primary btn-sm">
              <Layers size={16} /> Aggregate Multi-Farmer Batch
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Affiliated Farmers</span>
              <Users size={18} color="var(--primary-600)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              128
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Verified Delta Growers</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Aggregations</span>
              <Layers size={18} color="var(--primary-600)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              4
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Multi-farmer bulk orders</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Collection Hubs</span>
              <Building2 size={18} color="var(--primary-600)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              2 Centers
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Trichy & Madurai hubs</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Dispatched Tonnage</span>
              <Truck size={18} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
              24.5 <span style={{ fontSize: '1rem' }}>Tonnes</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>This month to city buyers</span>
          </div>
        </div>

        {/* Multi-Farmer Aggregation Feature Highlight Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid var(--primary-400)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={22} color="#15803d" />
              <h3 style={{ fontSize: '1.25rem', color: '#14532d' }}>
                Multi-Farmer Bulk Fulfillment Engine
              </h3>
            </div>
            <Link to="/fpo/aggregation" className="btn btn-primary btn-sm">
              Open Aggregation Visualizer
            </Link>
          </div>

          <p style={{ color: '#166534', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            When a commercial buyer places a large order (e.g. 1,000 kg Country Tomatoes), the FPO
            splits and allocates the volume across multiple smallholder farmers in the cluster:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
              background: '#ffffff',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-300)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Farmer A (Ravi)</span>
              <div style={{ fontWeight: 700, color: '#15803d' }}>300 kg</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Farmer B (Meena)</span>
              <div style={{ fontWeight: 700, color: '#15803d' }}>250 kg</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Farmer C (Arun)</span>
              <div style={{ fontWeight: 700, color: '#15803d' }}>200 kg</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Farmer D (Lakshmi)</span>
              <div style={{ fontWeight: 700, color: '#15803d' }}>250 kg</div>
            </div>
            <div style={{ borderLeft: '2px solid var(--primary-500)', paddingLeft: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Total Aggregated</span>
              <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>1,000 kg ✓</div>
            </div>
          </div>
        </div>

        {/* Orders In Cluster */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
              Recent Cluster Harvest Orders
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Assigned for FPO weighing & crate packing
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>Order #{ord.orderNumber}</strong>
                    <span className="badge badge-green">{ord.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                    Buyer: {ord.buyer?.user?.name || 'Commercial Mart'} • Destination: {ord.deliveryAddress?.city || 'Chennai'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '1.1rem' }}>
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {ord.items?.reduce((s, i) => s + i.quantity, 0)} kg total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

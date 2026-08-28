import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { getAdminAnalyticsApi } from '../../api/endpoints';
import {
  Users,
  Building2,
  Package,
  ShoppingBag,
  IndianRupee,
  Truck,
  TrendingUp,
  RefreshCw,
  Award,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAdminAnalyticsApi();
      if (res?.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const metrics = data?.metrics || {
    totalFarmers: 5,
    totalBuyers: 1,
    totalFPOs: 2,
    totalProducts: 9,
    totalOrders: 4,
    activeOrders: 2,
    completedOrders: 2,
    totalGrossRevenue: 15400,
    totalFarmerEarnings: 11200,
    totalPlatformCharges: 4200,
  };

  const monthlyTrends = data?.monthlyTrends || [
    { month: 'Oct', farmerPayout: 180000, buyerSpend: 245000 },
    { month: 'Nov', farmerPayout: 290000, buyerSpend: 395000 },
    { month: 'Dec', farmerPayout: 410000, buyerSpend: 558000 },
    { month: 'Jan', farmerPayout: 560000, buyerSpend: 760000 },
    { month: 'Feb', farmerPayout: 710000, buyerSpend: 965000 },
    { month: 'Mar', farmerPayout: 840000, buyerSpend: 1140000 },
  ];

  const categoryDistribution = data?.categoryDistribution || [
    { name: 'Vegetables', value: 4 },
    { name: 'Fruits', value: 2 },
    { name: 'Spices', value: 2 },
    { name: 'Grains', value: 1 },
    { name: 'Pulses', value: 1 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              FarmDirect Platform Control & Analytics
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              System overview of farmers, buyers, FPO aggregation hubs, and logistics pipelines
            </p>
          </div>

          <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh Analytics
          </button>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Registered Farmers</span>
              <Users size={18} color="var(--primary-600)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {metrics.totalFarmers}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>100% Verified Growers</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Farmer Direct Earnings</span>
              <IndianRupee size={18} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
              ₹{metrics.totalFarmerEarnings.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Zero intermediary cuts</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Orders</span>
              <ShoppingBag size={18} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7' }}>
              {metrics.activeOrders}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>In aggregation / transit</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Active FPOs</span>
              <Building2 size={18} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>
              {metrics.totalFPOs}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Trichy & Madurai hubs</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid-2" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
          {/* Revenue & Farmer Payout Trend */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                Farmer Direct Payout vs Gross Buyer Spend (₹)
              </h3>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`]} />
                  <Legend />
                  <Line type="monotone" dataKey="farmerPayout" name="Farmer Payout" stroke="#16a34a" strokeWidth={3} />
                  <Line type="monotone" dataKey="buyerSpend" name="Buyer Spend" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Category Distribution */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              Crop & Produce Category Distribution
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Recent Platform Activity Feed */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Activity size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
              Real-Time Platform Coordination Activity Feed
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {data?.recentActivities?.length ? (
              data.recentActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--slate-50)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <strong>Order #{act.order?.orderNumber}</strong> • {act.note}
                    {act.updatedBy && <span style={{ color: 'var(--slate-500)', marginLeft: '0.4rem' }}>({act.updatedBy})</span>}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

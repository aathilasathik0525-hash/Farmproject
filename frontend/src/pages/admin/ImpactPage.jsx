import React from 'react';
import { Link } from 'react-router-dom';
import { SupplyChainComparison } from '../../components/SupplyChainComparison';
import {
  Users,
  IndianRupee,
  ShoppingBag,
  TrendingDown,
  Building2,
  Award,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const ImpactPage = () => {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '3rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
          <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
            SIH26033 Platform Impact Dashboard
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
            Empowering Farmers. Lowering Buyer Costs.
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Measured socio-economic outcomes across our Tamil Nadu direct agricultural corridor
          </p>
        </div>

        {/* 5 Core Impact Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem',
          }}
        >
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', background: '#ffffff' }}>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--primary-700)', lineHeight: 1, marginBottom: '0.5rem' }}>
              1,250+
            </div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '1.05rem' }}>
              Farmers Connected
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Direct price control & mobile dispatch
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', background: '#ffffff' }}>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--primary-700)', lineHeight: 1, marginBottom: '0.5rem' }}>
              ₹18.4 Lakh
            </div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '1.05rem' }}>
              Farmer Earnings
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Zero mandi commission deductions
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', background: '#ffffff' }}>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--primary-700)', lineHeight: 1, marginBottom: '0.5rem' }}>
              3,800+
            </div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '1.05rem' }}>
              Orders Delivered
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              100% farm-to-buyer tracked
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)', border: '2px solid var(--primary-400)' }}>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#15803d', lineHeight: 1, marginBottom: '0.5rem' }}>
              27.5%
            </div>
            <div style={{ fontWeight: 700, color: '#14532d', fontSize: '1.05rem' }}>
              Intermediary Cost Cut
            </div>
            <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.2rem' }}>
              Saved by eliminating 5 middleman cuts
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', background: '#ffffff' }}>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--primary-700)', lineHeight: 1, marginBottom: '0.5rem' }}>
              15
            </div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '1.05rem' }}>
              FPOs Integrated
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Village aggregation hubs
            </div>
          </div>
        </div>

        {/* Traditional vs FarmDirect Comparison Section */}
        <div style={{ marginBottom: '3.5rem' }}>
          <SupplyChainComparison />
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            Experience FarmDirect Live
          </h2>
          <p style={{ color: '#dcfce7', maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
            Test the entire end-to-end presentation flow with our interactive role demos.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn btn-primary btn-lg">
              Explore Direct Marketplace
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Open Demo Switcher
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

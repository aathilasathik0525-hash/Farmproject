import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import {
  Globe,
  FileCheck,
  PackageCheck,
  Ship,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const SAMPLE_EXPORT_ORDERS = [
  {
    id: 'EXP-9001',
    buyerCountry: 'United Arab Emirates (Dubai Agri Terminal)',
    buyerName: 'Al-Madina Fresh Imports LLC',
    product: 'Salem Malgova Mangoes & Grand Naine Bananas',
    quantity: '12.5 Tonnes',
    qualityGrade: 'Export Premium (Phytosanitary Certified)',
    packaging: 'Ventilated CFB Corrugated Cartons (5kg packs)',
    docStatus: 'APEDA Phytosanitary Clearance Approved',
    transportStatus: 'Cold-Chain Container Transit to Chennai Port',
    exportStatus: 'Customs Cleared • Vessel Departure Scheduled',
    fpo: 'Trichy Farmer Producer Company Ltd.',
    farmerCount: 18,
    farmerPayout: '₹14,20,000',
  },
  {
    id: 'EXP-9002',
    buyerCountry: 'Singapore (Jurong Food Logistics Hub)',
    buyerName: 'SingFresh Global Pte Ltd',
    product: 'High-Curcumin Erode Organic Turmeric Fingers',
    quantity: '8.0 Tonnes',
    qualityGrade: '4.8% Curcumin Certified Organic',
    packaging: 'Multi-layer vacuum sealed eco-jute bags',
    docStatus: 'Organic Certification & NPOP Validated',
    transportStatus: 'Air Cargo Transfer to Singapore Changi',
    exportStatus: 'In Transit • Scheduled ETA: Tomorrow',
    fpo: 'Madurai Organic Farmers Cooperative',
    farmerCount: 12,
    farmerPayout: '₹9,80,000',
  },
];

export const ExportOrdersPage = () => {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              Large & Export Institutional Orders
            </h1>
            <span className="badge badge-purple">
              <Globe size={13} /> Global Agri Corridors
            </span>
          </div>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Connecting village FPO farmer clusters directly to institutional international importers
          </p>
        </div>

        {/* Export Workflow Journey Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Institutional Export Supply-Chain Flow
          </h3>
          <p style={{ color: '#c7d2fe', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            FarmDirect coordinates multi-farmer aggregation, grading, APEDA phytosanitary documentation,
            and port dispatch:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem' }}>👨‍🌾</div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>1. Cluster Farmers</strong>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Harvest Grade A crop</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem' }}>🏢</div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>2. FPO Aggregation</strong>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Weight & Quality check</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem' }}>📄</div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>3. APEDA Docs</strong>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Phyto certifications</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem' }}>📦</div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>4. CFB Packaging</strong>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Cold-chain pallets</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem' }}>🚢</div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>5. Port Dispatch</strong>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Customs & Delivery</div>
            </div>
          </div>
        </div>

        {/* Sample Export Order Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SAMPLE_EXPORT_ORDERS.map((exp) => (
            <div key={exp.id} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={20} color="#6366f1" />
                    <strong style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>
                      {exp.id} • {exp.buyerCountry}
                    </strong>
                    <span className="badge badge-purple">{exp.exportStatus}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                    Importer: <strong>{exp.buyerName}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Total Direct Farmer Payout</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#166534' }}>
                    {exp.farmerPayout}
                  </div>
                </div>
              </div>

              <div className="grid-3" style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Produce & Volume
                  </span>
                  <div style={{ fontWeight: 700, marginTop: '0.25rem', color: 'var(--slate-800)' }}>{exp.product}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>Total: <strong>{exp.quantity}</strong> ({exp.farmerCount} Farmers aggregated)</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Compliance & Packaging
                  </span>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--slate-800)' }}>
                    <div>Grade: <strong>{exp.qualityGrade}</strong></div>
                    <div>Pack: {exp.packaging}</div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Logistics & Documentation
                  </span>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--slate-800)' }}>
                    <div>Docs: <strong>{exp.docStatus}</strong></div>
                    <div>Transit: {exp.transportStatus}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { getCollectionCentersApi, getFPOsApi } from '../../api/endpoints';
import {
  Building2,
  MapPin,
  Truck,
  Boxes,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

export const FPOCollection = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await getCollectionCentersApi();
      if (res?.data) setCenters(res.data);
    } catch (err) {
      console.error('Failed to load collection centers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              Village Collection Centers & Weighment Hubs
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Coordinated farm-gate weighing, sorting, and crate packing facilities
            </p>
          </div>

          <button onClick={fetchCenters} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-500)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div>Loading collection centers...</div>
          </div>
        ) : (
          <div className="grid-2">
            {centers.map((center) => (
              <div key={center.id} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        background: 'var(--primary-100)',
                        color: 'var(--primary-800)',
                        padding: '0.5rem',
                        borderRadius: '10px',
                      }}
                    >
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>{center.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Managing FPO: {center.fpo?.name}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-green">Operational</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-700)' }}>
                    <MapPin size={15} color="var(--primary-600)" />
                    <span>{center.address}, {center.district}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-700)' }}>
                    <Boxes size={15} color="var(--primary-600)" />
                    <span>Handling Capacity: <strong>{center.capacity || 100} Tonnes</strong></span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--slate-50)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    fontSize: '0.8rem',
                    color: 'var(--slate-600)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Active Aggregations: <strong>{center._count?.aggregations || 2}</strong></span>
                  <span>Dispatched Shipments: <strong>{center._count?.shipments || 5}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

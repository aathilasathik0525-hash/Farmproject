import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { getFPOFarmersApi, getFPOsApi, verifyFarmerApi } from '../../api/endpoints';
import {
  Users,
  ShieldCheck,
  MapPin,
  Award,
  RefreshCw,
  Check,
  X,
  PlusCircle,
} from 'lucide-react';

export const FPOFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const fpos = await getFPOsApi();
      const primaryId = fpos?.data?.[0]?.id;
      if (primaryId) {
        const res = await getFPOFarmersApi(primaryId);
        if (res?.data) setFarmers(res.data);
      }
    } catch (err) {
      console.error('Failed to load farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleToggleVerification = async (farmerId, currentStatus) => {
    try {
      setVerifyingId(farmerId);
      const newStatus = currentStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
      await verifyFarmerApi(farmerId, newStatus);
      setFarmers(
        farmers.map((f) =>
          f.id === farmerId ? { ...f, verificationStatus: newStatus } : f
        )
      );
    } catch (err) {
      alert(err.message || 'Verification update failed');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              Registered Cluster Farmers
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Inspect farm holdings, verify grower credentials, and monitor crop availability
            </p>
          </div>

          <button onClick={fetchFarmers} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-500)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div>Loading registered farmers...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {farmers.map((farmer) => {
              const isVerified = farmer.verificationStatus === 'VERIFIED';

              return (
                <div key={farmer.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div
                        style={{
                          fontSize: '2rem',
                          background: 'var(--primary-100)',
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        👨‍🌾
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                            {farmer.user?.name}
                          </h3>
                          <span className={`badge ${isVerified ? 'badge-green' : 'badge-amber'}`}>
                            {isVerified ? '✓ Verified Farmer' : 'Pending Verification'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                          {farmer.farmName || 'Delta Organic Farm'} • Phone: {farmer.user?.phone}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                          <span>
                            📍 Village: <strong>{farmer.village}</strong>, {farmer.district}
                          </span>
                          <span>
                            🌱 Land: <strong>{farmer.landHolding || 4} Acres</strong>
                          </span>
                          <span>
                            ⏳ Experience: <strong>{farmer.experience || 10} Years</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Toggle Action */}
                    <div>
                      <button
                        onClick={() => handleToggleVerification(farmer.id, farmer.verificationStatus)}
                        disabled={verifyingId === farmer.id}
                        className={`btn ${isVerified ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      >
                        {isVerified ? (
                          <>
                            <X size={14} /> Revoke Verification
                          </>
                        ) : (
                          <>
                            <Check size={14} /> Approve & Verify Farmer
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Produce by this farmer */}
                  {farmer.products?.length > 0 && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                        Active Produce Listings
                      </span>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {farmer.products.map((prod) => (
                          <span
                            key={prod.id}
                            style={{
                              background: 'var(--slate-50)',
                              border: '1px solid var(--slate-300)',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.825rem',
                              color: 'var(--slate-800)',
                            }}
                          >
                            <strong>{prod.name}</strong> (₹{prod.farmerPrice}/{prod.unit} • Stock: {prod.inventory?.availableQty || 0} {prod.unit})
                          </span>
                        ))}
                      </div>
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

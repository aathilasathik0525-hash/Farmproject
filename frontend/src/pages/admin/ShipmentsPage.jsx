import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { getShipmentsApi, updateShipmentStatusApi } from '../../api/endpoints';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  RefreshCw,
  Phone,
  ArrowRight,
  Package,
} from 'lucide-react';

const SHIPMENT_STATUSES = [
  'PICKUP_ASSIGNED',
  'PICKED_UP',
  'AT_COLLECTION_CENTER',
  'PACKED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await getShipmentsApi();
      if (res?.data) setShipments(res.data);
    } catch (err) {
      console.error('Failed to load shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleUpdateStatus = async (shipmentId, nextStatus) => {
    try {
      setUpdatingId(shipmentId);
      await updateShipmentStatusApi(shipmentId, nextStatus, `Logistics updated state to ${nextStatus}`);
      await fetchShipments();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              Logistics & Farm-to-Gate Dispatch Fleet
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Real-time vehicle assignments, farm-gate pickup schedules, and delivery updates
            </p>
          </div>

          <button onClick={fetchShipments} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh Shipments
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-500)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div>Loading live shipment tracking...</div>
          </div>
        ) : shipments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Truck size={40} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No active shipments</h3>
            <p style={{ color: 'var(--slate-600)' }}>
              Shipments are automatically generated when buyer orders are confirmed.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {shipments.map((shp) => {
              const currentIdx = SHIPMENT_STATUSES.indexOf(shp.status);
              const nextStatus = currentIdx < SHIPMENT_STATUSES.length - 1 ? SHIPMENT_STATUSES[currentIdx + 1] : null;

              return (
                <div key={shp.id} className="card" style={{ padding: '1.75rem' }}>
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--slate-200)',
                      paddingBottom: '1rem',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                          Shipment #{shp.shipmentNumber}
                        </strong>
                        <span className="badge badge-green">
                          {shp.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        Linked Order: #{shp.order?.orderNumber} • Weight: {shp.weight || 150} kg
                      </div>
                    </div>

                    {/* Quick Next-State Button for Demo flow */}
                    {nextStatus && (
                      <button
                        onClick={() => handleUpdateStatus(shp.id, nextStatus)}
                        disabled={updatingId === shp.id}
                        className="btn btn-primary btn-sm"
                      >
                        <Truck size={15} /> Advance: Mark as {nextStatus.replace(/_/g, ' ')} <ArrowRight size={14} />
                      </button>
                    )}
                  </div>

                  {/* Shipment Info Grid */}
                  <div
                    className="grid-3"
                    style={{
                      background: 'var(--slate-50)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--slate-200)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Route Transit
                      </span>
                      <div style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--slate-800)' }}>
                        <div><strong>From:</strong> {shp.originAddress}</div>
                        <div style={{ marginTop: '0.2rem' }}><strong>To:</strong> {shp.destinationAddress}</div>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Assigned Vehicle & Fleet
                      </span>
                      <div style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--slate-800)' }}>
                        <div>Vehicle: <strong>{shp.vehicle?.registrationNumber || 'TN-45-AZ-2345'}</strong></div>
                        <div>Type: {shp.vehicle?.type || '5.5T Covered Truck'}</div>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Driver Details
                      </span>
                      <div style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--slate-800)' }}>
                        <div>Driver: <strong>{shp.vehicle?.driverName || 'P. Murugesan'}</strong></div>
                        <div>Phone: {shp.vehicle?.driverPhone || '+91 98940 33445'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Step Selector for Direct Jump */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                      Jump status to:
                    </span>
                    {SHIPMENT_STATUSES.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(shp.id, status)}
                        disabled={updatingId === shp.id || shp.status === status}
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: shp.status === status ? 'var(--primary-700)' : 'var(--slate-200)',
                          color: shp.status === status ? '#ffffff' : 'var(--slate-700)',
                          cursor: 'pointer',
                        }}
                      >
                        {status.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

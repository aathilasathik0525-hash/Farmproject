import React from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Store,
  MapPin,
  XCircle,
  PhoneCall,
  Layers,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'PENDING_FARMER_CONFIRMATION', label: 'Order Placed', desc: 'Awaiting Farmer Confirmation' },
  { key: 'FARMER_CONFIRMED', label: 'Farmer Confirmed', desc: 'Availability Confirmed by Farm' },
  { key: 'FPO_ASSIGNED', label: 'FPO Aggregation', desc: 'Assigned to Village Cooperative' },
  { key: 'COLLECTION_SCHEDULED', label: 'Pickup Scheduled', desc: 'Logistics Truck Allocated' },
  { key: 'COLLECTED', label: 'Produce Collected', desc: 'Weighed & Farm-Gate Picked' },
  { key: 'PACKED', label: 'Graded & Packed', desc: 'Ready in Crates at Hub' },
  { key: 'IN_TRANSIT', label: 'In Transit', desc: 'On Highway to Destination Hub' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Final Delivery Run' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered & Earnings Payout' },
];

export const OrderTimeline = ({ currentStatus, statusHistory = [] }) => {
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'FARMER_REJECTED';

  const getStepIndex = (status) => {
    return ORDER_STEPS.findIndex((s) => s.key === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--slate-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <h4 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>
          Live Farm-to-Buyer Journey Timeline
        </h4>
        <span
          className={`badge ${
            currentStatus === 'DELIVERED'
              ? 'badge-green'
              : isCancelled
              ? 'badge-danger'
              : 'badge-blue'
          }`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          Status: {currentStatus?.replace(/_/g, ' ')}
        </span>
      </div>

      {isCancelled ? (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <XCircle size={24} />
          <div>
            <strong>Order Terminated:</strong> {currentStatus === 'FARMER_REJECTED' ? 'Farmer indicated stock unavailability' : 'Order was cancelled'}.
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', margin: '1rem 0 2rem 0' }}>
          {/* Progress track */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
            }}
          >
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    position: 'relative',
                  }}
                >
                  {/* Indicator Dot */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isPast
                        ? 'var(--primary-600)'
                        : isCurrent
                        ? 'var(--primary-500)'
                        : 'var(--slate-200)',
                      color: isPast || isCurrent ? '#ffffff' : 'var(--slate-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      boxShadow: isCurrent ? '0 0 0 4px var(--primary-100)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>

                  {/* Step Info */}
                  <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                    <div
                      style={{
                        fontWeight: isCurrent ? 700 : 600,
                        fontSize: '0.95rem',
                        color: isCurrent
                          ? 'var(--primary-800)'
                          : isPast
                          ? 'var(--slate-900)'
                          : 'var(--slate-400)',
                      }}
                    >
                      {step.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: isCurrent ? 'var(--primary-600)' : 'var(--slate-500)',
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status History Logs */}
      {statusHistory.length > 0 && (
        <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
          <h5 style={{ fontSize: '0.9rem', color: 'var(--slate-700)', marginBottom: '0.75rem' }}>
            Event Log & Hand-off Records
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {statusHistory.map((hist, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--slate-50)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--slate-800)' }}>{hist.note}</strong>
                  {hist.updatedBy && (
                    <span style={{ color: 'var(--slate-500)', marginLeft: '0.5rem' }}>
                      by {hist.updatedBy}
                    </span>
                  )}
                </div>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                  {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

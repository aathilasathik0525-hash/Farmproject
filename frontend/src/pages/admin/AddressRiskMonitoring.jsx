import React, { useState, useEffect } from 'react';
import {
  getAdminRiskAddressesApi,
  getAdminRiskAddressDetailsApi,
  updateAdminRiskAddressStatusApi,
} from '../../api/endpoints';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Ban,
  Clock,
  MapPin,
  Users,
  ShoppingBag,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';

export const AddressRiskMonitoring = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Inspection Modal State
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Review Note Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [targetAddressId, setTargetAddressId] = useState(null);
  const [targetAction, setTargetAction] = useState('APPROVE');
  const [reviewNote, setReviewNote] = useState('');

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await getAdminRiskAddressesApi();
      if (res.data?.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load risk address monitoring:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenInspect = async (id) => {
    try {
      setInspectLoading(true);
      const res = await getAdminRiskAddressDetailsApi(id);
      if (res.data?.success) {
        setSelectedAddress(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load address details:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleOpenAction = (id, action) => {
    setTargetAddressId(id);
    setTargetAction(action);
    setReviewNote('');
    setReviewModalOpen(true);
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!targetAddressId) return;

    try {
      setActionLoading(true);
      await updateAdminRiskAddressStatusApi(targetAddressId, {
        action: targetAction,
        note: reviewNote,
      });
      setReviewModalOpen(false);
      fetchAddresses();
      if (selectedAddress?.id === targetAddressId) {
        handleOpenInspect(targetAddressId);
      }
    } catch (err) {
      console.error('Failed to update address risk status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getRiskBadge = (status, score) => {
    switch (status) {
      case 'ADMIN_REVIEW':
        return (
          <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={12} /> Admin Review ({score})
          </span>
        );
      case 'RESTRICTED':
        return (
          <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#92400e' }}>
            <AlertTriangle size={12} /> Restricted ({score})
          </span>
        );
      case 'WATCH':
        return (
          <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Watch List ({score})
          </span>
        );
      default:
        return (
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} /> Normal ({score})
          </span>
        );
    }
  };

  const filteredAddresses = addresses.filter((item) => {
    const matchesFilter = filterStatus === 'ALL' || item.riskStatus === filterStatus;
    const matchesSearch =
      !searchQuery ||
      item.normalizedAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pincode?.includes(searchQuery) ||
      item.fingerprint?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const highRiskCount = addresses.filter((a) => a.riskStatus === 'ADMIN_REVIEW' || a.riskStatus === 'RESTRICTED').length;
  const watchCount = addresses.filter((a) => a.riskStatus === 'WATCH').length;
  const normalCount = addresses.filter((a) => a.riskStatus === 'NORMAL').length;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--slate-900)', margin: '0 0 0.25rem 0' }}>
              Address Risk & Anti-Duplicate Monitoring
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', margin: 0 }}>
              Audit normalized address fingerprints, multi-account purchase clusters, and quota limit enforcements.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAddresses}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Monitoring
          </button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Monitored Addresses
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
              {addresses.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Distinct physical fingerprints
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '0.8rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>
              High Risk / Under Review
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>
              {highRiskCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.25rem' }}>
              Triggered quota restriction
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', fontWeight: 700 }}>
              Watch List
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
              {watchCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem' }}>
              Multiple accounts / rapid orders
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.8rem', color: '#065f46', textTransform: 'uppercase', fontWeight: 700 }}>
              Normal Consumer Status
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
              {normalCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.25rem' }}>
              Standard quota rules
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
              <Search size={18} color="var(--slate-400)" />
              <input
                type="text"
                placeholder="Search by address, city, PIN code or fingerprint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ margin: 0 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--slate-500)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select-field"
                style={{ margin: 0, width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="ADMIN_REVIEW">Admin Review</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="WATCH">Watch List</option>
                <option value="NORMAL">Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Risk Monitoring Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)' }}>
                  <th>Address ID / Fingerprint</th>
                  <th>Normalized Delivery Address</th>
                  <th>Accounts</th>
                  <th>Monthly Qty</th>
                  <th>Total Orders</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                      <RefreshCw className="spin" size={24} style={{ margin: '0 auto 0.5rem auto' }} />
                      <div>Loading monitored addresses...</div>
                    </td>
                  </tr>
                ) : filteredAddresses.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                      No address risk records found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAddresses.map((item) => (
                    <tr key={item.id} style={{ backgroundColor: item.isSuspended ? '#fff1f2' : undefined }}>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.85rem' }}>
                          ADDR-{item.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', fontFamily: 'monospace' }}>
                          {item.fingerprintShort}...
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.85rem' }}>
                          {item.normalizedAddress}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {item.city}, {item.state} - {item.pincode}
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: item.accountsCount > 1 ? '#fed7aa' : '#f1f5f9', color: item.accountsCount > 1 ? '#9a3412' : '#475569', fontWeight: 700 }}>
                          <Users size={12} style={{ marginRight: '4px' }} />
                          {item.accountsCount} {item.accountsCount === 1 ? 'account' : 'accounts'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: item.monthlyQuantityKg >= 10 ? '#dc2626' : '#166534', fontSize: '0.9rem' }}>
                          {item.monthlyQuantityKg.toFixed(1)} kg
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                          {item.totalOrdersCount} orders
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '45px',
                              height: '6px',
                              background: '#e2e8f0',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, item.riskScore)}%`,
                                height: '100%',
                                background:
                                  item.riskScore > 60
                                    ? '#ef4444'
                                    : item.riskScore > 30
                                    ? '#f59e0b'
                                    : '#10b981',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.riskScore}</span>
                        </div>
                      </td>
                      <td>{getRiskBadge(item.riskStatus, item.riskScore)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenInspect(item.id)}
                            className="btn btn-secondary btn-sm"
                            title="Inspect purchase cluster"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAction(item.id, item.riskStatus === 'NORMAL' ? 'RESTRICT' : 'APPROVE')}
                            className="btn btn-secondary btn-sm"
                            title="Modify Status"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            {item.riskStatus === 'NORMAL' ? <ShieldAlert size={14} color="#d97706" /> : <CheckCircle size={14} color="#16a34a" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Address Inspection Modal */}
        {selectedAddress && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1.5rem',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: '#ffffff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={22} color="var(--primary-600)" />
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--slate-900)', margin: 0 }}>
                      ADDR-{selectedAddress.id.slice(0, 8).toUpperCase()} Activity Audit
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.3rem' }}>
                    {selectedAddress.normalizedAddress}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAddress(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Current Risk Evaluation</div>
                  <div style={{ marginTop: '0.2rem' }}>
                    {getRiskBadge(selectedAddress.riskStatus, selectedAddress.riskScore)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenAction(selectedAddress.id, 'APPROVE')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <CheckCircle size={14} color="#16a34a" /> Set Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAction(selectedAddress.id, 'RESTRICT')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <ShieldAlert size={14} color="#d97706" /> Restrict (1kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAction(selectedAddress.id, 'SUSPEND')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', color: '#dc2626' }}
                  >
                    <Ban size={14} /> Suspend
                  </button>
                </div>
              </div>

              {/* Associated Verified Accounts Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={18} color="var(--primary-600)" />
                  Linked Customer Accounts ({selectedAddress.addresses?.length || 0})
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {selectedAddress.addresses?.map((addr, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--slate-200)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                        {addr.buyer?.user?.name || 'Customer'}
                      </div>
                      <div style={{ color: 'var(--primary-700)', fontWeight: 600, marginTop: '2px' }}>
                        ID: {addr.buyer?.verification?.customerId || 'CUST-VERIFIED'}
                      </div>
                      <div style={{ color: 'var(--slate-500)', marginTop: '2px' }}>
                        Aadhaar: {addr.buyer?.verification?.maskedAadhaar || 'XXXX-XXXX-XXXX'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Address Purchase History */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShoppingBag size={18} color="var(--primary-600)" />
                  Purchase History & Monthly Quota Tracking
                </h4>

                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--slate-200)', borderRadius: '6px' }}>
                  <table className="table" style={{ margin: 0, fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-100)' }}>
                        <th>Date</th>
                        <th>Customer ID</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAddress.purchaseHistories?.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: 'var(--slate-500)' }}>
                            No purchase transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        selectedAddress.purchaseHistories?.map((h) => (
                          <tr key={h.id} style={{ opacity: h.isCancelled ? 0.5 : 1 }}>
                            <td>{new Date(h.orderDate).toLocaleDateString('en-IN')}</td>
                            <td>{h.customerId}</td>
                            <td>
                              <strong>{h.quantity} {h.unit}</strong>
                            </td>
                            <td>
                              {h.isCancelled ? (
                                <span className="badge badge-red">Cancelled (Quota Restored)</span>
                              ) : (
                                <span className="badge badge-green">{h.orderStatus}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logged Risk Events */}
              {selectedAddress.riskEvents?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldAlert size={18} color="#d97706" />
                    Suspicious Signal Audit Log
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedAddress.riskEvents.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          background: '#fffbeb',
                          border: '1px solid #fed7aa',
                          borderRadius: '6px',
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.8rem',
                          color: '#92400e',
                        }}
                      >
                        <strong>{event.eventType}:</strong> {event.details} (+{event.scoreChange} risk points)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action / Review Note Modal */}
        {reviewModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '1rem',
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: '480px',
                width: '100%',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: '#ffffff',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                Update Address Risk Action: {targetAction}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                Add an internal audit note describing why this action is being taken.
              </p>

              <form onSubmit={handleConfirmAction}>
                <div className="input-group">
                  <label className="input-label">Admin Review Note</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="e.g. Verified genuine joint family household with independent Aadhaar tokens."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="textarea-field"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-primary"
                  >
                    {actionLoading ? 'Saving...' : 'Apply Status Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressRiskMonitoring;

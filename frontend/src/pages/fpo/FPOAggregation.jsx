import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { getOrdersApi, getFPOFarmersApi, getFPOsApi, createAggregationApi } from '../../api/endpoints';
import {
  Layers,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  Plus,
  Trash2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const FPOAggregation = () => {
  const [orders, setOrders] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [fpo, setFpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Aggregation form state
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [productName, setProductName] = useState('Country Tomatoes');
  const [targetQuantity, setTargetQuantity] = useState(1000);
  const [allocations, setAllocations] = useState([
    { farmerId: '', farmerName: 'Ravi Kumar (Trichy)', qty: 300 },
    { farmerId: '', farmerName: 'Meena Devi (Madurai)', qty: 250 },
    { farmerId: '', farmerName: 'Arun Kumar (Thanjavur)', qty: 200 },
    { farmerId: '', farmerName: 'Lakshmi (Coimbatore)', qty: 250 },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fpoRes, ordersRes] = await Promise.all([
        getFPOsApi(),
        getOrdersApi(),
      ]);

      if (fpoRes?.data?.[0]) {
        setFpo(fpoRes.data[0]);
        const farmerRes = await getFPOFarmersApi(fpoRes.data[0].id);
        if (farmerRes?.data) {
          setFarmers(farmerRes.data);
          // Set real farmer IDs to allocations
          if (farmerRes.data.length >= 4) {
            setAllocations([
              { farmerId: farmerRes.data[0].id, farmerName: farmerRes.data[0].user?.name, qty: 300 },
              { farmerId: farmerRes.data[1].id, farmerName: farmerRes.data[1].user?.name, qty: 250 },
              { farmerId: farmerRes.data[2].id, farmerName: farmerRes.data[2].user?.name, qty: 200 },
              { farmerId: farmerRes.data[3].id, farmerName: farmerRes.data[3].user?.name, qty: 250 },
            ]);
          }
        }
      }

      if (ordersRes?.data) {
        setOrders(ordersRes.data);
        if (ordersRes.data.length > 0) {
          setSelectedOrderId(ordersRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load aggregation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAllocated = allocations.reduce((sum, a) => sum + (Number(a.qty) || 0), 0);
  const isFulfilled = totalAllocated >= targetQuantity;

  const handleQtyChange = (index, value) => {
    const next = [...allocations];
    next[index].qty = parseFloat(value) || 0;
    setAllocations(next);
  };

  const handleFarmerSelect = (index, farmerId) => {
    const selected = farmers.find((f) => f.id === farmerId);
    const next = [...allocations];
    next[index].farmerId = farmerId;
    next[index].farmerName = selected?.user?.name || 'Selected Farmer';
    setAllocations(next);
  };

  const handleAddFarmerRow = () => {
    const firstFarmer = farmers[0];
    setAllocations([
      ...allocations,
      { farmerId: firstFarmer?.id || '', farmerName: firstFarmer?.user?.name || 'Additional Farmer', qty: 100 },
    ]);
  };

  const handleRemoveRow = (index) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleCreateAggregation = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Please select an active order to aggregate produce for');
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMsg('');

      await createAggregationApi({
        orderId: selectedOrderId,
        fpoId: fpo.id,
        scheduledDate: new Date(Date.now() + 86400000),
        notes: `Aggregated ${totalAllocated} kg produce across ${allocations.length} smallholder farmers.`,
        items: allocations.map((a) => ({
          farmerId: a.farmerId || farmers[0]?.id,
          productName,
          assignedQty: a.qty,
          unit: 'kg',
        })),
      });

      setSuccessMsg('Produce successfully aggregated across smallholder farmers! Order advanced to FPO_ASSIGNED.');
    } catch (err) {
      alert(err.message || 'Aggregation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
            Multi-Farmer Produce Aggregation
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            Coordinate smallholder farmers to collectively fulfill commercial bulk orders
          </p>
        </div>

        {/* Visual Architecture Diagram Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={22} color="#86efac" />
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>
              Collective Bulk Order Fulfillment Pattern
            </h3>
          </div>

          <p style={{ color: '#dcfce7', fontSize: '0.95rem', maxWidth: '750px', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Smallholder farmers individual production (200kg - 300kg) is aggregated under the FPO
            umbrella into a single bulk shipment (1,000kg) for institutional/retail buyers.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {allocations.map((a, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#bbf7d0', display: 'block' }}>
                  Grower #{idx + 1}
                </span>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{a.farmerName}</strong>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#86efac', marginTop: '0.35rem' }}>
                  {a.qty} kg
                </div>
              </div>
            ))}

            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'center',
                color: 'var(--slate-900)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                Collective Total
              </span>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {totalAllocated} kg
              </div>
              <span className="badge badge-green" style={{ margin: '0 auto', fontSize: '0.7rem' }}>
                {isFulfilled ? 'Full Batch Ready' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {successMsg && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={20} /> {successMsg}
          </div>
        )}

        {/* Aggregation Creation Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleCreateAggregation}>
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Select Customer Order</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="select-field"
                  required
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.orderNumber} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Produce Variety</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Target Total Quantity (kg)</label>
                <input
                  type="number"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(parseFloat(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Allocation rows */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--slate-800)' }}>
                  Farmer Quantity Allocation Table
                </h4>
                <button
                  type="button"
                  onClick={handleAddFarmerRow}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Add Farmer Allocation
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {allocations.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      background: 'var(--slate-50)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--slate-200)',
                    }}
                  >
                    <select
                      value={row.farmerId}
                      onChange={(e) => handleFarmerSelect(idx, e.target.value)}
                      className="select-field"
                      style={{ padding: '0.45rem' }}
                    >
                      {farmers.map((f) => (
                        <option key={f.id} value={f.id}>
                          👨‍🌾 {f.user?.name} ({f.village}, {f.district})
                        </option>
                      ))}
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        className="input-field"
                        style={{ padding: '0.45rem', textAlign: 'center', fontWeight: 700 }}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>kg</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      style={{ color: '#ef4444', padding: '0.4rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>Allocated: </span>
                <strong style={{ fontSize: '1.1rem', color: isFulfilled ? '#16a34a' : '#d97706' }}>
                  {totalAllocated} / {targetQuantity} kg
                </strong>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
              >
                <Layers size={18} /> {submitting ? 'Allocating...' : 'Confirm Produce Aggregation & Assign'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

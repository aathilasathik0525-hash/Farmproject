import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { getFarmerDashboardApi, deleteProductApi } from '../../api/endpoints';
import {
  PlusCircle,
  Trash2,
  Edit,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Store,
  Mic,
} from 'lucide-react';

export const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getFarmerDashboardApi();
      if (res?.data?.products) setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product listing?')) return;
    try {
      await deleteProductApi(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
              My Listed Agricultural Products
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Manage your direct farm-gate listings and set your unadjusted base prices
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={fetchProducts} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
            <Link
              to="/farmer/add-product"
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
              }}
            >
              <Mic size={16} /> 🎙️ Voice Add Produce
            </Link>
            <Link to="/farmer/add-product" className="btn btn-secondary btn-sm">
              <PlusCircle size={16} /> Manual Form
            </Link>
          </div>
        </div>

        {/* Clear Policy Notice */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1.5px solid var(--primary-300)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            fontSize: '0.875rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Farmer Price Guarantee:</strong> The platform will never silently deduct or modify your base price. You receive 100% of your listed selling price upon delivery.
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-500)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div>Loading your product listings...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Store size={40} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No products listed yet</h3>
            <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
              Add your country tomatoes, shallots, rice or mangoes to start receiving buyer orders.
            </p>
            <Link to="/farmer/add-product" className="btn btn-primary">
              <PlusCircle size={16} /> Add Your First Product
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products.map((prod) => (
              <div
                key={prod.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
                  <div
                    style={{
                      fontSize: '2.5rem',
                      background: 'var(--primary-50)',
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {prod.category?.slug === 'fruits' ? '🍌' : prod.category?.slug === 'grains' ? '🌾' : '🍅'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>{prod.name}</h3>
                      {prod.isOrganic && (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                          <Sparkles size={10} /> Organic
                        </span>
                      )}
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                        Grade {prod.qualityGrade}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Available Stock: <strong>{prod.inventory?.availableQty || 0} {prod.unit}</strong> • Harvested:{' '}
                      {prod.harvestDate ? new Date(prod.harvestDate).toLocaleDateString('en-IN') : 'Recent'}
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                <div style={{ textAlign: 'right', minWidth: '160px' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d' }}>
                    ₹{prod.farmerPrice}/{prod.unit}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Your Direct Base Price
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444' }}
                    title="Remove listing"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

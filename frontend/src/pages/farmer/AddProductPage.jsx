import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { VoiceProductAssistant } from '../../components/voice/VoiceProductAssistant';
import { createProductApi, getCategoriesApi } from '../../api/endpoints';
import {
  PlusCircle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Info,
  Mic,
  FileText,
} from 'lucide-react';

export const AddProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('voice'); // 'voice' | 'manual'

  const [formData, setFormData] = useState({
    name: 'Farm Fresh Country Tomatoes (நாட்டுக் தக்காளி)',
    categoryId: '',
    description: 'Freshly harvested naturally ripe country tomatoes from Lalgudi delta soil.',
    unit: 'kg',
    farmerPrice: '25',
    quantity: '500',
    qualityGrade: 'A',
    isOrganic: true,
    harvestDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategoriesApi();
        if (res?.data) {
          setCategories(res.data);
          if (res.data.length > 0 && !formData.categoryId) {
            setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleApplyVoiceData = (voiceData) => {
    setFormData((prev) => ({
      ...prev,
      name: voiceData.name || prev.name,
      categoryId: voiceData.categoryId || prev.categoryId,
      description: voiceData.description || prev.description,
      unit: voiceData.unit || prev.unit,
      farmerPrice: voiceData.farmerPrice ? String(voiceData.farmerPrice) : prev.farmerPrice,
      quantity: voiceData.quantity ? String(voiceData.quantity) : prev.quantity,
      qualityGrade: voiceData.qualityGrade || prev.qualityGrade,
      isOrganic: voiceData.isOrganic !== undefined ? voiceData.isOrganic : prev.isOrganic,
    }));
    setActiveTab('manual');
  };

  const handleVoiceCreated = (newProduct) => {
    navigate('/farmer/products');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createProductApi({
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        unit: formData.unit,
        farmerPrice: parseFloat(formData.farmerPrice),
        quantity: parseFloat(formData.quantity),
        qualityGrade: formData.qualityGrade,
        isOrganic: Boolean(formData.isOrganic),
        harvestDate: formData.harvestDate,
      });

      navigate('/farmer/products');
    } catch (err) {
      setError(err.message || 'Failed to list product');
    } finally {
      setLoading(false);
    }
  };

  const farmerPriceNum = parseFloat(formData.farmerPrice) || 0;
  const estimatedCustomerPrice = farmerPriceNum + 9; // 1 + 2 + 5 + 1

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 110px)', backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ maxWidth: '850px' }}>
          <Link
            to="/farmer/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--slate-600)',
              fontWeight: 600,
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} /> Back to My Listings
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
                List New Agricultural Produce
              </h1>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
                Speak in your native language (Tamil, English, Hindi, etc.) or type manually.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div
              style={{
                display: 'inline-flex',
                background: '#e2e8f0',
                borderRadius: '10px',
                padding: '4px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'voice' ? '#16a34a' : 'transparent',
                  color: activeTab === 'voice' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === 'voice' ? '0 2px 6px rgba(22, 163, 74, 0.3)' : 'none',
                }}
              >
                <Mic size={16} /> 🎙️ Voice Assistant
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'manual' ? '#ffffff' : 'transparent',
                  color: activeTab === 'manual' ? '#0f172a' : '#475569',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === 'manual' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                }}
              >
                <FileText size={16} /> 📝 Manual Form
              </button>
            </div>
          </div>

          {/* ── Multilingual Two-Way Voice Assistant ── */}
          {activeTab === 'voice' && (
            <VoiceProductAssistant
              initialCategories={categories}
              onProductCreated={handleVoiceCreated}
              onApplyToForm={handleApplyVoiceData}
            />
          )}

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              {error}
            </div>
          )}

          {/* ── Manual Form (Always accessible or via tab) ── */}
          <form onSubmit={handleSubmit} style={{ display: activeTab === 'manual' ? 'block' : 'block' }}>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                  1. Product Information
                </h3>
                {activeTab === 'voice' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Fields below sync automatically with Voice Assistant
                  </span>
                )}
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Product Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Product Name (English / Tamil)</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Country Tomatoes (நாட்டுக் தக்காளி)"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Produce Description</label>
                <textarea
                  rows="2"
                  name="description"
                  placeholder="Describe freshness, soil type, variety (e.g. heirloom country variety)..."
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea-field"
                />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Quality Grade</label>
                  <select
                    name="qualityGrade"
                    value={formData.qualityGrade}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="Premium">Premium Grade (Export Quality)</option>
                    <option value="A">Grade A (Standard Top Grade)</option>
                    <option value="B">Grade B (Commercial Processing)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Harvest Date</label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleChange}
                  />
                  <span>🌿 Mark as 100% Naturally / Organically Grown</span>
                </label>
              </div>
            </div>

            {/* 2. Direct Pricing & Stock */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--slate-900)' }}>
                2. Farmer's Direct Price & Stock
              </h3>

              <div className="grid-3">
                <div className="input-group">
                  <label className="input-label">Your Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    name="farmerPrice"
                    required
                    value={formData.farmerPrice}
                    onChange={handleChange}
                    className="input-field"
                    style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Measurement Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="quintal">quintal (100 kg)</option>
                    <option value="tonne">tonne (1000 kg)</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Available Harvest Quantity</label>
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Real-Time Price Transparency Breakdown Preview */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1.5px solid var(--primary-300)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <Info size={16} /> How Your Price is Displayed to Buyers:
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Farmer's Direct Price (You Receive):</span>
                    <strong style={{ color: '#15803d' }}>₹{farmerPriceNum.toFixed(0)}/{formData.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-500)' }}>
                    <span>+ Transparent FPO Collection, Packaging, Logistics & Platform:</span>
                    <span>+ ₹9/{formData.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #86efac', paddingTop: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                    <span>Final Marketplace Buyer Price:</span>
                    <span>₹{estimatedCustomerPrice.toFixed(0)}/{formData.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              <PlusCircle size={18} /> {loading ? 'Listing Produce...' : 'Publish Produce to Direct Marketplace'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddProductPage;

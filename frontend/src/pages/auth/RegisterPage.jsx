import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const [role, setRole] = useState('CUSTOMER'); // CUSTOMER or FARMER
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    village: '',
    district: 'Trichy',
    experience: 5,
    landHolding: 2.5,
    companyName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role === 'CUSTOMER' ? 'BUYER' : 'FARMER',
        profileData:
          role === 'FARMER'
            ? {
                village: formData.village,
                district: formData.district,
                experience: parseFloat(formData.experience),
                landHolding: parseFloat(formData.landHolding),
              }
            : {
                companyName: formData.companyName,
                buyerType: 'INDIVIDUAL',
              },
      };

      await register(payload);
      navigate(role === 'FARMER' ? '/farmer' : '/marketplace');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', display: 'flex', alignItems: 'center', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '560px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                background: 'var(--primary-100)',
                color: 'var(--primary-700)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <Sprout size={28} />
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--slate-900)' }}>
              Join FarmDirect
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Direct farmer-to-customer agricultural trade platform
            </p>
          </div>

          {/* Role selector tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              background: 'var(--slate-100)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              style={{
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: role === 'CUSTOMER' ? '#ffffff' : 'transparent',
                color: role === 'CUSTOMER' ? 'var(--primary-700)' : 'var(--slate-600)',
                boxShadow: role === 'CUSTOMER' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🛒 Register as Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              style={{
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: role === 'FARMER' ? '#ffffff' : 'transparent',
                color: role === 'FARMER' ? 'var(--primary-700)' : 'var(--slate-600)',
                boxShadow: role === 'FARMER' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              👨‍🌾 Register as Farmer
            </button>
          </div>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ravi Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Mobile Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. +91 98421 67890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. ravi@farmdirect.in"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            {/* Farmer Specific Fields */}
            {role === 'FARMER' ? (
              <>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Village / Town</label>
                    <input
                      type="text"
                      name="village"
                      required
                      placeholder="e.g. Lalgudi"
                      value={formData.village}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">District (Tamil Nadu)</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="Trichy">Trichy (திருச்சி)</option>
                      <option value="Madurai">Madurai (மதுரை)</option>
                      <option value="Thanjavur">Thanjavur (தஞ்சாவூர்)</option>
                      <option value="Salem">Salem (சேலம்)</option>
                      <option value="Coimbatore">Coimbatore (கோயம்புத்தூர்)</option>
                      <option value="Dindigul">Dindigul (திண்டுக்கல்)</option>
                      <option value="Erode">Erode (ஈரோடு)</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Farming Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      min="1"
                      value={formData.experience}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Land Holding (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="landHolding"
                      value={formData.landHolding}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="input-group">
                <label className="input-label">Delivery Note / Organization (Optional)</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. Home Delivery / Retail Store"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'FARMER' ? 'Farmer' : 'Customer'}`}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.875rem',
              color: 'var(--slate-600)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

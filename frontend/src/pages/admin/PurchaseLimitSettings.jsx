import React, { useState, useEffect } from 'react';
import { getAdminPurchasePolicyApi, updateAdminPurchasePolicyApi } from '../../api/endpoints';
import { Sliders, Save, RefreshCw, CheckCircle2, AlertCircle, Shield, Scale, Calendar, Zap } from 'lucide-react';

export const PurchaseLimitSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    firstOrderLimitKg: 5.0,
    subsequentOrderLimitKg: 1.0,
    customerMonthlyMaxKg: 10.0,
    addressMonthlyMaxKg: 10.0,
    shortIntervalHours: 48,
    riskNormalThreshold: 30.0,
    riskWatchThreshold: 60.0,
    riskRestrictedThreshold: 80.0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await getAdminPurchasePolicyApi();
      if (res.data?.success && res.data.data) {
        setFormData(res.data.data);
      }
    } catch (err) {
      setErrorMessage('Failed to load active purchase quota policy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setSaving(true);

    try {
      const res = await updateAdminPurchasePolicyApi(formData);
      if (res.data?.success) {
        setSuccessMessage('Purchase quota & anti-duplicate rules updated successfully!');
      } else {
        throw new Error(res.data?.message || 'Failed to update policy settings');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={24} color="var(--primary-600)" />
            <h1 style={{ fontSize: '1.75rem', color: 'var(--slate-900)', margin: 0 }}>
              Purchase Restriction & Quota Policy
            </h1>
          </div>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Configure dynamic purchase limits to discourage bulk resale and maintain fair customer access.
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              background: '#dcfce7',
              border: '1px solid #4ade80',
              color: '#14532d',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <div>{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Order Quota Rules */}
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
              <Scale size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0 }}>
                Order Quantity Limit Rules
              </h3>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">
                  First Order Limit (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  name="firstOrderLimitKg"
                  required
                  value={formData.firstOrderLimitKg}
                  onChange={handleChange}
                  className="input-field"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                  Maximum quantity allowed on the first order of the calendar month (Default: 5 kg).
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">
                  Subsequent Order Limit (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  name="subsequentOrderLimitKg"
                  required
                  value={formData.subsequentOrderLimitKg}
                  onChange={handleChange}
                  className="input-field"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                  Quantity cap on repeat orders within the same month (Default: 1 kg).
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Monthly Cumulative Caps */}
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
              <Calendar size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0 }}>
                Monthly Cumulative Limits (Stricter Rule Enforced)
              </h3>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">
                  Customer-Level Monthly Cap (kg)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="customerMonthlyMaxKg"
                  required
                  value={formData.customerMonthlyMaxKg}
                  onChange={handleChange}
                  className="input-field"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                  Maximum cumulative volume an individual customer identity can order per month.
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">
                  Address-Level Monthly Cap (kg)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="addressMonthlyMaxKg"
                  required
                  value={formData.addressMonthlyMaxKg}
                  onChange={handleChange}
                  className="input-field"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                  Maximum cumulative volume allowed across all accounts using the same delivery address.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Risk Evaluation & Fraud Signal Thresholds */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
              <Zap size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0 }}>
                Risk Scoring Thresholds
              </h3>
            </div>

            <div className="grid-3" style={{ marginBottom: '1rem' }}>
              <div className="input-group">
                <label className="input-label">
                  Normal Threshold (0 to X)
                </label>
                <input
                  type="number"
                  name="riskNormalThreshold"
                  required
                  value={formData.riskNormalThreshold}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  Watch List (X to Y)
                </label>
                <input
                  type="number"
                  name="riskWatchThreshold"
                  required
                  value={formData.riskWatchThreshold}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  Restricted Threshold (Y to Z)
                </label>
                <input
                  type="number"
                  name="riskRestrictedThreshold"
                  required
                  value={formData.riskRestrictedThreshold}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">
                Rapid Order Interval Window (Hours)
              </label>
              <input
                type="number"
                name="shortIntervalHours"
                required
                value={formData.shortIntervalHours}
                onChange={handleChange}
                className="input-field"
                style={{ maxWidth: '240px' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Flags successive orders placed to the same address within this hour window as suspicious.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={fetchPolicy}
              disabled={loading || saving}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} /> Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '180px' }}
            >
              {saving ? (
                'Saving Policies...'
              ) : (
                <>
                  <Save size={18} /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseLimitSettings;

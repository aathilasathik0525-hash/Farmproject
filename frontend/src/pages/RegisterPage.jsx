import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendAadhaarOtpApi, verifyAadhaarOtpApi } from '../api/endpoints';
import {
  Sprout, Languages, ShieldCheck, KeyRound, CheckCircle2,
  AlertCircle, RefreshCw, MapPin, User, Phone, Mail, Lock,
  ArrowRight, ArrowLeft, Eye, EyeOff
} from 'lucide-react';

const STEPS_CUSTOMER = ['Account Info', 'Aadhaar Verify', 'Delivery Address'];
const STEPS_FARMER = ['Account Info', 'Farm Details'];

export const RegisterPage = () => {
  const [role, setRole] = useState('CUSTOMER');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    aadhaarNumber: '', otp: '',
    // Address
    addressLine1: '', addressLine2: '', city: '', district: '', state: 'Tamil Nadu', pincode: '',
    // Farmer fields
    village: '', farmerDistrict: 'Trichy', experience: 5, landHolding: 2.5,
    preferredLanguage: 'ta-IN', companyName: '',
  });

  // Aadhaar OTP state
  const [otpStep, setOtpStep] = useState('UNVERIFIED');
  const [txnId, setTxnId] = useState('');
  const [maskedAadhaar, setMaskedAadhaar] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [verifiedCustomerId, setVerifiedCustomerId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const steps = role === 'CUSTOMER' ? STEPS_CUSTOMER : STEPS_FARMER;
  const totalSteps = steps.length;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStepError('');
  };

  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setFormData({ ...formData, aadhaarNumber: raw });
  };

  const formatAadhaarDisplay = (raw) => {
    const d = raw.replace(/\D/g, '');
    const parts = [d.slice(0, 4), d.slice(4, 8), d.slice(8, 12)].filter(Boolean);
    return parts.join(' ');
  };

  // Step 1 → 2 validation
  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.phone.match(/^\d{10}$/)) return 'Enter a valid 10-digit mobile number';
    if (!formData.email.includes('@')) return 'Enter a valid email address';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleNextStep = () => {
    setStepError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setStepError(err); return; }
    }
    if (step === 2 && role === 'CUSTOMER' && otpStep !== 'VERIFIED') {
      setStepError('Please complete Aadhaar OTP verification before proceeding.');
      return;
    }
    setStep(s => s + 1);
  };

  // Aadhaar OTP send
  const handleSendOtp = async () => {
    setOtpError(''); setOtpMessage('');
    if (formData.aadhaarNumber.length !== 12) {
      setOtpError('Enter a valid 12-digit Aadhaar number'); return;
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      setOtpError('Valid 10-digit mobile is required (enter it in Step 1 first)'); return;
    }
    try {
      setOtpLoading(true);
      const res = await sendAadhaarOtpApi({ aadhaarNumber: formData.aadhaarNumber, mobile: formData.phone });
      if (res.data?.success) {
        setTxnId(res.data.txnId);
        setMaskedAadhaar(res.data.maskedAadhaar);
        setOtpStep('OTP_SENT');
        setOtpMessage(res.data.message || 'OTP sent to your registered mobile number.');
        if (res.data.mockOtp) setMockOtp(res.data.mockOtp);
        // Resend cooldown 30s
        setResendCooldown(30);
        const timer = setInterval(() => {
          setResendCooldown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
        }, 1000);
      } else throw new Error(res.data?.message || 'OTP initiation failed');
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally { setOtpLoading(false); }
  };

  // Aadhaar OTP verify
  const handleVerifyOtp = async () => {
    setOtpError('');
    if (formData.otp.length !== 6) { setOtpError('Enter the 6-digit OTP'); return; }
    try {
      setOtpLoading(true);
      const res = await verifyAadhaarOtpApi({ txnId, otp: formData.otp.trim() });
      if (res.data?.success) {
        setOtpStep('VERIFIED');
        setVerificationToken(res.data.verificationToken);
        setVerifiedCustomerId(res.data.customerId);
        setMaskedAadhaar(res.data.maskedAadhaar);
        setOtpMessage('✓ Aadhaar identity verified successfully!');
      } else throw new Error(res.data?.message || 'Invalid OTP');
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally { setOtpLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'CUSTOMER') {
      if (otpStep !== 'VERIFIED') { setError('Aadhaar verification required'); return; }
      if (!formData.addressLine1.trim() || !formData.city.trim() || !formData.pincode.match(/^\d{6}$/)) {
        setError('Please complete all required address fields'); return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role === 'CUSTOMER' ? 'BUYER' : 'FARMER',
        preferredLanguage: formData.preferredLanguage,
        verificationToken: role === 'CUSTOMER' ? verificationToken : undefined,
        profileData: role === 'FARMER'
          ? {
              village: formData.village,
              district: formData.farmerDistrict,
              experience: parseFloat(formData.experience),
              landHolding: parseFloat(formData.landHolding),
              preferredLanguage: formData.preferredLanguage,
            }
          : {
              companyName: formData.companyName,
              buyerType: 'INDIVIDUAL',
              deliveryAddress: {
                label: 'Home',
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                district: formData.district || formData.city,
                state: formData.state,
                pincode: formData.pincode,
              },
            },
      };

      await register(payload);
      navigate(role === 'FARMER' ? '/farmer' : '/marketplace');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally { setLoading(false); }
  };

  // ── UI Helpers ──
  const StepDot = ({ n }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem',
        background: n < step ? 'var(--primary-600)' : n === step ? 'var(--primary-700)' : 'var(--slate-200)',
        color: n <= step ? '#fff' : 'var(--slate-500)',
        boxShadow: n === step ? '0 0 0 3px var(--primary-100)' : 'none',
        transition: 'all 0.2s',
      }}>
        {n < step ? <CheckCircle2 size={16} /> : n}
      </div>
      <span style={{ fontSize: '0.65rem', color: n === step ? 'var(--primary-700)' : 'var(--slate-500)', fontWeight: n === step ? 700 : 400, whiteSpace: 'nowrap' }}>
        {steps[n - 1]}
      </span>
    </div>
  );

  const InputField = ({ label, name, type = 'text', placeholder, required, value, onChange, disabled, extra }) => (
    <div className="input-group">
      <label className="input-label">{label}{required && <span style={{ color: '#dc2626' }}> *</span>}</label>
      <input
        type={type} name={name} required={required}
        placeholder={placeholder} value={value}
        onChange={onChange || handleChange} disabled={disabled}
        className="input-field" {...extra}
      />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', width: 60, height: 60, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto', boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
            }}>
              <Sprout size={30} />
            </div>
            <h1 style={{ fontSize: '1.7rem', color: 'var(--slate-900)', margin: 0 }}>Join FarmDirect</h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Direct farmer-to-customer agricultural trade platform
            </p>
          </div>

          {/* Role Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
            background: 'var(--slate-100)', padding: '0.3rem', borderRadius: '12px',
            marginBottom: '1.75rem',
          }}>
            {['CUSTOMER', 'FARMER'].map(r => (
              <button key={r} type="button" onClick={() => { setRole(r); setStep(1); setError(''); setStepError(''); }}
                style={{
                  padding: '0.65rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                  background: role === r ? '#ffffff' : 'transparent',
                  color: role === r ? 'var(--primary-700)' : 'var(--slate-500)',
                  boxShadow: role === r ? 'var(--shadow-sm)' : 'none',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {r === 'CUSTOMER' ? '🛒 Customer' : '👨‍🌾 Farmer'}
              </button>
            ))}
          </div>

          {/* Step Progress */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '0', marginBottom: '2rem' }}>
            {steps.map((_, i) => (
              <React.Fragment key={i}>
                <StepDot n={i + 1} />
                {i < totalSteps - 1 && (
                  <div style={{
                    flex: 1, height: 2, marginTop: 15,
                    background: step > i + 1 ? 'var(--primary-500)' : 'var(--slate-200)',
                    transition: 'background 0.3s',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Error */}
          {(stepError || error) && (
            <div style={{
              background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)', fontSize: '0.875rem',
              marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <AlertCircle size={18} /><span>{stepError || error}</span>
            </div>
          )}

          {/* ── STEP 1: Account Info ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--slate-800)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} color="var(--primary-600)" /> Step 1 — Account Information
              </h2>

              <div className="grid-2">
                <InputField label="Full Name" name="name" required placeholder="e.g. Ravi Kumar" value={formData.name} />
                <div className="input-group">
                  <label className="input-label">Mobile Phone <span style={{ color: '#dc2626' }}>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--slate-600)', fontSize: '0.9rem' }}>+91</span>
                    <input type="tel" name="phone" required maxLength="10" placeholder="9842167890"
                      value={formData.phone} onChange={handleChange} className="input-field" style={{ flex: 1 }} />
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <InputField label="Email Address" name="email" type="email" required placeholder="ravi@example.com" value={formData.email} />
                <div className="input-group">
                  <label className="input-label">Password <span style={{ color: '#dc2626' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} name="password" required
                      placeholder="Min 6 characters" value={formData.password}
                      onChange={handleChange} className="input-field" style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {role === 'FARMER' && (
                <>
                  <div className="grid-2">
                    <InputField label="Village / Town" name="village" required placeholder="e.g. Lalgudi" value={formData.village} />
                    <div className="input-group">
                      <label className="input-label">District</label>
                      <select name="farmerDistrict" value={formData.farmerDistrict} onChange={handleChange} className="select-field">
                        {['Trichy', 'Madurai', 'Thanjavur', 'Salem', 'Coimbatore', 'Dindigul', 'Erode', 'Tirunelveli'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <InputField label="Farming Experience (Years)" name="experience" type="number" value={formData.experience} />
                    <InputField label="Land Holding (Acres)" name="landHolding" type="number" extra={{ step: '0.1' }} value={formData.landHolding} />
                  </div>
                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Languages size={15} color="var(--primary-600)" /> Preferred Language for Alerts
                    </label>
                    <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="select-field">
                      <option value="ta-IN">🌾 தமிழ் (Tamil)</option>
                      <option value="hi-IN">हिन्दी (Hindi)</option>
                      <option value="te-IN">తెలుగు (Telugu)</option>
                      <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                      <option value="ml-IN">മലയാളം (Malayalam)</option>
                      <option value="en-IN">English (India)</option>
                    </select>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={handleNextStep} className="btn btn-primary btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {role === 'FARMER' ? 'Create Farmer Account' : 'Continue'} <ArrowRight size={18} />
                </button>
              </div>

              {role === 'FARMER' && (
                <button onClick={async (e) => {
                  e.preventDefault();
                  const err = validateStep1();
                  if (err) { setStepError(err); return; }
                  setLoading(true); setError('');
                  try {
                    await register({
                      name: formData.name, email: formData.email, phone: formData.phone,
                      password: formData.password, role: 'FARMER',
                      preferredLanguage: formData.preferredLanguage,
                      profileData: {
                        village: formData.village, district: formData.farmerDistrict,
                        experience: parseFloat(formData.experience),
                        landHolding: parseFloat(formData.landHolding),
                        preferredLanguage: formData.preferredLanguage,
                      },
                    });
                    navigate('/farmer');
                  } catch (err) { setError(err.message || 'Registration failed'); }
                  finally { setLoading(false); }
                }} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
                  disabled={loading}>
                  {loading ? 'Creating Account...' : '👨‍🌾 Register as Farmer'}
                </button>
              )}
            </div>
          )}

          {/* ── STEP 2 (CUSTOMER): Aadhaar Verification ── */}
          {step === 2 && role === 'CUSTOMER' && (
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--slate-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#16a34a" /> Step 2 — Aadhaar Identity Verification
              </h2>

              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#15803d', lineHeight: '1.5' }}>
                  🔒 <strong>Privacy Notice:</strong> Your Aadhaar number is used only for one-time identity verification.
                  FARMDirect <strong>never stores your full 12-digit Aadhaar number</strong>. Only a cryptographic
                  reference and last 4 digits are retained for duplicate account prevention.
                </div>
              </div>

              {otpStep === 'VERIFIED' ? (
                <div style={{ background: '#dcfce7', border: '1px solid #4ade80', padding: '1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CheckCircle2 size={32} color="#15803d" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#14532d', fontSize: '1rem' }}>✓ Aadhaar Verified!</div>
                    <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '2px' }}>
                      Customer ID: <strong>{verifiedCustomerId}</strong> | Aadhaar: <strong>{maskedAadhaar}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <label className="input-label">
                      Aadhaar Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text" maxLength="12"
                        placeholder="XXXX XXXX XXXX"
                        value={formatAadhaarDisplay(formData.aadhaarNumber)}
                        onChange={handleAadhaarChange}
                        disabled={otpStep === 'OTP_SENT' || otpLoading}
                        className="input-field"
                        style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '1.1rem', textAlign: 'center' }}
                      />
                      {otpStep === 'UNVERIFIED' && (
                        <button type="button" onClick={handleSendOtp}
                          disabled={otpLoading || formData.aadhaarNumber.length !== 12}
                          className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '0 1.25rem' }}>
                          {otpLoading ? <RefreshCw size={16} className="spin" /> : <><KeyRound size={15} /> Send OTP</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {otpStep === 'OTP_SENT' && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px' }}>
                      {mockOtp && (
                        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: '#92400e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                          <span>🔧 <strong>Dev Mode</strong> — Test OTP: <strong style={{ letterSpacing: '3px' }}>{mockOtp}</strong></span>
                          <button type="button" onClick={() => setFormData({ ...formData, otp: mockOtp })}
                            style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                            Autofill OTP
                          </button>
                        </div>
                      )}

                      <label className="input-label">6-Digit OTP (sent to registered mobile) <span style={{ color: '#dc2626' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" name="otp" maxLength="6" placeholder="_ _ _ _ _ _"
                          value={formData.otp} onChange={handleChange}
                          className="input-field"
                          style={{ fontFamily: 'monospace', letterSpacing: '8px', fontSize: '1.3rem', textAlign: 'center', flex: 1 }} />
                        <button type="button" onClick={handleVerifyOtp}
                          disabled={otpLoading || formData.otp.length !== 6}
                          className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                          {otpLoading ? <RefreshCw size={16} className="spin" /> : 'Verify OTP'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                        <button type="button" onClick={() => { setOtpStep('UNVERIFIED'); setFormData({ ...formData, otp: '' }); setMockOtp(''); }}
                          style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                          ← Change Aadhaar
                        </button>
                        <button type="button" onClick={handleSendOtp} disabled={otpLoading || resendCooldown > 0}
                          style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : '#166534', cursor: resendCooldown > 0 ? 'default' : 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                          {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                  )}

                  {otpError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} />{otpError}</div>}
                  {otpMessage && !otpError && <div style={{ color: '#15803d', fontSize: '0.85rem', marginTop: '0.5rem' }}>✓ {otpMessage}</div>}
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => { setStep(1); setStepError(''); }}
                  className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowLeft size={18} /> Back
                </button>
                {otpStep === 'VERIFIED' && (
                  <button type="button" onClick={() => setStep(3)}
                    className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Continue <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3 (CUSTOMER): Delivery Address ── */}
          {step === 3 && role === 'CUSTOMER' && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--slate-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} color="var(--primary-600)" /> Step 3 — Delivery Address
              </h2>

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#0369a1' }}>
                📍 Your delivery address is normalized and securely fingerprinted to enforce fair purchase quotas across our platform.
              </div>

              <div className="input-group">
                <label className="input-label">House / Flat / Door Number & Street <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" name="addressLine1" required className="input-field"
                  placeholder="e.g. Flat 4B, Emerald Heights, Anna Salai"
                  value={formData.addressLine1} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label className="input-label">Area / Landmark (Optional)</label>
                <input type="text" name="addressLine2" className="input-field"
                  placeholder="e.g. Near Bus Stand, T Nagar"
                  value={formData.addressLine2} onChange={handleChange} />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">City <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="text" name="city" required className="input-field"
                    placeholder="e.g. Madurai" value={formData.city} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">District</label>
                  <input type="text" name="district" className="input-field"
                    placeholder="e.g. Madurai" value={formData.district} onChange={handleChange} />
                </div>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">State <span style={{ color: '#dc2626' }}>*</span></label>
                  <select name="state" value={formData.state} onChange={handleChange} className="select-field">
                    {['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Delhi', 'Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">PIN Code <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="text" name="pincode" required className="input-field"
                    maxLength="6" placeholder="e.g. 625020"
                    value={formData.pincode} onChange={handleChange}
                    style={{ fontFamily: 'monospace', letterSpacing: '2px' }} />
                </div>
              </div>

              {/* Verified identity summary */}
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.5rem', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#14532d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> Identity Verified — {maskedAadhaar} | {verifiedCustomerId}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setStep(2)}
                  className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg"
                  style={{ minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {loading ? <><RefreshCw size={16} className="spin" /> Creating Account...</> : '🎉 Create Customer Account'}
                </button>
              </div>
            </form>
          )}

          {/* Sign in link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

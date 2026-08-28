import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductByIdApi } from '../../api/endpoints';
import { useCart } from '../../context/CartContext';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  ArrowDown,
  ShoppingCart,
  CheckCircle2,
  Phone,
  RefreshCw,
  ArrowLeft,
  Award,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(25);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductByIdApi(id);
        if (res?.data) setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--slate-500)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading product details and transparent pricing...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const b = product.priceBreakdown;
  const farmer = product.farmer;

  const handleAddToCart = () => {
    addToCart(product, Number(qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleInstantBuy = () => {
    addToCart(product, Number(qty));
    navigate('/checkout');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to={farmer?.id ? `/marketplace?farmerId=${farmer.id}` : '/marketplace'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--slate-600)',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to {farmer?.user?.name ? `${farmer.user.name}'s Produce` : 'Marketplace'}
        </Link>

        <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
          {/* Left Column: Product Visuals & Farmer Profile */}
          <div>
            {/* Visual Card */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                textAlign: 'center',
                padding: '3.5rem 2rem',
                marginBottom: '1.5rem',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '6rem', lineHeight: 1, marginBottom: '1rem' }}>
                {product.category?.slug === 'fruits'
                  ? '🍌'
                  : product.category?.slug === 'grains'
                  ? '🌾'
                  : product.category?.slug === 'spices'
                  ? '🌶️'
                  : product.category?.slug === 'pulses'
                  ? '🫘'
                  : '🍅'}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {product.isOrganic && (
                  <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
                    <Sparkles size={13} /> 100% Certified Organic
                  </span>
                )}
                <span className="badge badge-blue" style={{ fontSize: '0.85rem' }}>
                  Grade {product.qualityGrade}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
                  Direct Farm-Gate
                </span>
              </div>
            </div>

            {/* Farmer Profile Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--slate-200)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    background: 'var(--primary-100)',
                    color: 'var(--primary-800)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  👨‍🌾
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                      {farmer?.user?.name || 'Ravi Kumar'}
                    </h3>
                    <ShieldCheck size={18} color="#16a34a" />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    {farmer?.farmName || 'Cauvery Delta Organic Green Farms'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
                  <MapPin size={16} color="var(--primary-600)" />
                  <span>
                    Location: <strong>{farmer?.village || 'Lalgudi'}, {farmer?.district || 'Trichy'}</strong> (Tamil Nadu)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
                  <Award size={16} color="var(--primary-600)" />
                  <span>
                    Experience: <strong>{farmer?.experience || 12} Years</strong> • Land: <strong>{farmer?.landHolding || 4.5} Acres</strong>
                  </span>
                </div>

                {farmer?.fpo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
                    <ShieldCheck size={16} color="var(--primary-600)" />
                    <span>
                      Affiliated FPO: <strong>{farmer.fpo.name}</strong>
                    </span>
                  </div>
                )}
              </div>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--slate-600)',
                  marginTop: '1rem',
                  lineHeight: '1.5',
                  background: 'var(--slate-50)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {farmer?.bio ||
                  'Dedicated to sustainable agriculture and high quality harvesting. Produce is weighed and packed under direct FPO supervision.'}
              </p>
            </div>
          </div>

          {/* Right Column: Pricing & Purchase */}
          <div>
            <div className="card" style={{ padding: '2rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--slate-500)',
                  letterSpacing: '0.04em',
                }}
              >
                {product.category?.name}
              </span>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', margin: '0.35rem 0 1rem 0' }}>
                {product.name}
              </h1>

              <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {product.description}
              </p>

              {/* Price Transparency Highlight Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '2px solid var(--primary-400)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    Farmer's Price (Unadjusted):
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d' }}>
                    ₹{b.farmerPrice.toFixed(0)}/{product.unit}
                  </span>
                </div>

                {/* Breakdown List */}
                <div style={{ fontSize: '0.825rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid #86efac', paddingTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>+ FPO Village Collection:</span>
                    <strong>₹{b.collectionCharge.toFixed(0)}/{product.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>+ Grading & Packaging:</span>
                    <strong>₹{b.packagingCharge.toFixed(0)}/{product.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>+ Direct Transport:</span>
                    <strong>₹{b.transportCharge.toFixed(0)}/{product.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>+ FarmDirect Platform Fee:</span>
                    <strong>₹{b.platformFee.toFixed(0)}/{product.unit}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #16a34a', paddingTop: '0.6rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                    Total Buyer Price:
                  </span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    ₹{b.customerPrice.toFixed(0)}/{product.unit}
                  </span>
                </div>
              </div>

              {/* Order Controls */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label" style={{ marginBottom: '0.4rem' }}>
                  Select Quantity to Purchase ({product.unit}):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="number"
                    min="1"
                    max={product.availableStock || 5000}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field"
                    style={{ width: '120px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                  />
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    Available stock: <strong>{product.availableStock || 0} {product.unit}</strong>
                  </div>
                </div>
              </div>

              {/* Order Calculation Preview */}
              <div
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span>Farmer Direct Earnings:</span>
                  <strong style={{ color: '#16a34a' }}>₹{(b.farmerPrice * qty).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span>Transparent Logistics & Fees:</span>
                  <span>₹{(b.totalCharges * qty).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--slate-300)', paddingTop: '0.35rem', fontWeight: 700, fontSize: '1rem' }}>
                  <span>Total Order Value:</span>
                  <span>₹{(b.customerPrice * qty).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAddToCart}
                  className={`btn ${added ? 'btn-secondary' : 'btn-secondary'} btn-lg`}
                  style={{ flex: 1 }}
                >
                  {added ? <CheckCircle2 size={18} color="#16a34a" /> : <ShoppingCart size={18} />}
                  <span>{added ? 'Added to Cart!' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleInstantBuy}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  Instant Buy & Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

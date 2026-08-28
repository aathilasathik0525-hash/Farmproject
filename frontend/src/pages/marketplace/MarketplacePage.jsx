import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPublicFarmersApi, getFarmerByIdApi, getCategoriesApi } from '../../api/endpoints';
import { ProductCard } from '../../components/ProductCard';
import {
  Search,
  MapPin,
  RefreshCw,
  Store,
  ShieldCheck,
  Languages,
  ArrowLeft,
  Award,
  Package,
  ChevronRight,
} from 'lucide-react';

export const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFarmerId = searchParams.get('farmerId');

  // State: Farmers List vs Single Farmer View
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState(initialFarmerId || null);
  const [selectedFarmerData, setSelectedFarmerData] = useState(null);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Step 1 (Farmer Selection)
  const [farmerSearch, setFarmerSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Filters for Step 2 (Farmer's Products)
  const [productCategory, setProductCategory] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Language display map
  const languageNames = {
    'ta-IN': 'தமிழ் (Tamil)',
    'hi-IN': 'हिन्दी (Hindi)',
    'te-IN': 'తెలుగు (Telugu)',
    'kn-IN': 'ಕನ್ನಡ (Kannada)',
    'ml-IN': 'മലയാളം (Malayalam)',
    'mr-IN': 'मराठी (Marathi)',
    'bn-IN': 'বাংলা (Bengali)',
    'en-IN': 'English',
  };

  // Fetch all registered active farmers from DB
  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (farmerSearch) params.search = farmerSearch;
      if (selectedDistrict) params.district = selectedDistrict;

      const [res, catRes] = await Promise.all([
        getPublicFarmersApi(params),
        getCategoriesApi(),
      ]);

      if (res?.data) {
        setFarmers(res.data);
      }
      if (catRes?.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Failed to load farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single farmer details & strictly isolated products
  const fetchFarmerDetails = async (farmerId) => {
    try {
      setLoading(true);
      const res = await getFarmerByIdApi(farmerId);
      if (res?.data) {
        setSelectedFarmerData(res.data.farmer);
        setFarmerProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load farmer products:', err);
      setSelectedFarmerData(null);
      setFarmerProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarmerId) {
      fetchFarmerDetails(selectedFarmerId);
    } else {
      fetchFarmers();
    }
  }, [selectedFarmerId]);

  const handleSelectFarmer = (farmerId) => {
    setSelectedFarmerId(farmerId);
    setSearchParams({ farmerId });
  };

  const handleBackToFarmers = () => {
    setSelectedFarmerId(null);
    setSelectedFarmerData(null);
    setFarmerProducts([]);
    setSearchParams({});
    fetchFarmers();
  };

  // Filtered products for selected farmer
  const filteredProducts = farmerProducts.filter((prod) => {
    if (productCategory && prod.category?.slug !== productCategory) return false;
    if (organicOnly && !prod.isOrganic) return false;
    return true;
  });

  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => a.farmerPrice - b.farmerPrice);
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => b.farmerPrice - a.farmerPrice);
  }

  // Available districts extracted from real farmers
  const districtList = [...new Set(farmers.map((f) => f.district).filter(Boolean))];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Marketplace Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '750px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Direct-from-Farm Produce • 100% Zero Middleman Markup
            </span>
            <h1 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              {selectedFarmerData
                ? `Farm Store: ${selectedFarmerData.name}`
                : 'Direct Farmer Marketplace'}
            </h1>
            <p style={{ color: '#dcfce7', fontSize: '1.05rem', lineHeight: '1.5' }}>
              {selectedFarmerData
                ? `Browse and purchase fresh produce directly harvested by ${selectedFarmerData.name} in ${selectedFarmerData.village}, ${selectedFarmerData.district}.`
                : 'Select a verified registered farmer to view their authentic harvest batches and purchase directly at transparent farm-gate prices.'}
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            STEP 1: CHOOSE A FARMER VIEW
           ══════════════════════════════════════════════════════════════════════════ */}
        {!selectedFarmerId ? (
          <div>
            {/* Step 1 Title & Search Filter Card */}
            <div
              className="card"
              style={{
                padding: '1.5rem',
                marginBottom: '2rem',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', margin: 0 }}>
                    Step 1: Choose a Verified Farmer
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', margin: '0.2rem 0 0 0' }}>
                    Select an individual farmer to view their available harvest catalogue
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-green">
                    {farmers.length} Registered {farmers.length === 1 ? 'Farmer' : 'Farmers'}
                  </span>
                </div>
              </div>

              {/* Farmer Search & District Filter */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                  <input
                    type="text"
                    placeholder="Search farmers by name, village, farm name..."
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchFarmers()}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Search
                    size={18}
                    color="var(--slate-400)"
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '180px' }}>
                  <MapPin size={16} color="var(--slate-500)" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--slate-300)',
                      fontSize: '0.875rem',
                      flex: 1,
                    }}
                  >
                    <option value="">All Districts</option>
                    {districtList.map((d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    ))}
                  </select>
                </div>

                <button onClick={fetchFarmers} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                  <Search size={16} /> Filter Farmers
                </button>
              </div>
            </div>

            {/* Farmers Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--slate-500)' }}>
                <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                <div>Loading registered farmers from database...</div>
              </div>
            ) : farmers.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--slate-600)' }}
              >
                <Store size={44} color="var(--slate-400)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                  No farmers are currently registered.
                </h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {farmerSearch || selectedDistrict
                    ? 'No farmers found matching your search query. Try clearing the filters.'
                    : 'Registered farmers will appear here as soon as they onboard.'}
                </p>
                {(farmerSearch || selectedDistrict) && (
                  <button
                    onClick={() => {
                      setFarmerSearch('');
                      setSelectedDistrict('');
                      fetchFarmers();
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-3" style={{ gap: '1.5rem' }}>
                {farmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      border: '1.5px solid var(--slate-200)',
                    }}
                    onClick={() => handleSelectFarmer(farmer.id)}
                  >
                    <div>
                      {/* Farmer Header Info */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          marginBottom: '1rem',
                          paddingBottom: '0.85rem',
                          borderBottom: '1px solid var(--slate-100)',
                        }}
                      >
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                            color: '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            flexShrink: 0,
                          }}
                        >
                          👨‍🌾
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0 }}>
                              {farmer.name}
                            </h3>
                            <ShieldCheck size={18} color="#16a34a" title="Verified Farmer" />
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                            {farmer.farmName || 'Direct Organic Cultivator'}
                          </div>
                        </div>
                      </div>

                      {/* Location & Details */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--slate-600)',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={15} color="var(--primary-600)" />
                          <span>
                            {farmer.village ? `${farmer.village}, ` : ''}
                            <strong>{farmer.district}</strong>, {farmer.state}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Languages size={15} color="var(--primary-600)" />
                          <span>
                            Native Language:{' '}
                            <strong>
                              {languageNames[farmer.preferredLanguage] || farmer.preferredLanguage}
                            </strong>
                          </span>
                        </div>

                        {farmer.experience && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={15} color="var(--primary-600)" />
                            <span>
                              Experience: <strong>{farmer.experience} Years</strong>
                              {farmer.landHolding ? ` • Land: ${farmer.landHolding} Acres` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Products Summary Badge */}
                      <div
                        style={{
                          background: farmer.activeProductsCount > 0 ? '#f0fdf4' : 'var(--slate-100)',
                          border: `1px solid ${farmer.activeProductsCount > 0 ? '#bbf7d0' : 'var(--slate-300)'}`,
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          marginBottom: '1rem',
                          fontSize: '0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ color: farmer.activeProductsCount > 0 ? '#166534' : 'var(--slate-600)' }}>
                          <Package size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                          Available Products:
                        </span>
                        <strong
                          style={{
                            color: farmer.activeProductsCount > 0 ? '#15803d' : 'var(--slate-700)',
                            fontSize: '0.95rem',
                          }}
                        >
                          {farmer.activeProductsCount} {farmer.activeProductsCount === 1 ? 'Crop' : 'Crops'}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectFarmer(farmer.id)}
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      View Harvest from {farmer.name.split(' ')[0]} <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════════════
             STEP 2: PRODUCTS FROM SELECTED FARMER VIEW
             ══════════════════════════════════════════════════════════════════════════ */
          <div>
            {/* Top Navigation & Selected Farmer Banner */}
            <div
              className="card"
              style={{
                padding: '1.5rem',
                marginBottom: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid #86efac',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleBackToFarmers}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <ArrowLeft size={15} /> Change Farmer
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        Products from {selectedFarmerData?.name}
                      </span>
                      <ShieldCheck size={20} color="#16a34a" />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      📍 {selectedFarmerData?.village}, {selectedFarmerData?.district} ({selectedFarmerData?.state}) • Language: {languageNames[selectedFarmerData?.preferredLanguage] || selectedFarmerData?.preferredLanguage}
                    </div>
                  </div>
                </div>

                <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
                  Showing ONLY {selectedFarmerData?.name}'s Harvest Batches
                </span>
              </div>

              {/* Product Filtering and Sorting for this farmer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #dcfce7',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setProductCategory('')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid var(--slate-300)',
                      background: productCategory === '' ? 'var(--primary-700)' : '#ffffff',
                      color: productCategory === '' ? '#ffffff' : 'var(--slate-700)',
                      cursor: 'pointer',
                    }}
                  >
                    All Crops
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setProductCategory(cat.slug)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid var(--slate-300)',
                        background: productCategory === cat.slug ? 'var(--primary-700)' : '#ffffff',
                        color: productCategory === cat.slug ? '#ffffff' : 'var(--slate-700)',
                        cursor: 'pointer',
                      }}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Secondary Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={(e) => setOrganicOnly(e.target.checked)}
                    />
                    <span>🌿 Organic Only</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--slate-500)' }}>Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid var(--slate-300)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="newest">Fresh Harvest Date</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid for Selected Farmer */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--slate-500)' }}>
                <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                <div>Loading produce from {selectedFarmerData?.name}...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--slate-600)' }}
              >
                <Store size={44} color="var(--slate-400)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                  This farmer currently has no available products.
                </h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {selectedFarmerData?.name} does not have listed harvest batches matching the selected filters.
                </p>
                <button onClick={handleBackToFarmers} className="btn btn-primary">
                  <ArrowLeft size={16} /> Change Farmer
                </button>
              </div>
            ) : (
              <div className="grid-3" style={{ gap: '1.5rem' }}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;

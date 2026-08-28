import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Sprout,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Store,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'FARMER':
        return '/farmer';
      case 'FPO':
        return '/fpo';
      case 'LOGISTICS':
        return '/admin/shipments';
      case 'ADMIN':
        return '/admin';
      default:
        return '/customer/orders';
    }
  };

  const getRoleLabel = () => {
    if (user?.role === 'BUYER' || user?.role === 'CUSTOMER') return 'Customer';
    return user?.role || 'User';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--slate-200)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sprout size={24} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--slate-900)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Farm<span style={{ color: 'var(--primary-600)' }}>Direct</span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--slate-500)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Fair Farm-to-Buyer Supply Chain
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <Link
            to="/marketplace"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              color:
                location.pathname.startsWith('/marketplace')
                  ? 'var(--primary-700)'
                  : 'var(--slate-700)',
            }}
          >
            <Store size={18} /> Direct Marketplace
          </Link>

          <Link
            to="/impact"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              color:
                location.pathname === '/impact'
                  ? 'var(--primary-700)'
                  : 'var(--slate-700)',
            }}
          >
            <TrendingUp size={18} /> Impact & Savings
          </Link>

          {/* Cart Icon for Buyer */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.8rem',
              background: 'var(--slate-100)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--slate-800)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span
                style={{
                  background: 'var(--primary-600)',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to={getDashboardPath()}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LayoutDashboard size={16} />
                <span>{getRoleLabel()} Dashboard</span>
              </Link>

              {user?.role === 'FARMER' && (
                <Link
                  to="/farmer/notifications"
                  style={{
                    position: 'relative',
                    padding: '0.5rem',
                    background: 'var(--slate-100)',
                    borderRadius: '50%',
                    color: 'var(--slate-700)',
                  }}
                  title="SMS & Voice Notification Center"
                >
                  <Bell size={18} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%',
                    }}
                  />
                </Link>
              )}

              <button
                onClick={handleLogout}
                style={{
                  color: 'var(--slate-500)',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.85rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

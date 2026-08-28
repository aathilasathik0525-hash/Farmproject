import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Bell,
  IndianRupee,
  Users,
  Layers,
  Truck,
  Building2,
  Globe,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const getLinks = () => {
    switch (role) {
      case 'FARMER':
        return [
          { to: '/farmer', icon: <LayoutDashboard size={18} />, label: 'Dashboard Overview', end: true },
          { to: '/farmer/products', icon: <Package size={18} />, label: 'My Listed Products' },
          { to: '/farmer/add-product', icon: <PlusCircle size={18} />, label: 'Add New Product' },
          { to: '/farmer/orders', icon: <ShoppingBag size={18} />, label: 'Incoming Orders' },
          { to: '/farmer/notifications', icon: <Bell size={18} />, label: 'SMS / Voice Alerts' },
          { to: '/farmer/earnings', icon: <IndianRupee size={18} />, label: 'My Direct Earnings' },
        ];
      case 'FPO':
        return [
          { to: '/fpo', icon: <LayoutDashboard size={18} />, label: 'FPO Overview', end: true },
          { to: '/fpo/farmers', icon: <Users size={18} />, label: 'Registered Farmers' },
          { to: '/fpo/aggregation', icon: <Layers size={18} />, label: 'Produce Aggregation' },
          { to: '/fpo/collection', icon: <Building2 size={18} />, label: 'Collection Centers' },
          { to: '/fpo/logistics', icon: <Truck size={18} />, label: 'Logistics Requests' },
        ];
      case 'LOGISTICS':
        return [
          { to: '/admin/shipments', icon: <Truck size={18} />, label: 'Active Shipments', end: true },
          { to: '/admin/centers', icon: <Building2 size={18} />, label: 'Collection Centers' },
        ];
      case 'ADMIN':
        return [
          { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Platform Analytics', end: true },
          { to: '/admin/risk-monitoring', icon: <ShieldCheck size={18} />, label: 'Address Risk Monitoring' },
          { to: '/admin/purchase-limits', icon: <Settings size={18} />, label: 'Purchase Quota Rules' },
          { to: '/admin/shipments', icon: <Truck size={18} />, label: 'Live Shipments' },
          { to: '/admin/centers', icon: <Building2 size={18} />, label: 'Collection Hubs' },
          { to: '/admin/export-orders', icon: <Globe size={18} />, label: 'Large & Export Orders' },
        ];
      default:
        return [
          { to: '/customer/orders', icon: <ShoppingBag size={18} />, label: 'My Orders' },
          { to: '/marketplace', icon: <Package size={18} />, label: 'Browse Marketplace' },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--slate-200)',
        minHeight: 'calc(100vh - 110px)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Profile Card Header */}
        <div
          style={{
            background: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
            {role} PORTAL
          </div>
          <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '1rem' }}>
            {user?.name || 'Authorized User'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
              Verified Account
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary-800)' : 'var(--slate-700)',
                background: isActive ? 'var(--primary-50)' : 'transparent',
                border: isActive ? '1px solid var(--primary-200)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div
        style={{
          borderTop: '1px solid var(--slate-200)',
          paddingTop: '1rem',
          fontSize: '0.75rem',
          color: 'var(--slate-500)',
        }}
      >
        SIH26033 Prototype System
      </div>
    </aside>
  );
};

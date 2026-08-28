import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ImpactPage } from './pages/admin/ImpactPage';

// Marketplace & Customer
import { MarketplacePage } from './pages/marketplace/MarketplacePage';
import { ProductDetailPage } from './pages/marketplace/ProductDetailPage';
import { CartPage } from './pages/marketplace/CartPage';
import { CheckoutPage } from './pages/marketplace/CheckoutPage';
import { CustomerOrders } from './pages/customer/CustomerOrders';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';

// Farmer
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FarmerProducts } from './pages/farmer/FarmerProducts';
import { AddProductPage } from './pages/farmer/AddProductPage';
import { FarmerOrders } from './pages/farmer/FarmerOrders';
import { FarmerNotifications } from './pages/farmer/FarmerNotifications';
import { FarmerEarnings } from './pages/farmer/FarmerEarnings';

// FPO
import { FPODashboard } from './pages/fpo/FPODashboard';
import { FPOFarmers } from './pages/fpo/FPOFarmers';
import { FPOAggregation } from './pages/fpo/FPOAggregation';
import { FPOCollection } from './pages/fpo/FPOCollection';

// Admin / Logistics
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ShipmentsPage } from './pages/admin/ShipmentsPage';
import { ExportOrdersPage } from './pages/admin/ExportOrdersPage';
import { AddressRiskMonitoring } from './pages/admin/AddressRiskMonitoring';
import { PurchaseLimitSettings } from './pages/admin/PurchaseLimitSettings';

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Navbar />

            <div className="main-content">
              <Routes>
                {/* Public & General */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/impact" element={<ImpactPage />} />

                {/* Marketplace (Public Browsing) */}
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/marketplace/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Customer / Buyer Protected Flow */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['BUYER', 'CUSTOMER']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/orders"
                  element={
                    <ProtectedRoute allowedRoles={['BUYER', 'CUSTOMER']}>
                      <CustomerOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={['BUYER', 'CUSTOMER']}>
                      <OrderTrackingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Farmer Protected Module */}
                <Route
                  path="/farmer"
                  element={
                    <ProtectedRoute allowedRoles={['FARMER']}>
                      <FarmerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/products"
                  element={
                    <ProtectedRoute allowedRoles={['FARMER']}>
                      <FarmerProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/add-product"
                  element={
                    <ProtectedRoute allowedRoles={['FARMER']}>
                      <AddProductPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/orders"
                  element={
                    <ProtectedRoute allowedRoles={['FARMER']}>
                      <FarmerOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['FARMER']}>
                      <FarmerNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/earnings"
                  element={
                    <ProtectedRoute allowedRoles={['FARMER']}>
                      <FarmerEarnings />
                    </ProtectedRoute>
                  }
                />

                {/* FPO Protected Module */}
                <Route
                  path="/fpo"
                  element={
                    <ProtectedRoute allowedRoles={['FPO']}>
                      <FPODashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fpo/farmers"
                  element={
                    <ProtectedRoute allowedRoles={['FPO']}>
                      <FPOFarmers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fpo/aggregation"
                  element={
                    <ProtectedRoute allowedRoles={['FPO']}>
                      <FPOAggregation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fpo/collection"
                  element={
                    <ProtectedRoute allowedRoles={['FPO']}>
                      <FPOCollection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fpo/logistics"
                  element={
                    <ProtectedRoute allowedRoles={['FPO', 'ADMIN']}>
                      <ShipmentsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Logistics & Admin Module */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/risk-monitoring"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AddressRiskMonitoring />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/purchase-limits"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <PurchaseLimitSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/shipments"
                  element={
                    <ProtectedRoute allowedRoles={['LOGISTICS', 'ADMIN']}>
                      <ShipmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/centers"
                  element={
                    <ProtectedRoute allowedRoles={['LOGISTICS', 'ADMIN']}>
                      <FPOCollection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/export-orders"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ExportOrdersPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

import API from './client';

// ── Auth APIs ──
export const loginApi = (email, password) => API.post('/auth/login', { email, password });
export const registerApi = (data) => API.post('/auth/register', data);
export const sendAadhaarOtpApi = (data) => API.post('/auth/aadhaar/send-otp', data);
export const verifyAadhaarOtpApi = (data) => API.post('/auth/aadhaar/verify-otp', data);
export const getMeApi = () => API.get('/auth/me');
export const updateProfileApi = (data) => API.put('/auth/profile', data);

// ── Products APIs ──
export const getProductsApi = (params) => API.get('/products', { params });
export const getCategoriesApi = () => API.get('/products/categories');
export const getProductByIdApi = (id) => API.get(`/products/${id}`);
export const createProductApi = (data) => API.post('/products', data);
export const updateProductApi = (id, data) => API.put(`/products/${id}`, data);
export const deleteProductApi = (id) => API.delete(`/products/${id}`);

// ── Farmer Marketplace APIs ──
export const getPublicFarmersApi = (params) => API.get('/farmers', { params });
export const getFarmerByIdApi = (id) => API.get(`/farmers/${id}`);
export const getFarmerDashboardApi = (farmerId) =>
  farmerId ? API.get(`/farmers/${farmerId}/dashboard`) : API.get('/farmers/dashboard');
export const getFarmerEarningsApi = (farmerId) =>
  farmerId ? API.get(`/farmers/${farmerId}/earnings`) : API.get('/farmers/earnings');

// ── Orders APIs ──
export const validateCheckoutApi = (data) => API.post('/orders/validate-checkout', data);
export const createOrderApi = (data) => API.post('/orders', data);
export const getOrdersApi = () => API.get('/orders');
export const getOrderByIdApi = (id) => API.get(`/orders/${id}`);
export const updateOrderStatusApi = (id, status, note) =>
  API.patch(`/orders/${id}/status`, { status, note });

// ── FPO APIs ──
export const getFPOsApi = () => API.get('/fpos');
export const getFPOFarmersApi = (fpoId) => API.get(`/fpos/${fpoId}/farmers`);
export const verifyFarmerApi = (farmerId, status) =>
  API.patch(`/fpos/farmers/${farmerId}/verify`, { status });
export const createAggregationApi = (data) => API.post('/fpos/aggregation', data);
export const getCollectionCentersApi = () => API.get('/fpos/collection-centers');

// ── Logistics APIs ──
export const getShipmentsApi = () => API.get('/logistics/shipments');
export const getVehiclesApi = () => API.get('/logistics/vehicles');
export const createShipmentApi = (data) => API.post('/logistics/shipments', data);
export const updateShipmentStatusApi = (id, status, notes) =>
  API.patch(`/logistics/shipments/${id}/status`, { status, notes });

// ── Notifications APIs ──
export const getNotificationsApi = () => API.get('/notifications');
export const markNotificationReadApi = (id) => API.patch(`/notifications/${id}/read`);
export const simulateNotificationApi = (data) => API.post('/notifications/simulate', data);

// ── Payments APIs ──
export const createPaymentOrderApi = (orderId) =>
  API.post('/payments/create-order', { orderId });
export const verifyPaymentApi = (data) => API.post('/payments/verify', data);

// ── Admin APIs ──
export const getAdminAnalyticsApi = () => API.get('/admin/analytics');
export const getAdminUsersApi = () => API.get('/admin/users');
export const getAdminRiskAddressesApi = () => API.get('/admin/risk/addresses');
export const getAdminRiskAddressDetailsApi = (id) => API.get(`/admin/risk/addresses/${id}`);
export const updateAdminRiskAddressStatusApi = (id, data) => API.patch(`/admin/risk/addresses/${id}/status`, data);
export const getAdminPurchasePolicyApi = () => API.get('/admin/risk/policy');
export const updateAdminPurchasePolicyApi = (data) => API.put('/admin/risk/policy', data);

// ── Upload APIs ──
export const uploadImageApi = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return API.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Sends HttpOnly cookie
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.error?.code;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  demoLogin: (roleKey) => apiRequest('/auth/demo-login', { method: 'POST', body: JSON.stringify({ roleKey }) }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  switchCommunity: (communityId) => apiRequest('/auth/switch-community', { method: 'POST', body: JSON.stringify({ communityId }) }),

  // Communities
  getCommunities: () => apiRequest('/communities'),

  // Flats
  getFlats: (communityId) => apiRequest(`/flats${communityId ? `?communityId=${communityId}` : ''}`),

  // Tenancies & Leases
  getTenancies: (params = '') => apiRequest(`/tenancies${params}`),
  createTenancy: (data) => apiRequest('/tenancies', { method: 'POST', body: JSON.stringify(data) }),
  moveOutSettlement: (id, data) => apiRequest(`/tenancies/${id}/move-out`, { method: 'POST', body: JSON.stringify(data) }),

  // Invoices & Payments (Dual Ledger)
  getInvoices: (params = '') => apiRequest(`/invoices${params}`),
  reportPayment: (invoiceId, data) => apiRequest(`/invoices/${invoiceId}/report-payment`, { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (paymentId, data) => apiRequest(`/invoices/payments/${paymentId}/verify`, { method: 'POST', body: JSON.stringify(data) }),

  // Complaints
  getComplaints: (params = '') => apiRequest(`/complaints${params}`),
  createComplaint: (data) => apiRequest('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  updateComplaintStatus: (id, data) => apiRequest(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  assignComplaintWorker: (id, data) => apiRequest(`/complaints/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),

  // Visitors
  getVisitors: () => apiRequest('/visitors'),
  createVisitorPass: (data) => apiRequest('/visitors', { method: 'POST', body: JSON.stringify(data) }),
  validateVisitorPass: (data) => apiRequest('/visitors/validate', { method: 'POST', body: JSON.stringify(data) }),

  // Facilities
  getFacilities: () => apiRequest('/facilities'),
  bookFacility: (facilityId, data) => apiRequest(`/facilities/${facilityId}/book`, { method: 'POST', body: JSON.stringify(data) }),

  // Notices
  getNotices: () => apiRequest('/notices'),
  publishNotice: (data) => apiRequest('/notices', { method: 'POST', body: JSON.stringify(data) }),

  // Parking
  getParkingSlots: (communityId) => apiRequest(`/parking${communityId ? `?communityId=${communityId}` : ''}`),
  allocateParkingSlot: (id, data) => apiRequest(`/parking/${id}/allocate`, { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => apiRequest('/analytics'),

  // Super Admin
  getSuperAdminOverview: () => apiRequest('/super-admin/overview'),
  getSuperAdminCommunities: () => apiRequest('/super-admin/communities'),
  toggleCommunityStatus: (id, status) => apiRequest(`/super-admin/communities/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getSuperAdminAuditLogs: () => apiRequest('/super-admin/audit-logs')
};

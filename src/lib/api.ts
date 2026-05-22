const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('parksmart_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || res.statusText), { status: res.status, code: data.error });
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('POST', '/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string; vehiclePlate?: string; vehicleModel?: string }) =>
    request<{ success: boolean }>('POST', '/auth/register', data),

  // Users
  getUsers: () => request<any[]>('GET', '/users'),
  createUser: (data: any) => request<any>('POST', '/users', data),
  updateUser: (id: string, data: any) => request<any>('PATCH', `/users/${id}`, data),
  updateUserStatus: (id: string, status: string) => request<any>('PATCH', `/users/${id}/status`, { status }),
  deleteUser: (id: string) => request<any>('DELETE', `/users/${id}`),

  // Zones & Slots
  getZones: () => request<any[]>('GET', '/zones'),
  createZone: (data: any) => request<any>('POST', '/zones', data),
  updateZone: (id: string, data: any) => request<any>('PATCH', `/zones/${id}`, data),
  deleteZone: (id: string) => request<any>('DELETE', `/zones/${id}`),
  createSlot: (zoneId: string, data: any) => request<any>('POST', `/zones/${zoneId}/slots`, data),
  updateSlotStatus: (slotId: string, status: string) => request<any>('PATCH', `/zones/slots/${slotId}/status`, { status }),
  deleteSlot: (slotId: string) => request<any>('DELETE', `/zones/slots/${slotId}`),

  // Reservations
  getReservations: () => request<any[]>('GET', '/reservations'),
  createReservation: (data: any) => request<any>('POST', '/reservations', data),
  cancelReservation: (id: string) => request<any>('PATCH', `/reservations/${id}/cancel`),
  expireReservation: (id: string) => request<any>('PATCH', `/reservations/${id}/expire`),

  // Permits
  getPermits: () => request<any[]>('GET', '/permits'),
  requestPermit: (data: any) => request<any>('POST', '/permits', data),
  approvePermit: (id: string) => request<any>('PATCH', `/permits/${id}/approve`),
  revokePermit: (id: string) => request<any>('PATCH', `/permits/${id}/revoke`),

  // Violations
  getViolations: () => request<any[]>('GET', '/violations'),
  reportViolation: (data: any) => request<any>('POST', '/violations', data),
  resolveViolation: (id: string) => request<any>('PATCH', `/violations/${id}/resolve`),

  // Notifications
  getNotifications: () => request<any[]>('GET', '/notifications'),
  addNotification: (data: any) => request<any>('POST', '/notifications', data),
  markNotificationRead: (id: string) => request<any>('PATCH', `/notifications/${id}/read`),
  markAllRead: (role: string) => request<any>('PATCH', `/notifications/read-all?role=${role}`),

  // Logs
  getLogs: () => request<any[]>('GET', '/logs'),
  addLog: (data: any) => request<any>('POST', '/logs', data),
};

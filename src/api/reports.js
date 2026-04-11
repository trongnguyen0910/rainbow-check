import api from './axios';

export const getMonthlyReport = (params) => api.get('/reports/monthly', { params });
export const exportReport     = (params) => api.get('/reports/export', { params, responseType: 'blob' });

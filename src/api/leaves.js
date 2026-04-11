import api from './axios';

export const getLeaves     = (params) => api.get('/leaves', { params });
export const createLeave   = (data)   => api.post('/leaves', data);
export const approveLeave  = (id)     => api.put(`/leaves/${id}/approve`);
export const rejectLeave   = (id, d)  => api.put(`/leaves/${id}/reject`, d);
export const getBalances   = (params) => api.get('/leaves/balances', { params });

import api from './axios';

export const getAttendance   = (params) => api.get('/attendance', { params });
export const getTodayStatus  = ()       => api.get('/attendance/today');
export const checkIn         = ()       => api.post('/attendance/checkin');
export const checkOut        = ()       => api.post('/attendance/checkout');

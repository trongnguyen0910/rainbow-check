import api from './axios';

export const getProfile   = ()     => api.get('/profile');
export const updateProfile= (data) => api.put('/profile', data);
export const updateAvatar = (data) => api.put('/profile/avatar', data);
export const changePassword = (data) => api.put('/auth/change-password', data);

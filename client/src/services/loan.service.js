import api from './api';

export const loanService = {
  apply: (data) => api.post('/loans', data),
  getAll: (params) => api.get('/loans', { params }),
  getById: (id) => api.get(`/loans/${id}`),
  fund: (id) => api.post(`/loans/${id}/fund`),
  getMyRepayments: () => api.get('/repayments/my'),
  payInstallment: (id) => api.post(`/repayments/${id}/pay`),
};

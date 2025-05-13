import api from './api';

export const fetchCorrectionRequests = async () => {
    const response = await api.get('/admin/correction-requests');
    return response.data;
};

export const fetchCorrectionRequestsCount = async () => {
    const response = await api.get('/admin/correction-requests/count');
    return response.data;
};

export const approveCorrectionRequest = async (id) => {
    const response = await api.put(`/admin/correction-requests/${id}/approve`);
    return response.data;
};

export const rejectCorrectionRequest = async (id) => {
    const response = await api.put(`/admin/correction-requests/${id}/reject`);
    return response.data;
}; 
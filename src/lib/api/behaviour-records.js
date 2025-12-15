import apiClient from './client';

/**
 * Get all behaviour records with filters and pagination
 */
export const getAllBehaviourRecords = async (params = {}) => {
  const response = await apiClient.get('/behaviour-records', { params });
  return response.data;
};

/**
 * Get a single behaviour record by ID
 */
export const getBehaviourRecordById = async (id) => {
  const response = await apiClient.get(`/behaviour-records/${id}`);
  return response.data;
};

/**
 * Create a new behaviour record
 */
export const createBehaviourRecord = async (data) => {
  const response = await apiClient.post('/behaviour-records', data);
  return response.data;
};

/**
 * Update a behaviour record
 */
export const updateBehaviourRecord = async (id, data) => {
  const response = await apiClient.put(`/behaviour-records/${id}`, data);
  return response.data;
};

/**
 * Delete a behaviour record
 */
export const deleteBehaviourRecord = async (id) => {
  const response = await apiClient.delete(`/behaviour-records/${id}`);
  return response.data;
};

/**
 * Adjust sentence for a behaviour record
 */
export const adjustSentence = async (id) => {
  const response = await apiClient.post(`/behaviour-records/${id}/approve-adjustment`);
  return response.data;
};

/**
 * Reject sentence for a behaviour record
 */
export const rejectAdjustment = async (id) => {
  const response = await apiClient.post(`/behaviour-records/${id}/reject-adjustment`);
  return response.data;
};
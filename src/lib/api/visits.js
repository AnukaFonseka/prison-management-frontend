import apiClient from './client';

/**
 * Get all visits with filters and pagination
 */
export const getAllVisits = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.prison_id) queryParams.append('prison_id', params.prison_id);
  if (params.status) queryParams.append('status', params.status);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.search) queryParams.append('search', params.search);
  if (params.prisoner_id) queryParams.append('prisoner_id', params.prisoner_id);
  if (params.visitor_id) queryParams.append('visitor_id', params.visitor_id);

  const response = await apiClient.get(`/visits?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get visit by ID
 */
export const getVisitById = async (visitId) => {
  const response = await apiClient.get(`/visits/${visitId}`);
  return response.data;
};

/**
 * Create new visit
 */
export const createVisit = async (visitData) => {
  const response = await apiClient.post('/visits', visitData);
  return response.data;
};

/**
 * Update visit
 */
export const updateVisit = async (visitId, visitData) => {
  const response = await apiClient.put(`/visits/${visitId}`, visitData);
  return response.data;
};

/**
 * Delete visit
 */
export const deleteVisit = async (visitId) => {
  const response = await apiClient.delete(`/visits/${visitId}`);
  return response.data;
};

/**
 * Update visit status
 */
export const updateVisitStatus = async (visitId, status, notes = '') => {
  const response = await apiClient.patch(`/visits/${visitId}/status`, {
    status,
    notes,
  });
  return response.data;
};
// src/lib/api/prisons.js
import apiClient from './client';

/**
 * Get all prisons with filtering and pagination
 */
export const getAllPrisons = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.location) params.append('location', filters.location);
  if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await apiClient.get(`/prisons?${params.toString()}`);
  return response.data;
};

/**
 * Get prison by ID
 */
export const getPrisonById = async (prisonId) => {
  const response = await apiClient.get(`/prisons/${prisonId}`);
  return response.data;
};

/**
 * Create new prison
 */
export const createPrison = async (prisonData) => {
  const response = await apiClient.post('/prisons', prisonData);
  return response.data;
};

/**
 * Update prison
 */
export const updatePrison = async (prisonId, prisonData) => {
  const response = await apiClient.put(`/prisons/${prisonId}`, prisonData);
  return response.data;
};

/**
 * Delete prison (deactivate)
 */
export const deletePrison = async (prisonId) => {
  const response = await apiClient.delete(`/prisons/${prisonId}`);
  return response.data;
};

/**
 * Get prison statistics
 */
export const getPrisonStatistics = async (prisonId) => {
  const response = await apiClient.get(`/prisons/${prisonId}/statistics`);
  return response.data;
};
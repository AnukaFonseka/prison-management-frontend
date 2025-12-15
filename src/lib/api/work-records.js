// src/lib/api/work-records.js
import apiClient from './client';

/**
 * Get all work records with filtering and pagination
 */
export const getAllWorkRecords = async (params = {}) => {
  const response = await apiClient.get('/work-records', { params });
  return response.data;
};

/**
 * Get a single work record by ID
 */
export const getWorkRecordById = async (id) => {
  const response = await apiClient.get(`/work-records/${id}`);
  return response.data;
};

/**
 * Create a new work record
 */
export const createWorkRecord = async (data) => {
  const response = await apiClient.post('/work-records', data);
  return response.data;
};

/**
 * Update a work record
 */
export const updateWorkRecord = async (id, data) => {
  const response = await apiClient.put(`/work-records/${id}`, data);
  return response.data;
};

/**
 * Delete a work record
 */
export const deleteWorkRecord = async (id) => {
  const response = await apiClient.delete(`/work-records/${id}`);
  return response.data;
};

/**
 * Approve payment for a work record
 */
export const approvePayment = async (id) => {
  const response = await apiClient.post(`/work-records/${id}/approve-payment`);
  return response.data;
};

/**
 * Get work records statistics
 */
export const getWorkRecordsStats = async (prisonId = null) => {
  const params = prisonId ? { prison_id: prisonId } : {};
  const response = await apiClient.get('/work-records/stats', { params });
  return response.data;
};
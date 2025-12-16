// src/lib/api/visitors.js
import apiClient from './client';

/**
 * Get all visitors with pagination and filters
 */
export const getAllVisitors = async (params = {}) => {
  const response = await apiClient.get('/visitors', { params });
  return response.data;
};

/**
 * Get single visitor by ID
 */
export const getVisitorById = async (id) => {
  const response = await apiClient.get(`/visitors/${id}`);
  return response.data;
};

/**
 * Create new visitor
 */
export const createVisitor = async (data) => {
  const response = await apiClient.post('/visitors', data);
  return response.data;
};

/**
 * Update visitor
 */
export const updateVisitor = async (id, data) => {
  const response = await apiClient.put(`/visitors/${id}`, data);
  return response.data;
};

/**
 * Delete visitor
 */
export const deleteVisitor = async (id) => {
  const response = await apiClient.delete(`/visitors/${id}`);
  return response.data;
};

/**
 * Get visitor's visit history
 */
export const getVisitorVisits = async (id, params = {}) => {
  const response = await apiClient.get(`/visitors/${id}/visits`, { params });
  return response.data;
};
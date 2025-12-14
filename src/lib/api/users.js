// src/lib/api/users.js
import apiClient from './client';

/**
 * Get all users with filters and pagination
 */
export const getAllUsers = async (params = {}) => {
  const response = await apiClient.get('/users', { params });
  return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  const response = await apiClient.post('/users', userData);
  return response.data;
};

/**
 * Update user
 */
export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Delete user (deactivate)
 */
export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};

/**
 * Reset user password
 */
export const resetUserPassword = async (userId, newPassword) => {
  const response = await apiClient.post(`/users/${userId}/reset-password`, {
    newPassword,
  });
  return response.data;
};

/**
 * Get all roles
 */
export const getAllRoles = async () => {
  const response = await apiClient.get('/users/roles/dropdown');
  return response.data;
};
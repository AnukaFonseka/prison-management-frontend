// src/lib/api/prisoners.js
import apiClient from './client';

/**
 * Get all prisoners with filters and pagination
 */
export const getAllPrisoners = async (params = {}) => {
  const {
    prison_id = null,
    status = null,
    gender = null,
    nationality = null,
    search = null,
    page = 1,
    limit = 10,
  } = params;

  const response = await apiClient.get('/prisoners', {
    params: {
      prison_id,
      status,
      gender,
      nationality,
      search,
      page,
      limit,
    },
  });

  return response.data;
};

/**
 * Get single prisoner by ID
 */
export const getPrisonerById = async (prisonerId) => {
  const response = await apiClient.get(`/prisoners/${prisonerId}`);
  return response.data;
};

/**
 * Create new prisoner (Step 1 - Basic Details)
 */
export const createPrisoner = async (data) => {
  const response = await apiClient.post('/prisoners', {
    full_name: data.full_name,
    nic: data.nic,
    case_number: data.case_number,
    gender: data.gender,
    birthday: data.birthday,
    nationality: data.nationality,
    admission_date: data.admission_date,
    expected_release_date: data.expected_release_date,
    prison_id: data.prison_id,
    cell_number: data.cell_number,
    social_status: data.social_status,
  });
  return response.data;
};

/**
 * Upload prisoner photo (Step 2 - Photos)
 */
export const uploadPrisonerPhoto = async (prisonerId, photoFile, photoType = 'Profile') => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  formData.append('photo_type', photoType);

  const response = await apiClient.post(`/prisoners/${prisonerId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Add body mark (Step 3 - Body Marks)
 */
export const addBodyMark = async (prisonerId, data) => {
  const response = await apiClient.post(`/prisoners/${prisonerId}/body-marks`, {
    mark_description: data.mark_description,
    mark_location: data.mark_location,
  });
  return response.data;
};

/**
 * Add family member (Step 4 - Family Members)
 */
export const addFamilyMember = async (prisonerId, data) => {
  const response = await apiClient.post(`/prisoners/${prisonerId}/family`, {
    family_member_name: data.family_member_name,
    relationship: data.relationship,
    contact_number: data.contact_number,
    address: data.address,
    nic: data.nic,
    emergency_contact: data.emergency_contact,
  });
  return response.data;
};

/**
 * Update prisoner
 */
export const updatePrisoner = async (prisonerId, data) => {
  const response = await apiClient.put(`/prisoners/${prisonerId}`, data);
  return response.data;
};

/**
 * Delete prisoner (soft delete)
 */
export const deletePrisoner = async (prisonerId) => {
  const response = await apiClient.delete(`/prisoners/${prisonerId}`);
  return response.data;
};

/**
 * Get prisoner statistics
 */
export const getPrisonerStats = async () => {
  const response = await apiClient.get('/prisoners/stats');
  return response.data;
};
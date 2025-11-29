// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  PRISON_ADMIN: 'Prison Admin',
  OFFICER: 'Officer',
  RECORDS_KEEPER: 'Records Keeper',
  VISITOR_MANAGER: 'Visitor Manager',
};

// Permissions
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',

  // Prison Management
  MANAGE_PRISONS: 'manage_prisons',
  VIEW_PRISONS: 'view_prisons',

  // Prisoner Management
  MANAGE_PRISONERS: 'manage_prisoners',
  VIEW_PRISONERS: 'view_prisoners',
  REGISTER_PRISONER: 'register_prisoner',
  UPDATE_PRISONER: 'update_prisoner',
  DELETE_PRISONER: 'delete_prisoner',

  // Work Records
  MANAGE_WORK_RECORDS: 'manage_work_records',
  VIEW_WORK_RECORDS: 'view_work_records',
  RECORD_WORK: 'record_work',
  APPROVE_PAYMENT: 'approve_payment',

  // Behaviour Records
  MANAGE_BEHAVIOUR: 'manage_behaviour',
  VIEW_BEHAVIOUR: 'view_behaviour',
  RECORD_BEHAVIOUR: 'record_behaviour',
  ADJUST_SENTENCE: 'adjust_sentence',

  // Visitor Management
  MANAGE_VISITORS: 'manage_visitors',
  VIEW_VISITORS: 'view_visitors',
  SCHEDULE_VISIT: 'schedule_visit',
  APPROVE_VISIT: 'approve_visit',

  // Reports
  GENERATE_REPORTS: 'generate_reports',
  VIEW_REPORTS: 'view_reports',
};

// Prisoner Status
export const PRISONER_STATUS = {
  ACTIVE: 'Active',
  RELEASED: 'Released',
  TRANSFERRED: 'Transferred',
  DECEASED: 'Deceased',
};

// Visit Status
export const VISIT_STATUS = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
};

// Behaviour Type
export const BEHAVIOUR_TYPE = {
  POSITIVE: 'Positive',
  NEGATIVE: 'Negative',
};

// Severity Level
export const SEVERITY_LEVEL = {
  MINOR: 'Minor',
  MODERATE: 'Moderate',
  SEVERE: 'Severe',
};

// Adjustment Status
export const ADJUSTMENT_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  NOT_APPLICABLE: 'N/A',
};

// Gender
export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRISONS: '/prisons',
  USERS: '/users',
  PRISONERS: '/prisoners',
  WORK_RECORDS: '/work-records',
  BEHAVIOUR_RECORDS: '/behaviour-records',
  VISITORS: '/visitors',
  VISITS: '/visits',
  REPORTS: '/reports',
  SETTINGS: '/settings',
};
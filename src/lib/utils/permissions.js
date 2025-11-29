import { USER_ROLES } from './constants';

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) {
    return false;
  }
  return user.permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.permissions) {
    return false;
  }
  return permissions.some((permission) =>
    user.permissions.includes(permission)
  );
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !user.permissions) {
    return false;
  }
  return permissions.every((permission) =>
    user.permissions.includes(permission)
  );
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) {
    return false;
  }
  return user.role.roleName === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user, roles) => {
  if (!user || !user.role) {
    return false;
  }
  return roles.includes(user.role.roleName);
};

/**
 * Check if user is Super Admin
 */
export const isSuperAdmin = (user) => {
  return hasRole(user, USER_ROLES.SUPER_ADMIN);
};

/**
 * Check if user is Prison Admin
 */
export const isPrisonAdmin = (user) => {
  return hasRole(user, USER_ROLES.PRISON_ADMIN);
};

/**
 * Check if user can access prison data
 * Super Admin can access all prisons
 * Prison Admin and staff can only access their assigned prison
 */
export const canAccessPrison = (user, prisonId) => {
  if (isSuperAdmin(user)) {
    return true;
  }

  if (!user.prison) {
    return false;
  }

  return user.prison.prisonId === prisonId;
};
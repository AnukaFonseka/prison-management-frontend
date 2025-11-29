import { useAuth } from '@/context/AuthContext';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  isSuperAdmin,
  isPrisonAdmin,
  canAccessPrison,
} from '@/lib/utils/permissions';

/**
 * Custom hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    // Check single permission
    hasPermission: (permission) => hasPermission(user, permission),

    // Check multiple permissions (OR)
    hasAnyPermission: (permissions) => hasAnyPermission(user, permissions),

    // Check multiple permissions (AND)
    hasAllPermissions: (permissions) => hasAllPermissions(user, permissions),

    // Check single role
    hasRole: (role) => hasRole(user, role),

    // Check multiple roles (OR)
    hasAnyRole: (roles) => hasAnyRole(user, roles),

    // Check if super admin
    isSuperAdmin: () => isSuperAdmin(user),

    // Check if prison admin
    isPrisonAdmin: () => isPrisonAdmin(user),

    // Check if can access prison data
    canAccessPrison: (prisonId) => canAccessPrison(user, prisonId),

    // Get user's role name
    getRoleName: () => user?.role?.roleName || null,

    // Get user's prison
    getPrison: () => user?.prison || null,

    // Get all user permissions
    getPermissions: () => user?.permissions || [],
  };
}
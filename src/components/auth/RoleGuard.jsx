'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/lib/utils/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * RoleGuard component to restrict access based on roles or permissions
 * 
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of role names that can access
 * @param {string[]} props.requiredPermissions - Array of permissions required (user must have at least one)
 * @param {boolean} props.requireAll - If true, user must have all permissions (default: false)
 * @param {React.ReactNode} props.children - Content to render if access is granted
 * @param {React.ReactNode} props.fallback - Custom component to show when access is denied
 */
export default function RoleGuard({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAll = false,
  fallback = null,
}) {
  const { user } = useAuth();
  const {
    hasAnyRole,
    hasAnyPermission,
    hasAllPermissions,
    getRoleName,
  } = usePermissions();
  const router = useRouter();

  // Check role-based access
  const hasRoleAccess =
    allowedRoles.length === 0 || hasAnyRole(allowedRoles);

  // Check permission-based access
  let hasPermissionAccess = true;
  if (requiredPermissions.length > 0) {
    hasPermissionAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  // Check if user has access
  const hasAccess = hasRoleAccess && hasPermissionAccess;

  // If no access, show fallback or default access denied message
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="mt-2">
              You don&apos;t have permission to access this page.
              <br />
              <span className="text-sm text-muted-foreground">
                Your role: {getRoleName()}
              </span>
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => router.push(ROUTES.DASHBOARD)}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
}
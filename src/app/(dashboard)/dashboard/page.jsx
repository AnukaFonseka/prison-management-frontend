'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}!
          </p>
        </div>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Username:</span>
              <span>{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Role:</span>
              <Badge variant="secondary">{user?.role?.roleName}</Badge>
            </div>
            {user?.prison && (
              <div className="flex justify-between">
                <span className="font-medium">Prison:</span>
                <span>{user?.prison?.prisonName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Your access rights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user?.permissions?.slice(0, 10).map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission.replace(/_/g, ' ')}
                </Badge>
              ))}
              {user?.permissions?.length > 10 && (
                <Badge variant="secondary">
                  +{user.permissions.length - 10} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🎉 Authentication Setup Complete!</CardTitle>
          <CardDescription>
            Your authentication system is now fully functional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have successfully implemented:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>User login with JWT tokens</li>
            <li>Auth context with user state management</li>
            <li>Protected routes and role-based access control</li>
            <li>Token refresh mechanism</li>
            <li>Permission checking utilities</li>
          </ul>
          <p className="mt-4 text-sm font-medium">
            Next steps: Build the dashboard layout with sidebar navigation!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
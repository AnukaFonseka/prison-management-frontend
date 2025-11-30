'use client';

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Building2,
  Users,
  Shield,
  Briefcase,
  FileText,
  UserCheck,
  CalendarCheck,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { PERMISSIONS } from '@/lib/utils/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Mock statistics - Replace with actual API calls later
  const stats = [
    {
      title: 'Total Prisons',
      value: '3',
      icon: Building2,
      description: 'Active facilities',
      trend: '+0',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      show: isSuperAdmin(),
      href: '/prisons',
    },
    {
      title: 'Total Users',
      value: '48',
      icon: Users,
      description: 'Staff members',
      trend: '+3 this month',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      show: hasPermission(PERMISSIONS.VIEW_USERS),
      href: '/users',
    },
    {
      title: 'Active Prisoners',
      value: '1,247',
      icon: Shield,
      description: 'Currently detained',
      trend: '-12 this week',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      show: hasPermission(PERMISSIONS.VIEW_PRISONERS),
      href: '/prisoners',
    },
    {
      title: 'Pending Payments',
      value: '23',
      icon: Briefcase,
      description: 'Work records',
      trend: 'Needs approval',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      show: hasPermission(PERMISSIONS.APPROVE_PAYMENT),
      href: '/work-records/pending-payments',
    },
    {
      title: 'Pending Adjustments',
      value: '8',
      icon: FileText,
      description: 'Sentence reviews',
      trend: 'Awaiting decision',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      show: hasPermission(PERMISSIONS.ADJUST_SENTENCE),
      href: '/behaviour-records/pending-adjustments',
    },
    {
      title: 'Upcoming Visits',
      value: '15',
      icon: CalendarCheck,
      description: 'This week',
      trend: '3 today',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      show: hasPermission(PERMISSIONS.VIEW_VISITORS),
      href: '/visits/upcoming',
    },
  ];

  // Quick actions based on user permissions
  const quickActions = [
    {
      title: 'Register Prisoner',
      description: 'Add a new prisoner to the system',
      icon: Shield,
      href: '/prisoners/new',
      show: hasPermission(PERMISSIONS.REGISTER_PRISONER),
      variant: 'default',
    },
    {
      title: 'Record Work',
      description: 'Log prisoner work activities',
      icon: Briefcase,
      href: '/work-records/new',
      show: hasPermission(PERMISSIONS.RECORD_WORK),
      variant: 'secondary',
    },
    {
      title: 'Record Behaviour',
      description: 'Log behaviour incidents',
      icon: FileText,
      href: '/behaviour-records/new',
      show: hasPermission(PERMISSIONS.RECORD_BEHAVIOUR),
      variant: 'secondary',
    },
    {
      title: 'Schedule Visit',
      description: 'Book a prisoner visit',
      icon: CalendarCheck,
      href: '/visits/schedule',
      show: hasPermission(PERMISSIONS.SCHEDULE_VISIT),
      variant: 'secondary',
    },
    {
      title: 'Add User',
      description: 'Create new staff account',
      icon: Users,
      href: '/users/new',
      show: hasPermission(PERMISSIONS.CREATE_USER),
      variant: 'outline',
    },
    {
      title: 'Generate Report',
      description: 'Create system reports',
      icon: BarChart3,
      href: '/reports',
      show: hasPermission(PERMISSIONS.GENERATE_REPORTS),
      variant: 'outline',
    },
  ];

  // Recent activity mock data
  const recentActivities = [
    {
      type: 'success',
      title: 'New prisoner registered',
      description: 'John Doe (Case #2024-1547)',
      time: '2 hours ago',
      icon: CheckCircle2,
    },
    {
      type: 'warning',
      title: 'Payment pending approval',
      description: 'Work record #WR-2024-0892',
      time: '5 hours ago',
      icon: Clock,
    },
    {
      type: 'info',
      title: 'Visit scheduled',
      description: 'Visitor: Jane Smith (Tomorrow 10:00 AM)',
      time: '1 day ago',
      icon: CalendarCheck,
    },
    {
      type: 'error',
      title: 'Behaviour incident reported',
      description: 'Prisoner ID: PR-001234 (Under review)',
      time: '2 days ago',
      icon: AlertCircle,
    },
  ];

  const visibleStats = stats.filter((stat) => stat.show);
  const visibleActions = quickActions.filter((action) => action.show);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in your facility today.
        </p>
      </div>

      {/* Statistics Cards */}
      {visibleStats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    {stat.trend && (
                      <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {stat.trend}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {visibleActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used tasks for faster access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.href}>
                    <Button
                      variant={action.variant}
                      className="h-auto w-full justify-start p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs font-normal text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Profile and role information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Username</span>
              <span className="text-sm text-muted-foreground">
                {user?.username}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <Badge variant="secondary">{user?.role?.roleName}</Badge>
            </div>
            {user?.prison && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Assigned Prison</span>
                <span className="text-sm text-muted-foreground">
                  {user?.prison?.prisonName}
                </span>
              </div>
            )}
            <div className="pt-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/settings/profile">View Full Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex gap-3">
                    <div className="mt-1">
                      <Icon
                        className={`h-4 w-4 ${
                          activity.type === 'success'
                            ? 'text-green-600'
                            : activity.type === 'warning'
                            ? 'text-orange-600'
                            : activity.type === 'error'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Alert */}
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>System Status: Operational</AlertTitle>
        <AlertDescription>
          All services are running normally. Last updated: {new Date().toLocaleString()}
        </AlertDescription>
      </Alert>
    </div>
  );
}
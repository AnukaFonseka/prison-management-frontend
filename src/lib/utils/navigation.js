import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  Briefcase,
  FileText,
  UserCheck,
  CalendarCheck,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react';
import { PERMISSIONS, USER_ROLES } from './constants';

/**
 * Navigation configuration for sidebar
 * Each item can have:
 * - title: Display name
 * - icon: Lucide icon component
 * - href: Route path
 * - badge: Optional badge text
 * - permissions: Array of required permissions (user needs at least one)
 * - roles: Array of required roles (user needs at least one)
 * - children: Sub-menu items
 */
export const navigationConfig = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Prisons',
    icon: Building2,
    href: '/prisons',
    permissions: [PERMISSIONS.VIEW_PRISONS, PERMISSIONS.MANAGE_PRISONS],
    roles: [USER_ROLES.SUPER_ADMIN],
  },
  {
    title: 'Users',
    icon: UserCog,
    href: '/users',
    permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.MANAGE_USERS],
  },
  {
    title: 'Prisoners',
    icon: Shield,
    href: '/prisoners',
    permissions: [PERMISSIONS.VIEW_PRISONERS, PERMISSIONS.MANAGE_PRISONERS],
    children: [
      {
        title: 'All Prisoners',
        href: '/prisoners',
        permissions: [
          PERMISSIONS.VIEW_PRISONERS,
        ],
      },
      {
        title: 'Add Prisoner',
        href: '/prisoners/add',
        permissions: [
          PERMISSIONS.MANAGE_PRISONERS,
        ],
      },
    ],
  },
  {
    title: 'Work Records',
    icon: Briefcase,
    href: '/work-records',
    permissions: [
      PERMISSIONS.VIEW_WORK_RECORDS,
      PERMISSIONS.MANAGE_WORK_RECORDS,
      PERMISSIONS.RECORD_WORK,
    ],
    // children: [
    //   {
    //     title: 'All Records',
    //     href: '/work-records',
    //     permissions: [
    //       PERMISSIONS.VIEW_WORK_RECORDS,
    //       PERMISSIONS.MANAGE_WORK_RECORDS,
    //     ],
    //   },
    //   {
    //     title: 'Pending Payments',
    //     href: '/work-records/pending-payments',
    //     permissions: [
    //       PERMISSIONS.APPROVE_PAYMENT,
    //       PERMISSIONS.MANAGE_WORK_RECORDS,
    //     ],
    //   },
    // ],
  },
  {
    title: 'Behaviour Records',
    icon: FileText,
    href: '/behaviour-records',
    permissions: [
      PERMISSIONS.VIEW_BEHAVIOUR,
      PERMISSIONS.MANAGE_BEHAVIOUR,
      PERMISSIONS.RECORD_BEHAVIOUR,
    ],
    // children: [
    //   {
    //     title: 'All Records',
    //     href: '/behaviour-records',
    //     permissions: [PERMISSIONS.VIEW_BEHAVIOUR, PERMISSIONS.MANAGE_BEHAVIOUR],
    //   },
    //   {
    //     title: 'Pending Adjustments',
    //     href: '/behaviour-records/pending-adjustments',
    //     permissions: [
    //       PERMISSIONS.ADJUST_SENTENCE,
    //       PERMISSIONS.MANAGE_BEHAVIOUR,
    //     ],
    //   },
    // ],
  },
  {
    title: 'Visitors',
    icon: UserCheck,
    href: '/visitors',
    permissions: [PERMISSIONS.VIEW_VISITORS, PERMISSIONS.MANAGE_VISITORS],
  },
  {
    title: 'Visits',
    icon: CalendarCheck,
    href: '/visits',
    permissions: [
      PERMISSIONS.VIEW_VISITORS,
      PERMISSIONS.MANAGE_VISITORS,
      PERMISSIONS.SCHEDULE_VISIT,
    ],
    // `children: [
    //   // {
    //   //   title: 'All Visits',
    //   //   href: '/visits',
    //   //   permissions: [PERMISSIONS.VIEW_VISITORS, PERMISSIONS.MANAGE_VISITORS],
    //   // },
    //   // {
    //   //   title: 'Schedule Visit',
    //   //   href: '/visits/schedule',
    //   //   permissions: [PERMISSIONS.SCHEDULE_VISIT, PERMISSIONS.MANAGE_VISITORS],
    //   // },
    //   // {
    //   //   title: 'Upcoming Visits',
    //   //   href: '/visits/upcoming',
    //   //   permissions: [PERMISSIONS.VIEW_VISITORS, PERMISSIONS.MANAGE_VISITORS],
    //   // },
    // ],`
  },
  // {
  //   title: 'Reports',
  //   icon: BarChart3,
  //   href: '/reports',
  //   permissions: [PERMISSIONS.VIEW_REPORTS, PERMISSIONS.GENERATE_REPORTS],
  // },
  // {
  //   title: 'Settings',
  //   icon: Settings,
  //   href: '/settings',
  // },
];

/**
 * Filter navigation items based on user permissions
 */
export const filterNavigationByPermissions = (items, user) => {
  if (!user) return [];

  return items
    .map((item) => {
      // Check if user has required permissions
      const hasPermission =
        !item.permissions ||
        item.permissions.some((permission) =>
          user.permissions?.includes(permission)
        );

      // Check if user has required roles
      const hasRole =
        !item.roles || item.roles.includes(user.role?.roleName);

      // If item doesn't pass checks, exclude it
      if (!hasPermission || !hasRole) {
        return null;
      }

      // If item has children, filter them recursively
      if (item.children) {
        const filteredChildren = filterNavigationByPermissions(
          item.children,
          user
        );

        // If no children pass the filter, exclude parent
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          children: filteredChildren,
        };
      }

      return item;
    })
    .filter(Boolean);
};
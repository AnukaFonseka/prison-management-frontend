'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import { Fragment } from 'react';

// Map route segments to readable labels
const segmentLabels = {
  dashboard: 'Dashboard',
  prisons: 'Prisons',
  users: 'Users',
  prisoners: 'Prisoners',
  'work-records': 'Work Records',
  'behaviour-records': 'Behaviour Records',
  visitors: 'Visitors',
  visits: 'Visits',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  security: 'Security',
  new: 'New',
  edit: 'Edit',
  schedule: 'Schedule',
  upcoming: 'Upcoming',
  'pending-payments': 'Pending Payments',
  'pending-adjustments': 'Pending Adjustments',
  history: 'History',
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on dashboard home
  if (pathname === '/dashboard') {
    return null;
  }

  // Split pathname into segments
  const segments = pathname.split('/').filter(Boolean);

  // Generate breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;

    // Skip numeric IDs in breadcrumb display
    const isNumeric = /^\d+$/.test(segment);
    if (isNumeric && !isLast) {
      return null;
    }

    // Get label from map or format segment
    let label = segmentLabels[segment] || segment;

    // If it's a numeric ID, show "Details" or "View"
    if (isNumeric) {
      label = 'Details';
    } else {
      // Format multi-word segments
      label =
        label.charAt(0).toUpperCase() +
        label
          .slice(1)
          .replace(/-/g, ' ');
    }

    return {
      href,
      label,
      isLast,
    };
  }).filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.map((item, index) => (
          <Fragment key={item.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
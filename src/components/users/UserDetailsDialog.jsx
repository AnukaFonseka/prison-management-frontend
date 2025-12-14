// src/components/users/UserDetailsDialog.jsx
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Shield,
  CreditCard,
  Phone,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { getUserById } from '@/lib/api/users';

export default function UserDetailsDialog({ open, onOpenChange, userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      loadUserDetails();
    }
  }, [open, userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, badge = false, badgeVariant = 'default' }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {badge ? (
          <Badge variant={badgeVariant}>{value}</Badge>
        ) : (
          <p className="text-sm">{value || 'N/A'}</p>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information about the user account
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Separator />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              <div className="ml-auto">
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Personal Information</h4>
              <div className="space-y-1">
                <InfoRow icon={CreditCard} label="NIC" value={user.nic} />
                <InfoRow icon={User} label="Gender" value={user.gender} />
                <InfoRow
                  icon={Calendar}
                  label="Birthday"
                  value={user.birthday ? format(new Date(user.birthday), 'PPP') : 'N/A'}
                />
                <InfoRow icon={MapPin} label="Address" value={user.address} />
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Contact Information</h4>
              <div className="space-y-1">
                <InfoRow icon={Mail} label="Email" value={user.email} />
              </div>
            </div>

            <Separator />

            {/* Role & Prison */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Role & Assignment</h4>
              <div className="space-y-1">
                <InfoRow
                  icon={Shield}
                  label="Role"
                  value={user.role?.roleName}
                  badge
                  badgeVariant="outline"
                />
                {user.prison && (
                  <InfoRow
                    icon={Building2}
                    label="Assigned Prison"
                    value={user.prison.prisonName}
                  />
                )}
                {user.prison && (
                  <InfoRow
                    icon={MapPin}
                    label="Prison Location"
                    value={user.prison.location}
                  />
                )}
              </div>
            </div>

            {user.role?.permissions && user.role.permissions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.role.permissions.map((permission, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {permission.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* System Information */}
            <div>
              <h4 className="text-sm font-semibold mb-3">System Information</h4>
              <div className="space-y-1">
                <InfoRow
                  icon={Calendar}
                  label="Created At"
                  value={user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                />
                <InfoRow
                  icon={Calendar}
                  label="Last Updated"
                  value={user.updatedAt ? format(new Date(user.updatedAt), 'PPP') : 'N/A'}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">User not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
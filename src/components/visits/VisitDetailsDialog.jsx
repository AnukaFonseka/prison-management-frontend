'use client';

import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Users,
  UserCheck,
  Building2,
  CreditCard,
  Phone,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getVisitById } from '@/lib/api/visits';

const VISIT_STATUSES = {
  Scheduled: { label: 'Scheduled', color: 'bg-blue-500', icon: Clock },
  Completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle2 },
  Cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
  NoShow: { label: 'No Show', color: 'bg-gray-500', icon: AlertCircle },
};

export default function VisitDetailsDialog({ open, onOpenChange, visitId }) {
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && visitId) {
      loadVisit();
    }
  }, [open, visitId]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      const response = await getVisitById(visitId);
      setVisit(response.data);
    } catch (error) {
      console.error('Failed to load visit:', error);
      toast.error('Failed to load visit details');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status) => {
    const statusConfig = VISIT_STATUSES[status] || VISIT_STATUSES.Scheduled;
    const Icon = statusConfig.icon;
    
    return (
      <Badge variant="outline" className={`${statusConfig.color} text-white border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Visit Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this visit
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : visit ? (
          <div className="space-y-6">
            {/* Status and Visit Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Visit Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Visit ID: #{visit.visitId}
                  </p>
                </div>
                {getStatusBadge(visit.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Visit Date:</span>
                  </div>
                  <p className="text-sm ml-6">{formatDate(visit.visitDate)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Time Slot:</span>
                  </div>
                  <p className="text-sm ml-6">
                    {formatTime(visit.visitTimeStart)} - {formatTime(visit.visitTimeEnd)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Prisoner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Prisoner Information
              </h3>
              
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {getInitials(visit.prisoner.fullName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-lg">{visit.prisoner.fullName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Case Number: {visit.prisoner.caseNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>NIC: {visit.prisoner.nic}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{visit.prisoner.prison.prisonName}</span>
                    </div>
                  </div>

                  {visit.prisoner.prison.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{visit.prisoner.prison.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Visitor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Visitor Information
              </h3>
              
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {getInitials(visit.visitor.visitorName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-lg">{visit.visitor.visitorName}</h4>
                    <Badge variant="secondary" className="mt-1">
                      {visit.relationship}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>NIC: {visit.visitor.nic}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{visit.visitor.mobileNumber}</span>
                    </div>
                  </div>

                  {visit.visitor.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{visit.visitor.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Purpose and Notes */}
            {(visit.purpose || visit.notes) && (
              <>
                <Separator />
                <div className="space-y-4">
                  {visit.purpose && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Purpose
                      </div>
                      <p className="text-sm ml-6 p-3 bg-muted rounded-md">
                        {visit.purpose}
                      </p>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Notes
                      </div>
                      <p className="text-sm ml-6 p-3 bg-muted rounded-md whitespace-pre-wrap">
                        {visit.notes}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Approval Info */}
            {visit.approvedBy && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Approved By
                  </div>
                  <p className="text-sm ml-6">{visit.approvedBy.fullName}</p>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {formatDate(visit.createdAt)}
              </div>
              {visit.updatedAt && visit.updatedAt !== visit.createdAt && (
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {formatDate(visit.updatedAt)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No visit details available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
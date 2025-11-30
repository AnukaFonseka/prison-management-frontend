// src/components/prisons/PrisonDetailsDialog.jsx
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Shield,
  User,
  TrendingUp,
} from 'lucide-react';
import { getPrisonById, getPrisonStatistics } from '@/lib/api/prisons';
import { toast } from 'sonner';

export default function PrisonDetailsDialog({ open, onOpenChange, prisonId }) {
  const [prison, setPrison] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && prisonId) {
      loadPrisonDetails();
    }
  }, [open, prisonId]);

  const loadPrisonDetails = async () => {
    try {
      setLoading(true);
      const [prisonData, statsData] = await Promise.all([
        getPrisonById(prisonId),
        getPrisonStatistics(prisonId),
      ]);
      setPrison(prisonData.data);
      setStatistics(statsData.data);
    } catch (error) {
      toast.error('Failed to load prison details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Prison Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about the prison facility
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : prison ? (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="staff">Staff & Prisoners</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{prison.prisonName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{prison.location}</span>
                    </div>
                  </div>
                  <Badge variant={prison.isActive ? 'default' : 'secondary'}>
                    {prison.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{prison.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Superintendent</p>
                      <p className="text-sm text-muted-foreground">
                        {prison.superintendentName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Contact Number</p>
                      <p className="text-sm text-muted-foreground">
                        {prison.contactNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{prison.email}</p>
                    </div>
                  </div>

                  {prison.establishedDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Established Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(prison.establishedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              {statistics && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Capacity Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Total Capacity
                          </span>
                          <span className="text-2xl font-bold">
                            {statistics.capacity}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Current Occupancy
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            {statistics.currentOccupancy}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Available Space
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            {statistics.availableSpace}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Occupancy Rate</span>
                          <Badge variant="outline" className="text-base">
                            {statistics.occupancyRate}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Staff Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Total Staff
                          </span>
                          <span className="text-2xl font-bold">
                            {statistics.totalStaff}
                          </span>
                        </div>
                        <Separator />
                        {statistics.staff.map((staffGroup) => (
                          <div 
                            key={staffGroup.role} 
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-muted-foreground">
                              {staffGroup.role}
                            </span>
                            <Badge variant="secondary">{staffGroup.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Prisoner Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {statistics.prisoners.map((prisonerGroup) => (
                          <div 
                            key={prisonerGroup.status}
                            className="flex flex-col gap-1 rounded-lg border p-3"
                          >
                            <span className="text-sm text-muted-foreground">
                              {prisonerGroup.status}
                            </span>
                            <span className="text-2xl font-bold">
                              {prisonerGroup.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Members ({prison.staff?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {prison.staff && prison.staff.length > 0 ? (
                    <div className="space-y-2">
                      {prison.staff.map((staff) => (
                        <div 
                          key={staff.userId}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">{staff.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {staff.email}
                            </p>
                          </div>
                          <Badge variant="secondary">{staff.role}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No staff members assigned
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Active Prisoners ({prison.prisoners?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {prison.prisoners && prison.prisoners.length > 0 ? (
                    <div className="space-y-2">
                      {prison.prisoners.slice(0, 10).map((prisoner) => (
                        <div 
                          key={prisoner.prisonerId}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">{prisoner.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {prisoner.prisonerId}
                            </p>
                          </div>
                          <Badge variant="outline">{prisoner.status}</Badge>
                        </div>
                      ))}
                      {prison.prisoners.length > 10 && (
                        <p className="text-sm text-center text-muted-foreground pt-2">
                          And {prison.prisoners.length - 10} more prisoners...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No active prisoners
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Prison not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
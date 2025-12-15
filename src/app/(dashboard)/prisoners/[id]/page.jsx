// src/app/(dashboard)/prisoners/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Calendar,
  MapPin,
  Building2,
  Phone,
  Home,
  Shield,
  Users,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Download,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { getPrisonerById, deletePrisoner } from '@/lib/api/prisoners';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ViewPrisonerPage() {
  const router = useRouter();
  const params = useParams();
  const prisonerId = params.id;
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [loading, setLoading] = useState(true);
  const [prisoner, setPrisoner] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_PRISONERS)) {
      toast.error('You do not have permission to view prisoners');
      router.push('/prisoners');
      return;
    }

    loadPrisoner();
  }, [prisonerId]);

  const loadPrisoner = async () => {
    try {
      setLoading(true);
      const response = await getPrisonerById(prisonerId);
      setPrisoner(response.data);
    } catch (error) {
      toast.error('Failed to load prisoner data');
      console.error(error);
      router.push('/prisoners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePrisoner(prisonerId);
      toast.success('Prisoner deleted successfully');
      router.push('/prisoners');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete prisoner');
    }
  };

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (fullName) => {
    const names = fullName.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Released':
        return 'secondary';
      case 'Transferred':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const canManage = hasPermission(PERMISSIONS.MANAGE_PRISONERS);
  const profilePhoto = prisoner?.photos?.find(p => p.photoType === 'Profile');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!prisoner) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Prisoner not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/prisoners')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prisoner Details</h1>
            <p className="text-muted-foreground">
              Complete information about the prisoner
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/prisoners/${prisonerId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={profilePhoto ? `http://localhost:5000${profilePhoto.photoUrl}` : undefined}
                  alt={prisoner.fullName} 
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(prisoner.fullName)}
                </AvatarFallback>
              </Avatar>
              <Badge variant={getStatusColor(prisoner.status)} className="text-sm">
                {prisoner.status}
              </Badge>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{prisoner.fullName}</h2>
                <p className="text-muted-foreground">{prisoner.caseNumber}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NIC Number</p>
                    <p className="font-medium">{prisoner.nic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium">{prisoner.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium">
                      {calculateAge(prisoner.birthday)} years
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="font-medium">{prisoner.nationality}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prison</p>
                    <p className="font-medium">{prisoner.prison?.prisonName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cell Number</p>
                    <p className="font-medium">{prisoner.cellNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photos">
            Photos ({prisoner.photos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="marks">
            Body Marks ({prisoner.bodyMarks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="family">
            Family ({prisoner.familyDetails?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Admission Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Date of Birth</Label>
                  <p className="text-sm font-medium mt-1">{formatDate(prisoner.birthday)}</p>
                </div>
                <div>
                  <Label>Case Number</Label>
                  <p className="text-sm font-medium mt-1">{prisoner.caseNumber}</p>
                </div>
                <div>
                  <Label>Admission Date</Label>
                  <p className="text-sm font-medium mt-1">{formatDate(prisoner.admissionDate)}</p>
                </div>
                <div>
                  <Label>Expected Release Date</Label>
                  <p className="text-sm font-medium mt-1">{formatDate(prisoner.expectedReleaseDate)}</p>
                </div>
                {prisoner.actualReleaseDate && (
                  <div>
                    <Label>Actual Release Date</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(prisoner.actualReleaseDate)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Prison Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Prison Name</Label>
                  <p className="text-sm font-medium mt-1">{prisoner.prison?.prisonName}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-sm font-medium mt-1">{prisoner.prison?.location}</p>
                </div>
                <div>
                  <Label>Address</Label>
                  <p className="text-sm font-medium mt-1">{prisoner.prison?.address}</p>
                </div>
                <div>
                  <Label>Cell Number</Label>
                  <p className="text-sm font-medium mt-1">{prisoner.cellNumber || 'Not Assigned'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Social Status</Label>
                <p className="text-sm mt-1">{prisoner.socialStatus || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Prisoner Photos
              </CardTitle>
              <CardDescription>
                All photos associated with this prisoner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prisoner.photos && prisoner.photos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {prisoner.photos.map((photo) => (
                    <Card key={photo.photoId}>
                      <CardContent className="p-4">
                        <img
                          src={`http://localhost:5000${photo.photoUrl}`}
                          alt={photo.photoType}
                          className="w-full h-64 object-cover rounded-lg mb-3"
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{photo.photoType}</Badge>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Uploaded: {formatDate(photo.uploadDate)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No photos available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Marks Tab */}
        <TabsContent value="marks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Identifying Body Marks
              </CardTitle>
              <CardDescription>
                Physical identification marks and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prisoner.bodyMarks && prisoner.bodyMarks.length > 0 ? (
                <div className="space-y-3">
                  {prisoner.bodyMarks.map((mark) => (
                    <Card key={mark.markId}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Shield className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{mark.location}</Badge>
                            </div>
                            <p className="text-sm">{mark.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No body marks recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Members & Contacts
              </CardTitle>
              <CardDescription>
                Family members and emergency contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prisoner.familyDetails && prisoner.familyDetails.length > 0 ? (
                <div className="space-y-3">
                  {prisoner.familyDetails.map((member) => (
                    <Card key={member.familyId}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{member.memberName}</h4>
                              <Badge variant="outline">{member.relationship}</Badge>
                              {member.emergencyContact && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Emergency Contact
                                </Badge>
                              )}
                            </div>
                            <div className="grid gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">NIC:</span>
                                <span>{member.nic}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Phone:</span>
                                <span>{member.contactNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Address:</span>
                                <span>{member.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No family members recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {formatDate(prisoner.createdAt)}</p>
            <p>Last Updated: {formatDate(prisoner.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prisoner Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{prisoner.fullName}</strong>? 
              This action cannot be undone and will remove all associated data including photos, 
              body marks, and family member information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Label({ children }) {
  return <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{children}</p>;
}
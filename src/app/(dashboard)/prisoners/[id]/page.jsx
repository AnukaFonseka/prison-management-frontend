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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Briefcase,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { getPrisonerById, deletePrisoner } from '@/lib/api/prisoners';
import apiClient from '@/lib/api/client';
import { generatePrisonerReport } from '@/lib/reports/prisonerReport';
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
  const [workRecords, setWorkRecords] = useState([]);
  const [workSummary, setWorkSummary] = useState(null);
  const [behaviorRecords, setBehaviorRecords] = useState([]);
  const [behaviorSummary, setBehaviorSummary] = useState(null);
  const [visits, setVisits] = useState([]);
  const [visitsSummary, setVisitsSummary] = useState(null);
  const [loadingWork, setLoadingWork] = useState(false);
  const [loadingBehavior, setLoadingBehavior] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const canViewWork = hasPermission(PERMISSIONS.VIEW_WORK_RECORDS);
  const canViewBehavior = hasPermission(PERMISSIONS.VIEW_BEHAVIOUR);
  const canViewVisits = hasPermission(PERMISSIONS.VIEW_VISITORS);
  const canGenerateReports = hasPermission(PERMISSIONS.GENERATE_REPORTS);

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
      
      // Load work and behavior records if user has permission
      if (canViewWork) {
        loadWorkRecords();
      }
      if (canViewBehavior) {
        loadBehaviorRecords();
      }
      if (canViewVisits) {
        loadVisits();
      }
    } catch (error) {
      toast.error('Failed to load prisoner data');
      console.error(error);
      router.push('/prisoners');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkRecords = async () => {
    try {
      setLoadingWork(true);
      const response = await apiClient.get(`/work-records/prisoner/${prisonerId}?page=1&limit=100`);
      setWorkRecords(response.data.data || []);
      setWorkSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to load work records:', error);
    } finally {
      setLoadingWork(false);
    }
  };

  const loadBehaviorRecords = async () => {
    try {
      setLoadingBehavior(true);
      const response = await apiClient.get(`/behaviour-records/prisoner/${prisonerId}?page=1&limit=100`);
      setBehaviorRecords(response.data.data || []);
      setBehaviorSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to load behavior records:', error);
    } finally {
      setLoadingBehavior(false);
    }
  };

  const loadVisits = async () => {
    try {
      setLoadingVisits(true);
      const response = await apiClient.get(`/visits/prisoner/${prisonerId}?page=1&limit=100`);
      setVisits(response.data.data || []);
      setVisitsSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to load visits:', error);
    } finally {
      setLoadingVisits(false);
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

  const handlePrintReport = async () => {
    if (!prisoner) return;

    try {
      setGeneratingReport(true);
      toast.info('Generating report...');

      // Generate the report with all available data
      const fileName = generatePrisonerReport(prisoner, {
        workRecords: canViewWork ? workRecords : [],
        workSummary: canViewWork ? workSummary : null,
        behaviorRecords: canViewBehavior ? behaviorRecords : [],
        behaviorSummary: canViewBehavior ? behaviorSummary : null,
        visits: canViewVisits ? visits : [],
        visitsSummary: canViewVisits ? visitsSummary : null,
        generatedBy: user,
      });

      toast.success(`Report generated successfully: ${fileName}`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Handle time in HH:MM:SS format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount).replace('LKR', 'Rs.');
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

  const getVisitStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'default';
      case 'Completed':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getBehaviorTypeColor = (type) => {
    return type === 'Positive' ? 'default' : 'destructive';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Minor':
        return 'secondary';
      case 'Moderate':
        return 'default';
      case 'Severe':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getAdjustmentStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
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
          {canGenerateReports && (<Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintReport}
            disabled={generatingReport}
          >
            <Printer className="mr-2 h-4 w-4" />
            {generatingReport ? 'Generating...' : 'Print Report'}
          </Button>)}
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
              {/* <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button> */}
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
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="marks">Body Marks</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          {canViewWork && <TabsTrigger value="work">Work Records</TabsTrigger>}
          {canViewBehavior && <TabsTrigger value="behavior">Behavior Records</TabsTrigger>}
          {canViewVisits && <TabsTrigger value="visits">Visits</TabsTrigger>}
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prisoner.bodyMarks.map((mark) => (
                        <TableRow key={mark.markId}>
                          <TableCell className="font-medium">
                            <Badge variant="outline">{mark.location}</Badge>
                          </TableCell>
                          <TableCell>{mark.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>NIC</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Emergency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prisoner.familyDetails.map((member) => (
                        <TableRow key={member.familyId}>
                          <TableCell className="font-medium">{member.memberName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.relationship}</Badge>
                          </TableCell>
                          <TableCell>{member.nic}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {member.contactNumber}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{member.address}</TableCell>
                          <TableCell>
                            {member.emergencyContact && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Yes
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

        {/* Work Records Tab */}
        {canViewWork && (
          <TabsContent value="work">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work Records
                    </CardTitle>
                    <CardDescription>
                      Work assignments and payment history
                    </CardDescription>
                  </div>
                  {workSummary && (
                    <div className="flex gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Total Hours</p>
                        <p className="font-semibold">{workSummary.totalHours}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Total Earned</p>
                        <p className="font-semibold">{formatCurrency(workSummary.totalEarned)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-semibold text-orange-600">{formatCurrency(workSummary.totalPending)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingWork ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : workRecords.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Task Description</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Payment Status</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Recorded By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workRecords.map((record) => (
                          <TableRow key={record.workRecordId}>
                            <TableCell className="font-medium">
                              {formatDate(record.workDate)}
                            </TableCell>
                            <TableCell>{record.taskDescription}</TableCell>
                            <TableCell className="text-right">{record.hoursWorked}h</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(record.paymentAmount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={record.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                                {record.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {record.paymentDate ? formatDate(record.paymentDate) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {record.recordedBy?.fullName}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No work records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Behavior Records Tab */}
        {canViewBehavior && (
          <TabsContent value="behavior">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Behavior Records
                    </CardTitle>
                    <CardDescription>
                      Behavioral incidents and sentence adjustments
                    </CardDescription>
                  </div>
                  {behaviorSummary && (
                    <div className="flex gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Total Records</p>
                        <p className="font-semibold">{behaviorSummary.totalRecords}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Positive</p>
                        <p className="font-semibold text-green-600">{behaviorSummary.positiveCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Negative</p>
                        <p className="font-semibold text-red-600">{behaviorSummary.negativeCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Net Adjustment</p>
                        <p className={`font-semibold ${behaviorSummary.approvedAdjustment < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {behaviorSummary.approvedAdjustment} days
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingBehavior ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : behaviorRecords.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Action Taken</TableHead>
                          <TableHead className="text-right">Adjustment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Recorded By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {behaviorRecords.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {formatDate(record.incidentDate)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getBehaviorTypeColor(record.behaviourType)}>
                                {record.behaviourType === 'Positive' ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {record.behaviourType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getSeverityColor(record.severityLevel)}>
                                {record.severityLevel}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate">{record.description}</p>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate">{record.actionTaken}</p>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              record.sentenceAdjustmentDays < 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {record.sentenceAdjustmentDays > 0 ? '+' : ''}
                              {record.sentenceAdjustmentDays} days
                            </TableCell>
                            <TableCell>
                              <Badge variant={getAdjustmentStatusColor(record.adjustmentStatus)}>
                                {record.adjustmentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {record.recordedBy?.fullName}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No behavior records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Visits Tab */}
        {canViewVisits && (
          <TabsContent value="visits">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Visit History
                    </CardTitle>
                    <CardDescription>
                      All visits scheduled and completed for this prisoner
                    </CardDescription>
                  </div>
                  {visitsSummary && (
                    <div className="flex gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Scheduled</p>
                        <p className="font-semibold text-blue-600">{visitsSummary.scheduled}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-semibold text-green-600">{visitsSummary.completed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Cancelled</p>
                        <p className="font-semibold text-red-600">{visitsSummary.cancelled}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingVisits ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : visits.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Visit Date</TableHead>
                          <TableHead>Visitor</TableHead>
                          <TableHead>Relationship</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Time Slot</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Approved By</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.map((visit) => (
                          <TableRow key={visit.visitId}>
                            <TableCell className="font-medium">
                              {formatDate(visit.visitDate)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{visit.visitor.visitorName}</p>
                                <p className="text-xs text-muted-foreground">{visit.visitor.nic}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{visit.relationship}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {visit.visitor.mobileNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {formatTime(visit.visitTimeStart)} - {formatTime(visit.visitTimeEnd)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate">{visit.purpose}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getVisitStatusColor(visit.status)}>
                                {visit.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {visit.approvedBy?.fullName || 'N/A'}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate text-sm text-muted-foreground">
                                {visit.notes || 'No notes'}
                              </p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No visits recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
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
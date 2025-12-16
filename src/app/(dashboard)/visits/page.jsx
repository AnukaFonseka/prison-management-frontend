'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CalendarCheck,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Users,
  Building2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { getAllVisits, deleteVisit, updateVisitStatus } from '@/lib/api/visits';
import VisitFormDialog from '@/components/visits/VisitFormDialog';
import VisitDetailsDialog from '@/components/visits/VisitDetailsDialog';

const VISIT_STATUSES = {
  Scheduled: { label: 'Scheduled', color: 'bg-blue-500', icon: Clock },
  Completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle2 },
  Cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
  NoShow: { label: 'No Show', color: 'bg-gray-500', icon: AlertCircle },
};

export default function VisitsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisits, setTotalVisits] = useState(0);
  const itemsPerPage = 10;

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editVisitId, setEditVisitId] = useState(null);
  const [detailsVisitId, setDetailsVisitId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadVisits();
  }, [currentPage, searchTerm, statusFilter]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (user?.prisonId) params.prison_id = user.prisonId;

      const response = await getAllVisits(params);
      setVisits(response.data);
      setTotalPages(response.pagination.pages);
      setTotalVisits(response.pagination.total);

      // Calculate statistics
      calculateStats(response.data);
    } catch (error) {
      toast.error('Failed to load visits');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (visitsData) => {
    const stats = {
      total: visitsData.length,
      scheduled: visitsData.filter(v => v.status === 'Scheduled').length,
      completed: visitsData.filter(v => v.status === 'Completed').length,
      cancelled: visitsData.filter(v => v.status === 'Cancelled').length,
    };
    setStats(stats);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDeleteVisit = async () => {
    try {
      await deleteVisit(selectedVisit.visitId);
      toast.success('Visit deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedVisit(null);
      loadVisits();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete visit');
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateVisitStatus(selectedVisit.visitId, newStatus);
      toast.success('Visit status updated successfully');
      setIsStatusDialogOpen(false);
      setSelectedVisit(null);
      setNewStatus('');
      loadVisits();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openDeleteDialog = (visit) => {
    setSelectedVisit(visit);
    setIsDeleteDialogOpen(true);
  };

  const openStatusDialog = (visit, status) => {
    setSelectedVisit(visit);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  const openFormDialog = (visitId = null) => {
    setEditVisitId(visitId);
    setIsFormDialogOpen(true);
  };

  const openDetailsDialog = (visitId) => {
    setDetailsVisitId(visitId);
    setIsDetailsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadVisits();
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const canManageVisits = hasPermission(PERMISSIONS.MANAGE_VISITORS);
  const canScheduleVisit = hasPermission(PERMISSIONS.SCHEDULE_VISIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-8 w-8" />
            Visits Management
          </h1>
          <p className="text-muted-foreground">
            Schedule and manage prisoner visits
          </p>
        </div>
        {canScheduleVisit && (
          <Button onClick={() => openFormDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Visit
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled visits</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Visits</CardTitle>
              <CardDescription>
                View and manage visit schedules
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prisoner, visitor, or case number..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="NoShow">No Show</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : visits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CalendarCheck className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all'
                            ? 'No visits found matching your filters'
                            : 'No visits scheduled yet'}
                        </p>
                        {canScheduleVisit && !searchTerm && statusFilter === 'all' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFormDialog()}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule First Visit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  visits.map((visit) => (
                    <TableRow key={visit.visitId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(visit.prisoner.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{visit.prisoner.fullName}</div>
                            <div className="text-xs text-muted-foreground">
                              {visit.prisoner.caseNumber}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {visit.prisoner.prison.prisonName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(visit.visitor.visitorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{visit.visitor.visitorName}</div>
                            <div className="text-xs text-muted-foreground">
                              {visit.visitor.mobileNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{visit.relationship}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(visit.visitDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatTime(visit.visitTimeStart)} - {formatTime(visit.visitTimeEnd)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(visit.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                          {visit.purpose || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDetailsDialog(visit.visitId)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canManageVisits && visit.status === 'Scheduled' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openFormDialog(visit.visitId)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openStatusDialog(visit, 'Completed')}
                                  className="text-green-600"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openStatusDialog(visit, 'Cancelled')}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Visit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openStatusDialog(visit, 'NoShow')}
                                  className="text-gray-600"
                                >
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  Mark No Show
                                </DropdownMenuItem>
                              </>
                            )}
                            {canManageVisits && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(visit)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({totalVisits} total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Visit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this visit for{' '}
              <strong>{selectedVisit?.prisoner.fullName}</strong> with{' '}
              <strong>{selectedVisit?.visitor.visitorName}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVisit} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Visit Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this visit as{' '}
              <strong>{VISIT_STATUSES[newStatus]?.label}</strong>?
              {newStatus === 'Cancelled' && ' This will cancel the scheduled visit.'}
              {newStatus === 'Completed' && ' This will mark the visit as successfully completed.'}
              {newStatus === 'NoShow' && ' This will record that the visitor did not show up.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Visit Form Dialog */}
      <VisitFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        visitId={editVisitId}
        onSuccess={handleFormSuccess}
      />

      {/* Visit Details Dialog */}
      <VisitDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        visitId={detailsVisitId}
      />
    </div>
  );
}
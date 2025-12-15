// src/app/(dashboard)/work-records/page.jsx
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  User,
  CalendarRange,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { getAllWorkRecords, deleteWorkRecord, approvePayment } from '@/lib/api/work-records';
import { getAllPrisons } from '@/lib/api/prisons';
import { getAllPrisoners } from '@/lib/api/prisoners';
import WorkRecordFormDialog from '@/components/work-records/WorkRecordFormDialog';

export default function WorkRecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();
  
  const [workRecords, setWorkRecords] = useState([]);
  const [prisons, setPrisons] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [selectedPrison, setSelectedPrison] = useState('all');
  const [selectedPrisoner, setSelectedPrisoner] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editRecordId, setEditRecordId] = useState(null);

  useEffect(() => {
    loadPrisons();
    loadPrisoners();
  }, []);

  useEffect(() => {
    loadWorkRecords();
  }, [
    currentPage,
    searchTerm,
    selectedPrison,
    selectedPrisoner,
    selectedPaymentStatus,
    startDate,
    endDate,
  ]);

  const loadPrisons = async () => {
    try {
      const response = await getAllPrisons();
      setPrisons(response.data);
    } catch (error) {
      console.error('Failed to load prisons:', error);
    }
  };

  const loadPrisoners = async () => {
    try {
      const response = await getAllPrisoners({ limit: 1000 });
      setPrisoners(response.data);
    } catch (error) {
      console.error('Failed to load prisoners:', error);
    }
  };

  const loadWorkRecords = async () => {
    try {
      setLoading(true);
      const response = await getAllWorkRecords({
        search: searchTerm || null,
        prison_id: selectedPrison === 'all' ? null : selectedPrison,
        prisoner_id: selectedPrisoner === 'all' ? null : selectedPrisoner,
        payment_status: selectedPaymentStatus === 'all' ? null : selectedPaymentStatus,
        start_date: startDate || null,
        end_date: endDate || null,
        page: currentPage,
        limit: itemsPerPage,
      });
      setWorkRecords(response.data);
      setTotalPages(response.pagination.pages);
      setTotalRecords(response.pagination.total);
    } catch (error) {
      toast.error('Failed to load work records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedPrison('all');
    setSelectedPrisoner('all');
    setSelectedPaymentStatus('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedPrison !== 'all' ||
    selectedPrisoner !== 'all' ||
    selectedPaymentStatus !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    searchTerm !== '';

  const handleDeleteRecord = async () => {
    try {
      await deleteWorkRecord(selectedRecord.workRecordId);
      toast.success('Work record deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      loadWorkRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete work record');
    }
  };

  const handleApprovePayment = async () => {
    try {
      await approvePayment(selectedRecord.workRecordId);
      toast.success('Payment approved successfully');
      setIsApproveDialogOpen(false);
      setSelectedRecord(null);
      loadWorkRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const openDeleteDialog = (record) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const openApproveDialog = (record) => {
    setSelectedRecord(record);
    setIsApproveDialogOpen(true);
  };

  const openFormDialog = (recordId = null) => {
    setEditRecordId(recordId);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadWorkRecords();
  };

  const getInitials = (fullName) => {
    const names = fullName.split(' ');
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

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getPaymentStatusColor = (status) => {
    return status === 'Paid' ? 'default' : 'secondary';
  };

  const canManageWorkRecords = hasPermission(PERMISSIONS.MANAGE_WORK_RECORDS);
  const canRecordWork = hasPermission(PERMISSIONS.RECORD_WORK);
  const canApprovePayment = hasPermission(PERMISSIONS.APPROVE_PAYMENT);
  const canViewWorkRecords = hasPermission(PERMISSIONS.VIEW_WORK_RECORDS);

  // Calculate statistics
  const pendingPayments = workRecords.filter((r) => r.paymentStatus === 'Pending').length;
  const totalHours = workRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  const totalAmount = workRecords.reduce((sum, r) => sum + parseFloat(r.paymentAmount), 0);
  const paidAmount = workRecords
    .filter((r) => r.paymentStatus === 'Paid')
    .reduce((sum, r) => sum + parseFloat(r.paymentAmount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            Work Records
          </h1>
          <p className="text-muted-foreground">
            Manage prisoner work assignments and payments
          </p>
        </div>
        {(canManageWorkRecords || canRecordWork) && (
          <Button onClick={() => openFormDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Work Record
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">Work assignments recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">Hours worked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paidAmount)} paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Work Records</CardTitle>
              <CardDescription>
                View and manage all work assignments and payments
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prisoner name, NIC, or task..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-5 mb-4 p-4 border rounded-lg bg-muted/50">
              {isSuperAdmin() && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Prison</label>
                  <Select
                    value={selectedPrison}
                    onValueChange={(value) => {
                      setSelectedPrison(value);
                      handleFilterChange();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Prisons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prisons</SelectItem>
                      {prisons.map((prison) => (
                        <SelectItem key={prison.prisonId} value={prison.prisonId.toString()}>
                          {prison.prisonName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Prisoner</label>
                <Select
                  value={selectedPrisoner}
                  onValueChange={(value) => {
                    setSelectedPrisoner(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Prisoners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prisoners</SelectItem>
                    {prisoners.map((prisoner) => (
                      <SelectItem
                        key={prisoner.prisonerId}
                        value={prisoner.prisonerId.toString()}
                      >
                        {prisoner.fullName} ({prisoner.nic})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Status</label>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={(value) => {
                    setSelectedPaymentStatus(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Task Description</TableHead>
                  <TableHead>Work Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : workRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || hasActiveFilters
                            ? 'No work records found matching your criteria'
                            : 'No work records yet'}
                        </p>
                        {(canManageWorkRecords || canRecordWork) &&
                          !searchTerm &&
                          !hasActiveFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push('/work-records/add')}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add First Record
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  workRecords.map((record) => (
                    <TableRow key={record.workRecordId}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage
                            src={
                              record.prisoner?.profilePhoto
                                ? `http://localhost:5000${record.prisoner.profilePhoto}`
                                : undefined
                            }
                            alt={record.prisoner?.fullName}
                          />
                          <AvatarFallback>
                            {getInitials(record.prisoner?.fullName || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{record.prisoner?.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {record.prisoner?.nic}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {record.prisoner?.prison?.prisonName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{record.taskDescription}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(record.workDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {record.hoursWorked}h
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">
                          {formatCurrency(record.paymentAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusColor(record.paymentStatus)}>
                          {record.paymentStatus === 'Paid' ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {record.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {record.paymentDate ? formatDate(record.paymentDate) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {record.recordedBy?.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{record.recordedBy?.username}
                          </div>
                        </div>
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
                            {canApprovePayment && record.paymentStatus === 'Pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openApproveDialog(record)}
                                  className="text-green-600"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve Payment
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {canManageWorkRecords && record.paymentStatus === 'Pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openFormDialog(record.workRecordId)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(record)}
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
                Page {currentPage} of {totalPages} ({totalRecords} total)
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
            <AlertDialogTitle>Delete Work Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Payment Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve payment of{' '}
              <strong>{formatCurrency(selectedRecord?.paymentAmount || 0)}</strong> for{' '}
              <strong>{selectedRecord?.prisoner?.fullName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprovePayment} className="bg-green-600">
              Approve Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Work Record Form Dialog */}
      <WorkRecordFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        recordId={editRecordId}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
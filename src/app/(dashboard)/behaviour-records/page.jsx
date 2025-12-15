// src/app/(dashboard)/behaviour-records/page.jsx
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
  FileText,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  User,
  Clock,
  Shield,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import {
  getAllBehaviourRecords,
  deleteBehaviourRecord,
  adjustSentence,
} from '@/lib/api/behaviour-records';
import { getAllPrisons } from '@/lib/api/prisons';
import { getAllPrisoners } from '@/lib/api/prisoners';
import BehaviourRecordFormDialog from '@/components/behaviour-records/BehaviourRecordFormDialog';

export default function BehaviourRecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();

  const [behaviourRecords, setBehaviourRecords] = useState([]);
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
  const [selectedBehaviourType, setSelectedBehaviourType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedAdjustmentStatus, setSelectedAdjustmentStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editRecordId, setEditRecordId] = useState(null);

  useEffect(() => {
    loadPrisons();
    loadPrisoners();
  }, []);

  useEffect(() => {
    loadBehaviourRecords();
  }, [
    currentPage,
    searchTerm,
    selectedPrison,
    selectedPrisoner,
    selectedBehaviourType,
    selectedSeverity,
    selectedAdjustmentStatus,
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

  const loadBehaviourRecords = async () => {
    try {
      setLoading(true);
      const response = await getAllBehaviourRecords({
        search: searchTerm || null,
        prison_id: selectedPrison === 'all' ? null : selectedPrison,
        prisoner_id: selectedPrisoner === 'all' ? null : selectedPrisoner,
        behaviour_type: selectedBehaviourType === 'all' ? null : selectedBehaviourType,
        severity_level: selectedSeverity === 'all' ? null : selectedSeverity,
        adjustment_status: selectedAdjustmentStatus === 'all' ? null : selectedAdjustmentStatus,
        start_date: startDate || null,
        end_date: endDate || null,
        page: currentPage,
        limit: itemsPerPage,
      });
      setBehaviourRecords(response.data);
      setTotalPages(response.pagination.pages);
      setTotalRecords(response.pagination.total);
    } catch (error) {
      toast.error('Failed to load behaviour records');
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
    setSelectedBehaviourType('all');
    setSelectedSeverity('all');
    setSelectedAdjustmentStatus('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedPrison !== 'all' ||
    selectedPrisoner !== 'all' ||
    selectedBehaviourType !== 'all' ||
    selectedSeverity !== 'all' ||
    selectedAdjustmentStatus !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    searchTerm !== '';

  const handleDeleteRecord = async () => {
    try {
      await deleteBehaviourRecord(selectedRecord.behaviourRecordId);
      toast.success('Behaviour record deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      loadBehaviourRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete behaviour record');
    }
  };

  const handleAdjustSentence = async () => {
    try {
      await adjustSentence(selectedRecord.behaviourRecordId);
      toast.success('Sentence adjustment applied successfully');
      setIsAdjustDialogOpen(false);
      setSelectedRecord(null);
      loadBehaviourRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust sentence');
    }
  };

  const openDeleteDialog = (record) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const openAdjustDialog = (record) => {
    setSelectedRecord(record);
    setIsAdjustDialogOpen(true);
  };

  const openFormDialog = (recordId = null) => {
    setEditRecordId(recordId);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadBehaviourRecords();
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

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'minor':
        return 'default';
      case 'moderate':
        return 'secondary';
      case 'severe':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'minor':
        return <AlertCircle className="h-3 w-3" />;
      case 'moderate':
        return <AlertTriangle className="h-3 w-3" />;
      case 'severe':
        return <Shield className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getBehaviourTypeColor = (type) => {
    return type === 'Positive' ? 'default' : 'destructive';
  };

  const getBehaviourTypeIcon = (type) => {
    return type === 'Positive' ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  const getAdjustmentStatusColor = (status) => {
    return status === 'Adjusted' ? 'default' : 'secondary';
  };

  const canManageBehaviour = hasPermission(PERMISSIONS.MANAGE_BEHAVIOUR);
  const canRecordBehaviour = hasPermission(PERMISSIONS.RECORD_BEHAVIOUR);
  const canAdjustSentence = hasPermission(PERMISSIONS.ADJUST_SENTENCE);
  const canViewBehaviour = hasPermission(PERMISSIONS.VIEW_BEHAVIOUR);

  // Calculate statistics
  const pendingAdjustments = behaviourRecords.filter(
    (r) => r.adjustmentStatus === 'Pending'
  ).length;
  const negativeRecords = behaviourRecords.filter((r) => r.behaviourType === 'Negative').length;
  const positiveRecords = behaviourRecords.filter((r) => r.behaviourType === 'Positive').length;
  const severeIncidents = behaviourRecords.filter(
    (r) => r.severityLevel?.toLowerCase() === 'severe'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Behaviour Records
          </h1>
          <p className="text-muted-foreground">
            Track and manage prisoner behaviour incidents and adjustments
          </p>
        </div>
        {(canManageBehaviour || canRecordBehaviour) && (
          <Button onClick={() => openFormDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Record Behaviour
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              {positiveRecords} positive, {negativeRecords} negative
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Adjustments</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAdjustments}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severe Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severeIncidents}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Behaviour</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positiveRecords}</div>
            <p className="text-xs text-muted-foreground">Good conduct records</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Behaviour Records</CardTitle>
              <CardDescription>
                View and manage all behaviour incidents and adjustments
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
                placeholder="Search by prisoner name, NIC, or incident..."
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
            <div className="grid gap-4 md:grid-cols-6 mb-4 p-4 border rounded-lg bg-muted/50">
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
                <label className="text-sm font-medium mb-2 block">Behaviour Type</label>
                <Select
                  value={selectedBehaviourType}
                  onValueChange={(value) => {
                    setSelectedBehaviourType(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Severity</label>
                <Select
                  value={selectedSeverity}
                  onValueChange={(value) => {
                    setSelectedSeverity(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Adjustment Status</label>
                <Select
                  value={selectedAdjustmentStatus}
                  onValueChange={(value) => {
                    setSelectedAdjustmentStatus(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Adjusted">Adjusted</SelectItem>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Status</TableHead>
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
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : behaviourRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || hasActiveFilters
                            ? 'No behaviour records found matching your criteria'
                            : 'No behaviour records yet'}
                        </p>
                        {(canManageBehaviour || canRecordBehaviour) &&
                          !searchTerm &&
                          !hasActiveFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFormDialog()}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add First Record
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  behaviourRecords.map((record) => (
                    <TableRow key={record.behaviourRecordId}>
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
                        <Badge variant={getBehaviourTypeColor(record.behaviourType)}>
                          {getBehaviourTypeIcon(record.behaviourType)}
                          <span className="ml-1">{record.behaviourType}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium truncate">{record.description}</p>
                          {record.actionTaken && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Action: {record.actionTaken}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(record.severityLevel)}>
                          {getSeverityIcon(record.severityLevel)}
                          <span className="ml-1 capitalize">{record.severityLevel}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(record.incidentDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.sentenceAdjustmentDays ? (
                          <div className="text-sm">
                            <span
                              className={
                                record.sentenceAdjustmentDays > 0
                                  ? 'text-red-600 font-semibold'
                                  : 'text-green-600 font-semibold'
                              }
                            >
                              {record.sentenceAdjustmentDays > 0 ? '+' : ''}
                              {record.sentenceAdjustmentDays} days
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No adjustment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAdjustmentStatusColor(record.adjustmentStatus)}>
                          {record.adjustmentStatus === 'Adjusted' ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {record.adjustmentStatus}
                        </Badge>
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
                            {canAdjustSentence && record.adjustmentStatus === 'Pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openAdjustDialog(record)}
                                  className="text-green-600"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Apply Adjustment
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {canManageBehaviour && record.adjustmentStatus === 'Pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openFormDialog(record.behaviourRecordId)}
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
            <AlertDialogTitle>Delete Behaviour Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this behaviour record? This action cannot be undone.
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

      {/* Adjust Sentence Dialog */}
      <AlertDialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Sentence Adjustment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to apply a sentence adjustment of{' '}
              <strong>
                {selectedRecord?.sentenceAdjustmentDays > 0 ? '+' : ''}
                {selectedRecord?.sentenceAdjustmentDays} days
              </strong>{' '}
              for <strong>{selectedRecord?.prisoner?.fullName}</strong>?
              <br />
              <br />
              This will modify their release date and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdjustSentence} className="bg-green-600">
              Apply Adjustment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Behaviour Record Form Dialog */}
      <BehaviourRecordFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        recordId={editRecordId}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
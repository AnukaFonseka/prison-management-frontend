// src/app/(dashboard)/prisoners/page.jsx
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
  Shield,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  User,
  Users2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { getAllPrisoners, deletePrisoner } from '@/lib/api/prisoners';
import { getAllPrisons } from '@/lib/api/prisons';

export default function PrisonersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [prisoners, setPrisoners] = useState([]);
  const [prisons, setPrisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrisoners, setTotalPrisoners] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [selectedPrison, setSelectedPrison] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedNationality, setSelectedNationality] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrisoner, setSelectedPrisoner] = useState(null);

  useEffect(() => {
    loadPrisons();
  }, []);

  useEffect(() => {
    loadPrisoners();
  }, [currentPage, searchTerm, selectedPrison, selectedStatus, selectedGender, selectedNationality]);

  const loadPrisons = async () => {
    try {
      const response = await getAllPrisons({ limit: 100 });
      setPrisons(response.data);
    } catch (error) {
      console.error('Failed to load prisons:', error);
    }
  };

  const loadPrisoners = async () => {
    try {
      setLoading(true);
      const response = await getAllPrisoners({
        search: searchTerm || null,
        prison_id: selectedPrison === 'all' ? null : selectedPrison,
        status: selectedStatus === 'all' ? null : selectedStatus,
        gender: selectedGender === 'all' ? null : selectedGender,
        nationality: selectedNationality === 'all' ? null : selectedNationality,
        page: currentPage,
        limit: itemsPerPage,
      });
      setPrisoners(response.data);
      setTotalPages(response.pagination.pages);
      setTotalPrisoners(response.pagination.total);
    } catch (error) {
      toast.error('Failed to load prisoners');
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
    setSelectedStatus('all');
    setSelectedGender('all');
    setSelectedNationality('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    selectedPrison !== 'all' || 
    selectedStatus !== 'all' || 
    selectedGender !== 'all' || 
    selectedNationality !== 'all' ||
    searchTerm !== '';

  const handleDeletePrisoner = async () => {
    try {
      await deletePrisoner(selectedPrisoner.prisonerId);
      toast.success('Prisoner record deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedPrisoner(null);
      loadPrisoners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete prisoner');
    }
  };

  const openDeleteDialog = (prisoner) => {
    setSelectedPrisoner(prisoner);
    setIsDeleteDialogOpen(true);
  };

  const getInitials = (fullName) => {
    const names = fullName.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
      month: 'short',
      day: 'numeric'
    });
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

  const canManagePrisoners = hasPermission(PERMISSIONS.MANAGE_PRISONERS);
  const canViewPrisoners = hasPermission(PERMISSIONS.VIEW_PRISONERS);

  // Calculate statistics
  const activePrisoners = prisoners.filter(p => p.status === 'Active').length;
  const malePrisoners = prisoners.filter(p => p.gender === 'Male').length;
  const femalePrisoners = prisoners.filter(p => p.gender === 'Female').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Prisoner Management
          </h1>
          <p className="text-muted-foreground">
            Manage prisoner records and information
          </p>
        </div>
        {canManagePrisoners && (
          <Button onClick={() => router.push('/prisoners/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Prisoner
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prisoners</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrisoners}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrisoners}</div>
            <p className="text-xs text-muted-foreground">
              Currently imprisoned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{malePrisoners}</div>
            <p className="text-xs text-muted-foreground">
              {totalPrisoners > 0 ? `${((malePrisoners / totalPrisoners) * 100).toFixed(0)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female</CardTitle>
            <User className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{femalePrisoners}</div>
            <p className="text-xs text-muted-foreground">
              {totalPrisoners > 0 ? `${((femalePrisoners / totalPrisoners) * 100).toFixed(0)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Prisoners</CardTitle>
              <CardDescription>
                View and manage all prisoner records in the system
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
                placeholder="Search by name, NIC, or case number..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-4 mb-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <label className="text-sm font-medium mb-2 block">Prison</label>
                <Select value={selectedPrison} onValueChange={(value) => {
                  setSelectedPrison(value);
                  handleFilterChange();
                }}>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={(value) => {
                  setSelectedStatus(value);
                  handleFilterChange();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Released">Released</SelectItem>
                    <SelectItem value="Transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Gender</label>
                <Select value={selectedGender} onValueChange={(value) => {
                  setSelectedGender(value);
                  handleFilterChange();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nationality</label>
                <Select value={selectedNationality} onValueChange={(value) => {
                  setSelectedNationality(value);
                  handleFilterChange();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Nationalities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Nationalities</SelectItem>
                    <SelectItem value="Sri Lankan">Sri Lankan</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Prisoner Details</TableHead>
                  <TableHead>NIC / Case No.</TableHead>
                  <TableHead>Age / Gender</TableHead>
                  <TableHead>Prison / Cell</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Expected Release</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : prisoners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || hasActiveFilters ? 'No prisoners found matching your criteria' : 'No prisoners registered yet'}
                        </p>
                        {canManagePrisoners && !searchTerm && !hasActiveFilters && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/prisoners/add')}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Prisoner
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  prisoners.map((prisoner) => (
                    <TableRow key={prisoner.prisonerId}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage 
                            src={prisoner.profilePhoto ? `http://localhost:5000${prisoner.profilePhoto}` : undefined} 
                            alt={prisoner.fullName} 
                          />
                          <AvatarFallback>{getInitials(prisoner.fullName)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{prisoner.fullName}</div>
                          <div className="text-xs text-muted-foreground">{prisoner.nationality}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{prisoner.nic}</div>
                          <div className="text-xs text-muted-foreground">{prisoner.caseNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{calculateAge(prisoner.birthday)} years</div>
                          <div className="text-xs text-muted-foreground">{prisoner.gender}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {prisoner.prison?.prisonName}
                          </div>
                          <div className="text-xs text-muted-foreground">Cell: {prisoner.cellNumber || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(prisoner.admissionDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(prisoner.expectedReleaseDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusColor(prisoner.status)}>
                          {prisoner.status}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => toast.info('View details page coming soon')}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canManagePrisoners && (
                              <>
                                <DropdownMenuItem onClick={() => toast.info('Edit page coming soon')}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(prisoner)}
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
                Page {currentPage} of {totalPages} ({totalPrisoners} total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
            <AlertDialogTitle>Delete Prisoner Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for <strong>{selectedPrisoner?.fullName}</strong>? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrisoner} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
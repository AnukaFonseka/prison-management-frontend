// src/app/(dashboard)/prisons/page.jsx
'use client';

import { useState, useEffect } from 'react';
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
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { getAllPrisons, createPrison, updatePrison, deletePrison } from '@/lib/api/prisons';
import PrisonFormDialog from '@/components/prisons/PrisonFormDialog';
import PrisonDetailsDialog from '@/components/prisons/PrisonDetailsDialog';

export default function PrisonsPage() {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  
  const [prisons, setPrisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrisons, setTotalPrisons] = useState(0);
  const itemsPerPage = 10;

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrison, setSelectedPrison] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadPrisons();
  }, [currentPage, searchTerm]);

  const loadPrisons = async () => {
    try {
      setLoading(true);
      const response = await getAllPrisons({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      });
      setPrisons(response.data);
      setTotalPages(response.pagination.pages);
      setTotalPrisons(response.pagination.total);
    } catch (error) {
      toast.error('Failed to load prisons');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreatePrison = async (data) => {
    try {
      setFormLoading(true);
      await createPrison(data);
      toast.success('Prison created successfully');
      setIsFormOpen(false);
      loadPrisons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create prison');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePrison = async (data) => {
    try {
      setFormLoading(true);
      await updatePrison(selectedPrison.prisonId, data);
      toast.success('Prison updated successfully');
      setIsFormOpen(false);
      setSelectedPrison(null);
      loadPrisons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update prison');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePrison = async () => {
    try {
      await deletePrison(selectedPrison.prisonId);
      toast.success('Prison deactivated successfully');
      setIsDeleteDialogOpen(false);
      setSelectedPrison(null);
      loadPrisons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete prison');
    }
  };

  const openEditDialog = (prison) => {
    setSelectedPrison(prison);
    setIsFormOpen(true);
  };

  const openDetailsDialog = (prison) => {
    setSelectedPrison(prison);
    setIsDetailsOpen(true);
  };

  const openDeleteDialog = (prison) => {
    setSelectedPrison(prison);
    setIsDeleteDialogOpen(true);
  };

  const canManagePrisons = isSuperAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Prison Management
          </h1>
          <p className="text-muted-foreground">
            Manage prison facilities and their information
          </p>
        </div>
        {canManagePrisons && (
          <Button onClick={() => {
            setSelectedPrison(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Prison
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prisons</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrisons}</div>
            <p className="text-xs text-muted-foreground">
              Registered facilities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prisons.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prisons.reduce((sum, p) => sum + (p.capacity || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>All Prisons</CardTitle>
          <CardDescription>
            View and manage all prison facilities in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or superintendent..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prison Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Superintendent</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead className="text-center">Occupancy</TableHead>
                  <TableHead className="text-center">Staff</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : prisons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No prisons found' : 'No prisons registered yet'}
                        </p>
                        {canManagePrisons && !searchTerm && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPrison(null);
                              setIsFormOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Prison
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  prisons.map((prison) => (
                    <TableRow key={prison.prisonId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {prison.prisonName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {prison.location}
                        </div>
                      </TableCell>
                      <TableCell>{prison.superintendentName}</TableCell>
                      <TableCell className="text-center">
                        {prison.capacity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">
                            {prison.currentOccupancy || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {prison.capacity > 0 
                              ? `${((prison.currentOccupancy / prison.capacity) * 100).toFixed(0)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {prison.staffCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={prison.isActive ? 'default' : 'secondary'}>
                          {prison.isActive ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => openDetailsDialog(prison)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canManagePrisons && (
                              <>
                                <DropdownMenuItem onClick={() => openEditDialog(prison)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(prison)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Deactivate
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
                Page {currentPage} of {totalPages} ({totalPrisons} total)
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

      {/* Dialogs */}
      <PrisonFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        prison={selectedPrison}
        onSubmit={selectedPrison ? handleUpdatePrison : handleCreatePrison}
        isLoading={formLoading}
      />

      <PrisonDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        prisonId={selectedPrison?.prisonId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Prison</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{selectedPrison?.prisonName}</strong>? 
              This action can be reversed by editing the prison later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrison} className="bg-red-600">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
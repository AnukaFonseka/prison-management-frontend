// src/components/prisoners/steps/EditBodyMarksStep.jsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
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

const BODY_LOCATIONS = [
  'Head', 'Face', 'Neck', 'Left Shoulder', 'Right Shoulder',
  'Left Arm', 'Right Arm', 'Left Forearm', 'Right Forearm',
  'Left Hand', 'Right Hand', 'Chest', 'Abdomen', 'Back',
  'Left Thigh', 'Right Thigh', 'Left Leg', 'Right Leg',
  'Left Foot', 'Right Foot',
];

const bodyMarkSchema = z.object({
  mark_description: z.string().min(3, 'Description must be at least 3 characters'),
  mark_location: z.string().min(1, 'Location is required'),
});

export default function EditBodyMarksStep({ 
  existingMarks = [], 
  onNext, 
  onBack, 
  onUpdateMark,
  onDeleteMark,
  isLoading 
}) {
  const [marks, setMarks] = useState(existingMarks.map(m => ({ ...m, isExisting: true })));
  const [isAdding, setIsAdding] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [deletingMark, setDeletingMark] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(bodyMarkSchema),
    defaultValues: {
      mark_description: '',
      mark_location: '',
    },
  });

  const markLocation = watch('mark_location');

  const onSubmitMark = (data) => {
    if (editingMark) {
      // Update existing mark
      const updatedMarks = marks.map(m => 
        m === editingMark 
          ? { ...m, description: data.mark_description, location: data.mark_location, isModified: true }
          : m
      );
      setMarks(updatedMarks);
      toast.success('Body mark updated');
      setEditingMark(null);
    } else {
      // Add new mark
      setMarks([...marks, { 
        description: data.mark_description, 
        location: data.mark_location,
        isExisting: false,
        isNew: true
      }]);
      toast.success('Body mark added');
      setIsAdding(false);
    }
    reset();
  };

  const startEdit = (mark) => {
    setEditingMark(mark);
    setValue('mark_description', mark.description);
    setValue('mark_location', mark.location);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingMark(null);
    reset();
  };

  const handleDeleteMark = (mark) => {
    if (mark.isExisting && !mark.isNew) {
      setDeletingMark(mark);
      setShowDeleteDialog(true);
    } else {
      // Just remove from local state if it's a new mark
      setMarks(marks.filter(m => m !== mark));
      toast.success('Body mark removed');
    }
  };

  const confirmDelete = async () => {
    if (deletingMark && deletingMark.markId) {
      const success = await onDeleteMark(deletingMark);
      if (success) {
        setMarks(marks.filter(m => m.markId !== deletingMark.markId));
      }
    }
    setShowDeleteDialog(false);
    setDeletingMark(null);
  };

  const handleNext = () => {
    // Separate marks into updates and new additions
    const marksToUpdate = marks.filter(m => m.isExisting && m.isModified);
    const marksToAdd = marks.filter(m => m.isNew);
    
    onNext({ marksToUpdate, marksToAdd });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Manage Body Marks</h3>
        <p className="text-sm text-muted-foreground">
          Update existing marks or add new identifying marks.
        </p>
      </div>

      {/* Existing Body Marks */}
      {marks.length > 0 && (
        <div className="space-y-3">
          <Label>Body Marks ({marks.length})</Label>
          {marks.map((mark, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {mark.location}
                      </span>
                      {mark.isNew && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                      {mark.isModified && (
                        <Badge variant="outline" className="text-xs">Modified</Badge>
                      )}
                    </div>
                    <p className="text-sm">{mark.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(mark)}
                      disabled={editingMark === mark}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMark(mark)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Add Form */}
      {(isAdding || editingMark) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingMark ? 'Edit Body Mark' : 'Add New Body Mark'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitMark)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mark_location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={markLocation}
                  onValueChange={(value) => setValue('mark_location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body location" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mark_location && (
                  <p className="text-sm text-red-500">{errors.mark_location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mark_description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="mark_description"
                  placeholder="e.g., Scar on left forearm, approximately 5cm long"
                  rows={3}
                  {...register('mark_description')}
                />
                {errors.mark_description && (
                  <p className="text-sm text-red-500">{errors.mark_description.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAdding(false);
                    cancelEdit();
                    reset();
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  {editingMark ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {!isAdding && !editingMark && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Body Mark
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Next: Family Members'}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Body Mark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this body mark? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
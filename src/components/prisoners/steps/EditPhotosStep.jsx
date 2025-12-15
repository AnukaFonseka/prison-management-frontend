// src/components/prisoners/steps/EditPhotosStep.jsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, User, FileText, Trash2 } from 'lucide-react';
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

const PHOTO_TYPES = [
  { value: 'Profile', label: 'Profile Photo', icon: User },
  { value: 'Front', label: 'Front View', icon: User },
  { value: 'Side', label: 'Side View', icon: User },
  { value: 'Identification', label: 'Identification Document', icon: FileText },
];

export default function EditPhotosStep({ 
  existingPhotos = [], 
  onNext, 
  onBack, 
  onDeletePhoto,
  isLoading 
}) {
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const existingIndex = newPhotos.findIndex(p => p.type === type);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto = { file, type, preview: reader.result };
      
      if (existingIndex >= 0) {
        const updatedPhotos = [...newPhotos];
        updatedPhotos[existingIndex] = newPhoto;
        setNewPhotos(updatedPhotos);
      } else {
        setNewPhotos([...newPhotos, newPhoto]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeNewPhoto = (type) => {
    setNewPhotos(newPhotos.filter(p => p.type !== type));
  };

  const handleDeleteExisting = (photo) => {
    setDeletingPhoto(photo);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deletingPhoto) {
      await onDeletePhoto(deletingPhoto);
      setShowDeleteDialog(false);
      setDeletingPhoto(null);
    }
  };

  const handleNext = () => {
    onNext(newPhotos);
  };

  const getPhotoForType = (type) => {
    // Check if there's a new photo for this type
    const newPhoto = newPhotos.find(p => p.type === type);
    if (newPhoto) return { ...newPhoto, isNew: true };

    // Check existing photos
    const existing = existingPhotos.find(p => p.photoType === type);
    if (existing) return { ...existing, isNew: false };

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Manage Photos</h3>
        <p className="text-sm text-muted-foreground">
          Update or add new photos. Existing photos will be replaced when you upload new ones.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PHOTO_TYPES.map((photoType) => {
          const photo = getPhotoForType(photoType.value);
          const Icon = photoType.icon;

          return (
            <Card key={photoType.value} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" />
                  <Label className="font-medium">
                    {photoType.label}
                    {photoType.value === 'Profile' && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                </div>

                {photo ? (
                  <div className="relative">
                    <img
                      src={photo.isNew 
                        ? photo.preview 
                        : `http://localhost:5000${photo.photoUrl}`
                      }
                      alt={photoType.label}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {photo.isNew ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeNewPhoto(photoType.value)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteExisting(photo)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {photo.isNew && (
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        New photo (will be uploaded)
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, photoType.value)}
                    />
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Max 5MB
                    </span>
                  </label>
                )}

                {/* Replace existing photo */}
                {photo && !photo.isNew && (
                  <label className="mt-2 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, photoType.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => e.currentTarget.previousElementSibling.click()}
                    >
                      <Upload className="mr-2 h-3 w-3" />
                      Replace Photo
                    </Button>
                  </label>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Photo Guidelines:
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Profile photo is mandatory</li>
              <li>New uploads will replace existing photos</li>
              <li>Maximum file size: 5MB per photo</li>
              <li>Supported formats: JPG, PNG, WEBP</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Next: Body Marks'}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
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
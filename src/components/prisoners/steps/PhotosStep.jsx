// src/components/prisoners/steps/PhotosStep.jsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

const PHOTO_TYPES = [
  { value: 'Profile', label: 'Profile Photo', icon: User },
  { value: 'Front', label: 'Front View', icon: User },
  { value: 'Side', label: 'Side View', icon: User },
  { value: 'Identification', label: 'Identification Document', icon: FileText },
];

export default function PhotosStep({ onNext, onBack, isLoading }) {
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Check if photo type already exists
    const existingIndex = photos.findIndex(p => p.type === type);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto = { file, type, preview: reader.result };
      
      if (existingIndex >= 0) {
        // Replace existing photo
        const updatedPhotos = [...photos];
        updatedPhotos[existingIndex] = newPhoto;
        setPhotos(updatedPhotos);
      } else {
        // Add new photo
        setPhotos([...photos, newPhoto]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (type) => {
    setPhotos(photos.filter(p => p.type !== type));
  };

  const handleNext = () => {
    if (photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    // Check if profile photo exists
    const hasProfile = photos.some(p => p.type === 'Profile');
    if (!hasProfile) {
      toast.error('Profile photo is required');
      return;
    }

    onNext(photos);
  };

  const handleSkip = () => {
    onNext([]);
  };

  const getPhotoByType = (type) => {
    return photos.find(p => p.type === type);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Photos</h3>
        <p className="text-sm text-muted-foreground">
          Upload prisoner photos for identification. Profile photo is required.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PHOTO_TYPES.map((photoType) => {
          const existingPhoto = getPhotoByType(photoType.value);
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

                {existingPhoto ? (
                  <div className="relative">
                    <img
                      src={existingPhoto.preview}
                      alt={photoType.label}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removePhoto(photoType.value)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                      {existingPhoto.file.name}
                    </div>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Photo Guidelines:
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Profile photo is mandatory</li>
              <li>Images should be clear and well-lit</li>
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
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
            Skip for Now
          </Button>
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Next: Body Marks'}
          </Button>
        </div>
      </div>
    </div>
  );
}
// src/components/prisoners/steps/BodyMarksStep.jsx
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
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BODY_LOCATIONS = [
  'Head',
  'Face',
  'Neck',
  'Left Shoulder',
  'Right Shoulder',
  'Left Arm',
  'Right Arm',
  'Left Forearm',
  'Right Forearm',
  'Left Hand',
  'Right Hand',
  'Chest',
  'Abdomen',
  'Back',
  'Left Thigh',
  'Right Thigh',
  'Left Leg',
  'Right Leg',
  'Left Foot',
  'Right Foot',
];

const bodyMarkSchema = z.object({
  mark_description: z.string().min(3, 'Description must be at least 3 characters'),
  mark_location: z.string().min(1, 'Location is required'),
});

export default function BodyMarksStep({ onNext, onBack, isLoading }) {
  const [bodyMarks, setBodyMarks] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

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
    setBodyMarks([...bodyMarks, data]);
    reset();
    setIsAdding(false);
    toast.success('Body mark added');
  };

  const removeMark = (index) => {
    setBodyMarks(bodyMarks.filter((_, i) => i !== index));
    toast.success('Body mark removed');
  };

  const handleNext = () => {
    onNext(bodyMarks);
  };

  const handleSkip = () => {
    onNext([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Body Marks & Identification</h3>
        <p className="text-sm text-muted-foreground">
          Add any distinguishing marks, scars, or tattoos for identification purposes.
        </p>
      </div>

      {/* Existing Body Marks */}
      {bodyMarks.length > 0 && (
        <div className="space-y-3">
          <Label>Added Body Marks ({bodyMarks.length})</Label>
          {bodyMarks.map((mark, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {mark.mark_location}
                      </span>
                    </div>
                    <p className="text-sm">{mark.mark_description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMark(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Body Mark */}
      {!isAdding ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Body Mark
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Body Mark</CardTitle>
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
                <p className="text-xs text-muted-foreground">
                  Provide detailed description including size, shape, and any notable features
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAdding(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Mark
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      {bodyMarks.length === 0 && !isAdding && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Optional Step
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                Body marks are optional but highly recommended for accurate prisoner identification.
                You can add them now or skip to the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <div className="flex gap-2">
          {bodyMarks.length === 0 && (
            <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
              Skip for Now
            </Button>
          )}
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Next: Family Members'}
          </Button>
        </div>
      </div>
    </div>
  );
}
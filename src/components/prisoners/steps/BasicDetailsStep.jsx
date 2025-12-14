// src/components/prisoners/steps/BasicDetailsStep.jsx
'use client';

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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Date formatting helper
const formatDate = (date) => {
  if (!date) return 'Pick a date';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const basicDetailsSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  nic: z.string().min(10, 'NIC must be at least 10 characters').max(12, 'NIC must be at most 12 characters'),
  case_number: z.string().min(1, 'Case number is required'),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required' }),
  birthday: z.date({ required_error: 'Birthday is required' }),
  nationality: z.string().min(2, 'Nationality is required'),
  admission_date: z.date({ required_error: 'Admission date is required' }),
  expected_release_date: z.date({ required_error: 'Expected release date is required' }),
  prison_id: z.string().min(1, 'Prison is required'),
  cell_number: z.string().optional(),
  social_status: z.string().optional(),
});

export default function BasicDetailsStep({ initialData, prisons, onNext, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      nic: initialData?.nic || '',
      case_number: initialData?.case_number || '',
      gender: initialData?.gender || '',
      birthday: initialData?.birthday ? new Date(initialData.birthday) : undefined,
      nationality: initialData?.nationality || 'Sri Lankan',
      admission_date: initialData?.admission_date ? new Date(initialData.admission_date) : new Date(),
      expected_release_date: initialData?.expected_release_date ? new Date(initialData.expected_release_date) : undefined,
      prison_id: initialData?.prison_id || '',
      cell_number: initialData?.cell_number || '',
      social_status: initialData?.social_status || '',
    },
  });

  const birthday = watch('birthday');
  const admissionDate = watch('admission_date');
  const expectedReleaseDate = watch('expected_release_date');

  const onSubmit = (data) => {
    // Format dates to YYYY-MM-DD
    const formattedData = {
      ...data,
      birthday: data.birthday.toISOString().split('T')[0],
      admission_date: data.admission_date.toISOString().split('T')[0],
      expected_release_date: data.expected_release_date.toISOString().split('T')[0],
      prison_id: parseInt(data.prison_id),
    };
    onNext(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="full_name"
            placeholder="Enter full name"
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-sm text-red-500">{errors.full_name.message}</p>
          )}
        </div>

        {/* NIC */}
        <div className="space-y-2">
          <Label htmlFor="nic">
            NIC Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nic"
            placeholder="e.g., 199512345678"
            {...register('nic')}
          />
          {errors.nic && (
            <p className="text-sm text-red-500">{errors.nic.message}</p>
          )}
        </div>

        {/* Case Number */}
        <div className="space-y-2">
          <Label htmlFor="case_number">
            Case Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="case_number"
            placeholder="e.g., CC/2024/001"
            {...register('case_number')}
          />
          {errors.case_number && (
            <p className="text-sm text-red-500">{errors.case_number.message}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('gender')}
            onValueChange={(value) => setValue('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender.message}</p>
          )}
        </div>

        {/* Birthday */}
        <div className="space-y-2">
          <Label>
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !birthday && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthday ? formatDate(birthday) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={birthday}
                onSelect={(date) => setValue('birthday', date)}
                initialFocus
                captionLayout="dropdown"
                fromYear={1940}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
          {errors.birthday && (
            <p className="text-sm text-red-500">{errors.birthday.message}</p>
          )}
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality">
            Nationality <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nationality"
            placeholder="e.g., Sri Lankan"
            {...register('nationality')}
          />
          {errors.nationality && (
            <p className="text-sm text-red-500">{errors.nationality.message}</p>
          )}
        </div>

        {/* Prison */}
        <div className="space-y-2">
          <Label htmlFor="prison_id">
            Prison Facility <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('prison_id')}
            onValueChange={(value) => setValue('prison_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select prison" />
            </SelectTrigger>
            <SelectContent>
              {prisons.map((prison) => (
                <SelectItem key={prison.prisonId} value={prison.prisonId.toString()}>
                  {prison.prisonName} - {prison.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.prison_id && (
            <p className="text-sm text-red-500">{errors.prison_id.message}</p>
          )}
        </div>

        {/* Cell Number */}
        <div className="space-y-2">
          <Label htmlFor="cell_number">Cell Number</Label>
          <Input
            id="cell_number"
            placeholder="e.g., A-101"
            {...register('cell_number')}
          />
        </div>

        {/* Admission Date */}
        <div className="space-y-2">
          <Label>
            Admission Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !admissionDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {admissionDate ? formatDate(admissionDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={admissionDate}
                onSelect={(date) => setValue('admission_date', date)}
                initialFocus
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          {errors.admission_date && (
            <p className="text-sm text-red-500">{errors.admission_date.message}</p>
          )}
        </div>

        {/* Expected Release Date */}
        <div className="space-y-2">
          <Label>
            Expected Release Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !expectedReleaseDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expectedReleaseDate ? formatDate(expectedReleaseDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={expectedReleaseDate}
                onSelect={(date) => setValue('expected_release_date', date)}
                initialFocus
                toYear={2200}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          {errors.expected_release_date && (
            <p className="text-sm text-red-500">{errors.expected_release_date.message}</p>
          )}
        </div>
      </div>

      {/* Social Status */}
      <div className="space-y-2">
        <Label htmlFor="social_status">Social Status</Label>
        <Textarea
          id="social_status"
          placeholder="e.g., Single, no dependents"
          rows={3}
          {...register('social_status')}
        />
        <p className="text-sm text-muted-foreground">
          Optional: Provide any relevant social information
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Next: Upload Photos'}
        </Button>
      </div>
    </form>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Loader2, 
  CalendarCheck, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  UserCheck,
  FileText,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { createVisit, updateVisit, getVisitById } from '@/lib/api/visits';
import { getAllPrisoners } from '@/lib/api/prisoners';
import { getAllVisitors } from '@/lib/api/visitors';
import { cn } from '@/lib/utils.js';
import { format } from 'date-fns';

// Zod validation schema matching backend validation
const visitSchema = z.object({
  prisoner_id: z
    .number({ required_error: 'Prisoner is required' })
    .int()
    .min(1, 'Invalid prisoner selection'),
  visitor_id: z
    .number({ required_error: 'Visitor is required' })
    .int()
    .min(1, 'Invalid visitor selection'),
  relationship: z
    .string()
    .min(2, 'Relationship must be at least 2 characters')
    .max(100, 'Relationship must not exceed 100 characters')
    .regex(
      /^[a-zA-Z\s-]+$/,
      'Relationship can only contain letters, spaces and hyphens'
    )
    .trim(),
  visit_date: z.date({
    required_error: 'Visit date is required',
  }).refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Visit date cannot be in the past')
  .refine((date) => {
    const maxFutureDate = new Date();
    maxFutureDate.setDate(maxFutureDate.getDate() + 30);
    return date <= maxFutureDate;
  }, 'Visit date cannot be more than 30 days in the future'),
  visit_time_start: z
    .string()
    .min(1, 'Start time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  visit_time_end: z
    .string()
    .min(1, 'End time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  purpose: z
    .string()
    .max(500, 'Purpose must not exceed 500 characters')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
}).refine((data) => {
  // Validate end time is after start time
  if (data.visit_time_start && data.visit_time_end) {
    const start = new Date(`2000-01-01T${data.visit_time_start}:00`);
    const end = new Date(`2000-01-01T${data.visit_time_end}:00`);
    return end > start;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['visit_time_end'],
}).refine((data) => {
  // Validate visit duration (15 minutes to 2 hours)
  if (data.visit_time_start && data.visit_time_end) {
    const start = new Date(`2000-01-01T${data.visit_time_start}:00`);
    const end = new Date(`2000-01-01T${data.visit_time_end}:00`);
    const durationMinutes = (end - start) / (1000 * 60);
    return durationMinutes >= 15 && durationMinutes <= 120;
  }
  return true;
}, {
  message: 'Visit duration must be between 15 minutes and 2 hours',
  path: ['visit_time_end'],
});

// Predefined relationship options
const RELATIONSHIPS = [
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Son',
  'Daughter',
  'Spouse',
  'Friend',
  'Lawyer',
  'Other',
];

export default function VisitFormDialog({ 
  open, 
  onOpenChange, 
  visitId = null, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const isEditMode = !!visitId;

  // Data states
  const [prisoners, setPrisoners] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [openPrisonerCombobox, setOpenPrisonerCombobox] = useState(false);
  const [openVisitorCombobox, setOpenVisitorCombobox] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  const form = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      prisoner_id: 0,
      visitor_id: 0,
      relationship: '',
      visit_date: undefined,
      visit_time_start: '',
      visit_time_end: '',
      purpose: '',
      notes: '',
    },
  });

  // Load initial data when dialog opens
  useEffect(() => {
    if (open) {
      loadInitialData();
      if (visitId) {
        loadVisit();
      } else {
        form.reset({
          prisoner_id: 0,
          visitor_id: 0,
          relationship: '',
          visit_date: undefined,
          visit_time_start: '',
          visit_time_end: '',
          purpose: '',
          notes: '',
        });
      }
    }
  }, [open, visitId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Load prisoners and visitors
      const [prisonersRes, visitorsRes] = await Promise.all([
        getAllPrisoners({ limit: 1000 }), // Get all prisoners
        getAllVisitors({ limit: 1000 }), // Get all visitors
      ]);

      setPrisoners(prisonersRes.data);
      setVisitors(visitorsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load prisoners and visitors');
    } finally {
      setLoadingData(false);
    }
  };

  const loadVisit = async () => {
    try {
      setLoading(true);
      const response = await getVisitById(visitId);
      const visit = response.data;
      
      form.reset({
        prisoner_id: visit.prisoner.prisonerId,
        visitor_id: visit.visitor.visitorId,
        relationship: visit.relationship,
        visit_date: new Date(visit.visitDate),
        visit_time_start: visit.visitTimeStart.slice(0, 5), // HH:MM:SS -> HH:MM
        visit_time_end: visit.visitTimeEnd.slice(0, 5),
        purpose: visit.purpose || '',
        notes: visit.notes || '',
      });
    } catch (error) {
      console.error('Failed to load visit:', error);
      toast.error('Failed to load visit details');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        prisoner_id: data.prisoner_id,
        visitor_id: data.visitor_id,
        relationship: data.relationship,
        visit_date: format(data.visit_date, 'yyyy-MM-dd'),
        visit_time_start: `${data.visit_time_start}:00`, // Add seconds
        visit_time_end: `${data.visit_time_end}:00`,
        purpose: data.purpose || undefined,
        notes: data.notes || undefined,
      };

      if (isEditMode) {
        await updateVisit(visitId, payload);
        toast.success('Visit updated successfully');
      } else {
        await createVisit(payload);
        toast.success('Visit scheduled successfully');
      }

      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving visit:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errors.forEach((err) => {
          toast.error(err.msg);
        });
      } else {
        toast.error(
          `Failed to ${isEditMode ? 'update' : 'schedule'} visit`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Get selected prisoner and visitor details
  const selectedPrisoner = prisoners.find(p => p.prisonerId === form.watch('prisoner_id'));
  const selectedVisitor = visitors.find(v => v.visitorId === form.watch('visitor_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            {isEditMode ? 'Edit Visit' : 'Schedule New Visit'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the visit details below'
              : 'Schedule a new visit for a prisoner'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Prisoner Selection */}
            <FormField
              control={form.control}
              name="prisoner_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Prisoner *
                  </FormLabel>
                  <Popover open={openPrisonerCombobox} onOpenChange={setOpenPrisonerCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={loading || loadingData}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? prisoners.find((prisoner) => prisoner.prisonerId === field.value)?.fullName
                            : 'Select prisoner'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search prisoner..." />
                        <CommandList>
                          <CommandEmpty>No prisoner found.</CommandEmpty>
                          <CommandGroup>
                            {prisoners.map((prisoner) => (
                              <CommandItem
                                key={prisoner.prisonerId}
                                value={`${prisoner.fullName} ${prisoner.caseNumber} ${prisoner.nic}`}
                                onSelect={() => {
                                  form.setValue('prisoner_id', prisoner.prisonerId);
                                  setOpenPrisonerCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    prisoner.prisonerId === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <div>
                                  <div className="font-medium">{prisoner.fullName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {prisoner.caseNumber} • {prisoner.nic}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedPrisoner && (
                    <FormDescription>
                      Case: {selectedPrisoner.caseNumber} • Prison: {selectedPrisoner.prison?.prisonName}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visitor Selection */}
            <FormField
              control={form.control}
              name="visitor_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Visitor *
                  </FormLabel>
                  <Popover open={openVisitorCombobox} onOpenChange={setOpenVisitorCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={loading || loadingData}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? visitors.find((visitor) => visitor.visitorId === field.value)?.visitorName
                            : 'Select visitor'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search visitor..." />
                        <CommandList>
                          <CommandEmpty>No visitor found.</CommandEmpty>
                          <CommandGroup>
                            {visitors.map((visitor) => (
                              <CommandItem
                                key={visitor.visitorId}
                                value={`${visitor.visitorName} ${visitor.nic} ${visitor.mobileNumber}`}
                                onSelect={() => {
                                  form.setValue('visitor_id', visitor.visitorId);
                                  setOpenVisitorCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    visitor.visitorId === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <div>
                                  <div className="font-medium">{visitor.visitorName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {visitor.nic} • {visitor.mobileNumber}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedVisitor && (
                    <FormDescription>
                      NIC: {selectedVisitor.nic} • Mobile: {selectedVisitor.mobileNumber}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Relationship */}
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELATIONSHIPS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Visitor's relationship to the prisoner
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visit Date */}
            <FormField
              control={form.control}
              name="visit_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Visit Date *
                  </FormLabel>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          disabled={loading}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenCalendar(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const maxDate = new Date();
                          maxDate.setDate(maxDate.getDate() + 30);
                          return date < today || date > maxDate;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Visit date (today to 30 days from now)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <FormField
                control={form.control}
                name="visit_time_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Time *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Visit start time
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="visit_time_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      End Time *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Visit end time (15min - 2hrs)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Purpose
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Family visit, legal consultation, etc."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Purpose of the visit (optional, max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes or special instructions..."
                      className="min-h-[80px] resize-none"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional notes (optional, max 1000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || loadingData}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Visit' : 'Schedule Visit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
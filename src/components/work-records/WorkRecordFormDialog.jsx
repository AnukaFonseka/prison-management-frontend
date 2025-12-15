// src/components/work-records/WorkRecordFormDialog.jsx
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock, DollarSign, Briefcase, User } from 'lucide-react';
import { toast } from 'sonner';
import { getAllPrisoners } from '@/lib/api/prisoners';
import { createWorkRecord, updateWorkRecord, getWorkRecordById } from '@/lib/api/work-records';

// Zod validation schema matching backend validation
const workRecordSchema = z.object({
  prisoner_id: z
    .string()
    .min(1, 'Prisoner is required')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Invalid prisoner selection',
    }),
  task_description: z
    .string()
    .min(10, 'Task description must be at least 10 characters')
    .max(1000, 'Task description must not exceed 1000 characters')
    .trim(),
  work_date: z
    .string()
    .min(1, 'Work date is required')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const now = new Date();
        now.setHours(23, 59, 59, 999); // End of today
        return selectedDate <= now;
      },
      {
        message: 'Work date cannot be in the future',
      }
    )
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return selectedDate >= thirtyDaysAgo;
      },
      {
        message: 'Work date cannot be more than 30 days in the past',
      }
    ),
  hours_worked: z
    .string()
    .min(1, 'Hours worked is required')
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0.5 && val <= 24, {
      message: 'Hours worked must be between 0.5 and 24',
    }),
  payment_amount: z
    .string()
    .min(1, 'Payment amount is required')
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Payment amount must be a positive number',
    }),
}).refine(
  (data) => {
    // Validate payment amount based on hours worked
    const maxPaymentPerHour = 1000;
    const maxAllowed = data.hours_worked * maxPaymentPerHour;
    return data.payment_amount <= maxAllowed;
  },
  {
    message: 'Payment amount seems too high',
    path: ['payment_amount'],
  }
);

export default function WorkRecordFormDialog({ 
  open, 
  onOpenChange, 
  recordId = null, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [prisoners, setPrisoners] = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isEditMode = !!recordId;

  const form = useForm({
    resolver: zodResolver(workRecordSchema),
    defaultValues: {
      prisoner_id: '',
      task_description: '',
      work_date: new Date().toISOString().split('T')[0], // Today's date
      hours_worked: '',
      payment_amount: '',
    },
  });

  // Load prisoners when dialog opens
  useEffect(() => {
    if (open) {
      loadPrisoners();
      if (recordId) {
        loadWorkRecord();
      } else {
        form.reset({
          prisoner_id: '',
          task_description: '',
          work_date: new Date().toISOString().split('T')[0],
          hours_worked: '',
          payment_amount: '',
        });
      }
    }
  }, [open, recordId]);

  const loadPrisoners = async () => {
    try {
      setLoadingPrisoners(true);
      const response = await getAllPrisoners({ 
        status: 'Active',
        limit: 1000 
      });
      setPrisoners(response.data);
    } catch (error) {
      console.error('Failed to load prisoners:', error);
      toast.error('Failed to load prisoners');
    } finally {
      setLoadingPrisoners(false);
    }
  };

  const loadWorkRecord = async () => {
    try {
      setLoading(true);
      const response = await getWorkRecordById(recordId);
      const record = response.data;
      
      form.reset({
        prisoner_id: record.prisonerId.toString(),
        task_description: record.taskDescription,
        work_date: record.workDate,
        hours_worked: record.hoursWorked.toString(),
        payment_amount: record.paymentAmount.toString(),
      });
    } catch (error) {
      console.error('Failed to load work record:', error);
      toast.error('Failed to load work record details');
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
        task_description: data.task_description,
        work_date: data.work_date,
        hours_worked: data.hours_worked,
        payment_amount: data.payment_amount,
      };

      if (isEditMode) {
        await updateWorkRecord(recordId, payload);
        toast.success('Work record updated successfully');
      } else {
        await createWorkRecord(payload);
        toast.success('Work record created successfully');
      }

      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving work record:', error);
      toast.error(
        error.response?.data?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} work record`
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate suggested payment based on hours worked
  const calculateSuggestedPayment = (hours) => {
    const ratePerHour = 100; // Default rate
    return (parseFloat(hours) * ratePerHour).toFixed(2);
  };

  // Filter prisoners based on search
  const filteredPrisoners = prisoners.filter((prisoner) =>
    prisoner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prisoner.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prisoner.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get today's date for max date constraint
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days ago for min date constraint
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const minDate = thirtyDaysAgo.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {isEditMode ? 'Edit Work Record' : 'Add Work Record'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the work record details below'
              : 'Record a new work assignment and payment details'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Prisoner Selection */}
            <FormField
              control={form.control}
              name="prisoner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Prisoner *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading || loadingPrisoners || isEditMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a prisoner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="px-2 pb-2">
                        <Input
                          placeholder="Search prisoner..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      {loadingPrisoners ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : filteredPrisoners.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No active prisoners found
                        </div>
                      ) : (
                        filteredPrisoners.map((prisoner) => (
                          <SelectItem
                            key={prisoner.prisonerId}
                            value={prisoner.prisonerId.toString()}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{prisoner.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {prisoner.nic} • {prisoner.caseNumber} • {prisoner.prison?.prisonName}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isEditMode 
                      ? 'Prisoner cannot be changed when editing' 
                      : 'Select the prisoner who performed the work'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Description */}
            <FormField
              control={form.control}
              name="task_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Task Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work task performed (minimum 10 characters)..."
                      className="min-h-[100px] resize-none"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the work performed (10-1000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Work Date */}
              <FormField
                control={form.control}
                name="work_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Work Date *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={loading}
                        min={minDate}
                        max={today}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Date when work was performed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hours Worked */}
              <FormField
                control={form.control}
                name="hours_worked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hours Worked *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        placeholder="8.0"
                        disabled={loading}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-calculate suggested payment
                          const hours = e.target.value;
                          if (hours && !form.getValues('payment_amount')) {
                            form.setValue(
                              'payment_amount',
                              calculateSuggestedPayment(hours)
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Between 0.5 and 24 hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Amount */}
            <FormField
              control={form.control}
              name="payment_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment Amount (Rs.) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="500.00"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch('hours_worked') && (
                      <span className="text-primary">
                        Maximum allowed: Rs.{' '}
                        {(parseFloat(form.watch('hours_worked')) * 1000).toFixed(2)}
                      </span>
                    )}
                    {!form.watch('hours_worked') && 'Enter hours worked first to see maximum allowed payment'}
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
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Record' : 'Create Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
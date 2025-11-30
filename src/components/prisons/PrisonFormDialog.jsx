// src/components/prisons/PrisonFormDialog.jsx
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const prisonSchema = z.object({
  prison_name: z.string().min(1, 'Prison name is required').max(100),
  location: z.string().min(1, 'Location is required').max(100),
  address: z.string().min(1, 'Address is required'),
  capacity: z.coerce.number().int().min(0, 'Capacity must be a positive number'),
  superintendent_name: z.string().min(1, 'Superintendent name is required').max(100),
  contact_number: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number').max(20),
  email: z.string().email('Invalid email address'),
  established_date: z.string().optional(),
  is_active: z.boolean().default(true),
});

export default function PrisonFormDialog({ 
  open, 
  onOpenChange, 
  prison, 
  onSubmit,
  isLoading 
}) {
  const isEditMode = !!prison;

  const form = useForm({
    resolver: zodResolver(prisonSchema),
    defaultValues: {
      prison_name: '',
      location: '',
      address: '',
      capacity: 0,
      superintendent_name: '',
      contact_number: '',
      email: '',
      established_date: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (prison) {
      form.reset({
        prison_name: prison.prisonName || '',
        location: prison.location || '',
        address: prison.address || '',
        capacity: prison.capacity || 0,
        superintendent_name: prison.superintendentName || '',
        contact_number: prison.contactNumber || '',
        email: prison.email || '',
        established_date: prison.establishedDate 
          ? new Date(prison.establishedDate).toISOString().split('T')[0] 
          : '',
        is_active: prison.isActive ?? true,
      });
    } else {
      form.reset({
        prison_name: '',
        location: '',
        address: '',
        capacity: 0,
        superintendent_name: '',
        contact_number: '',
        email: '',
        established_date: '',
        is_active: true,
      });
    }
  }, [prison, form]);

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error is handled in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Prison' : 'Add New Prison'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the prison information below.' 
              : 'Enter the details of the new prison facility.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="prison_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prison Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Central Prison" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Colombo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter full address" 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="established_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Established Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="superintendent_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Superintendent Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+94 11 234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="prison@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this prison facility
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Prison' : 'Create Prison'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
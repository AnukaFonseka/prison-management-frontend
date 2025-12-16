// src/components/visitors/VisitorFormDialog.jsx
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, CreditCard, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { createVisitor, updateVisitor, getVisitorById } from '@/lib/api/visitors';

// Zod validation schema matching backend validation
const visitorSchema = z.object({
  visitor_name: z
    .string()
    .min(2, 'Visitor name must be at least 2 characters')
    .max(200, 'Visitor name must not exceed 200 characters')
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      'Visitor name can only contain letters, spaces, dots, hyphens and apostrophes'
    )
    .trim(),
  nic: z
    .string()
    .min(1, 'NIC is required')
    .trim()
    .refine(
      (value) => {
        // Old NIC format: 9 digits + V/X (e.g., 912345678V)
        const oldNicPattern = /^[0-9]{9}[vVxX]$/;
        // New NIC format: 12 digits (e.g., 199123456789)
        const newNicPattern = /^[0-9]{12}$/;
        return oldNicPattern.test(value) || newNicPattern.test(value);
      },
      {
        message: 'Invalid NIC format. Use either 9 digits + V/X or 12 digits',
      }
    ),
  mobile_number: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .trim(),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .trim(),
});

export default function VisitorFormDialog({ 
  open, 
  onOpenChange, 
  visitorId = null, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!visitorId;

  const form = useForm({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      visitor_name: '',
      nic: '',
      mobile_number: '',
      address: '',
    },
  });

  // Load visitor data when editing
  useEffect(() => {
    if (open) {
      if (visitorId) {
        loadVisitor();
      } else {
        form.reset({
          visitor_name: '',
          nic: '',
          mobile_number: '',
          address: '',
        });
      }
    }
  }, [open, visitorId]);

  const loadVisitor = async () => {
    try {
      setLoading(true);
      const response = await getVisitorById(visitorId);
      const visitor = response.data;
      
      form.reset({
        visitor_name: visitor.visitorName,
        nic: visitor.nic,
        mobile_number: visitor.mobileNumber,
        address: visitor.address,
      });
    } catch (error) {
      console.error('Failed to load visitor:', error);
      toast.error('Failed to load visitor details');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        visitor_name: data.visitor_name,
        nic: data.nic,
        mobile_number: data.mobile_number,
        address: data.address,
      };

      if (isEditMode) {
        await updateVisitor(visitorId, payload);
        toast.success('Visitor updated successfully');
      } else {
        await createVisitor(payload);
        toast.success('Visitor created successfully');
      }

      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving visitor:', error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errors.forEach((err) => {
          toast.error(err.msg);
        });
      } else {
        toast.error(
          `Failed to ${isEditMode ? 'update' : 'create'} visitor`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Format NIC input (auto uppercase V/X)
  const formatNIC = (value) => {
    return value.toUpperCase();
  };

  // Format mobile number (remove non-digits)
  const formatMobileNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {isEditMode ? 'Edit Visitor' : 'Add New Visitor'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the visitor information below'
              : 'Enter the details of the new visitor'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Visitor Name */}
            <FormField
              control={form.control}
              name="visitor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Visitor Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Full name of the visitor (2-200 characters, letters only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIC */}
              <FormField
                control={form.control}
                name="nic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      NIC *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="912345678V or 199123456789"
                        disabled={loading}
                        {...field}
                        onChange={(e) => {
                          const formatted = formatNIC(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      9 digits + V/X or 12 digits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Mobile Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0771234567"
                        disabled={loading}
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          const formatted = formatMobileNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      10 digits starting with 0
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main Street, Colombo 08"
                      className="min-h-[100px] resize-none"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Full residential address (10-500 characters)
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
                {isEditMode ? 'Update Visitor' : 'Create Visitor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
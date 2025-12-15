// src/components/behaviour-records/BehaviourRecordFormDialog.jsx
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
import {
  Loader2,
  Calendar,
  FileText,
  User,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Eye,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllPrisoners } from '@/lib/api/prisoners';
import {
  createBehaviourRecord,
  updateBehaviourRecord,
  getBehaviourRecordById,
} from '@/lib/api/behaviour-records';

// Behaviour types and severity levels matching backend
const BEHAVIOUR_TYPES = {
  POSITIVE: 'Positive',
  NEGATIVE: 'Negative',
};

const SEVERITY_LEVELS = {
  MINOR: 'Minor',
  MODERATE: 'Moderate',
  SEVERE: 'Severe',
};

// Zod validation schema matching backend validation
const behaviourRecordSchema = z
  .object({
    prisoner_id: z
      .string()
      .min(1, 'Prisoner is required')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, {
        message: 'Invalid prisoner selection',
      }),
    behaviour_type: z
      .string()
      .min(1, 'Behaviour type is required')
      .refine((val) => Object.values(BEHAVIOUR_TYPES).includes(val), {
        message: `Behaviour type must be one of: ${Object.values(BEHAVIOUR_TYPES).join(', ')}`,
      }),
    severity_level: z
      .string()
      .min(1, 'Severity level is required')
      .refine((val) => Object.values(SEVERITY_LEVELS).includes(val), {
        message: `Severity level must be one of: ${Object.values(SEVERITY_LEVELS).join(', ')}`,
      }),
    incident_date: z
      .string()
      .min(1, 'Incident date is required')
      .refine(
        (date) => {
          const selectedDate = new Date(date);
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          return selectedDate <= now;
        },
        {
          message: 'Incident date cannot be in the future',
        }
      )
      .refine(
        (date) => {
          const selectedDate = new Date(date);
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          ninetyDaysAgo.setHours(0, 0, 0, 0);
          return selectedDate >= ninetyDaysAgo;
        },
        {
          message: 'Incident date cannot be more than 90 days in the past',
        }
      ),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .max(2000, 'Description must not exceed 2000 characters')
      .trim(),
    action_taken: z
      .string()
      .max(1000, 'Action taken must not exceed 1000 characters')
      .trim()
      .optional()
      .or(z.literal('')),
    witness_name: z
      .string()
      .max(255, 'Witness name must not exceed 255 characters')
      .trim()
      .optional()
      .or(z.literal('')),
    sentence_adjustment_days: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? 0 : parseInt(val, 10)))
      .refine(
        (val) => {
          if (val === 0) return true;
          return !isNaN(val) && val >= -365 && val <= 365;
        },
        {
          message: 'Sentence adjustment must be between -365 and 365 days',
        }
      ),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .trim()
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // Positive behaviours should reduce sentence (negative adjustment)
      if (
        data.behaviour_type === BEHAVIOUR_TYPES.POSITIVE &&
        data.sentence_adjustment_days > 0
      ) {
        return false;
      }
      // Negative behaviours should increase sentence (positive adjustment)
      if (
        data.behaviour_type === BEHAVIOUR_TYPES.NEGATIVE &&
        data.sentence_adjustment_days < 0
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'Sentence adjustment direction must match behaviour type (Positive = reduction, Negative = increase)',
      path: ['sentence_adjustment_days'],
    }
  );

export default function BehaviourRecordFormDialog({
  open,
  onOpenChange,
  recordId = null,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [prisoners, setPrisoners] = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isEditMode = !!recordId;

  const form = useForm({
    resolver: zodResolver(behaviourRecordSchema),
    defaultValues: {
      prisoner_id: '',
      behaviour_type: '',
      severity_level: '',
      incident_date: new Date().toISOString().split('T')[0],
      description: '',
      action_taken: '',
      witness_name: '',
      sentence_adjustment_days: '',
      notes: '',
    },
  });

  const selectedBehaviourType = form.watch('behaviour_type');

  // Load prisoners when dialog opens
  useEffect(() => {
    if (open) {
      loadPrisoners();
      if (recordId) {
        loadBehaviourRecord();
      } else {
        form.reset({
          prisoner_id: '',
          behaviour_type: '',
          severity_level: '',
          incident_date: new Date().toISOString().split('T')[0],
          description: '',
          action_taken: '',
          witness_name: '',
          sentence_adjustment_days: '',
          notes: '',
        });
      }
    }
  }, [open, recordId]);

  const loadPrisoners = async () => {
    try {
      setLoadingPrisoners(true);
      const response = await getAllPrisoners({
        status: 'Active',
        limit: 1000,
      });
      setPrisoners(response.data);
    } catch (error) {
      console.error('Failed to load prisoners:', error);
      toast.error('Failed to load prisoners');
    } finally {
      setLoadingPrisoners(false);
    }
  };

  const loadBehaviourRecord = async () => {
    try {
      setLoading(true);
      const response = await getBehaviourRecordById(recordId);
      const record = response.data;

      form.reset({
        prisoner_id: record.prisonerId.toString(),
        behaviour_type: record.behaviourType,
        severity_level: record.severityLevel,
        incident_date: record.incidentDate,
        description: record.description,
        action_taken: record.actionTaken || '',
        witness_name: record.witnessName || '',
        sentence_adjustment_days: record.sentenceAdjustmentDays?.toString() || '',
        notes: record.notes || '',
      });
    } catch (error) {
      console.error('Failed to load behaviour record:', error);
      toast.error('Failed to load behaviour record details');
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
        behaviour_type: data.behaviour_type,
        severity_level: data.severity_level,
        incident_date: data.incident_date,
        description: data.description,
        action_taken: data.action_taken || undefined,
        witness_name: data.witness_name || undefined,
        sentence_adjustment_days: data.sentence_adjustment_days || undefined,
        notes: data.notes || undefined,
      };

      if (isEditMode) {
        await updateBehaviourRecord(recordId, payload);
        toast.success('Behaviour record updated successfully');
      } else {
        await createBehaviourRecord(payload);
        toast.success('Behaviour record created successfully');
      }

      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving behaviour record:', error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} behaviour record`
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter prisoners based on search
  const filteredPrisoners = prisoners.filter(
    (prisoner) =>
      prisoner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prisoner.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prisoner.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get today's date for max date constraint
  const today = new Date().toISOString().split('T')[0];

  // Get date 90 days ago for min date constraint
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const minDate = ninetyDaysAgo.toISOString().split('T')[0];

  // Get suggested adjustment based on severity
  const getSuggestedAdjustment = (behaviourType, severity) => {
    if (!behaviourType || !severity) return '';

    const isPositive = behaviourType === BEHAVIOUR_TYPES.POSITIVE;
    const suggestions = {
      [SEVERITY_LEVELS.MINOR]: isPositive ? -3 : 3,
      [SEVERITY_LEVELS.MODERATE]: isPositive ? -7 : 7,
      [SEVERITY_LEVELS.SEVERE]: isPositive ? -14 : 14,
    };

    return suggestions[severity]?.toString() || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditMode ? 'Edit Behaviour Record' : 'Record Behaviour'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the behaviour record details below'
              : 'Record a new behaviour incident or positive conduct'}
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
                                {prisoner.nic} • {prisoner.caseNumber} •{' '}
                                {prisoner.prison?.prisonName}
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
                      : 'Select the prisoner involved in this incident'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Behaviour Type */}
              <FormField
                control={form.control}
                name="behaviour_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Behaviour Type *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-suggest adjustment when type and severity are set
                        const severity = form.getValues('severity_level');
                        if (severity && !form.getValues('sentence_adjustment_days')) {
                          const suggested = getSuggestedAdjustment(value, severity);
                          form.setValue('sentence_adjustment_days', suggested);
                        }
                      }}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={BEHAVIOUR_TYPES.POSITIVE}>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span>Positive</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={BEHAVIOUR_TYPES.NEGATIVE}>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span>Negative</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Severity Level */}
              <FormField
                control={form.control}
                name="severity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Severity Level *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-suggest adjustment when type and severity are set
                        const type = form.getValues('behaviour_type');
                        if (type && !form.getValues('sentence_adjustment_days')) {
                          const suggested = getSuggestedAdjustment(type, value);
                          form.setValue('sentence_adjustment_days', suggested);
                        }
                      }}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SEVERITY_LEVELS.MINOR}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span>Minor</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={SEVERITY_LEVELS.MODERATE}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <span>Moderate</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={SEVERITY_LEVELS.SEVERE}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span>Severe</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Incident Date */}
              <FormField
                control={form.control}
                name="incident_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Incident Date *
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Incident Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the incident or positive behaviour in detail (minimum 20 characters)..."
                      className="min-h-[120px] resize-none"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the behaviour (20-2000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Action Taken */}
              <FormField
                control={form.control}
                name="action_taken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Action Taken
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any disciplinary action or reward given..."
                        className="min-h-20 resize-none"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional (max 1000 characters)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Witness Name */}
              <FormField
                control={form.control}
                name="witness_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Witness Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name of witness (if any)"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional (max 255 characters)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sentence Adjustment */}
            <FormField
              control={form.control}
              name="sentence_adjustment_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Sentence Adjustment (Days)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={
                        selectedBehaviourType === BEHAVIOUR_TYPES.POSITIVE
                          ? 'e.g., -7 (reduce sentence by 7 days)'
                          : selectedBehaviourType === BEHAVIOUR_TYPES.NEGATIVE
                          ? 'e.g., 7 (add 7 days to sentence)'
                          : 'Enter adjustment days'
                      }
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedBehaviourType === BEHAVIOUR_TYPES.POSITIVE && (
                      <span className="text-green-600">
                        Positive behaviour: Use negative values to reduce sentence (e.g., -7)
                      </span>
                    )}
                    {selectedBehaviourType === BEHAVIOUR_TYPES.NEGATIVE && (
                      <span className="text-red-600">
                        Negative behaviour: Use positive values to increase sentence (e.g., 7)
                      </span>
                    )}
                    {!selectedBehaviourType && 'Between -365 and 365 days'}
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
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Additional Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes or observations..."
                      className="min-h-20 resize-none"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional (max 1000 characters)</FormDescription>
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
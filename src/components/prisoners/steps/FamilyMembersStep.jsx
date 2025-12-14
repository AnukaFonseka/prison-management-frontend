// src/components/prisoners/steps/FamilyMembersStep.jsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, Phone, MapPin, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const RELATIONSHIPS = [
  'Mother',
  'Father',
  'Spouse',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Uncle',
  'Aunt',
  'Cousin',
  'Other',
];

const familyMemberSchema = z.object({
  family_member_name: z.string().min(2, 'Name must be at least 2 characters'),
  relationship: z.string().min(1, 'Relationship is required'),
  contact_number: z.string().regex(/^[0-9]{10}$/, 'Contact number must be 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  nic: z.string().min(10, 'NIC must be at least 10 characters').max(12, 'NIC must be at most 12 characters'),
  emergency_contact: z.boolean().default(false),
});

export default function FamilyMembersStep({ onNext, onBack, isLoading }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      family_member_name: '',
      relationship: '',
      contact_number: '',
      address: '',
      nic: '',
      emergency_contact: false,
    },
  });

  const relationship = watch('relationship');
  const emergencyContact = watch('emergency_contact');

  const onSubmitMember = (data) => {
    // If marking as emergency contact, unmark others
    if (data.emergency_contact) {
      setFamilyMembers(familyMembers.map(m => ({ ...m, emergency_contact: false })));
    }
    
    setFamilyMembers([...familyMembers, data]);
    reset();
    setIsAdding(false);
    toast.success('Family member added');
  };

  const removeMember = (index) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
    toast.success('Family member removed');
  };

  const handleNext = () => {
    onNext(familyMembers);
  };

  const handleSkip = () => {
    onNext([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Family Members & Emergency Contacts</h3>
        <p className="text-sm text-muted-foreground">
          Add family members and designate emergency contacts.
        </p>
      </div>

      {/* Existing Family Members */}
      {familyMembers.length > 0 && (
        <div className="space-y-3">
          <Label>Added Family Members ({familyMembers.length})</Label>
          {familyMembers.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{member.family_member_name}</h4>
                      <Badge variant="outline">{member.relationship}</Badge>
                      {member.emergency_contact && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Emergency Contact
                        </Badge>
                      )}
                    </div>
                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>NIC: {member.nic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{member.contact_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{member.address}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Family Member */}
      {!isAdding ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Family Member
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Family Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitMember)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="family_member_name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="family_member_name"
                    placeholder="Enter full name"
                    {...register('family_member_name')}
                  />
                  {errors.family_member_name && (
                    <p className="text-sm text-red-500">{errors.family_member_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">
                    Relationship <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={relationship}
                    onValueChange={(value) => setValue('relationship', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.relationship && (
                    <p className="text-sm text-red-500">{errors.relationship.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nic">
                    NIC Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nic"
                    placeholder="e.g., 199612345678"
                    {...register('nic')}
                  />
                  {errors.nic && (
                    <p className="text-sm text-red-500">{errors.nic.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">
                    Contact Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact_number"
                    placeholder="0771234567"
                    maxLength={10}
                    {...register('contact_number')}
                  />
                  {errors.contact_number && (
                    <p className="text-sm text-red-500">{errors.contact_number.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  rows={2}
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emergency_contact"
                  checked={emergencyContact}
                  onCheckedChange={(checked) => setValue('emergency_contact', checked)}
                />
                <Label htmlFor="emergency_contact" className="cursor-pointer">
                  Mark as Emergency Contact
                </Label>
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
                  Add Member
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      {familyMembers.length === 0 && !isAdding && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Optional Step
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                Family member information is optional but recommended for emergency contacts and visitor management.
                You can add them now or skip to complete registration.
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
          {familyMembers.length === 0 && (
            <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
              Skip for Now
            </Button>
          )}
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {isLoading ? 'Completing...' : 'Complete Registration'}
          </Button>
        </div>
      </div>
    </div>
  );
}
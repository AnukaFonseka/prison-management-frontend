// src/components/prisoners/steps/EditFamilyMembersStep.jsx
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
import { Plus, Trash2, Edit2, Phone, MapPin, User, AlertTriangle, X, Check } from 'lucide-react';
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

const RELATIONSHIPS = [
  'Mother', 'Father', 'Spouse', 'Son', 'Daughter',
  'Brother', 'Sister', 'Grandfather', 'Grandmother',
  'Uncle', 'Aunt', 'Cousin', 'Other',
];

const familyMemberSchema = z.object({
  family_member_name: z.string().min(2, 'Name must be at least 2 characters'),
  relationship: z.string().min(1, 'Relationship is required'),
  contact_number: z.string().regex(/^[0-9]{10}$/, 'Contact number must be 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  nic: z.string().min(10, 'NIC must be at least 10 characters').max(12, 'NIC must be at most 12 characters'),
  emergency_contact: z.boolean().default(false),
});

export default function EditFamilyMembersStep({ 
  existingMembers = [], 
  onNext, 
  onBack,
  onUpdateMember,
  onDeleteMember,
  isLoading 
}) {
  const [members, setMembers] = useState(existingMembers.map(m => ({
    ...m,
    family_member_name: m.memberName,
    contact_number: m.contactNumber,
    emergency_contact: m.emergencyContact,
    isExisting: true
  })));
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    if (editingMember) {
      // Update existing member
      const updatedMembers = members.map(m => 
        m === editingMember 
          ? { ...m, ...data, isModified: true }
          : m
      );
      setMembers(updatedMembers);
      toast.success('Family member updated');
      setEditingMember(null);
    } else {
      // Add new member
      if (data.emergency_contact) {
        setMembers(members.map(m => ({ ...m, emergency_contact: false })));
      }
      
      setMembers([...members, { ...data, isExisting: false, isNew: true }]);
      toast.success('Family member added');
      setIsAdding(false);
    }
    reset();
  };

  const startEdit = (member) => {
    setEditingMember(member);
    setValue('family_member_name', member.family_member_name);
    setValue('relationship', member.relationship);
    setValue('contact_number', member.contact_number);
    setValue('address', member.address);
    setValue('nic', member.nic);
    setValue('emergency_contact', member.emergency_contact);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingMember(null);
    reset();
  };

  const handleDeleteMember = (member) => {
    if (member.isExisting && !member.isNew) {
      setDeletingMember(member);
      setShowDeleteDialog(true);
    } else {
      setMembers(members.filter(m => m !== member));
      toast.success('Family member removed');
    }
  };

  const confirmDelete = async () => {
    if (deletingMember && deletingMember.familyId) {
      const success = await onDeleteMember(deletingMember);
      if (success) {
        setMembers(members.filter(m => m.familyId !== deletingMember.familyId));
      }
    }
    setShowDeleteDialog(false);
    setDeletingMember(null);
  };

  const handleNext = () => {
    const membersToUpdate = members.filter(m => m.isExisting && m.isModified);
    const membersToAdd = members.filter(m => m.isNew);
    
    onNext({ membersToUpdate, membersToAdd });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Manage Family Members</h3>
        <p className="text-sm text-muted-foreground">
          Update existing family members or add new contacts.
        </p>
      </div>

      {/* Existing Family Members */}
      {members.length > 0 && (
        <div className="space-y-3">
          <Label>Family Members ({members.length})</Label>
          {members.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{member.family_member_name}</h4>
                      <Badge variant="outline">{member.relationship}</Badge>
                      {member.emergency_contact && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Emergency Contact
                        </Badge>
                      )}
                      {member.isNew && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                      {member.isModified && (
                        <Badge variant="outline" className="text-xs">Modified</Badge>
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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(member)}
                      disabled={editingMember === member}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMember(member)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Add Form */}
      {(isAdding || editingMember) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
            </CardTitle>
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
                    cancelEdit();
                    reset();
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  {editingMember ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {!isAdding && !editingMember && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Family Member
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this family member? This action cannot be undone.
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
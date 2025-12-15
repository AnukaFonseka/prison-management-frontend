// src/app/(dashboard)/prisoners/[id]/edit/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { 
  getPrisonerById,
  updatePrisoner, 
  uploadPrisonerPhoto,
  deletePrisonerPhoto,
  addBodyMark,
  updateBodyMark,
  deleteBodyMark,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember
} from '@/lib/api/prisoners';
import { getAllPrisons } from '@/lib/api/prisons';
import BasicDetailsStep from '@/components/prisoners/steps/BasicDetailsStep';
import EditPhotosStep from '@/components/prisoners/steps/EditPhotosStep';
import EditBodyMarksStep from '@/components/prisoners/steps/EditBodyMarksStep';
import EditFamilyMembersStep from '@/components/prisoners/steps/EditFamilyMembersStep';

const STEPS = [
  { id: 1, name: 'Basic Details', description: 'Prisoner information' },
  { id: 2, name: 'Photos', description: 'Manage photos' },
  { id: 3, name: 'Body Marks', description: 'Identification marks' },
  { id: 4, name: 'Family Members', description: 'Emergency contacts' },
];

export default function EditPrisonerPage() {
  const router = useRouter();
  const params = useParams();
  const prisonerId = params.id;
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prisons, setPrisons] = useState([]);
  const [prisoner, setPrisoner] = useState(null);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.MANAGE_PRISONERS)) {
      toast.error('You do not have permission to edit prisoners');
      router.push('/prisoners');
      return;
    }

    loadData();
  }, [prisonerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prisonerResponse, prisonsResponse] = await Promise.all([
        getPrisonerById(prisonerId),
        getAllPrisons({ limit: 100 })
      ]);
      
      setPrisoner(prisonerResponse.data);
      setPrisons(prisonsResponse.data.filter(p => p.isActive));
    } catch (error) {
      toast.error('Failed to load prisoner data');
      console.error(error);
      router.push('/prisoners');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Update basic details
  const handleBasicDetailsNext = async (data) => {
    console.log("step 1 called")
    try {
      setSaving(true);
      await updatePrisoner(prisonerId, data);
      toast.success('Basic details updated successfully');
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update prisoner');
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Manage photos
  const handlePhotosNext = async (newPhotos) => {
    if (newPhotos.length === 0) {
      setCurrentStep(3);
      return;
    }

    try {
      setSaving(true);
      
      for (const photo of newPhotos) {
        await uploadPrisonerPhoto(prisonerId, photo.file, photo.type);
      }
      
      toast.success(`${newPhotos.length} photo(s) uploaded successfully`);
      await loadData(); // Reload to get updated photos
      setCurrentStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    try {
      await deletePrisonerPhoto(prisonerId, photo.photoId);
      toast.success('Photo deleted successfully');
      await loadData(); // Reload to update the list
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete photo');
      return false;
    }
  };

  // Step 3: Manage body marks
  const handleBodyMarksNext = async ({ marksToUpdate, marksToAdd }) => {
    try {
      setSaving(true);
      
      // Update existing marks
      for (const mark of marksToUpdate) {
        await updateBodyMark(prisonerId, mark.markId, {
          mark_description: mark.description,
          mark_location: mark.location
        });
      }
      
      // Add new marks
      for (const mark of marksToAdd) {
        await addBodyMark(prisonerId, {
          mark_description: mark.description,
          mark_location: mark.location
        });
      }
      
      if (marksToUpdate.length > 0 || marksToAdd.length > 0) {
        toast.success('Body marks updated successfully');
      }
      
      setCurrentStep(4);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update body marks');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBodyMark = async (mark) => {
    try {
      await deleteBodyMark(prisonerId, mark.markId);
      toast.success('Body mark deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete body mark');
      return false;
    }
  };

  // Step 4: Manage family members
  const handleFamilyMembersNext = async ({ membersToUpdate, membersToAdd }) => {
    try {
      setSaving(true);
      
      // Update existing members
      for (const member of membersToUpdate) {
        await updateFamilyMember(prisonerId, member.familyId, {
          family_member_name: member.family_member_name,
          relationship: member.relationship,
          contact_number: member.contact_number,
          address: member.address,
          nic: member.nic,
          emergency_contact: member.emergency_contact
        });
      }
      
      // Add new members
      for (const member of membersToAdd) {
        await addFamilyMember(prisonerId, {
          family_member_name: member.family_member_name,
          relationship: member.relationship,
          contact_number: member.contact_number,
          address: member.address,
          nic: member.nic,
          emergency_contact: member.emergency_contact
        });
      }
      
      toast.success('Prisoner updated successfully!');
      
      setTimeout(() => {
        router.push('/prisoners');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update family members');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFamilyMember = async (member) => {
    try {
      await deleteFamilyMember(prisonerId, member.familyId);
      toast.success('Family member deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete family member');
      return false;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateProgress = () => {
    return ((currentStep - 1) / (STEPS.length - 1)) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!prisoner) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Prisoner not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/prisoners')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Prisoner</h1>
          <p className="text-muted-foreground">
            {prisoner.fullName} - {prisoner.caseNumber}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Progress value={calculateProgress()} className="h-2" />
            
            {/* Steps Indicator */}
            <div className="grid grid-cols-4 gap-4">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-center ${
                    step.id < currentStep
                      ? 'text-primary'
                      : step.id === currentStep
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step.id < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step.id === currentStep
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="text-sm font-medium">{step.name}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStep} of {STEPS.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <BasicDetailsStep
              initialData={{
                full_name: prisoner.fullName,
                nic: prisoner.nic,
                case_number: prisoner.caseNumber,
                gender: prisoner.gender,
                birthday: prisoner.birthday,
                nationality: prisoner.nationality,
                admission_date: prisoner.admissionDate,
                expected_release_date: prisoner.expectedReleaseDate,
                prison_id: prisoner.prison?.prisonId,
                cell_number: prisoner.cellNumber,
                social_status: prisoner.socialStatus,
              }}
              prisons={prisons}
              onNext={handleBasicDetailsNext}
              isLoading={saving}
            />
          )}

          {currentStep === 2 && (
            <EditPhotosStep
              existingPhotos={prisoner.photos || []}
              onNext={handlePhotosNext}
              onBack={handleBack}
              onDeletePhoto={handleDeletePhoto}
              isLoading={saving}
            />
          )}

          {currentStep === 3 && (
            <EditBodyMarksStep
              existingMarks={prisoner.bodyMarks || []}
              onNext={handleBodyMarksNext}
              onBack={handleBack}
              onDeleteMark={handleDeleteBodyMark}
              isLoading={saving}
            />
          )}

          {currentStep === 4 && (
            <EditFamilyMembersStep
              existingMembers={prisoner.familyDetails || []}
              onNext={handleFamilyMembersNext}
              onBack={handleBack}
              onDeleteMember={handleDeleteFamilyMember}
              isLoading={saving}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// src/app/(dashboard)/prisoners/add/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/utils/constants';
import { 
  createPrisoner, 
  uploadPrisonerPhoto, 
  addBodyMark, 
  addFamilyMember 
} from '@/lib/api/prisoners';
import { getAllPrisons } from '@/lib/api/prisons';
import BasicDetailsStep from '@/components/prisoners/steps/BasicDetailsStep';
import PhotosStep from '@/components/prisoners/steps/PhotosStep';
import BodyMarksStep from '@/components/prisoners/steps/BodyMarksStep';
import FamilyMembersStep from '@/components/prisoners/steps/FamilyMembersStep';

const STEPS = [
  { id: 1, name: 'Basic Details', description: 'Prisoner information' },
  { id: 2, name: 'Photos', description: 'Upload photos' },
  { id: 3, name: 'Body Marks', description: 'Identification marks' },
  { id: 4, name: 'Family Members', description: 'Emergency contacts' },
];

export default function AddPrisonerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prisons, setPrisons] = useState([]);
  
  // Store data from each step
  const [prisonerId, setPrisonerId] = useState(null);
  const [basicDetails, setBasicDetails] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [bodyMarks, setBodyMarks] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    // Check permissions
    if (!hasPermission(PERMISSIONS.MANAGE_PRISONERS)) {
      toast.error('You do not have permission to add prisoners');
      router.push('/prisoners');
      return;
    }

    loadPrisons();
  }, []);

  const loadPrisons = async () => {
    try {
      const response = await getAllPrisons({ limit: 100 });
      setPrisons(response.data.filter(p => p.isActive));
    } catch (error) {
      toast.error('Failed to load prisons');
      console.error(error);
    }
  };

  // Step 1: Create prisoner with basic details
  const handleBasicDetailsNext = async (data) => {
    try {
      setLoading(true);
      const response = await createPrisoner(data);
      setPrisonerId(response.data.prisonerId);
      setBasicDetails(data);
      setCurrentStep(2);
      toast.success('Prisoner created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create prisoner');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Upload photos
  const handlePhotosNext = async (photosList) => {
    if (photosList.length === 0) {
      setCurrentStep(3);
      return;
    }

    try {
      setLoading(true);
      
      // Upload each photo
      for (const photo of photosList) {
        await uploadPrisonerPhoto(prisonerId, photo.file, photo.type);
      }
      
      setPhotos(photosList);
      setCurrentStep(3);
      toast.success(`${photosList.length} photo(s) uploaded successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Add body marks
  const handleBodyMarksNext = async (marksList) => {
    if (marksList.length === 0) {
      setCurrentStep(4);
      return;
    }

    try {
      setLoading(true);
      
      // Add each body mark
      for (const mark of marksList) {
        await addBodyMark(prisonerId, mark);
      }
      
      setBodyMarks(marksList);
      setCurrentStep(4);
      toast.success(`${marksList.length} body mark(s) added successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add body marks');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Add family members and complete
  const handleFamilyMembersNext = async (membersList) => {
    try {
      setLoading(true);
      
      // Add each family member
      if (membersList.length > 0) {
        for (const member of membersList) {
          await addFamilyMember(prisonerId, member);
        }
      }
      
      setFamilyMembers(membersList);
      
      toast.success('Prisoner registration completed successfully!');
      
      // Redirect to prisoner details or list
      setTimeout(() => {
        router.push('/prisoners');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add family members');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Add New Prisoner</h1>
          <p className="text-muted-foreground">
            Complete all steps to register a new prisoner
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
              initialData={basicDetails}
              prisons={prisons}
              onNext={handleBasicDetailsNext}
              isLoading={loading}
            />
          )}

          {currentStep === 2 && (
            <PhotosStep
              onNext={handlePhotosNext}
              onBack={handleBack}
              isLoading={loading}
            />
          )}

          {currentStep === 3 && (
            <BodyMarksStep
              onNext={handleBodyMarksNext}
              onBack={handleBack}
              isLoading={loading}
            />
          )}

          {currentStep === 4 && (
            <FamilyMembersStep
              onNext={handleFamilyMembersNext}
              onBack={handleBack}
              isLoading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-2 text-sm text-muted-foreground">
            <div className="flex-shrink-0">💡</div>
            <div>
              <p className="font-medium mb-1">Registration Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All fields marked with <span className="text-red-500">*</span> are required</li>
                <li>You can go back to edit previous steps</li>
                <li>Photos and body marks help with accurate identification</li>
                <li>Emergency contact information is important for notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
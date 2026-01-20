'use client';

import { useOnboarding } from '@/hooks/useOnboarding';
import { ProgressIndicator } from './ProgressIndicator';
import { Step1HeightWeight } from './steps/Step1HeightWeight';
import { Step2AgeGender } from './steps/Step2AgeGender';
import { Step3Goal } from './steps/Step3Goal';
import { Step4Schedule } from './steps/Step4Schedule';
import { Step5Equipment } from './steps/Step5Equipment';
import { Step6Budget } from './steps/Step6Budget';
import { Step7DislikedFoods } from './steps/Step7DislikedFoods';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export function OnboardingWizard() {
  const {
    currentStep,
    totalSteps,
    formData,
    error,
    isLoading,
    isInitialized,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    submitProfile,
  } = useOnboarding();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20 animate-pulse" />
          <Sparkles className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-center">Creating your profile...</h2>
        <p className="text-muted-foreground text-center">
          Setting up your personalized fitness journey
        </p>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1HeightWeight formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2AgeGender formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Goal formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Schedule formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5Equipment formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6Budget formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <Step7DislikedFoods formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with progress */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 px-4 py-4 border-b">
        <div className="max-w-md mx-auto">
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          {renderStep()}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 py-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="h-12 px-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            onClick={isLastStep ? submitProfile : goToNextStep}
            className="flex-1 h-12 text-base font-medium"
          >
            {isLastStep ? (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

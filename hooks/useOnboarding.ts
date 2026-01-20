'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  OnboardingFormData,
  initialFormData,
  stepValidators,
  convertToProfileData,
  ProfileData,
} from '@/lib/validation/profile';

const STORAGE_KEY = 'ironplate_onboarding_progress';
const TOTAL_STEPS = 7;

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function useOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          setFormData(parsed.formData);
        }
        if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= TOTAL_STEPS) {
          setCurrentStep(parsed.currentStep);
        }
      } catch (e) {
        console.error('Failed to parse saved onboarding progress:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ formData, currentStep })
      );
    }
  }, [formData, currentStep, isInitialized]);

  const updateFormData = useCallback((updates: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const validator = stepValidators[currentStep - 1];
    const validationError = validator(formData);
    if (validationError) {
      setError(validationError);
      return false;
    }
    setError(null);
    return true;
  }, [currentStep, formData]);

  const goToNextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      return false;
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      return true;
    }
    return false;
  }, [currentStep, validateCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
      return true;
    }
    return false;
  }, [currentStep]);

  const submitProfile = useCallback(async () => {
    if (!validateCurrentStep()) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to complete onboarding');
        setIsLoading(false);
        return false;
      }

      const profileData: ProfileData = convertToProfileData(formData);

      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('users')
          .update({
            profile_data: profileData as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            profile_data: profileData as unknown as Record<string, unknown>,
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Clear localStorage on success
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to dashboard (AI plan generation will be triggered there)
      router.push('/dashboard');
      return true;
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save your profile. Please try again.');
      setIsLoading(false);
      return false;
    }
  }, [formData, router, validateCurrentStep]);

  const resetProgress = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    formData,
    error,
    isLoading,
    isInitialized,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    submitProfile,
    resetProgress,
  };
}

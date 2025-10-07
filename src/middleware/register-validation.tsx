import { validateDateOfBirth as validateDateOfBirthRegister } from '@/lib/validation/dateOfBirth';
import { validateBasicInfoForRegister } from '@/lib/validation/basicInfo';
import { validateIdentitiesForRegister } from '@/lib/validation/identities';
import { validatePhotos as validatePhotosShared } from '@/lib/validation/photos';

// Date of birth validation: no future dates, minimum 18 years old
export const validateDateOfBirth = (dateString: string): { isValid: boolean; message?: string } => {
  return validateDateOfBirthRegister(dateString);
};

// Step 1 Validation
export const validateBasicInfo = (data: {
  name: string;
  dateOfBirth: string;
  location: string;
  city: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  return validateBasicInfoForRegister(data);
};

// Step 2 Validation
export const validateIdentitiesAndInterests = (data: {
  sexualIdentities: string;
  sexualPreferences: string;
  racialPreferences: string;
  meetingInterests: string;
}) => {
  return validateIdentitiesForRegister(data);
};

// Step 3 Validation
export const validatePhotos = (photos: string[]) => {
  // Register อนุญาตได้มากสุด 5 รูป
  return validatePhotosShared(photos, { min: 2, max: 5, allowBlob: true });
};

// Complete registration validation
export const validateCompleteRegistration = (formData: unknown) => {
  const step1 = validateBasicInfo(formData as { name: string; dateOfBirth: string; location: string; city: string; username: string; email: string; password: string; confirmPassword: string });
  const step2 = validateIdentitiesAndInterests(formData as { sexualIdentities: string; sexualPreferences: string; racialPreferences: string; meetingInterests: string });
  const step3 = validatePhotos((formData as { photos: string[] }).photos);

  return {
    isValid: step1.isValid && step2.isValid && step3.isValid,
    errors: {
      ...step1.errors,
      ...step2.errors,
      ...step3.errors
    }
  };
};
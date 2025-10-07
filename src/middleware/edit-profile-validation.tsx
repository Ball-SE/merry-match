import { validateBasicInfoForEdit } from '@/lib/validation/basicInfo';
import { validateIdentitiesAndInterestsForEdit } from '@/lib/validation/identities';
import { validatePhotos as validatePhotosShared } from '@/lib/validation/photos';

// Date of birth validation: no future dates, minimum 18 years old
export const validateDateOfBirth = (dateString: string): { isValid: boolean; message?: string } => {
  if (!dateString) {
    return { isValid: false, message: 'Date of birth is required' };
  }

  // Parse the date - assuming format is YYYY-MM-DD (HTML date input format)
  const selectedDate = new Date(dateString);
  const today = new Date();

  // Check if date is valid
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }

  // Check if date is in the future
  if (selectedDate > today) {
    return { isValid: false, message: 'Users cannot select the current date or any future dates.' };
  }

  // Check if date is today
  const todayStr = today.toISOString().split('T')[0];
  const selectedStr = selectedDate.toISOString().split('T')[0];
  if (selectedStr === todayStr) {
    return { isValid: false, message: 'The minimum age for registration is 18 years old.' };
  }

  // Check minimum age (18 years)
  const age = today.getFullYear() - selectedDate.getFullYear();
  const monthDiff = today.getMonth() - selectedDate.getMonth();

  let actualAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
    actualAge = age - 1;
  }

  if (actualAge < 18) {
    return { isValid: false, message: 'The minimum age for registration is 18 years old.' };
  }

  // Check maximum age (reasonable limit to prevent invalid dates)
  if (actualAge > 120) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }

  return { isValid: true };
};

// Basic Information Validation for Edit Profile
export const validateBasicInfo = (data: {
  name: string;
  date_of_birth: string;
  location: string;
  city: string;
  username: string;
}) => {
  return validateBasicInfoForEdit(data);
};

// Identities and Interests Validation for Edit Profile
export const validateIdentitiesAndInterests = (data: {
  gender: string;
  sexual_preferences: string;
  racial_preferences: string;
  meeting_interests: string;
  bio: string;
  interests: string[];
}) => {
  return validateIdentitiesAndInterestsForEdit(data); // EDIT
};

// Photos Validation for Edit Profile
export const validatePhotos = (photos: string[]) => {
  return validatePhotosShared(photos, { min: 2, max: 5, allowBlob: true }); // EDIT
};

// Username validation with Supabase check (for edit profile)
export const validateUsername = async (username: string, currentUsername?: string): Promise<{ isValid: boolean; message?: string }> => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }

  // Basic username format validation
  if (username.length < 6) {
    return { isValid: false, message: 'Username must be at least 6 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }

  // If username hasn't changed, it's valid
  if (currentUsername && username === currentUsername) {
    return { isValid: true };
  }

  try {
    // Check if username exists in Supabase
    const response = await fetch('/api/check-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    const result = await response.json();

    if (!result.isAvailable) {
      return { isValid: false, message: 'Username already exists' };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Username validation error:', error);
    return { isValid: false, message: 'Unable to verify username availability' };
  }
};

// Complete edit profile validation
export const validateEditProfile = (formData: {
  name: string;
  date_of_birth: string;
  location: string;
  city: string;
  username: string;
  gender: string;
  sexual_preferences: string;
  racial_preferences: string;
  meeting_interests: string;
  bio: string;
  interests: string[];
  photos: string[];
}) => {
  const basicInfo = validateBasicInfo({
    name: formData.name,
    date_of_birth: formData.date_of_birth,
    location: formData.location,
    city: formData.city,
    username: formData.username
  });

  const identitiesAndInterests = validateIdentitiesAndInterests({
    gender: formData.gender,
    sexual_preferences: formData.sexual_preferences,
    racial_preferences: formData.racial_preferences,
    meeting_interests: formData.meeting_interests,
    bio: formData.bio,
    interests: formData.interests
  });

  const photos = validatePhotos(formData.photos);

  return {
    isValid: basicInfo.isValid && identitiesAndInterests.isValid && photos.isValid,
    errors: {
      ...basicInfo.errors,
      ...identitiesAndInterests.errors,
      ...photos.errors
    }
  };
};
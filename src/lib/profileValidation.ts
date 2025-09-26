/**
 * Profile data validation utilities
 */

export interface ValidatedProfileData {
  id: string;
  name: string;
  age: number;
  email: string;
  username: string;
  city: string;
  gender: string;
  sexual_preferences: string;
  racial_preferences: string;
  meeting_interests: string;
  bio: string;
  interests: string[];
  photos: string[];
}

/**
 * Validates and sanitizes profile data
 * @param profileData - Raw profile data
 * @param fallbackData - Fallback data for missing fields
 * @returns Validated profile data
 */
export function validateProfileData(
  profileData: unknown,
  fallbackData: { name: string; age: string; photos: string[] }
): ValidatedProfileData {
  // Validate required fields
  if (!profileData || typeof profileData !== 'object') {
    throw new Error('Invalid profile data structure');
  }

  return {
    id: validateString(profileData.id, ''),
    name: validateString(profileData.name, fallbackData.name),
    age: validateAge(profileData.age, fallbackData.age),
    email: validateEmail(profileData.email, fallbackData.name),
    username: validateUsername(profileData.username || profileData.email, fallbackData.name),
    city: validateString(profileData.location || profileData.city, 'Bangkok, Thailand'),
    gender: validateString(profileData.gender, 'Not specified'),
    sexual_preferences: validateString(profileData.sexual_preferences, 'Not specified'),
    racial_preferences: validateString(profileData.racial_preferences, 'Not specified'),
    meeting_interests: validateString(profileData.meeting_interests, 'Not specified'),
    bio: validateString(profileData.bio, ''),
    interests: validateStringArray(profileData.interests),
    photos: validateStringArray(profileData.photos, fallbackData.photos)
  };
}

/**
 * Validates string field
 */
function validateString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

/**
 * Validates age field
 */
function validateAge(value: unknown, fallbackAge: string): number {
  const numValue = Number(value);
  if (!isNaN(numValue) && numValue > 0 && numValue < 150) {
    return numValue;
  }
  
  const fallbackNum = parseInt(fallbackAge);
  return !isNaN(fallbackNum) ? fallbackNum : 18;
}

/**
 * Validates email field
 */
function validateEmail(value: unknown, fallbackName: string): string {
  if (typeof value === 'string' && value.includes('@')) {
    return value.trim();
  }
  
  const cleanName = fallbackName.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}@example.com`;
}

/**
 * Validates username field
 */
function validateUsername(value: unknown, fallbackName: string): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    const username = value.includes('@') ? value.split('@')[0] : value;
    return username.trim();
  }
  
  return fallbackName.toLowerCase().replace(/\s+/g, '');
}

/**
 * Validates string array field
 */
function validateStringArray(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string' && item.trim().length > 0);
  }
  return fallback;
}

export function validateIdentitiesAndInterestsForEdit(data: {
    gender: string;
    sexual_preferences: string;
    racial_preferences: string;
    meeting_interests: string;
    bio: string;
    interests: string[];
  }) {
    const errors: Record<string, string> = {};
  
    if (!data.gender) errors.gender = 'Sexual identity is required';
    if (!data.sexual_preferences) errors.sexual_preferences = 'Sexual preference is required';
    if (!data.racial_preferences) errors.racial_preferences = 'Racial preference is required';
    if (!data.meeting_interests) errors.meeting_interests = 'Meeting interest is required';
  
    if (data.bio && data.bio.length > 150) errors.bio = 'Bio must be 150 characters or less';
    if (data.interests && data.interests.length > 10) errors.interests = 'Maximum 10 interests allowed';
  
    return { isValid: Object.keys(errors).length === 0, errors };
  }
  
  export function validateIdentitiesForRegister(data: {
    sexualIdentities: string;
    sexualPreferences: string;
    racialPreferences: string;
    meetingInterests: string;
  }) {
    const errors: Record<string, string> = {};
  
    if (!data.sexualIdentities) errors.sexualIdentities = 'Sexual identity is required';
    if (!data.sexualPreferences) errors.sexualPreferences = 'Sexual preference is required';
    if (!data.racialPreferences) errors.racialPreferences = 'Racial preference is required';
    if (!data.meetingInterests) errors.meetingInterests = 'Meeting interest is required';
  
    return { isValid: Object.keys(errors).length === 0, errors };
  }
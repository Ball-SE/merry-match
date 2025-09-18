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
    const errors: Record<string, string> = {};
  
    // Name validation
    if (!data.name || data.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
  
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }
  
    // Password validation
    if (!data.password || data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
  
    // Confirm password validation
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  
    // Username validation
    if (!data.username || data.username.length < 6) {
      errors.username = "Username must be at least 6 characters";
    }
  
    // Required fields
    if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!data.location) errors.location = "Location is required";
    if (!data.city) errors.city = "City is required";
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Step 2 Validation
  export const validateIdentitiesAndInterests = (data: {
    sexualIdentities: string;
    sexualPreferences: string;
    racialPreferences: string;
    meetingInterests: string;
  }) => {
    const errors: Record<string, string> = {};
  
    if (!data.sexualIdentities) errors.sexualIdentities = "Sexual identity is required";
    if (!data.sexualPreferences) errors.sexualPreferences = "Sexual preference is required";
    if (!data.racialPreferences) errors.racialPreferences = "Racial preference is required";
    if (!data.meetingInterests) errors.meetingInterests = "Meeting interest is required";
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Step 3 Validation
  export const validatePhotos = (photos: string[]) => {
    const errors: Record<string, string> = {};
  
    if (!photos || photos.length < 2) {
      errors.photos = "Please upload at least 2 photos";
    }
  
    if (photos.length > 6) {
      errors.photos = "Maximum 6 photos allowed";
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Complete registration validation
  export const validateCompleteRegistration = (formData: any) => {
    const step1 = validateBasicInfo(formData);
    const step2 = validateIdentitiesAndInterests(formData);
    const step3 = validatePhotos(formData.photos);
  
    return {
      isValid: step1.isValid && step2.isValid && step3.isValid,
      errors: {
        ...step1.errors,
        ...step2.errors,
        ...step3.errors
      }
    };
  };
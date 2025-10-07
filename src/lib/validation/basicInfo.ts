import { validateDateOfBirth } from './dateOfBirth';

export function validateBasicInfoForEdit(data: {
  name: string;
  date_of_birth: string;
  location: string;
  city: string;
  username: string;
}) {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (!/^[a-zA-Z\s]+$/.test(data.name)) errors.name = 'Name can only contain letters and spaces';

  if (!data.username || data.username.length < 6) errors.username = 'Username must be at least 6 characters';
  else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) errors.username = 'Username can only contain letters, numbers, and underscores';

  const dob = validateDateOfBirth(data.date_of_birth);
  if (!dob.isValid) errors.date_of_birth = dob.message || 'Date of birth is required';

  if (!data.location) errors.location = 'Location is required';
  if (!data.city) errors.city = 'City is required';

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateBasicInfoForRegister(data: {
  name: string;
  dateOfBirth: string;
  location: string;
  city: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (!/^[a-zA-Z\s]+$/.test(data.name)) errors.name = 'Name can only contain letters and spaces';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) errors.email = 'Please enter a valid email address';

  if (!data.password || data.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (!data.username || data.username.length < 6) errors.username = 'Username must be at least 6 characters';

  const dob = validateDateOfBirth(data.dateOfBirth);
  if (!dob.isValid) errors.dateOfBirth = dob.message || 'Date of birth is required';

  if (!data.location) errors.location = 'Location is required';
  if (!data.city) errors.city = 'City is required';

  return { isValid: Object.keys(errors).length === 0, errors };
}
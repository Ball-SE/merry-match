export function validateDateOfBirth(dateString: string): { isValid: boolean; message?: string } {
    if (!dateString) return { isValid: false, message: 'Date of birth is required' };
  
    const selectedDate = new Date(dateString);
    const today = new Date();
    if (isNaN(selectedDate.getTime())) return { isValid: false, message: 'Please enter a valid date of birth' };
    if (selectedDate > today) return { isValid: false, message: 'Users cannot select the current date or any future dates.' };
  
    const todayStr = today.toISOString().split('T')[0];
    const selectedStr = selectedDate.toISOString().split('T')[0];
    if (selectedStr === todayStr) return { isValid: false, message: 'The minimum age for registration is 18 years old.' };
  
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) ? age - 1 : age;
  
    if (actualAge < 18) return { isValid: false, message: 'The minimum age for registration is 18 years old.' };
    if (actualAge > 120) return { isValid: false, message: 'Please enter a valid date of birth' };
  
    return { isValid: true };
  }
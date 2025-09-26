import { useState, useEffect } from 'react';

interface EmailValidationResult {
  isValid: boolean;
  message?: string;
  isChecking: boolean;
}

export const useEmailValidation = (email: string, debounceMs: number = 500) => {
  const [result, setResult] = useState<EmailValidationResult>({
    isValid: false,
    isChecking: false
  });

  useEffect(() => {
    if (!email) {
      setResult({ isValid: false, isChecking: false });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResult({ 
        isValid: false, 
        message: 'Please enter a valid email address',
        isChecking: false 
      });
      return;
    }

    // Set checking state
    setResult(prev => ({ ...prev, isChecking: true }));

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch('/api/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.isAvailable) {
          setResult({
            isValid: true,
            message: 'Email is available',
            isChecking: false
          });
        } else {
          setResult({
            isValid: false,
            message: 'Email already exists',
            isChecking: false
          });
        }
      } catch (error) {
        console.error('Email validation error:', error);
        setResult({
          isValid: false,
          message: 'Unable to verify email availability',
          isChecking: false
        });
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [email, debounceMs]);

  return result;
};
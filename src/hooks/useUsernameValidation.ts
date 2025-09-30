import { useState, useEffect } from 'react';

interface UsernameValidationResult {
  isValid: boolean;
  message?: string;
  isChecking: boolean;
}

export const useUsernameValidation = (username: string, debounceMs: number = 500) => {
  const [result, setResult] = useState<UsernameValidationResult>({
    isValid: false,
    isChecking: false,
  });

  useEffect(() => {
    // ว่าง: ไม่ตรวจ
    if (!username) {
      setResult({ isValid: false, isChecking: false });
      return;
    }

    // กฎพื้นฐาน (ปรับได้ตามต้องการ)
    // - ยาว >= 6
    // - เฉพาะ a-z 0-9 _ -
    // - เริ่มต้นด้วยตัวอักษร/ตัวเลข
    const basic = /^[a-z0-9][a-z0-9_-]{5,}$/i;
    if (!basic.test(username)) {
      setResult({
        isValid: false,
        message: 'Minimum 6 chars; only letters, numbers, _ and -',
        isChecking: false,
      });
      return;
    }

    setResult(prev => ({ ...prev, isChecking: true }));

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();

        if (data.isAvailable) {
          setResult({ isValid: true, message: 'Username is available', isChecking: false });
        } else {
          setResult({ isValid: false, message: 'Username already exists', isChecking: false });
        }
      } catch (e) {
        setResult({
          isValid: false,
          message: 'Unable to verify username',
          isChecking: false,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [username, debounceMs]);

  return result;
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateEmail = (email: string) => {
  if (!email || !emailRegex.test(email)) {
    return false;
  }
  return true;
}
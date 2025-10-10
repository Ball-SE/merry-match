import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/supabaseClient';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)

  useEffect(() => {
    // ตรวจสอบว่ามี session หรือไม่ (จาก reset link)
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        setErrorMsg('Invalid or expired reset link. Please request a new password reset.')
      }
    }
    checkSession()
  }, [])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    return null
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setErrorMsg(null)
    setPasswordError(null)
    setConfirmPasswordError(null)

    // Validate password
    const passwordValidation = validatePassword(password)
    if (passwordValidation) {
      setPasswordError(passwordValidation)
      setLoading(false)
      return
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // ใช้ Supabase updateUser โดยตรง
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setErrorMsg(error.message || 'Failed to update password')
      } else {
        setMessage('Password updated successfully! Redirecting to login...')
        
        // Sign out user เพื่อให้ต้อง login ใหม่ด้วย password ใหม่
        await supabase.auth.signOut()
        
        // Redirect ไปหน้า login หลังจาก 2 วินาที
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setErrorMsg('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FCFCFE] flex flex-col sm:flex-row">
      {/* Mobile: Image at top, Desktop: Image on left */}
      <div className="flex items-start justify-center pt-4 pb-0 px-4 sm:items-center sm:p-8 order-1 sm:order-1 mt-6 sm:mt-0 mb-9 sm:mb-0">
        <div className="relative">
          {/* Main image */}
          <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px]">
            <Image
              src="/assets/image3.png"
              alt="Merry Match"
              width={500}
              height={500}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          
          {/* Decorative circles - hidden on mobile, visible on sm and up */}
          <div className="hidden sm:block absolute -top-0 -left-12 w-20 h-20 bg-[#FAF1ED] rounded-full"></div>
          <div className="hidden sm:block absolute top-25 left-7 w-2 h-2 bg-[#7B4429] rounded-full"></div>
        </div>
      </div>

      {/* Mobile: Form below image, Desktop: Form on right */}
      <div className="flex-none flex items-start justify-center pt-0 pb-4 px-4 sm:flex-1 sm:items-center sm:p-8 order-2 sm:order-2">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 sm:mb-8">
            <h2 className="text-[#7B4429] text-sm font-medium mb-2">RESET PASSWORD</h2>
            <h1 className="text-[#A62D82] text-3xl sm:text-4xl font-bold mb-2">Create new password</h1>
          </div>

          {/* Success message */}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Error message for invalid link */}
          {errorMsg && !password && !confirmPassword && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Reset Password form */}
          {!errorMsg && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A62D82] focus:border-transparent outline-none transition-all ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A62D82] focus:border-transparent outline-none transition-all ${
                    confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="button-primary w-full bg-[#C70039] hover:bg-[#FF1659] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>

              {/* Form Error message */}
              {errorMsg && (password || confirmPassword) && (
                <div className="text-center">
                  <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
                </div>
              )}
            </form>
          )}

          {/* Back to login link */}
          <div className="mt-8 sm:mt-6 text-center">
            <button 
              type="button"
              onClick={() => router.push('/login')}
              className="flex justify-center items-center text-[#C70039] hover:text-[#FF1659] font-medium bg-transparent border-none cursor-pointer underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

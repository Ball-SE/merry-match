import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import Image from 'next/image';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null)
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null)

  const handleSendResetEmail = async (e: FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setForgotPasswordMessage(null)
    setForgotPasswordError(null)

    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address')
      setForgotPasswordLoading(false)
      return
    }

    // ตรวจสอบว่า input เป็น email หรือ username
    let resetEmail = forgotPasswordEmail
    const isEmail = forgotPasswordEmail.includes('@')

    try {
      if (!isEmail) {
        // ถ้าเป็น username ให้ค้นหา email จาก profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', forgotPasswordEmail)
          .single()

        if (profileError || !profileData) {
          setForgotPasswordError('Username not found')
          setForgotPasswordLoading(false)
          return
        }

        resetEmail = profileData.email
      }

      // ใช้ Supabase reset password โดยตรง
      // ใช้ environment variable สำหรับ production URL หรือ fallback เป็น current host
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${window.location.protocol}//${window.location.host}`
      const redirectUrl = `${baseUrl}/reset-password`
      console.log('Reset password redirect URL:', redirectUrl) // Debug log
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl
      })

      if (error) {
        setForgotPasswordError(error.message || 'Failed to send reset email')
      } else {
        setForgotPasswordMessage('Password reset email sent! Please check your inbox.')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setForgotPasswordError('An error occurred. Please try again.')
    }

    setForgotPasswordLoading(false)
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
            <h2 className="text-[#7B4429] text-sm font-medium mb-2">FORGOT PASSWORD</h2>
            <h1 className="text-[#A62D82] text-3xl sm:text-4xl font-bold mb-2">Reset your password</h1>
            <p className="text-gray-700 text-sm mt-4">
              Enter your email or username.
            </p>
            <p className="text-gray-700 text-sm mt-4">
              We&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Success message */}
          {forgotPasswordMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">{forgotPasswordMessage}</p>
            </div>
          )}

          {/* Forgot Password form */}
          <form onSubmit={handleSendResetEmail} className="space-y-6">
            <div>
              <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="forgotEmail"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your username or email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={forgotPasswordLoading}
              className="button-primary w-full bg-[#C70039] hover:bg-[#FF1659] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
            </button>

            {/* Error message */}
            {forgotPasswordError && (
              <div className="text-center">
                <p className="text-red-500 text-sm font-medium">{forgotPasswordError}</p>
              </div>
            )}
          </form>

          {/* Back to login */}
          <div className="mt-8 sm:mt-6 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
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

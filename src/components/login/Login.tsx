import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/supabaseClient';
import { validateEmail } from '@/middleware/validation';
import Image from 'next/image';
import ForgotPassword from './ForgotPassword';
import { useAuthContext } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { isLoggedIn } = useAuthContext();
  
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setEmailError(null)

    // ปรับ validation ให้รองรับทั้ง email และ username
    const isEmail = email.includes('@');
    
    if (isEmail && !validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      setLoading(false)
      return
    }
    
    if (!isEmail && email.length < 6) {
      setEmailError('Username must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      setLoading(false)
      if (!result.success) {
        setErrorMsg(result.message || "Invalid username/email or password")
      } else {
        console.log('login ok', result)
        // Set the session in the client
        if (result.session && result.session.access_token && result.session.refresh_token) {
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token
          })
        }
        // The useEffect will redirect the user when auth state changes
        // ตรวจสอบ admin role และ redirect
        if (result.user?.app_metadata?.is_admin === true) {
          router.replace('/admin')
        } else {
          router.replace('/')
        }
      }
    } catch (error) {
      setLoading(false)
      setErrorMsg("An error occurred. Please try again.")
      console.error('Login error:', error)
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
    setErrorMsg(null)
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
  }

  // ถ้าแสดง forgot password ให้ใช้ ForgotPassword component
  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />
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
          {/* Login header */}
          <div className="mb-8 sm:mb-8">
            <h2 className="text-[#7B4429] text-sm font-medium mb-2">LOGIN</h2>
            <h1 className="text-[#A62D82] text-3xl sm:text-5xl font-bold">Welcome back to</h1>
            <h1 className="text-[#A62D82] text-3xl sm:text-5xl font-bold">Merry Match</h1>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-8 sm:space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Username or Email"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A62D82] focus:border-transparent outline-none transition-all ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62D82] focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="button-primary w-full bg-[#C70039] hover:bg-[#FF1659] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>

            {/* Error message - centered */}
            {errorMsg && (
              <div className="text-center">
                <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
              </div>
            )}
          </form>

          {/* Register and Forgot Password links */}
          <div className="mt-8 sm:mt-6">
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              {/* Register link */}
              <div>
                <span className="text-gray-600">Don&apos;t have an account? </span>
                <button 
                  type="button"
                  onClick={() => router.push('/register')}
                  className="text-[#C70039] hover:text-[#FF1659] font-medium bg-transparent border-none cursor-pointer underline"
                >
                  Register
                </button>
              </div>

              {/* Forgot Password link */}
              <div className="sm:text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#C70039] hover:text-[#FF1659] font-medium bg-transparent border-none cursor-pointer underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClient';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { CustomDatePicker } from '@/components/register/date-picker';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';
import { validateBasicInfo } from '@/middleware/register-validation';
import { SEA_COUNTRY_OPTIONS } from '@/data/sea-countries';
import { SEA_CITIES_BY_COUNTRY } from '@/data/sea-cities';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  email: string;
  username: string;
  city: string;
  gender: string;
  sexual_preferences: string;
  racial_preferences: string;
  meeting_interests: string;
  bio: string;
  interests: string[];
  photos: string[];
  date_of_birth: string;
  location: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    location: '',
    city: '',
    username: '',
    gender: '',
    sexual_preferences: '',
    racial_preferences: '',
    meeting_interests: '',
    bio: '',
    interests: [] as string[],
    photos: [] as string[]
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Username validation
  const usernameValidation = useUsernameValidation(formData.username, 2000);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle blur for validation
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Validate specific fields
    if (field === 'name' || field === 'dateOfBirth' || field === 'location' || field === 'city' || field === 'username') {
      const validation = validateBasicInfo({
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        location: formData.location,
        city: formData.city,
        username: formData.username,
        email: '', // Not needed for edit
        password: '', // Not needed for edit
        confirmPassword: '' // Not needed for edit
      });
      
      if (!validation.isValid && validation.errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: validation.errors[field] }));
      }
    }
  };

  // ดึงข้อมูล profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error(result.message || 'Failed to fetch profile');
        }

        const profileData = result.data;
        setProfile(profileData);
        
        // Set form data
        const filteredInterests = (profileData.interests || []).filter((interest: string) => {
          const lowerInterest = interest.toLowerCase();
          return !['game', 'football', 'base', 'sing', 'song'].includes(lowerInterest);
        });

        setFormData({
          name: profileData.name || '',
          dateOfBirth: profileData.date_of_birth || '',
          location: profileData.location || '',
          city: profileData.city || '',
          username: profileData.username || '',
          gender: profileData.gender || '',
          sexual_preferences: profileData.sexual_preferences || '',
          racial_preferences: profileData.racial_preferences || '',
          meeting_interests: profileData.meeting_interests || '',
          bio: profileData.bio || '',
          interests: filteredInterests,
          photos: profileData.photos || []
        });

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);



  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // ตรวจสอบ authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please login first');
        return;
      }

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters long');
        return;
      }

      if (!formData.username || formData.username.trim().length < 6) {
        setError('Username must be at least 6 characters long');
        return;
      }

      // ส่งข้อมูลไปยัง API
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          date_of_birth: formData.dateOfBirth // Convert to API format
        })
      });

      const result = await response.json();

      if (result.success) {
        router.push('/profile');
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C70039] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/profile')}
            className="bg-[#C70039] text-white px-6 py-2 rounded-lg hover:bg-[#950028] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Main Container */}
      <div className="mx-auto px-4 md:px-8 lg:px-16 xl:px-32 py-4 md:py-10">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="px-4 md:px-12 py-6 md:py-12 border-b border-gray-100">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm text-[#7B4429] uppercase tracking-wider mb-2 md:mb-3 font-medium">PROFILE</p>
                <h1 className="text-[46px] font-extrabold text-[#A62D82] leading-[125%] tracking-[-0.02em]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Let&apos;s make profile<br />to let others know you
                </h1>
              </div>
              {/* Desktop Buttons */}
              <div className="hidden md:flex flex-row gap-2 mb-2">
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 text-[#C70039] rounded-full hover:opacity-90 transition-all duration-300 font-bold text-center leading-[150%]"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif', 
                    fontSize: '16px', 
                    letterSpacing: '0%',
                    backgroundColor: '#FFE1EA',
                    boxShadow: '2px 2px 12px 0px rgba(64, 50, 133, 0.08)'
                  }}
                >
                  Preview Profile
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-[#C70039] text-white rounded-full hover:bg-[#950028] transition-all duration-300 disabled:opacity-50 flex items-center justify-center font-bold text-center leading-[150%]"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif', 
                    fontSize: '16px', 
                    letterSpacing: '0%',
                    gap: '8px',
                    boxShadow: '2px 2px 12px 0px rgba(64, 50, 133, 0.16)'
                  }}
                >
                  {saving && <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />}
                  Update Profile
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 md:px-12 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="p-4 md:p-12">
            <div className="max-w-4xl mx-auto">
          
          {/* Basic Information */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Name */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("name")}
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base ${
                    touched.name && errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="At least 2 characters"
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Date of birth */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Date of birth</label>
                <CustomDatePicker
                  selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                  onChange={(date: Date | null) => {
                    const dateString = date ? date.toISOString().split("T")[0] : "";
                    handleInputChange({
                      target: { name: "dateOfBirth", value: dateString },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  onBlur={() => handleBlur("dateOfBirth")}
                  placeholder="Select date"
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg text-sm md:text-base ${
                    touched.dateOfBirth && errors.dateOfBirth
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:border-transparent`}
                  minDate={new Date(new Date().getFullYear() - 120, new Date().getMonth(), new Date().getDate())}
                  maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                  name="dateOfBirth"
                  id="dateOfBirth"
                  error={errors.dateOfBirth}
                  touched={touched.dateOfBirth}
                />
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Reset city when location changes
                    const resetCity = {
                      target: { name: "city", value: "" },
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleInputChange(resetCity);
                  }}
                  onBlur={() => handleBlur("location")}
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white ${
                    touched.location && errors.location
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  } ${!formData.location ? "text-gray-400" : "text-black"}`}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundImage:
                      'url(\'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6,9 12,15 18,9"%3e%3c/polyline%3e%3c/svg%3e\')',
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "16px",
                  }}
                >
                  <option value="">
                    {!formData.location ? "Thailand" : "Select location"}
                  </option>
                  {SEA_COUNTRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ color: "#000000" }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {touched.location && errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("city")}
                  disabled={!formData.location}
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white ${
                    touched.city && errors.city
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  } ${!formData.location
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : ""
                    }`}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundImage:
                      'url(\'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6,9 12,15 18,9"%3e%3c/polyline%3e%3c/svg%3e\')',
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "16px",
                  }}
                >
                  <option value="">
                    {!formData.location ? "Bangkok" : "Select city"}
                  </option>
                  {(SEA_CITIES_BY_COUNTRY[formData.location] || []).map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {touched.city && errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("username")}
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base ${
                    touched.username && errors.username
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="At least 6 characters"
                />
                {touched.username && errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
                {touched.username && (
                  <div className="mt-2 flex items-center gap-2">
                    {usernameValidation.isChecking && (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                        <span className="text-sm text-yellow-600">Checking availability...</span>
                      </>
                    )}
                    {!usernameValidation.isChecking && usernameValidation.isValid && (
                      <>
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-green-600">Username is available</span>
                      </>
                    )}
                    {!usernameValidation.isChecking && !usernameValidation.isValid && usernameValidation.message && (
                      <>
                        <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                          <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-red-600">{usernameValidation.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg text-sm md:text-base bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="name@website.com"
                />
              </div>
            </div>
          </div>

          {/* Identities and Interests */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Identities and Interests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Sexual Identity */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Sexual Identity</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="">Male</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="LGBTQ+">LGBTQ+</option>
                </select>
              </div>

              {/* Sexual preferences */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Sexual preferences</label>
                <select
                  name="sexual_preferences"
                  value={formData.sexual_preferences}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="">Female</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="LGBTQ+">LGBTQ+</option>
                </select>
              </div>

              {/* Racial preferences */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Racial preferences</label>
                <select
                  name="racial_preferences"
                  value={formData.racial_preferences}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="">Asian</option>
                  <option value="Asian">Asian</option>
                  <option value="Caucasian">Caucasian</option>
                  <option value="African">African</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Meeting interests */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Meeting interests</label>
                <select
                  name="meeting_interests"
                  value={formData.meeting_interests}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="">Friends</option>
                  <option value="Friends">Friends</option>
                  <option value="Dating">Dating</option>
                  <option value="Relationship">Long-term relationship</option>
                  <option value="Casual">Casual dating</option>
                </select>
              </div>
            </div>

            {/* Hobbies and Interests */}
            <div className="mt-6 md:mt-8">
              <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Hobbies and Interests (Choose up to 10)</label>
              <input
                type="text"
                value={formData.interests.join(', ')}
                onChange={(e) => {
                  const interests = e.target.value.split(', ').filter(item => item.trim() !== '');
                  setFormData(prev => ({ ...prev, interests }));
                }}
                className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base"
                placeholder="Photography, Cooking, Gym, Music..."
              />
            </div>

            {/* About me */}
            <div className="mt-6 md:mt-8">
              <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">
                About me (150 Characters)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={150}
                rows={4}
                className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent resize-none text-sm md:text-base"
                placeholder="I really looking for new..."
              />
              <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                {formData.bio.length}/150 characters
              </p>
            </div>
          </div>

          {/* Profile Pictures */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Profile pictures</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">Upload at least 2 photos</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square">
                  {formData.photos[index] ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.photos[index]}
                        alt={`Profile ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                      />
                      <button
                        onClick={() => {
                          const newPhotos = [...formData.photos];
                          newPhotos.splice(index, 1);
                          setFormData(prev => ({ ...prev, photos: newPhotos }));
                        }}
                        className="absolute -top-1 md:-top-2 -right-1 md:-right-2 w-6 md:w-7 h-6 md:h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm hover:bg-red-600 shadow-lg"
                      >
                        <X className="w-3 md:w-4 h-3 md:h-4" />
                      </button>
                    </div>
                  ) : (
                    <button className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-[#C70039] hover:text-[#C70039] transition-colors">
                      <Upload className="w-8 md:w-10 h-8 md:h-10 mb-2 md:mb-3" />
                      <span className="text-xs md:text-base font-medium">Upload photo</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="mb-8 md:mb-10 flex md:hidden flex-row gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex-1 px-6 py-3 text-[#C70039] rounded-full transition-all duration-300 font-bold text-center leading-[150%]"
              style={{ 
                fontFamily: 'Nunito, sans-serif', 
                fontSize: '16px', 
                letterSpacing: '0%',
                backgroundColor: '#FFE1EA',
                boxShadow: '2px 2px 12px 0px rgba(64, 50, 133, 0.08)'
              }}
            >
              Preview Profile
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#C70039] text-white rounded-full hover:bg-[#950028] transition-all duration-300 disabled:opacity-50 flex items-center justify-center font-bold text-center leading-[150%]"
              style={{ 
                fontFamily: 'Nunito, sans-serif', 
                fontSize: '16px', 
                letterSpacing: '0%',
                gap: '8px',
                boxShadow: '2px 2px 12px 0px rgba(64, 50, 133, 0.16)'
              }}
            >
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
              Update Profile
            </button>
          </div>

          {/* Delete Account */}
          <div className="pt-6 md:pt-8 border-t border-gray-200 flex justify-center md:justify-end">
            <button className="text-gray-500 hover:text-gray-700 text-sm md:text-base font-medium">
              Delete account
            </button>
          </div>

            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClient';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { validateEditProfile, validateUsername } from '@/middleware/edit-profile-validation';

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
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    location: 'Thailand',
    city: 'Bangkok',
    username: '',
    email: '',
    gender: 'Male',
    sexual_preferences: 'Female',
    racial_preferences: 'Asian',
    meeting_interests: 'Friends',
    bio: '',
    interests: [] as string[],
    photos: [] as string[]
  });

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
          date_of_birth: profileData.date_of_birth || '',
          location: profileData.location || 'Thailand',
          city: profileData.city || 'Bangkok',
          username: profileData.username || '',
          email: profileData.email || '',
          gender: profileData.gender || 'Male',
          sexual_preferences: profileData.sexual_preferences || 'Female',
          racial_preferences: profileData.racial_preferences || 'Asian',
          meeting_interests: profileData.meeting_interests || 'Friends',
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

  // Handle input changes
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Real-time validation for specific fields
  const validateField = async (field: string, value: string) => {
    if (field === 'username' && value.length >= 6) {
      const validation = await validateUsername(value, profile?.username);
      if (!validation.isValid) {
        setFieldErrors(prev => ({ ...prev, [field]: validation.message || '' }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };


  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setValidationErrors({});
    
    try {
      // Validate form data
      const validation = validateEditProfile(formData);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setSaving(false);
        return;
      }

      // Additional username validation if changed
      if (formData.username !== profile?.username) {
        const usernameValidation = await validateUsername(formData.username, profile?.username);
        if (!usernameValidation.isValid) {
          setValidationErrors({ username: usernameValidation.message || 'Username validation failed' });
          setSaving(false);
          return;
        }
      }

      // Get session for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Call API to update profile
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('❌ API Error:', result);
        throw new Error(result.message || 'Failed to update profile');
      }

      const result = await response.json();
      
      // Show success message
      setSuccess('Profile updated successfully!');
      
      // Update local profile state
      setProfile(result.data);
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
      setError(errorMessage);
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
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm text-[#7B4429] uppercase tracking-wider mb-2 md:mb-3 font-medium">PROFILE</p>
                <h1 className="text-[46px] font-extrabold text-[#A62D82] leading-[125%] tracking-[-0.02em]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Let&apos;s make profile<br />to let others know you
                </h1>
              </div>
              {/* Desktop Buttons */}
              <div className="hidden md:flex flex-row gap-3 md:gap-4">
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 md:px-8 py-3 md:py-3.5 border-2 border-[#C70039] text-[#C70039] rounded-lg md:rounded-xl hover:bg-pink-50 transition-colors text-sm md:text-base font-semibold"
                >
                  Preview Profile
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 md:px-8 py-3 md:py-3.5 bg-[#C70039] text-white rounded-lg md:rounded-xl hover:bg-[#950028] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base font-semibold"
                >
                  {saving && <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />}
                  Update Profile
                </button>
              </div>
            </div>
          </div>

        {/* Form Content */}
        <div className="p-4 md:p-12">
          <div className="max-w-4xl mx-auto">
          
          {/* Global Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Please fix the following errors:</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(validationErrors).map(([field, message]) => (
                  <li key={field} className="text-sm">{message}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Basic Information */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Name */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base ${
                    validationErrors.name || fieldErrors.name 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="At least 2 character"
                />
                {(validationErrors.name || fieldErrors.name) && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name || fieldErrors.name}</p>
                )}
              </div>

              {/* Date of birth */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Date of birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base ${
                    validationErrors.date_of_birth || fieldErrors.date_of_birth 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                />
                {(validationErrors.date_of_birth || fieldErrors.date_of_birth) && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date_of_birth || fieldErrors.date_of_birth}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="Thailand">Thailand</option>
                  <option value="Bangkok">Bangkok</option>
                  <option value="Chiang Mai">Chiang Mai</option>
                  <option value="Phuket">Phuket</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="Bangkok">Bangkok</option>
                  <option value="Chiang Mai">Chiang Mai</option>
                  <option value="Phuket">Phuket</option>
                  <option value="Pattaya">Pattaya</option>
                </select>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    handleInputChange('username', e.target.value);
                    validateField('username', e.target.value);
                  }}
                  className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base ${
                    validationErrors.username || fieldErrors.username 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="At least 6 character"
                />
                {(validationErrors.username || fieldErrors.username) && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.username || fieldErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm md:text-base cursor-not-allowed"
                  placeholder="Email cannot be changed"
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
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
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
                  value={formData.sexual_preferences}
                  onChange={(e) => handleInputChange('sexual_preferences', e.target.value)}
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
                  value={formData.racial_preferences}
                  onChange={(e) => handleInputChange('racial_preferences', e.target.value)}
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
                  value={formData.meeting_interests}
                  onChange={(e) => handleInputChange('meeting_interests', e.target.value)}
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
                onChange={(e) => handleInputChange('interests', e.target.value.split(', ').filter(item => item.trim() !== ''))}
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
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                maxLength={150}
                rows={4}
                className={`w-full px-3 md:px-4 py-3 md:py-4 border rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent resize-none text-sm md:text-base ${
                  validationErrors.bio || fieldErrors.bio 
                    ? 'border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="I really looking for new..."
              />
              <div className="flex justify-between items-center mt-1 md:mt-2">
                <p className="text-xs md:text-sm text-gray-500">
                  {formData.bio.length}/150 characters
                </p>
                {(validationErrors.bio || fieldErrors.bio) && (
                  <p className="text-xs md:text-sm text-red-600">{validationErrors.bio || fieldErrors.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Pictures */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Profile pictures</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">Upload at least 2 photos</p>
            {(validationErrors.photos || fieldErrors.photos) && (
              <p className="text-sm text-red-600 mb-4">{validationErrors.photos || fieldErrors.photos}</p>
            )}
            
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
                          handleInputChange('photos', newPhotos);
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
              className="flex-1 px-4 py-3 border-2 border-[#C70039] text-[#C70039] rounded-xl hover:bg-pink-50 transition-colors text-base font-bold"
            >
              Preview Profile
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-[#C70039] text-white rounded-xl hover:bg-[#950028] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base font-bold"
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

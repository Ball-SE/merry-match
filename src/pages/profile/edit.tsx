import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClient';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

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
    date_of_birth: '',
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

  // Handle input changes
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement save logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/profile');
    } catch {
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-10">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="px-4 md:px-12 py-6 md:py-12 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm text-[#7B4429] uppercase tracking-wider mb-2 md:mb-3 font-medium">PROFILE</p>
                <h1 className="text-2xl md:text-5xl font-bold text-[#A62D82] mb-2 md:mb-3 leading-tight">Let&apos;s make profile</h1>
                <p className="text-2xl md:text-5xl font-bold text-[#A62D82] leading-tight">to let others know you</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full md:w-auto px-6 md:px-8 py-3 md:py-3.5 border-2 border-[#C70039] text-[#C70039] rounded-lg md:rounded-xl hover:bg-pink-50 transition-colors text-sm md:text-base font-semibold"
                >
                  Preview Profile
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full md:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-[#C70039] text-white rounded-lg md:rounded-xl hover:bg-[#950028] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base font-semibold"
                >
                  {saving && <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />}
                  Update Profile
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 md:p-12">
          
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
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base"
                  placeholder="At least 2 character"
                />
              </div>

              {/* Date of birth */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Date of birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="">Thailand</option>
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
                  <option value="">Bangkok</option>
                  <option value="Bangkok">Bangkok</option>
                  <option value="Chiang Mai">Chiang Mai</option>
                  <option value="Phuket">Phuket</option>
                  <option value="Pattaya">Pattaya</option>
                </select>
              </div>

              {/* Username */}
              <div className="md:col-span-2">
                <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C70039] focus:border-transparent text-sm md:text-base"
                  placeholder="At least 6 character"
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

          {/* Delete Account */}
          <div className="pt-6 md:pt-8 border-t border-gray-200 flex justify-end">
            <button className="text-gray-500 hover:text-gray-700 text-sm md:text-base font-medium">
              Delete account
            </button>
          </div>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

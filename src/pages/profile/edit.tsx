import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { supabase } from '@/lib/supabase/supabaseClient';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { validateBasicInfoForEdit } from '@/lib/validation/basicInfo';
import { validateIdentitiesAndInterestsForEdit } from '@/lib/validation/identities';
import { validatePhotos as validatePhotosShared } from '@/lib/validation/photos';
import { validateUsername } from '@/middleware/edit-profile-validation';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';
import { SEA_COUNTRY_OPTIONS } from '@/data/sea-countries';
import { SEA_CITIES_BY_COUNTRY } from '@/data/sea-cities';
import { CustomDatePicker } from '@/components/register/date-picker';
import InterestsInput from '@/components/edit/InterestsInput';
import ProfileCardPopup from '@/components/edit/ProfileCardPopup';
import { usePhotoManagement } from '@/hooks/usePhotoManagement';
import { useInterestsManagement } from '@/hooks/useInterestsManagement';
import { deleteProfilePhoto } from '@/lib/supabase/uploadPhotoUtils';
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<boolean[]>(Array(5).fill(false)); // EDIT: mirror Register spinner state
  const [uploadError, setUploadError] = useState<string | null>(null); // EDIT: mirror Register error banner

  // Username availability (mirror Register). If unchanged, treat as valid without checking

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

  // Username availability (mirror Register). If unchanged, treat as valid without checking
  const usernameValidation = useUsernameValidation(formData.username, 500);
  const isCurrentUsername = formData.username === profile?.username;

  const {
    photoFiles,
    photoPreviews,
    photoItems,
    onFiles,
    removePhoto,
    handleReorder,
    loadExistingPhotos
  } = usePhotoManagement();

  // เพิ่ม folderRef เหมือน RegisterStep
  const folderRef = useRef(
    formData.email
      ? `${formData.email
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "_")
        .slice(0, 24)}`
      : `temp-user-${Date.now()}`
  );

  // ช่วยดึงโฟลเดอร์เดิมจาก URL รูปใน Supabase // EDIT
  const extractFolderFromPhotoUrl = (url: string): string | null => {
    // ตัวอย่าง path: https://.../profile-photos/public/USER_FOLDER/photo_0_....jpg
    const parts = url.split('/profile-photos/')[1]?.split('/');
    if (!parts || parts.length < 2) return null;
    // parts[0] คือ bucket visibility (เช่น public), parts[1] คือโฟลเดอร์ผู้ใช้
    // บางโปรเจกต์ path อาจเป็น `public/username/...` หรือ `username/...`
    // ลองหาชิ้นส่วนที่ไม่ใช่ 'public' เป็นโฟลเดอร์
    const folder = parts.find(seg => seg && seg !== 'public');
    return folder || null;
  };

  // อัปเดต folderRef เมื่อโหลดโปรไฟล์/รูปเสร็จหรือ email พร้อมใช้งาน // EDIT
  useEffect(() => {
    // 1) ถ้ามีรูปเดิม ให้ใช้โฟลเดอร์เดิมจาก URL
    const existingFolder =
      (formData.photos?.find(p => p.startsWith('http')) && extractFolderFromPhotoUrl(formData.photos.find(p => p.startsWith('http'))!))
      || null;
    if (existingFolder) {
      folderRef.current = existingFolder; // ใช้โฟลเดอร์เดิม // EDIT
      return;
    }
    // 2) ถ้าไม่มีรูปเดิม ให้ใช้โฟลเดอร์จากอีเมล (เมื่ออีเมลมาแล้ว)
    if (formData.email) {
      folderRef.current = `${formData.email
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "_")
        .slice(0, 24)}`; // EDIT
    }
  }, [formData.email, formData.photos]); // EDIT

  const { chipInput, setChipInput, addChip } = useInterestsManagement();

  const loadPhotosCallback = useCallback((photos: string[]) => {
    loadExistingPhotos(photos);
  }, [loadExistingPhotos]);

  // อัปเดต formData.photos เมื่อ photoPreviews เปลี่ยนแปลง
  useEffect(() => {
    // สร้าง array ของรูปที่มี preview
    const photosWithPreviews = photoPreviews.filter(preview => preview !== "");

    setFormData(prev => ({
      ...prev,
      photos: photosWithPreviews
    }));
  }, [photoPreviews]);

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

        const formData = {
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
          interests: profileData.interests || [],
          photos: profileData.photos || []
        };

        setFormData(formData);
        loadPhotosCallback(profileData.photos || []);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, loadPhotosCallback]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

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

  // Helpers to mirror Register onBlur validations
  const runBasicValidation = () => {
    const basic = validateBasicInfoForEdit({
      name: formData.name,
      date_of_birth: formData.date_of_birth,
      location: formData.location,
      city: formData.city,
      username: formData.username,
    });
    setValidationErrors(prev => {
      const next = { ...prev } as Record<string, string>;
      // clear old basic keys
      delete next.name;
      delete next.date_of_birth;
      delete next.location;
      delete next.city;
      delete next.username;
      // set new errors
      return { ...next, ...basic.errors };
    });
  };

  const runIdentitiesValidation = () => {
    const identities = validateIdentitiesAndInterestsForEdit({
      gender: formData.gender,
      sexual_preferences: formData.sexual_preferences,
      racial_preferences: formData.racial_preferences,
      meeting_interests: formData.meeting_interests,
      bio: formData.bio,
      interests: formData.interests,
    });
    setValidationErrors(prev => {
      const next = { ...prev } as Record<string, string>;
      // clear old identities keys
      delete next.gender;
      delete next.sexual_preferences;
      delete next.racial_preferences;
      delete next.meeting_interests;
      delete next.bio;
      delete next.interests;
      // set new errors
      return { ...next, ...identities.errors };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    try {
      // EDIT use the same shared validators as register-page
      const basic = validateBasicInfoForEdit({
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        location: formData.location,
        city: formData.city,
        username: formData.username,
      });
      const identities = validateIdentitiesAndInterestsForEdit({
        gender: formData.gender,
        sexual_preferences: formData.sexual_preferences,
        racial_preferences: formData.racial_preferences,
        meeting_interests: formData.meeting_interests,
        bio: formData.bio,
        interests: formData.interests,
      });
      const photosVal = validatePhotosShared(formData.photos, { min: 2, max: 5, allowBlob: true });
      const isValid = basic.isValid && identities.isValid && photosVal.isValid;
      const mergedErrors = { ...basic.errors, ...identities.errors, ...photosVal.errors };
      if (!isValid) {
        setValidationErrors(mergedErrors);
        setSaving(false);
        return;
      }

      if (formData.username !== profile?.username) {
        const usernameValidation = await validateUsername(formData.username, profile?.username);
        if (!usernameValidation.isValid) {
          setValidationErrors({ username: usernameValidation.message || 'Username validation failed' });
          setSaving(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      // Upload new photos using same method as RegisterStep
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        if (file) {
          try {
            const { uploadProfilePhoto } = await import('@/lib/supabase/uploadPhotoUtils');
            const result = await uploadProfilePhoto(file, folderRef.current, i);

            if (result.success && result.url) {
              uploadedUrls[i] = result.url;
            } else {
              throw new Error(result.error || "Upload failed");
            }
          } catch (error) {
            console.error(`Upload error for photo ${i}:`, error);
            throw new Error(`Failed to upload photo ${i + 1}`);
          }
        }
      }

      // Combine existing photos with new uploads
      const processedPhotos = formData.photos.map((photoUrl, index) => {
        if (photoUrl.startsWith('blob:')) {
          return uploadedUrls[index] || photoUrl;
        }
        return photoUrl;
      });

      const updatedFormData = {
        ...formData,
        photos: processedPhotos
      };

      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update profile');
      }

      const result = await response.json();

      // Update formData with the latest data first
      const latestFormData = {
        name: result.data.name || '',
        date_of_birth: result.data.date_of_birth || '',
        location: result.data.location || 'Thailand',
        city: result.data.city || 'Bangkok',
        username: result.data.username || '',
        email: result.data.email || '',
        gender: result.data.gender || 'Male',
        sexual_preferences: result.data.sexual_preferences || 'Female',
        racial_preferences: result.data.racial_preferences || 'Asian',
        meeting_interests: result.data.meeting_interests || 'Friends',
        bio: result.data.bio || '',
        interests: result.data.interests || [],
        photos: result.data.photos || []
      };

      setFormData(latestFormData);
      setProfile(result.data);
      setSuccess('Profile updated successfully!');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

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

      <div className="mx-auto px-4 md:px-8 lg:px-16 xl:px-32 py-4 md:py-10">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="px-4 md:px-12 py-6 md:py-12 border-b border-gray-100">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm text-[#7B4429] uppercase tracking-wider mb-2 md:mb-3 font-medium">PROFILE</p>
                <h1 className="text-[46px] font-extrabold text-[#A62D82] leading-[125%] tracking-[-0.02em]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Let&apos;s make profile<br />to let others know you
                </h1>
              </div>
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

          <div className="p-4 md:p-12">
            <div className="max-w-4xl mx-auto">

              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <ProfileCardPopup
                  formData={formData}
                  profile={profile}
                  onClose={() => {
                    setSuccess(null);
                    router.push('/profile/edit');
                  }}
                />
              )}


              <div className="mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, name: true }));
                        runBasicValidation();
                      }}
                      className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 ${
                        (validationErrors.name || fieldErrors.name)
                          ? 'border-[#AF2758] focus:ring-[#AF2758]'
                          : 'border-gray-300 focus:ring-[#A62D82]'
                      }`}
                      placeholder="At least 2 character"
                    />
                    {(validationErrors.name || fieldErrors.name) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.name || fieldErrors.name}</p>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Date of birth</label>
                    <CustomDatePicker
                      selected={formData.date_of_birth ? new Date(formData.date_of_birth) : null} // EDIT
                      onChange={(date: Date | null) => { // EDIT
                        const dateString = date ? date.toISOString().split('T')[0] : '';
                        handleInputChange('date_of_birth', dateString);
                      }}
                      className={`h-12.5`}
                      onBlur={() => { // EDIT
                        setTouched(prev => ({ ...prev, date_of_birth: true }));
                        const basic = validateBasicInfoForEdit({
                          name: formData.name,
                          date_of_birth: formData.date_of_birth,
                          location: formData.location,
                          city: formData.city,
                          username: formData.username,
                        });
                        setValidationErrors(prev => ({ ...prev, ...basic.errors }));
                      }}
                      minDate={new Date(new Date().getFullYear() - 120, new Date().getMonth(), new Date().getDate())} // EDIT
                      maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())} // EDIT
                      error={validationErrors.date_of_birth || fieldErrors.date_of_birth} // EDIT
                      touched={touched.date_of_birth} // EDIT
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Location</label>
                    <select
                      value={formData.location}
                      onChange={(e) => {
                        handleInputChange('location', e.target.value);
                        handleInputChange('city', '');
                        runBasicValidation();
                      }}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, location: true }));
                        runBasicValidation();
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base bg-white focus:outline-none ${
                        (validationErrors.location || fieldErrors.location)
                          ? 'border-[#AF2758] focus:ring-[#AF2758]'
                          : 'border-gray-300 focus:ring-[#A62D82]'
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
                        paddingRight: "48px",
                      }}
                    >
                      <option value="">
                        Select location
                      </option>
                      {SEA_COUNTRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ color: "#000000" }}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {(validationErrors.location || fieldErrors.location) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.location || fieldErrors.location}</p>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, city: true }));
                        runBasicValidation();
                      }}
                      disabled={!formData.location}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base focus:outline-none ${!formData.location
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white"}
                        ${
                          (validationErrors.city || fieldErrors.city)
                            ? ' border-[#AF2758] focus:ring-[#AF2758]'
                            : ' border-gray-300 focus:ring-[#A62D82]'
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
                        paddingRight: "48px",
                      }}
                    >
                      <option value="">
                        Select city
                      </option>
                      {(SEA_CITIES_BY_COUNTRY[formData.location] || []).map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    {(validationErrors.city || fieldErrors.city) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.city || fieldErrors.city}</p>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        handleInputChange('username', e.target.value);
                      }}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, username: true }));
                        runBasicValidation();
                      }}
                      className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 ${
                        (validationErrors.username || fieldErrors.username)
                          ? 'border-[#AF2758] focus:ring-[#AF2758]'
                          : 'border-gray-300 focus:ring-[#A62D82]'
                      } text-sm md:text-base`}
                      placeholder="At least 6 character"
                    />
                    {(validationErrors.username || fieldErrors.username) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.username || fieldErrors.username}</p>
                      </>
                    )}
                    {touched.username && !(validationErrors.username || fieldErrors.username) && (
                      <div className="mt-2 flex items-center gap-2">
                        {!isCurrentUsername && usernameValidation.isChecking && (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                            <span className="text-sm text-yellow-600">checking...</span>
                          </>
                        )}
                        {(isCurrentUsername || (!usernameValidation.isChecking && usernameValidation.isValid)) && (
                          <>
                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm text-green-600">Username is available</span>
                          </>
                        )}
                        {!isCurrentUsername && !usernameValidation.isChecking && !usernameValidation.isValid && touched.username && (
                          <>
                            <div className="h-4 w-4 rounded-full bg-[#C70039] flex items-center justify-center">
                              <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm text-[#C70039]">{usernameValidation.message || 'Username already exists or invalid'}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm md:text-base cursor-not-allowed h-12.5"
                      placeholder="Email cannot be changed"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Identities and Interests</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Sexual Identity</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, gender: true }));
                        runIdentitiesValidation();
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base bg-white focus:outline-none ${
                        (validationErrors.gender || fieldErrors.gender)
                          ? 'border-[#AF2758] focus:ring-[#AF2758]'
                          : 'border-gray-300 focus:ring-[#A62D82]'
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
                        paddingRight: "48px",
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="LGBTQ+">LGBTQ+</option>
                    </select>
                    {(validationErrors.gender || fieldErrors.gender) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.gender || fieldErrors.gender}</p>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Sexual preferences</label>
                    <select
                      value={formData.sexual_preferences}
                      onChange={(e) => handleInputChange('sexual_preferences', e.target.value)}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, sexual_preferences: true }));
                        runIdentitiesValidation();
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base bg-white focus:outline-none ${
                        (validationErrors.sexual_preferences || fieldErrors.sexual_preferences)
                          ? 'border-[#AF2758] focus:ring-[#AF2758]'
                          : 'border-gray-300 focus:ring-[#A62D82]'
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
                        paddingRight: "48px",
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="LGBTQ+">LGBTQ+</option>
                    </select>
                    {(validationErrors.sexual_preferences || fieldErrors.sexual_preferences) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.sexual_preferences || fieldErrors.sexual_preferences}</p>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Racial preferences</label>
                    <select
                      value={formData.racial_preferences}
                      onChange={(e) => handleInputChange('racial_preferences', e.target.value)}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, racial_preferences: true }));
                        runIdentitiesValidation();
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base bg-white focus:outline-none ${
                        (validationErrors.racial_preferences || fieldErrors.racial_preferences)
                          ? 'border-[#AF2758] focus:ring-[#AF2758]'
                          : 'border-gray-300 focus:ring-[#A62D82]'
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
                        paddingRight: "48px",
                      }}
                    >
                      <option value="Asian">Asian</option>
                      <option value="Caucasian">Caucasian</option>
                      <option value="African">African</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Other">Other</option>
                    </select>
                    {(validationErrors.racial_preferences || fieldErrors.racial_preferences) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.racial_preferences || fieldErrors.racial_preferences}</p>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Meeting interests</label>
                    <select
                      value={formData.meeting_interests}
                      onChange={(e) => handleInputChange('meeting_interests', e.target.value)}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, meeting_interests: true }));
                        runIdentitiesValidation();
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base bg-white focus:outline-none ${
                        (validationErrors.meeting_interests || fieldErrors.meeting_interests)
                          ? 'border-[#AF2758] focus:ring-[#AF2758]'
                          : 'border-gray-300 focus:ring-[#A62D82]'
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
                        paddingRight: "48px",
                      }}
                    >
                      <option value="Friends">Friends</option>
                      <option value="Dating">Dating</option>
                      <option value="Relationship">Long-term relationship</option>
                      <option value="Casual">Casual dating</option>
                    </select>
                    {(validationErrors.meeting_interests || fieldErrors.meeting_interests) && (
                      <>
                        <img
                          src="/assets/inputError.svg"
                          alt="Error"
                          className="absolute right-3 top-[42px] h-5 w-5"
                        />
                        <p className="mt-1 text-sm text-[#C70039]">{validationErrors.meeting_interests || fieldErrors.meeting_interests}</p>
                      </>
                    )}
                  </div>
                </div>

                <InterestsInput
                  interests={formData.interests}
                  chipInput={chipInput}
                  setChipInput={setChipInput}
                  addChip={() => addChip(formData.interests, handleInputChange)}
                  handleInputChange={handleInputChange}
                  validationErrors={validationErrors}
                  fieldErrors={fieldErrors}
                />

                <div className="mt-6 md:mt-8">
                  <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">
                    About me (150 Characters)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, bio: true }));
                      runIdentitiesValidation();
                    }}
                    maxLength={150}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent resize-none text-sm md:text-base ${
                      (validationErrors.bio || fieldErrors.bio)
                        ? 'border-[#AF2758] focus:ring-[#AF2758]'
                        : 'border-gray-300 focus:ring-[#A62D82]'
                    }`}
                    placeholder="I really looking for new..."
                  />
                  <div className="flex justify-between items-center mt-1 md:mt-2">
                    <p className="text-xs md:text-sm text-gray-500">
                      {formData.bio.length}/150 characters
                    </p>
                    {(validationErrors.bio || fieldErrors.bio) && (
                      <p className="text-xs md:text-sm text-[#C70039]">{validationErrors.bio || fieldErrors.bio}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Photo Upload Section - Same as RegisterStep */}
              <div className="mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Profile pictures</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  Upload at least 2 photos. Drag to reorder. Main photo will be the first one.
                </p>

                {(validationErrors.photos || fieldErrors.photos) && (
                  <p className="text-sm text-red-600 mb-4">{validationErrors.photos || fieldErrors.photos}</p>
                )}

                <Reorder.Group
                  axis="x"
                  values={photoItems}
                  onReorder={handleReorder}
                  className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
                >
                  <AnimatePresence>
                    {photoItems.map((item, i) => {
                      const hasImage = !!item.preview || item.file !== null; // allow drag when preview exists (existing photos)
                      const isMainPhoto = i === 0 && hasImage;
                      const isUploading = uploading[i];

                      return (
                        <Reorder.Item
                          key={item.id}
                          value={item}
                          as="div"
                          className="relative"
                          dragListener={hasImage}
                          whileDrag={{
                            scale: 1.05,
                            rotate: 2,
                            zIndex: 1000,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                          }}
                          whileHover={hasImage ? { scale: 1.02 } : {}}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                          }}
                        >
                          <motion.div
                            className={`flex aspect-square items-center justify-center rounded-xl bg-gray-100 transition-all duration-200 ${photoPreviews.filter(preview => preview !== "").length < 2 && i < 2
                              ? "border-red-300"
                              : "border-gray-300"
                              }`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            layout
                          >
                          {isUploading ? (
                            <motion.div
                              className="text-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#A62D82]"></div>
                              <span className="text-xs text-gray-500">Processing...</span>
                            </motion.div>
                          ) : item.preview ? (
                              <motion.div
                                className="relative h-full w-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                layout
                              >
                                <img
                                  src={item.preview}
                                  alt={`photo-${i}`}
                                  className="h-full w-full rounded-xl object-cover cursor-grab active:cursor-grabbing"
                                  draggable={false}
                                />

                                {/* Main photo indicator */}
                                {isMainPhoto && (
                                  <motion.div
                                    className="absolute top-2 left-2 bg-[#A62D82] text-white text-xs px-2 py-1 rounded"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                  >
                                    Main
                                  </motion.div>
                                )}

                                {/* Delete button */}
                                <motion.button
                                  onClick={async () => {
                                    const currentUrl = item.preview;
                                    if (currentUrl && currentUrl.startsWith('http')) {
                                      const ok = await deleteProfilePhoto(currentUrl);
                                      if (!ok) {
                                        setError('Failed to delete photo');
                                        return;
                                      }
                                    }
                                    await removePhoto(i);
                                  }}
                                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C70039] text-white hover:bg-[#950028]"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.3, type: "spring" }}
                                >
                                  ×
                                </motion.button>
                              </motion.div>
                            ) : (
                              <motion.div
                                className="text-center flex flex-col"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                layout
                              >
                                <div className="mx-auto mb-2 flex h-8 w-8 items-center text-4xl justify-center rounded-full text-[#A62D82]">
                                  +
                                </div>
                                <span className="text-sm font-medium text-[#A62D82]">
                                  {i === 0 ? "Main photo" : "Upload photo"}
                                </span>
                              </motion.div>
                            )}
                          </motion.div>

                          {/* File input overlay */}
                          {!hasImage && !isUploading && (
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                              onChange={async (e) => {
                                setUploadError(null);
                                setUploading((prev) => {
                                  const next = [...prev];
                                  next[i] = true;
                                  return next;
                                });
                                try {
                                  const files = e.target.files;
                                  if (!files || files.length === 0) {
                                    return;
                                  }
                                  let file = files[0];

                                  // Validate max size 10MB
                                  if (file.size > 10 * 1024 * 1024) {
                                    setUploadError('File size cannot exceed 10MB');
                                    return;
                                  }
                                  // Validate type
                                  if (!file.type.startsWith('image/')) {
                                    setUploadError('Please select only image files');
                                    return;
                                  }
                                  // Compress if > 1MB
                                  if (file.size > 1 * 1024 * 1024) {
                                    try {
                                      const { compressImageToTarget } = await import('@/lib/image/browserImageProcessor');
                                      file = await compressImageToTarget(file, 1 * 1024 * 1024);
                                    } catch (err) {
                                      console.error('Compress failed:', err);
                                      setUploadError('Failed to compress image. Please try again.');
                                      return;
                                    }
                                  }

                                  // Create a single-file FileList to pass to hook
                                  const dt = new DataTransfer();
                                  dt.items.add(file);
                                  await onFiles(dt.files, i);
                                } catch (err) {
                                  console.error('File processing error:', err);
                                  setUploadError('Failed to process image. Please try again.');
                                } finally {
                                  setUploading((prev) => {
                                    const next = [...prev];
                                    next[i] = false;
                                    return next;
                                  });
                                }
                              }}
                            />
                          )}
                        </Reorder.Item>
                      );
                    })}
                  </AnimatePresence>
                </Reorder.Group>

                {uploadError && (
                  <motion.div
                    className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {uploadError}
                  </motion.div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  {photoPreviews.filter(preview => preview !== "").length}/5 photos ready
                </div>
              </div>

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
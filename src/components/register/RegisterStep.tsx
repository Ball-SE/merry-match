import { useState, useRef } from "react";
import { validateBasicInfo, validateIdentitiesAndInterests, validatePhotos } from "@/middleware/register-validation";
import { uploadProfilePhoto, deleteProfilePhoto } from "@/lib/supabase/uploadPhotoUtils";

interface FormData {
  name: string;
  dateOfBirth: string;
  location: string;
  city: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  sexualIdentities: string;
  sexualPreferences: string;
  racialPreferences: string;
  meetingInterests: string;
  interests: string[];
  photos: string[];
}

interface Props {
  currentStep: number;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setPhotos: (next: string[]) => void;
  setInterests: (chips: string[]) => void;
}

export default function RegisterStep({
  currentStep,
  formData,
  handleInputChange,
  setPhotos,
  setInterests,
}: Props) {
  if (currentStep === 1) return <Step1 formData={formData} handleInputChange={handleInputChange} />;
  if (currentStep === 2) return <Step2 formData={formData} handleInputChange={handleInputChange} setInterests={setInterests} />;
  return <Step3 formData={formData} photos={formData.photos} setPhotos={setPhotos} />;
}



/* ------------------------------ Step 1 ------------------------------ */
function Step1({
  formData,
  handleInputChange,
}: {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const validation = validateBasicInfo(formData);
    setErrors(validation.errors);
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full rounded-lg border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2";
    const hasError = touched[fieldName] && errors[fieldName];

    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-gray-300 focus:ring-[#C70039]`;
  };

  return (
    <div>
      <h2 className="mb-6 text-4xl font-bold text-[#A62D82]">Basic Information</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={() => handleBlur('name')}
              placeholder="At least 2 characters"
              className={getInputClassName('name')}
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Date of birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              onBlur={() => handleBlur('dateOfBirth')}
              className={getInputClassName('dateOfBirth')}
            />
            {touched.dateOfBirth && errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              onBlur={() => handleBlur('location')}
              className={getInputClassName('location')}
            >
              <option value="">Select location</option>
              <option value="bangkok">Bangkok</option>
              <option value="chiang-mai">Chiang Mai</option>
              <option value="phuket">Phuket</option>
            </select>
            {touched.location && errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              onBlur={() => handleBlur('city')}
              className={getInputClassName('city')}
            >
              <option value="">Select city</option>
              <option value="chatuchak">Chatuchak</option>
              <option value="sukhumvit">Sukhumvit</option>
              <option value="silom">Silom</option>
            </select>
            {touched.city && errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={() => handleBlur('username')}
              placeholder="At least 6 characters"
              className={getInputClassName('username')}
            />
            {touched.username && errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              placeholder="name@website.com"
              className={getInputClassName('email')}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={() => handleBlur('password')}
              placeholder="At least 8 characters"
              className={getInputClassName('password')}
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="At least 8 characters"
              className={getInputClassName('confirmPassword')}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Step 2 ------------------------------ */
function Step2({
  formData,
  handleInputChange,
  setInterests,
}: {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setInterests: (chips: string[]) => void;
}) {
  const [chipInput, setChipInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const validation = validateIdentitiesAndInterests(formData);
    setErrors(validation.errors);
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full rounded-lg border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2";
    const hasError = touched[fieldName] && errors[fieldName];

    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-gray-300 focus:ring-[#C70039]`;
  };

  const addChip = () => {
    const trimmed = chipInput.trim();
    if (!trimmed) return;
    if ((formData.interests || []).length >= 10) return;
    setInterests([...(formData.interests || []), trimmed]);
    setChipInput("");
  };

  const removeChip = (i: number) => {
    const next = [...(formData.interests || [])];
    next.splice(i, 1);
    setInterests(next);
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-[#2A0B21]">Identities and Interests</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Sexual identities</label>
            <select
              name="sexualIdentities"
              value={formData.sexualIdentities}
              onChange={handleInputChange}
              onBlur={() => handleBlur('sexualIdentities')}
              className={getInputClassName('sexualIdentities')}
            >
              <option value="">Select identity</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="lgbtq+">LGBTQ+</option>
            </select>
            {touched.sexualIdentities && errors.sexualIdentities && (
              <p className="mt-1 text-sm text-red-500">{errors.sexualIdentities}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Sexual preferences</label>
            <select
              name="sexualPreferences"
              value={formData.sexualPreferences}
              onChange={handleInputChange}
              onBlur={() => handleBlur('sexualPreferences')}
              className={getInputClassName('sexualPreferences')}
            >
              <option value="">Select preference</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="lgbtq+">LGBTQ+</option>
            </select>
            {touched.sexualPreferences && errors.sexualPreferences && (
              <p className="mt-1 text-sm text-red-500">{errors.sexualPreferences}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Racial preferences</label>
            <select
              name="racialPreferences"
              value={formData.racialPreferences}
              onChange={handleInputChange}
              onBlur={() => handleBlur('racialPreferences')}
              className={getInputClassName('racialPreferences')}
            >
              <option value="">Select preference</option>
              <option value="asian">Asian</option>
              <option value="caucasian">Caucasian</option>
              <option value="african">African</option>
              <option value="hispanic">Hispanic</option>
              <option value="mixed">Mixed</option>
            </select>
            {touched.racialPreferences && errors.racialPreferences && (
              <p className="mt-1 text-sm text-red-500">{errors.racialPreferences}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Meeting interests</label>
            <select
              name="meetingInterests"
              value={formData.meetingInterests}
              onChange={handleInputChange}
              onBlur={() => handleBlur('meetingInterests')}
              className={getInputClassName('meetingInterests')}
            >
              <option value="">Select interest</option>
              <option value="friends">Friends</option>
              <option value="dating">Dating</option>
              <option value="relationship">Long-term relationship</option>
              <option value="casual">Casual meeting</option>
            </select>
            {touched.meetingInterests && errors.meetingInterests && (
              <p className="mt-1 text-sm text-red-500">{errors.meetingInterests}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hobbies / Interests (Maximum 10)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(formData.interests || []).map((chip, i) => (
              <span key={`${chip}-${i}`} className="flex items-center gap-2 rounded-full bg-[#F6F7FC] px-3 py-1 text-sm text-[#2A0B21]">
                {chip}
                <button
                  onClick={() => removeChip(i)}
                  className="rounded-full bg-[#C70039] px-2 text-white hover:bg-[#950028]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={chipInput}
              onChange={(e) => setChipInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChip();
                }
              }}
              placeholder="Type and press Enter to add"
              disabled={(formData.interests || []).length >= 10}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039] disabled:bg-gray-100"
            />
            <button
              onClick={addChip}
              disabled={(formData.interests || []).length >= 10}
              className="button-primary bg-[#C70039] text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {(formData.interests || []).length >= 10 && (
            <p className="mt-1 text-sm text-yellow-600">Maximum 10 interests reached</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Step 3 ------------------------------ */

function Step3({
  formData,
  photos,
  setPhotos,
}: {
  formData: FormData;
  photos: string[];
  setPhotos: (next: string[]) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<boolean[]>(Array(5).fill(false));
  const folderRef = useRef(
    formData.email
      ? `${formData.email.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '-').slice(0, 24)}`
      : `temp-user-${Date.now()}`
  );

  const validateCurrentPhotos = () => {
    const validation = validatePhotos(photos);
    setErrors(validation.errors);
  };

  const onFiles = async (files: FileList | null, index: number) => {
    if (!files || files.length === 0) return;

    let file = files[0];

    // ตรวจสอบขนาดไฟล์ (10MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      alert('you cannot upload more than 10MB');
      return;
    }

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
      alert('please select only image files');
      return;
    }

    // บีบอัดถ้าไฟล์ใหญ่กว่า 2MB
    if (file.size > 2 * 1024 * 1024) {
      try {
        const { compressImageToTarget } = await import('@/lib/image/browserImageProcessor');
        file = await compressImageToTarget(file, 2 * 1024 * 1024);
      } catch (e) {
        console.error('Compress failed:', e);
        alert('Failed to compress image');
        return;
      }
    }



    setUploading(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    try {
      // สำหรับ demo ใช้ temporary user ID
      // ในการใช้งานจริงควรได้จาก auth context

      const result = await uploadProfilePhoto(file, folderRef.current, index);

      if (result.success && result.url) {
        const newPhotos = [...photos];
        newPhotos[index] = result.url;
        setPhotos(newPhotos);
        validateCurrentPhotos();
      } else {
        alert(result.error || 'upload photo failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('upload photo failed');
    } finally {
      setUploading(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  };

  const remove = async (idx: number) => {
    const photoUrl = photos[idx];

    // ลบรูปจาก Storage ถ้าเป็น URL จริง (ไม่ใช่ data URL)
    if (photoUrl && photoUrl.startsWith('http')) {
      await deleteProfilePhoto(photoUrl);
    }

    const next = [...photos];
    next.splice(idx, 1);
    setPhotos(next);
    validateCurrentPhotos();
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-[#2A0B21]">Profile pictures</h2>
      <p className="mb-6 text-sm text-gray-600">Upload at least 2 photos</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => {
          const url = photos[i];
          const isUploading = uploading[i];

          return (
            <div key={i} className="relative">
              <div className={`flex aspect-square items-center justify-center rounded-xl border-2 border-dashed bg-gray-50 ${photos.length < 2 && i < 2 ? 'border-red-300' : 'border-gray-300'
                }`}>
                {isUploading ? (
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#C70039]"></div>
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </div>
                ) : url ? (
                  <img src={url} alt={`photo-${i}`} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#C70039] text-white">+</div>
                    <span className="text-xs text-gray-500">
                      {i === 0 ? "Main photo" : "Upload photo"}
                    </span>
                  </div>
                )}
              </div>

              {!url && !isUploading ? (
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => onFiles(e.target.files, i)}
                />
              ) : url && !isUploading ? (
                <button
                  onClick={() => remove(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C70039] text-white hover:bg-[#950028]"
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {errors.photos && (
        <p className="mt-4 text-sm text-red-500">{errors.photos}</p>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {photos.length}/5 photos uploaded
      </div>
    </div>
  );
}
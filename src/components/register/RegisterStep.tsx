import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  validateBasicInfo,
  validateIdentitiesAndInterests,
  validatePhotos,
} from "@/middleware/register-validation";
import { CustomDatePicker } from "@/components/register/date-picker";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";

import { SEA_COUNTRY_OPTIONS } from "@/data/sea-countries";
import { SEA_CITIES_BY_COUNTRY } from "@/data/sea-cities";

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
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setPhotos: (next: string[]) => void;
  setInterests: (chips: string[]) => void;
  step3Ref: React.RefObject<{
    uploadPhotosToSupabase: () => Promise<string[]>;
  } | null>;
}

export default function RegisterStep({
  currentStep,
  formData,
  handleInputChange,
  setPhotos,
  setInterests,
  step3Ref,
}: Props) {
  if (currentStep === 1)
    return <Step1 formData={formData} handleInputChange={handleInputChange} />;
  if (currentStep === 2) {
    return (
      <Step2
        formData={formData}
        handleInputChange={handleInputChange}
        setInterests={setInterests}
      />
    );
  }

  return (
    <Step3
      ref={step3Ref}
      formData={formData}
      photos={formData.photos}
      setPhotos={setPhotos}
    />
  );
}

// เพิ่มฟังก์ชันสำหรับ upload รูปเมื่อกด confirm
export const uploadPhotosOnConfirm = async (
  step3Ref: React.RefObject<{
    uploadPhotosToSupabase: () => Promise<string[]>;
  } | null>
): Promise<string[]> => {
  if (step3Ref.current) {
    return await step3Ref.current.uploadPhotosToSupabase();
  }
  return [];
};

/* ------------------------------ Step 1 ------------------------------ */
function Step1({
  formData,
  handleInputChange,
}: {
  formData: FormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // เพิ่ม email validation hook
  const emailValidation = useEmailValidation(formData.email, 500);
  const usernameValidation = useUsernameValidation(formData.username, 500);

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const validation = validateBasicInfo(formData);
    setErrors(validation.errors);
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass =
      "w-full rounded-lg border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2";
    const hasError = touched[fieldName] && errors[fieldName];

    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-gray-300 focus:ring-[#C70039]`;
  };

  useEffect(() => {
    if (Object.values(touched).some(Boolean)) {
      const validation = validateBasicInfo(formData);
      setErrors(validation.errors);
    }
  }, [formData, touched]);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-[#A62D82]">
        Basic Information
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={() => handleBlur("name")}
              placeholder="Jon Snow"
              className={getInputClassName("name")}
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-[#C70039]">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Date of birth
            </label>
            <CustomDatePicker
              selected={
                formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
              }
              onChange={(date: Date | null) => {
                const dateString = date ? date.toISOString().split("T")[0] : "";
                handleInputChange({
                  target: { name: "dateOfBirth", value: dateString },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              onBlur={() => handleBlur("dateOfBirth")}
              placeholder="01/01/2022"
              className={getInputClassName("dateOfBirth")}
              dateFormat="dd/MM/yyyy"
              minDate={
                new Date(
                  new Date().getFullYear() - 120,
                  new Date().getMonth(),
                  new Date().getDate()
                )
              } // 120 ปีที่แล้ว
              maxDate={
                new Date(
                  new Date().getFullYear() - 18,
                  new Date().getMonth(),
                  new Date().getDate()
                )
              } // 18 ปีที่แล้ว
              name="dateOfBirth"
              id="dateOfBirth"
              error={errors.dateOfBirth}
              touched={touched.dateOfBirth}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={(e) => {
                handleInputChange(e);
                // รีเซ็ต city เมื่อเปลี่ยนประเทศ
                const resetCity = {
                  target: { name: "city", value: "" },
                } as React.ChangeEvent<HTMLInputElement>;
                handleInputChange(resetCity);
              }}
              onBlur={() => handleBlur("location")}
              className={`${getInputClassName("location")} ${!formData.location ? "text-gray-400" : "text-black"
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
                {!formData.location ? "Thailand" : "Select location"}
              </option>

              {SEA_COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ color: "#000000" }}>
                  {opt.label}
                </option>
              ))}
            </select>
            {touched.location && errors.location && (
              <p className="mt-1 text-sm text-[#C70039]">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              City
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              onBlur={() => handleBlur("city")}
              disabled={!formData.location}
              className={`${getInputClassName("city")} ${!formData.location
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
                paddingRight: "48px",
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
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={() => handleBlur("username")}
              placeholder="At least 6 characters"
              className={getInputClassName("username")}
            />
            {touched.username && errors.username && (
              <p className="mt-1 text-sm text-[#C70039]">{errors.username}</p>
            )}
            {touched.username && (
              <div className="mt-2 flex items-center gap-2">
                {usernameValidation.isChecking && (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                    <span className="text-sm text-yellow-600">checking...</span>
                  </>
                )}
                {!usernameValidation.isChecking &&
                  usernameValidation.isValid && (
                    <>
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="h-2 w-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-green-600">
                        Username is available
                      </span>
                    </>
                  )}
                {!usernameValidation.isChecking &&
                  !usernameValidation.isValid &&
                  touched.username && (
                    <>
                      <div className="h-4 w-4 rounded-full bg-[#C70039] flex items-center justify-center">
                        <svg
                          className="h-2 w-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-[#C70039]">
                        {usernameValidation.message ||
                          "Username already exists or invalid"}
                      </span>
                    </>
                  )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur("email")}
              placeholder="name@website.com"
              className={getInputClassName("email")}
            />
            {/* แสดงสถานะการตรวจสอบ email ด้านล่าง input */}
            {touched.email && (
              <div className="mt-2 flex items-center gap-2">
                {emailValidation.isChecking && (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                    <span className="text-sm text-yellow-600">checking...</span>
                  </>
                )}
                {!emailValidation.isChecking && emailValidation.isValid && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="h-2 w-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-green-600">
                      Email is available
                    </span>
                  </>
                )}
                {!emailValidation.isChecking &&
                  !emailValidation.isValid &&
                  touched.email && (
                    <>
                      <div className="h-4 w-4 rounded-full bg-[#C70039] flex items-center justify-center">
                        <svg
                          className="h-2 w-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-[#C70039]">
                        Email is already exists or invalid
                      </span>
                    </>
                  )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={() => handleBlur("password")}
              placeholder="At least 8 characters"
              className={getInputClassName("password")}
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-[#C70039]">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="At least 8 characters"
              className={getInputClassName("confirmPassword")}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-[#C70039]">
                {errors.confirmPassword}
              </p>
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
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setInterests: (chips: string[]) => void;
}) {
  const [chipInput, setChipInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const validation = validateIdentitiesAndInterests(formData);
    setErrors(validation.errors);
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass =
      "w-full rounded-lg border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2";
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
      <h2 className="mb-6 text-2xl font-semibold text-[#2A0B21]">
        Identities and Interests
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Sexual identities
            </label>
            <select
              name="sexualIdentities"
              value={formData.sexualIdentities}
              onChange={handleInputChange}
              onBlur={() => handleBlur("sexualIdentities")}
              className={getInputClassName("sexualIdentities")}
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
              <option value="">Select identity</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="lgbtq+">LGBTQ+</option>
            </select>
            {touched.sexualIdentities && errors.sexualIdentities && (
              <p className="mt-1 text-sm text-red-500">
                {errors.sexualIdentities}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Sexual preferences
            </label>
            <select
              name="sexualPreferences"
              value={formData.sexualPreferences}
              onChange={handleInputChange}
              onBlur={() => handleBlur("sexualPreferences")}
              className={getInputClassName("sexualPreferences")}
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
              <option value="">Select preference</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="lgbtq+">LGBTQ+</option>
            </select>
            {touched.sexualPreferences && errors.sexualPreferences && (
              <p className="mt-1 text-sm text-red-500">
                {errors.sexualPreferences}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Racial preferences
            </label>
            <select
              name="racialPreferences"
              value={formData.racialPreferences}
              onChange={handleInputChange}
              onBlur={() => handleBlur("racialPreferences")}
              className={getInputClassName("racialPreferences")}
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
              <option value="">Select preference</option>
              <option value="asian">Asian</option>
              <option value="caucasian">Caucasian</option>
              <option value="african">African</option>
              <option value="hispanic">Hispanic</option>
              <option value="mixed">Mixed</option>
            </select>
            {touched.racialPreferences && errors.racialPreferences && (
              <p className="mt-1 text-sm text-red-500">
                {errors.racialPreferences}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Meeting interests
            </label>
            <select
              name="meetingInterests"
              value={formData.meetingInterests}
              onChange={handleInputChange}
              onBlur={() => handleBlur("meetingInterests")}
              className={getInputClassName("meetingInterests")}
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
              <option value="">Select interest</option>
              <option value="friends">Friends</option>
              <option value="dating">Dating</option>
              <option value="relationship">Long-term relationship</option>
              <option value="casual">Casual meeting</option>
            </select>
            {touched.meetingInterests && errors.meetingInterests && (
              <p className="mt-1 text-sm text-red-500">
                {errors.meetingInterests}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hobbies / Interests (Maximum 10)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(formData.interests || []).map((chip, i) => (
              <span
                key={`${chip}-${i}`}
                className="flex items-center gap-2 rounded-sm bg-[#F4EBF2] px-3 py-1 text-md font-bold text-[#7D2262]"
              >
                {chip}
                <button
                  onClick={() => removeChip(i)}
                  className="rounded-full bg-[#F4EBF2] px-0 text-[#7D2262] text-xl font-bold hover:bg-[#950028]"
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
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A62D82] disabled:bg-gray-100"
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
            <p className="mt-1 text-sm text-yellow-600">
              Maximum 10 interests reached
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Step 3 ------------------------------ */

const Step3 = React.forwardRef<
  { uploadPhotosToSupabase: () => Promise<string[]> },
  {
    formData: FormData;
    photos: string[];
    setPhotos: (next: string[]) => void;
  }
>(({ formData, photos, setPhotos }, ref) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<boolean[]>(Array(5).fill(false));
  const [uploadError, setUploadError] = useState<string | null>(null);

  // เก็บรูปเป็น File objects แทน URL
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>(
    Array(5).fill(null)
  );
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(
    Array(5).fill("")
  );

  // สร้าง array ของ items สำหรับ Reorder
  const [photoItems, setPhotoItems] = useState<Array<{
    id: string;
    file: File | null;
    preview: string;
    index: number;
  }>>(
    Array.from({ length: 5 }, (_, i) => ({
      id: `photo-${i}`,
      file: null,
      preview: "",
      index: i,
    }))
  );

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

  // ฟังก์ชันสำหรับจัดเรียงรูปให้ติดกัน
  const compactPhotos = (files: (File | null)[], previews: string[]) => {
    const compactedFiles = Array(5).fill(null);
    const compactedPreviews = Array(5).fill("");

    let writeIndex = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i] !== null) {
        compactedFiles[writeIndex] = files[i];
        compactedPreviews[writeIndex] = previews[i];
        writeIndex++;
      }
    }

    return { compactedFiles, compactedPreviews };
  };

  // ฟังก์ชันสำหรับอัปเดต photoItems ตาม photoFiles
  const updatePhotoItems = (files: (File | null)[], previews: string[]) => {
    setPhotoItems(prev =>
      prev.map((item, index) => ({
        ...item,
        file: files[index],
        preview: previews[index],
      }))
    );
  };

  const validateCurrentPhotos = (files: (File | null)[]) => { // EDIT                                               
    const photoCount = files.filter((file) => file !== null).length; // EDIT                                       
    const validation = validatePhotos(Array(photoCount).fill("temp")); // EDIT                                     
    setErrors(validation.errors); // EDIT                                                                           
  }; // EDIT

  // useEffect สำหรับจัดเรียงใหม่หลัง 1.5 วินาที
  useEffect(() => {
    const timer = setTimeout(() => {
      // ตรวจสอบว่ามีช่องว่างหรือไม่
      const hasEmptySlots = photoFiles.some((file, index) => {
        if (file === null) return false;
        // ตรวจสอบว่ามีช่องว่างก่อนหน้านี้หรือไม่
        for (let i = 0; i < index; i++) {
          if (photoFiles[i] === null) return true;
        }
        return false;
      });

      if (hasEmptySlots) {
        // จัดเรียงรูปให้ติดกัน
        const { compactedFiles, compactedPreviews } = compactPhotos(photoFiles, photoPreviews);

        setPhotoFiles(compactedFiles);
        setPhotoPreviews(compactedPreviews);
        updatePhotoItems(compactedFiles, compactedPreviews);

        const remainingPhotos = compactedFiles.filter((f) => f !== null);
        setPhotos(Array(remainingPhotos.length).fill("temp"));

        validateCurrentPhotos(compactedFiles);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [photoFiles, photoPreviews]); // ทำงานเมื่อ photoFiles หรือ photoPreviews เปลี่ยน

  const onFiles = async (files: FileList | null, index: number) => {
    if (!files || files.length === 0) return;

    let file = files[0];
    setUploadError(null);

    // ตรวจสอบขนาดไฟล์ (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size cannot exceed 10MB");
      return;
    }

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select only image files");
      return;
    }

    // บีบอัดถ้าไฟล์ใหญ่กว่า 1MB
    if (file.size > 1 * 1024 * 1024) {
      try {
        const { compressImageToTarget } = await import(
          "@/lib/image/browserImageProcessor"
        );
        file = await compressImageToTarget(file, 1 * 1024 * 1024);
      } catch (e) {
        console.error("Compress failed:", e);
        setUploadError("Failed to compress image. Please try again.");
        return;
      }
    }

    setUploading((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    try {
      const previewUrl = URL.createObjectURL(file);

      // สร้าง arrays ใหม่
      const newPhotoFiles = [...photoFiles];
      const newPhotoPreviews = [...photoPreviews];

      // ใส่รูปในตำแหน่งที่เลือก
      newPhotoFiles[index] = file;
      newPhotoPreviews[index] = previewUrl;

      // อัปเดต state ทันที (useEffect จะจัดการการจัดเรียงใหม่)
      setPhotoFiles(newPhotoFiles);
      setPhotoPreviews(newPhotoPreviews);
      updatePhotoItems(newPhotoFiles, newPhotoPreviews);

      const remainingPhotos = newPhotoFiles.filter((f) => f !== null);
      setPhotos(Array(remainingPhotos.length).fill("temp"));

      validateCurrentPhotos(newPhotoFiles);
    } catch (error: unknown) {
      console.error("File processing error:", error);
      setUploadError("Failed to process image. Please try again.");
    } finally {
      setUploading((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  };

  const remove = async (idx: number) => {
    // ลบ preview URL
    if (photoPreviews[idx]) {
      URL.revokeObjectURL(photoPreviews[idx]);
    }

    // สร้าง arrays ใหม่
    const newPhotoFiles = [...photoFiles];
    const newPhotoPreviews = [...photoPreviews];

    // ลบรูปในตำแหน่งที่เลือก
    newPhotoFiles[idx] = null;
    newPhotoPreviews[idx] = "";

    // อัปเดต state ทันที (useEffect จะจัดการการจัดเรียงใหม่)
    setPhotoFiles(newPhotoFiles);
    setPhotoPreviews(newPhotoPreviews);
    updatePhotoItems(newPhotoFiles, newPhotoPreviews);

    const remainingPhotos = newPhotoFiles.filter((f) => f !== null);
    setPhotos(Array(remainingPhotos.length).fill("temp"));

    validateCurrentPhotos(newPhotoFiles);
  };

  // จัดการการเรียงลำดับใหม่ (drag & drop)
  const handleReorder = (newOrder: typeof photoItems) => {
    // สร้าง arrays ใหม่จากลำดับที่ลาก
    const newPhotoFiles = newOrder.map(item => item.file);
    const newPhotoPreviews = newOrder.map(item => item.preview);

    // อัปเดต state ทันที
    setPhotoFiles(newPhotoFiles);
    setPhotoPreviews(newPhotoPreviews);
    setPhotoItems(newOrder);

    const remainingPhotos = newPhotoFiles.filter((f) => f !== null);
    setPhotos(Array(remainingPhotos.length).fill("temp"));

    validateCurrentPhotos(newPhotoFiles);
  };

  // ฟังก์ชันสำหรับ upload รูปไป Supabase
  const uploadPhotosToSupabase = async (): Promise<string[]> => {
    console.log("uploadPhotosToSupabase called");
    const uploadedUrls: string[] = [];

    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      if (file) {
        try {
          const { uploadProfilePhoto } = await import(
            "@/lib/supabase/uploadPhotoUtils"
          );
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

    return uploadedUrls;
  };

  // Expose upload function to parent component
  React.useImperativeHandle(ref, () => ({
    uploadPhotosToSupabase,
  }));

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-[#2A0B21]">
        Profile pictures
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Upload at least 2 photos. Drag to reorder. Main photo will be the first
        one.
      </p>

      <Reorder.Group
        axis="x"
        values={photoItems}
        onReorder={handleReorder}
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
      >
        <AnimatePresence>
          {photoItems.map((item, i) => {
            const isUploading = uploading[i];
            const hasFile = item.file !== null;
            const isMainPhoto = i === 0 && hasFile;

            return (
              <Reorder.Item
                key={item.id}
                value={item}
                as="div"
                className="relative"
                dragListener={hasFile} // ให้ลากได้เฉพาะเมื่อมีรูป
                whileDrag={{
                  scale: 1.05,
                  rotate: 2,
                  zIndex: 1000,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
                whileHover={hasFile ? { scale: 1.02 } : {}}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
              >
                <motion.div
                  className={`flex aspect-square items-center justify-center rounded-xl bg-gray-100 transition-all duration-200 ${photoFiles.filter((f) => f !== null).length < 2 && i < 2
                      ? "border-red-300"
                      : "border-gray-300"
                    }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  layout // เพิ่ม layout animation
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
                      layout // เพิ่ม layout animation
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
                        onClick={() => remove(i)}
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
                      layout // เพิ่ม layout animation
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
                {!hasFile && !isUploading && (
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={(e) => onFiles(e.target.files, i)}
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

      {errors.photos && (
        <motion.p
          className="mt-4 text-sm text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {errors.photos}
        </motion.p>
      )}

      <motion.div
        className="mt-4 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {photoFiles.filter((f) => f !== null).length}/5 photos ready
      </motion.div>
    </div>
  );
});

Step3.displayName = "Step3";
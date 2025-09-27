import NavBarNonUser from "@/components/NavBarNonUser";
import StepIndicator from "@/components/register/StepIndicator";
import RegisterStep from "@/components/register/RegisterStep";
import FooterSummitStep from "@/components/register/FooterSummitStep";
import { useState } from "react";
import {
  validateBasicInfo,
  validateIdentitiesAndInterests,
  validatePhotos,
} from "@/middleware/register-validation";
import { useRouter } from "next/router";
import { uploadPhotosOnConfirm } from "@/components/register/RegisterStep";
import { useRef } from "react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const step3Ref = useRef<{ uploadPhotosToSupabase: () => Promise<string[]> } | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "", // ตั้งค่าเริ่มต้นเป็น 18 ปีที่แล้ว
    location: "",
    city: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    sexualIdentities: "",
    sexualPreferences: "",
    racialPreferences: "",
    meetingInterests: "",
    interests: [] as string[],
    photos: [] as string[],
  });

  const titles = [
    "Basic Information",
    "Identities and Interests",
    "Upload Photos",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setPhotos = (next: string[]) => {
    setFormData((prev) => ({ ...prev, photos: next }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      const validation = validateBasicInfo(formData);
      return validation.isValid;
    }
    if (step === 2) {
      const validation = validateIdentitiesAndInterests(formData);
      return validation.isValid;
    }
    if (step === 3) {
      const validation = validatePhotos(formData.photos);
      return validation.isValid;
    }
    return false;
  };

  // ฟังก์ชันสำหรับเรียก API register
  const handleSubmitRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Upload รูปไป Supabase ก่อน
      let uploadedPhotoUrls: string[] = [];
      
      // รอ 100ms ให้ Step3 component render เสร็จก่อน
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (step3Ref.current) {
        console.log("step3Ref.current exists, uploading photos...");
        uploadedPhotoUrls = await uploadPhotosOnConfirm(step3Ref);
      } else {
        console.log("step3Ref.current is null, using existing photos");
        // ถ้าไม่มี ref ให้ใช้ photos เดิม
        uploadedPhotoUrls = formData.photos;
      }

      // 2. อัปเดต formData ด้วย URL ที่ upload แล้ว
      const updatedFormData = {
        ...formData,
        photos: uploadedPhotoUrls,
      };

      // 3. ส่งข้อมูลไป API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData), // ใช้ updatedFormData แทน formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Register Failed");
      }

      // แสดงข้อความสำเร็จ
      // alert(result.message || 'Register Successfully');

      // เปลี่ยนเส้นทางไปหน้า login
      router.push("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (currentStep < 3 && validateStep(currentStep))
      setCurrentStep((s) => s + 1);
    if (currentStep === 3 && validateStep(3)) {
      // เรียก API register
      void handleSubmitRegister();
    }
  };

  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-white">
      <NavBarNonUser />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header row */}
        <div className="flex max-xs:flex-col items-center justify-between max-xs:my-4 max-xs:gap-4 max-xs:items-start">
          <div>
            <span className="text-[#7B4429] text-lg font-semibold">
              REGISTER
            </span>
            <h1 className="mt-2 text-6xl max-xs:text-4xl font-extrabold text-[#A62D82]">
              Join us and start
              <br />
              matching
            </h1>
          </div>
          <div className="items-end max-xs:items-center max-xs:scale-95 mt-16 max-xs:mt-4 mr-10 max-xs:mr-0">
            <StepIndicator currentStep={currentStep} titles={titles} />
          </div>
        </div>

        {/* Middle: Register steps */}
        <div className="mt-10">
          <RegisterStep
            currentStep={currentStep}
            formData={formData}
            handleInputChange={handleInputChange}
            setPhotos={setPhotos}
            setInterests={(chips) =>
              setFormData((prev) => ({ ...prev, interests: chips }))
            }
            step3Ref={step3Ref}
          />
        </div>

        {/* แสดง error message ถ้ามี */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Bottom controls */}
        <FooterSummitStep
          currentStep={currentStep}
          totalSteps={3}
          canProceed={validateStep(currentStep) && !loading}
          onBack={goBack}
          onNext={goNext}
        />

        {/* แสดง loading state */}
        {loading && (
          <div className="mt-4 text-center">
            <p className="text-gray-600">Registering...</p>
          </div>
        )}
      </div>
    </div>
  );
}

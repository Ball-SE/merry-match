import NavBarNonUser from "@/components/NavBarNonUser";
import StepIndicator from "@/components/register/StepIndicator";
import RegisterStep from "@/components/register/RegisterStep";
import FooterSummitStep from "@/components/register/FooterSummitStep";
import { useState } from "react";
import { validateBasicInfo, validateIdentitiesAndInterests, validatePhotos } from "@/middleware/register-validation";

const getDefaultBirthDate = () => {
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return eighteenYearsAgo.toISOString().split('T')[0];
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth:  getDefaultBirthDate(), // ตั้งค่าเริ่มต้นเป็น 18 ปีที่แล้ว
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

  const titles = ["Basic Information", "Identities and Interests", "Upload Photos"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setPhotos = (next: string[]) => {
    setFormData(prev => ({ ...prev, photos: next }));
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'การสมัครสมาชิกล้มเหลว');
      }

      // แสดงข้อความสำเร็จ
      alert(result.message || 'การสมัครสมาชิกสำเร็จ!');
      
      // เปลี่ยนเส้นทางไปหน้า login หรือหน้าอื่น
      // Router.push("/login");
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (currentStep < 3 && validateStep(currentStep)) setCurrentStep(s => s + 1);
    if (currentStep === 3 && validateStep(3)) {
      // เรียก API register
      void handleSubmitRegister();
    }
  };

  const goBack = () => setCurrentStep(s => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-white">
      <NavBarNonUser />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[#7B4429] text-lg font-semibold">REGISTER</span>
            <h1 className="mt-2 text-6xl font-extrabold text-[#A62D82]">
              Join us and start<br />matching
            </h1>
          </div>

          <StepIndicator currentStep={currentStep} titles={titles} />
        </div>

        {/* Middle: Register steps */}
        <div className="mt-10">
          <RegisterStep
            currentStep={currentStep}
            formData={formData}
            handleInputChange={handleInputChange}
            setPhotos={setPhotos}
            setInterests={(chips) => setFormData(prev => ({ ...prev, interests: chips }))}
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
            <p className="text-gray-600">กำลังดำเนินการสมัครสมาชิก...</p>
          </div>
        )}
      </div>
    </div>
  );
}
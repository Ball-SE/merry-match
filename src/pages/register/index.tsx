import NavBarNonUser from "@/components/NavBarNonUser";
import StepIndicator from "@/components/register/StepIndicator";
import RegisterStep from "@/components/register/RegisterStep";
import FooterSummitStep from "@/components/register/FooterSummitStep";
import { useState } from "react";
import { validateBasicInfo, validateIdentitiesAndInterests, validatePhotos } from "@/middleware/register-validation";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
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

  const goNext = () => {
    if (currentStep < 3 && validateStep(currentStep)) setCurrentStep(s => s + 1);
    if (currentStep === 3 && validateStep(3)) {
      // Submit placeholder
      console.log("Submit:", formData);
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

        {/* Bottom controls */}
        <FooterSummitStep
          currentStep={currentStep}
          totalSteps={3}
          canProceed={validateStep(currentStep) as boolean}
          onBack={goBack}
          onNext={goNext}
        />
      </div>
    </div>
  );
}
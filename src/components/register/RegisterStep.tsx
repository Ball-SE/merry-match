import { useState } from "react";

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
  return <Step3 photos={formData.photos} setPhotos={setPhotos} />;
}

/* ------------------------------ Step 1 ------------------------------ */
function Step1({
  formData,
  handleInputChange,
}: {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
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
              placeholder="At least 2 characters"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Date of birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            >
              <option value="">Thailand</option>
              <option value="bangkok">Bangkok</option>
              <option value="chiang-mai">Chiang Mai</option>
              <option value="phuket">Phuket</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            >
              <option value="">Bangkok</option>
              <option value="chatuchak">Chatuchak</option>
              <option value="sukhumvit">Sukhumvit</option>
              <option value="silom">Silom</option>
            </select>
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
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@website.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            />
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
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            />
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

  const addChip = () => {
    const trimmed = chipInput.trim();
    if (!trimmed) return;
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            >
              <option value="">Male</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="lgbtq+">LGBTQ+</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Sexual preferences</label>
            <select
              name="sexualPreferences"
              value={formData.sexualPreferences}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            >
              <option value="">Female</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="lgbtq+">LGBTQ+</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Racial preferences</label>
            <select
              name="racialPreferences"
              value={formData.racialPreferences}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            >
              <option value="">Asian</option>
              <option value="asian">Asian</option>
              <option value="caucasian">Caucasian</option>
              <option value="african">African</option>
              <option value="hispanic">Hispanic</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Meeting interests</label>
            <select
              name="meetingInterests"
              value={formData.meetingInterests}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            >
              <option value="">Friends</option>
              <option value="friends">Friends</option>
              <option value="dating">Dating</option>
              <option value="relationship">Long-term relationship</option>
              <option value="casual">Casual meeting</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hobbies / Interests (Maximum 10)
          </label>
          <div className="flex flex-wrap gap-2">
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
          <div className="mt-3 flex gap-2">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C70039]"
            />
            <button onClick={addChip} className="button-primary bg-[#C70039] text-white">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Step 3 ------------------------------ */
function Step3({
  photos,
  setPhotos,
}: {
  photos: string[];
  setPhotos: (next: string[]) => void;
}) {
  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const readers = Array.from(files).slice(0, 6 - photos.length).map(file => {
      return new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(urls => setPhotos([...(photos || []), ...urls]));
  };

  const remove = (idx: number) => {
    const next = [...photos];
    next.splice(idx, 1);
    setPhotos(next);
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-[#2A0B21]">Profile pictures</h2>
      <p className="mb-6 text-sm text-gray-600">Upload at least 2 photos</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const url = photos[i];
          return (
            <div key={i} className="relative">
              <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                {url ? (
                  <img src={url} alt={`photo-${i}`} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#C70039] text-white">+</div>
                    <span className="text-xs text-gray-500">{i === 0 ? "Main photo" : "Upload photo"}</span>
                  </div>
                )}
              </div>

              {!url ? (
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => onFiles(e.target.files)}
                />
              ) : (
                <button
                  onClick={() => remove(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C70039] text-white hover:bg-[#950028]"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export interface LocationOption {
    value: string;   // ใช้เป็นค่าใน form
    label: string;   // ข้อความที่โชว์
  }
  
  export const EXTRA_LOCATION_OPTIONS: LocationOption[] = [
    { value: "chon-buri", label: "Chon Buri" },
    { value: "nakhon-ratchasima", label: "Nakhon Ratchasima" },
    { value: "khon-kaen", label: "Khon Kaen" },
    { value: "chiang-rai", label: "Chiang Rai" },
    { value: "rayong", label: "Rayong" },
    { value: "samut-prakan", label: "Samut Prakan" },
  ];
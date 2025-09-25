export interface Country {
    value: string;
    label: string;
    code: string; // ISO country code
  }
  
  export const SEA_COUNTRIES: Country[] = [
    { value: "thailand", label: "Thailand", code: "TH" },
    { value: "singapore", label: "Singapore", code: "SG" },
    { value: "malaysia", label: "Malaysia", code: "MY" },
    { value: "indonesia", label: "Indonesia", code: "ID" },
    { value: "philippines", label: "Philippines", code: "PH" },
    { value: "vietnam", label: "Vietnam", code: "VN" },
    { value: "myanmar", label: "Myanmar", code: "MM" },
    // { value: "cambodia", label: "Cambodia", code: "KH" },
    { value: "laos", label: "Laos", code: "LA" },
    // { value: "brunei", label: "Brunei", code: "BN" },
    // { value: "east-timor", label: "East Timor", code: "TL" }
  ];
  
  // สำหรับใช้ใน select options
  export const SEA_COUNTRY_OPTIONS = SEA_COUNTRIES.map(country => ({
    value: country.value,
    label: country.label
  }));
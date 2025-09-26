export interface City {
    value: string;
    label: string;
  }
  
  export interface CountryCities {
    country: string;
    cities: City[];
  }
  
  export const SEA_CITIES_BY_COUNTRY: Record<string, City[]> = {
    "thailand": [
      { value: "bangkok", label: "Bangkok" },
      { value: "chiang-mai", label: "Chiang Mai" },
      { value: "phuket", label: "Phuket" },
      { value: "pattaya", label: "Pattaya" },
      { value: "khon-kaen", label: "Khon Kaen" }
    ],
    "singapore": [
      { value: "singapore-city", label: "Singapore City" },
      { value: "jurong-east", label: "Jurong East" },
      { value: "tampines", label: "Tampines" },
      { value: "woodlands", label: "Woodlands" },
      { value: "bedok", label: "Bedok" }
    ],
    "malaysia": [
      { value: "kuala-lumpur", label: "Kuala Lumpur" },
      { value: "george-town", label: "George Town" },
      { value: "johor-bahru", label: "Johor Bahru" },
      { value: "ipoh", label: "Ipoh" },
      { value: "kuching", label: "Kuching" }
    ],
    "indonesia": [
      { value: "jakarta", label: "Jakarta" },
      { value: "surabaya", label: "Surabaya" },
      { value: "bandung", label: "Bandung" },
      { value: "medan", label: "Medan" },
      { value: "semarang", label: "Semarang" }
    ],
    "philippines": [
      { value: "manila", label: "Manila" },
      { value: "cebu-city", label: "Cebu City" },
      { value: "davao-city", label: "Davao City" },
      { value: "quezon-city", label: "Quezon City" },
      { value: "makati", label: "Makati" }
    ],
    "vietnam": [
      { value: "ho-chi-minh-city", label: "Ho Chi Minh City" },
      { value: "hanoi", label: "Hanoi" },
      { value: "da-nang", label: "Da Nang" },
      { value: "hai-phong", label: "Hai Phong" },
      { value: "can-tho", label: "Can Tho" }
    ],
    "myanmar": [
      { value: "yangon", label: "Yangon" },
      { value: "mandalay", label: "Mandalay" },
      { value: "naypyidaw", label: "Naypyidaw" },
      { value: "mawlamyine", label: "Mawlamyine" },
      { value: "taunggyi", label: "Taunggyi" }
    ],
    "cambodia": [
      { value: "phnom-penh", label: "Phnom Penh" },
      { value: "siem-reap", label: "Siem Reap" },
      { value: "battambang", label: "Battambang" },
      { value: "sihanoukville", label: "Sihanoukville" },
      { value: "kampong-cham", label: "Kampong Cham" }
    ],
    "laos": [
      { value: "vientiane", label: "Vientiane" },
      { value: "luang-prabang", label: "Luang Prabang" },
      { value: "pakse", label: "Pakse" },
      { value: "savannakhet", label: "Savannakhet" },
      { value: "luang-namtha", label: "Luang Namtha" }
    ],
    "brunei": [
      { value: "bandar-seri-begawan", label: "Bandar Seri Begawan" },
      { value: "kuwait", label: "Kuwait" },
      { value: "tutong", label: "Tutong" },
      { value: "sengkurong", label: "Sengkurong" },
      { value: "seria", label: "Seria" }
    ],
    "east-timor": [
      { value: "dili", label: "Dili" },
      { value: "baucau", label: "Baucau" },
      { value: "maliana", label: "Maliana" },
      { value: "suai", label: "Suai" },
      { value: "liquica", label: "Liquica" }
    ]
  };
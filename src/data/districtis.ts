export interface Option {
    value: string;
    label: string; // English display name
  }
  
  // key must match the value used in the Location select
  export const DISTRICTS_BY_PROVINCE: Record<string, Option[]> = {
    // Bangkok (50 districts)
    "bangkok": [
      { value: "phra-nakhon", label: "Phra Nakhon" },
      { value: "dusit", label: "Dusit" },
      { value: "nong-chok", label: "Nong Chok" },
      { value: "bang-rak", label: "Bang Rak" },
      { value: "bang-khen", label: "Bang Khen" },
      { value: "bang-kapi", label: "Bang Kapi" },
      { value: "pathum-wan", label: "Pathum Wan" },
      { value: "pom-prap-sattru-phai", label: "Pom Prap Sattru Phai" },
      { value: "phra-khanong", label: "Phra Khanong" },
      { value: "min-buri", label: "Min Buri" },
      { value: "lat-krabang", label: "Lat Krabang" },
      { value: "yan-nawa", label: "Yan Nawa" },
      { value: "samphanthawong", label: "Samphanthawong" },
      { value: "phaya-thai", label: "Phaya Thai" },
      { value: "thon-buri", label: "Thon Buri" },
      { value: "bangkok-yai", label: "Bangkok Yai" },
      { value: "huai-khwang", label: "Huai Khwang" },
      { value: "khlong-san", label: "Khlong San" },
      { value: "taling-chan", label: "Taling Chan" },
      { value: "bangkok-noi", label: "Bangkok Noi" },
      { value: "bang-khun-thian", label: "Bang Khun Thian" },
      { value: "phasi-charoen", label: "Phasi Charoen" },
      { value: "nong-khaem", label: "Nong Khaem" },
      { value: "rat-burana", label: "Rat Burana" },
      { value: "bang-phlat", label: "Bang Phlat" },
      { value: "din-daeng", label: "Din Daeng" },
      { value: "bueng-kum", label: "Bueng Kum" },
      { value: "sathon", label: "Sathon" },
      { value: "bang-sue", label: "Bang Sue" },
      { value: "chatuchak", label: "Chatuchak" },
      { value: "bang-kho-laem", label: "Bang Kho Laem" },
      { value: "prawet", label: "Prawet" },
      { value: "khlong-toei", label: "Khlong Toei" },
      { value: "suan-luang", label: "Suan Luang" },
      { value: "chom-thong", label: "Chom Thong" },
      { value: "don-mueang", label: "Don Mueang" },
      { value: "ratchathewi", label: "Ratchathewi" },
      { value: "lat-phrao", label: "Lat Phrao" },
      { value: "watthana", label: "Watthana" },
      { value: "bang-khae", label: "Bang Khae" },
      { value: "lak-si", label: "Lak Si" },
      { value: "sai-mai", label: "Sai Mai" },
      { value: "khan-na-yao", label: "Khan Na Yao" },
      { value: "saphan-sung", label: "Saphan Sung" },
      { value: "wang-thonglang", label: "Wang Thonglang" },
      { value: "khlong-sam-wa", label: "Khlong Sam Wa" },
      { value: "thawi-watthana", label: "Thawi Watthana" },
      { value: "thung-khru", label: "Thung Khru" },
      { value: "bang-bon", label: "Bang Bon" },
      { value: "bang-na", label: "Bang Na" }
    ],
  
    // Chiang Mai (25 districts)
    "chiang-mai": [
      { value: "mueang-chiang-mai", label: "Mueang Chiang Mai" },
      { value: "chom-thong", label: "Chom Thong" },
      { value: "mae-chaem", label: "Mae Chaem" },
      { value: "chiang-dao", label: "Chiang Dao" },
      { value: "doi-saket", label: "Doi Saket" },
      { value: "mae-taeng", label: "Mae Taeng" },
      { value: "mae-rim", label: "Mae Rim" },
      { value: "samoeng", label: "Samoeng" },
      { value: "fang", label: "Fang" },
      { value: "mae-ai", label: "Mae Ai" },
      { value: "phrao", label: "Phrao" },
      { value: "san-pa-tong", label: "San Pa Tong" },
      { value: "hang-dong", label: "Hang Dong" },
      { value: "hot", label: "Hot" },
      { value: "doi-tao", label: "Doi Tao" },
      { value: "omkoi", label: "Omkoi" },
      { value: "saraphi", label: "Saraphi" },
      { value: "wiang-haeng", label: "Wiang Haeng" },
      { value: "chai-prakan", label: "Chai Prakan" },
      { value: "san-kamphaeng", label: "San Kamphaeng" },
      { value: "san-sai", label: "San Sai" },
      { value: "mae-wang", label: "Mae Wang" },
      { value: "mae-on", label: "Mae On" },
      { value: "doi-lo", label: "Doi Lo" },
      { value: "galyani-vadhana", label: "Galyani Vadhana" }
    ],
  
    // Phuket (3 districts)
  "phuket": [
    { value: "mueang-phuket", label: "Mueang Phuket" },
    { value: "kathu", label: "Kathu" },
    { value: "thalang", label: "Thalang" }
  ],

  // Chon Buri (11 districts)
  "chon-buri": [
    { value: "mueang-chon-buri", label: "Mueang Chon Buri" },
    { value: "ban-bueng", label: "Ban Bueng" },
    { value: "bo-thong", label: "Bo Thong" },
    { value: "ko-chan", label: "Ko Chan" },
    { value: "nong-yai", label: "Nong Yai" },
    { value: "bang-lamung", label: "Bang Lamung" },
    { value: "phan-thong", label: "Phan Thong" },
    { value: "phanat-nikhom", label: "Phanat Nikhom" },
    { value: "sattahip", label: "Sattahip" },
    { value: "si-racha", label: "Si Racha" },
    { value: "ko-si-chang", label: "Ko Si Chang" }
  ],

  // Nakhon Ratchasima (32 districts)
  "nakhon-ratchasima": [
    { value: "mueang-nakhon-ratchasima", label: "Mueang Nakhon Ratchasima" },
    { value: "ban-lueam", label: "Ban Lueam" },
    { value: "chakkarat", label: "Chakkarat" },
    { value: "chaloem-phra-kiat", label: "Chaloem Phra Kiat" },
    { value: "chok-chai", label: "Chok Chai" },
    { value: "chum-phuang", label: "Chum Phuang" },
    { value: "dan-khun-thot", label: "Dan Khun Thot" },
    { value: "huai-thalaeng", label: "Huai Thalaeng" },
    { value: "kham-sakaesaeng", label: "Kham Sakaesaeng" },
    { value: "kham-thale-so", label: "Kham Thale So" },
    { value: "khon-buri", label: "Khon Buri" },
    { value: "khong", label: "Khong" },
    { value: "lam-plai-mat", label: "Lam Plai Mat" },
    { value: "non-sung", label: "Non Sung" },
    { value: "non-thai", label: "Non Thai" },
    { value: "pak-chong", label: "Pak Chong" },
    { value: "pak-thong-chai", label: "Pak Thong Chai" },
    { value: "phimai", label: "Phimai" },
    { value: "phra-thong-kham", label: "Phra Thong Kham" },
    { value: "phutthaisong", label: "Phutthaisong" },
    { value: "prathai", label: "Prathai" },
    { value: "sikhio", label: "Sikhio" },
    { value: "soeng-sang", label: "Soeng Sang" },
    { value: "sung-noen", label: "Sung Noen" },
    { value: "wang-nam-khiao", label: "Wang Nam Khiao" },
    { value: "watthana-nakhon", label: "Watthana Nakhon" },
    { value: "yong", label: "Yong" },
    { value: "ban-pai", label: "Ban Pai" },
    { value: "ban-wa", label: "Ban Wa" },
    { value: "chak-karat", label: "Chak Karat" },
    { value: "khong-yang", label: "Khong Yang" },
    { value: "non-daeng", label: "Non Daeng" }
  ],

  // Khon Kaen (26 districts)
  "khon-kaen": [
    { value: "mueang-khon-kaen", label: "Mueang Khon Kaen" },
    { value: "ban-fang", label: "Ban Fang" },
    { value: "ban-haet", label: "Ban Haet" },
    { value: "ban-phai", label: "Ban Phai" },
    { value: "chonnabot", label: "Chonnabot" },
    { value: "chum-phae", label: "Chum Phae" },
    { value: "khao-suwan-kiri", label: "Khao Suwan Kiri" },
    { value: "kranuan", label: "Kranuan" },
    { value: "mancha-khiri", label: "Mancha Khiri" },
    { value: "nam-phong", label: "Nam Phong" },
    { value: "nong-na-kham", label: "Nong Na Kham" },
    { value: "nong-ruea", label: "Nong Ruea" },
    { value: "nong-song-hong", label: "Nong Song Hong" },
    { value: "phu-kradueng", label: "Phu Kradueng" },
    { value: "phu-wiang", label: "Phu Wiang" },
    { value: "phra-yuen", label: "Phra Yuen" },
    { value: "pueai-noi", label: "Pueai Noi" },
    { value: "sam-sung", label: "Sam Sung" },
    { value: "si-chomphu", label: "Si Chomphu" },
    { value: "sikhio", label: "Sikhio" },
    { value: "soeng-sang", label: "Soeng Sang" },
    { value: "waeng-noi", label: "Waeng Noi" },
    { value: "waeng-yai", label: "Waeng Yai" },
    { value: "wang-saphung", label: "Wang Saphung" },
    { value: "wiang-khao", label: "Wiang Khao" },
    { value: "chum-phae", label: "Chum Phae" }
  ],

  // Chiang Rai (18 districts)
  "chiang-rai": [
    { value: "mueang-chiang-rai", label: "Mueang Chiang Rai" },
    { value: "ban-ruam-mit", label: "Ban Ruam Mit" },
    { value: "chiang-khong", label: "Chiang Khong" },
    { value: "chiang-saen", label: "Chiang Saen" },
    { value: "doi-luang", label: "Doi Luang" },
    { value: "khun-tan", label: "Khun Tan" },
    { value: "mae-chan", label: "Mae Chan" },
    { value: "mae-fa-luang", label: "Mae Fa Luang" },
    { value: "mae-lao", label: "Mae Lao" },
    { value: "mae-sai", label: "Mae Sai" },
    { value: "mae-suai", label: "Mae Suai" },
    { value: "pa-daet", label: "Pa Daet" },
    { value: "phan", label: "Phan" },
    { value: "phaya-mengrai", label: "Phaya Mengrai" },
    { value: "phu-sang", label: "Phu Sang" },
    { value: "thoeng", label: "Thoeng" },
    { value: "wiang-chai", label: "Wiang Chai" },
    { value: "wiang-pa-pao", label: "Wiang Pa Pao" }
  ],

  // Rayong (8 districts)
  "rayong": [
    { value: "mueang-rayong", label: "Mueang Rayong" },
    { value: "ban-chang", label: "Ban Chang" },
    { value: "ban-khai", label: "Ban Khai" },
    { value: "khao-chamao", label: "Khao Chamao" },
    { value: "klang", label: "Klang" },
    { value: "nikhom-pattana", label: "Nikhom Pattana" },
    { value: "pluak-daeng", label: "Pluak Daeng" },
    { value: "wang-chan", label: "Wang Chan" }
  ],

  // Samut Prakan (6 districts)
  "samut-prakan": [
    { value: "mueang-samut-prakan", label: "Mueang Samut Prakan" },
    { value: "bang-bo", label: "Bang Bo" },
    { value: "bang-phli", label: "Bang Phli" },
    { value: "bang-sao-thong", label: "Bang Sao Thong" },
    { value: "phra-pradaeng", label: "Phra Pradaeng" },
    { value: "phra-samut-chedi", label: "Phra Samut Chedi" }
  ]
};
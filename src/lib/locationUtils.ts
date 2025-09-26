/**
 * Location utility functions for handling location data mapping and formatting
 */

export interface LocationMapping {
  [key: string]: string;
}

// Location mapping configuration
const LOCATION_MAP: LocationMapping = {
  // Phuket areas
  'kathu': 'Phuket, Thailand',
  'patong': 'Phuket, Thailand',
  'phuket_town': 'Phuket, Thailand',
  'chalong': 'Phuket, Thailand',
  'rawai': 'Phuket, Thailand',
  'karon': 'Phuket, Thailand',
  'kamala': 'Phuket, Thailand',
  'bang_tao': 'Phuket, Thailand',
  
  // Other locations
  'bangkok': 'Bangkok, Thailand',
  'chiang_mai': 'Chiang Mai, Thailand',
  'chiang_rai': 'Chiang Rai, Thailand',
  'pattaya': 'Pattaya, Thailand',
  'phuket': 'Phuket, Thailand',
  'krabi': 'Krabi, Thailand',
  'koh_samui': 'Koh Samui, Thailand',
  'koh_phangan': 'Koh Phangan, Thailand',
  'koh_tao': 'Koh Tao, Thailand',
  'hua_hin': 'Hua Hin, Thailand',
  'kanchanaburi': 'Kanchanaburi, Thailand',
  'ayutthaya': 'Ayutthaya, Thailand'
};

/**
 * Maps raw location data to user-friendly location string
 * @param locationData - Raw location data (string or object)
 * @returns Formatted location string
 */
export function mapLocationToString(locationData: unknown): string {
  // Validate input
  if (!locationData) {
    return 'Bangkok, Thailand';
  }

  let locationValue = '';

  // Handle different location data types
  if (typeof locationData === 'string') {
    locationValue = locationData;
  } else if (typeof locationData === 'object' && locationData && 'city' in locationData) {
    locationValue = (locationData as { city: string }).city;
  } else {
    return 'Bangkok, Thailand';
  }

  // Clean and normalize location value
  const normalizedLocation = locationValue.toLowerCase().trim();
  
  // Return mapped location or fallback
  return LOCATION_MAP[normalizedLocation] || 
         `${locationValue.charAt(0).toUpperCase() + locationValue.slice(1)}, Thailand`;
}

/**
 * Validates if location data is valid
 * @param locationData - Location data to validate
 * @returns true if valid, false otherwise
 */
export function isValidLocation(locationData: unknown): boolean {
  if (!locationData) return false;
  
  if (typeof locationData === 'string') {
    return locationData.trim().length > 0;
  }
  
  if (typeof locationData === 'object' && locationData && 'city' in locationData) {
    const city = (locationData as { city: string }).city;
    return typeof city === 'string' && city.trim().length > 0;
  }
  
  return false;
}

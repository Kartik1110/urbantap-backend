/**
 * Dubai Localities with their approximate central coordinates
 * These coordinates represent the center point of each locality for proximity calculations
 */

export interface LocalityCoordinates {
  name: string;
  lat: number;
  lng: number;
}

export const DUBAI_LOCALITIES: LocalityCoordinates[] = [
  { name: "Al Barsha 1", lat: 25.1180, lng: 55.2000 },
  { name: "Al Barsha South", lat: 25.1080, lng: 55.1900 },
  { name: "Al Jaddaf", lat: 25.2200, lng: 55.3200 },
  { name: "Al Kifaf", lat: 25.2300, lng: 55.3100 },
  { name: "Al Quoz 1", lat: 25.1500, lng: 55.2200 },
  { name: "Al Satwa", lat: 25.2200, lng: 55.2600 },
  { name: "Al Sufouh", lat: 25.1200, lng: 55.1800 },
  { name: "Al Sufouh 1", lat: 25.1250, lng: 55.1850 },
  { name: "Al Sufouh 2", lat: 25.1150, lng: 55.1750 },
  { name: "Al Wasl", lat: 25.2100, lng: 55.2500 },
  { name: "Barsha Heights", lat: 25.1100, lng: 55.1950 },
  { name: "Business Bay", lat: 25.1900, lng: 55.2700 },
  { name: "City of Arabia", lat: 25.0500, lng: 55.1200 },
  { name: "Downtown Dubai", lat: 25.2000, lng: 55.2800 },
  { name: "Dubai Festival City", lat: 25.2200, lng: 55.3400 },
  { name: "Dubai Investments Park", lat: 25.0500, lng: 55.2200 },
  { name: "Dubai Islands", lat: 25.1200, lng: 55.3400 },
  { name: "Dubai Marina", lat: 25.0800, lng: 55.1300 },
  { name: "Dubai Production City", lat: 25.0600, lng: 55.2300 },
  { name: "Dubai Silicon Oasis", lat: 25.1200, lng: 55.3500 },
  { name: "Emirates Hills", lat: 25.0700, lng: 55.1400 },
  { name: "Golf City", lat: 25.0800, lng: 55.1500 },
  { name: "Green Community Village", lat: 25.0900, lng: 55.1600 },
  { name: "Jabal Ali Industrial First", lat: 25.0400, lng: 55.1100 },
  { name: "Jabal Ali Industrial Second", lat: 25.0300, lng: 55.1000 },
  { name: "Jumeirah 2", lat: 25.2100, lng: 55.2600 },
  { name: "Jumeirah 3", lat: 25.2000, lng: 55.2500 },
  { name: "Jumeirah Lake Towers", lat: 25.0700, lng: 55.1200 },
  { name: "Jumeirah Village Circle", lat: 25.0600, lng: 55.1300 },
  { name: "Madinat Hind 4", lat: 25.0400, lng: 55.1400 },
  { name: "Mina Jebel Ali", lat: 25.0200, lng: 55.0900 },
  { name: "Muhaisnah 1", lat: 25.2400, lng: 55.3600 },
  { name: "Muhaisnah 3", lat: 25.2500, lng: 55.3700 },
  { name: "Nad Al Sheba", lat: 25.1300, lng: 55.3600 },
  { name: "Nad Al Sheba 1", lat: 25.1350, lng: 55.3650 },
  { name: "Nad Al Sheba 2", lat: 25.1250, lng: 55.3550 },
  { name: "Nadd Al Hamar", lat: 25.2400, lng: 55.3800 },
  { name: "Ras Al Khor", lat: 25.2300, lng: 55.3500 },
  { name: "Ras Al Khor Industrial Area 1", lat: 25.2400, lng: 55.3400 },
  { name: "Saih Shuaib 2", lat: 25.0100, lng: 55.0800 },
  { name: "The Palm Jumeirah", lat: 25.1100, lng: 55.1100 },
  { name: "Umm Suqeim 3", lat: 25.2000, lng: 55.2400 },
  { name: "Wadi Al Safa 5", lat: 25.0000, lng: 55.0700 },
  { name: "Mirdif", lat: 25.2500, lng: 55.3900 },
  { name: "Deira", lat: 25.2700, lng: 55.3200 },
  { name: "Liwan", lat: 25.0200, lng: 55.0600 }
];

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the closest locality to the given coordinates
 * @param lat Latitude of the point
 * @param lng Longitude of the point
 * @returns The name of the closest locality
 */
export function findClosestLocality(lat: number, lng: number): string {
  let closestLocality = "";
  let minDistance = Infinity;
  
  for (const locality of DUBAI_LOCALITIES) {
    const distance = calculateDistance(lat, lng, locality.lat, locality.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestLocality = locality.name;
    }
  }
  
  return closestLocality;
}

/**
 * Find the closest locality with distance information
 * @param lat Latitude of the point
 * @param lng Longitude of the point
 * @returns Object containing the closest locality name and distance
 */
export function findClosestLocalityWithDistance(lat: number, lng: number): { locality: string; distance: number } {
  let closestLocality = "";
  let minDistance = Infinity;
  
  for (const locality of DUBAI_LOCALITIES) {
    const distance = calculateDistance(lat, lng, locality.lat, locality.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestLocality = locality.name;
    }
  }
  
  return { locality: closestLocality, distance: minDistance };
}

/**
 * Get all localities as a simple array of names
 */
export function getAllLocalityNames(): string[] {
  return DUBAI_LOCALITIES.map(locality => locality.name);
}

/**
 * Validate if a locality name exists in our predefined list
 * @param localityName The locality name to validate
 * @returns True if the locality exists in our list
 */
export function isValidLocality(localityName: string): boolean {
  return DUBAI_LOCALITIES.some(locality => 
    locality.name.toLowerCase() === localityName.toLowerCase()
  );
}

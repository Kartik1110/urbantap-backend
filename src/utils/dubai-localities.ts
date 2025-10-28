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
    { name: 'Al Barsha 1', lat: 25.118, lng: 55.2 },
    { name: 'Al Barsha South', lat: 25.108, lng: 55.19 },
    { name: 'Al Jaddaf', lat: 25.22, lng: 55.32 },
    { name: 'Al Kifaf', lat: 25.23, lng: 55.31 },
    { name: 'Al Quoz 1', lat: 25.15, lng: 55.22 },
    { name: 'Al Satwa', lat: 25.22, lng: 55.26 },
    { name: 'Al Sufouh', lat: 25.12, lng: 55.18 },
    { name: 'Al Sufouh 1', lat: 25.125, lng: 55.185 },
    { name: 'Al Sufouh 2', lat: 25.115, lng: 55.175 },
    { name: 'Al Wasl', lat: 25.21, lng: 55.25 },
    { name: 'Barsha Heights', lat: 25.11, lng: 55.195 },
    { name: 'Business Bay', lat: 25.19, lng: 55.27 },
    { name: 'City of Arabia', lat: 25.05, lng: 55.12 },
    { name: 'Downtown Dubai', lat: 25.2, lng: 55.28 },
    { name: 'Dubai Festival City', lat: 25.22, lng: 55.34 },
    { name: 'Dubai Investments Park', lat: 25.05, lng: 55.22 },
    { name: 'Dubai Islands', lat: 25.12, lng: 55.34 },
    { name: 'Dubai Marina', lat: 25.08, lng: 55.13 },
    { name: 'Dubai Production City', lat: 25.06, lng: 55.23 },
    { name: 'Dubai Silicon Oasis', lat: 25.12, lng: 55.35 },
    { name: 'Emirates Hills', lat: 25.07, lng: 55.14 },
    { name: 'Golf City', lat: 25.08, lng: 55.15 },
    { name: 'Green Community Village', lat: 25.09, lng: 55.16 },
    { name: 'Jabal Ali Industrial First', lat: 25.04, lng: 55.11 },
    { name: 'Jabal Ali Industrial Second', lat: 25.03, lng: 55.1 },
    { name: 'Jumeirah 2', lat: 25.21, lng: 55.26 },
    { name: 'Jumeirah 3', lat: 25.2, lng: 55.25 },
    { name: 'Jumeirah Lake Towers', lat: 25.07, lng: 55.12 },
    { name: 'Jumeirah Village Circle', lat: 25.06, lng: 55.13 },
    { name: 'Madinat Hind 4', lat: 25.04, lng: 55.14 },
    { name: 'Mina Jebel Ali', lat: 25.02, lng: 55.09 },
    { name: 'Muhaisnah 1', lat: 25.24, lng: 55.36 },
    { name: 'Muhaisnah 3', lat: 25.25, lng: 55.37 },
    { name: 'Nad Al Sheba', lat: 25.13, lng: 55.36 },
    { name: 'Nad Al Sheba 1', lat: 25.135, lng: 55.365 },
    { name: 'Nad Al Sheba 2', lat: 25.125, lng: 55.355 },
    { name: 'Nadd Al Hamar', lat: 25.24, lng: 55.38 },
    { name: 'Ras Al Khor', lat: 25.23, lng: 55.35 },
    { name: 'Ras Al Khor Industrial Area 1', lat: 25.24, lng: 55.34 },
    { name: 'Saih Shuaib 2', lat: 25.01, lng: 55.08 },
    { name: 'The Palm Jumeirah', lat: 25.11, lng: 55.11 },
    { name: 'Umm Suqeim 3', lat: 25.2, lng: 55.24 },
    { name: 'Wadi Al Safa 5', lat: 25.0, lng: 55.07 },
    { name: 'Mirdif', lat: 25.25, lng: 55.39 },
    { name: 'Deira', lat: 25.27, lng: 55.32 },
    { name: 'Liwan', lat: 25.02, lng: 55.06 },
];

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

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
    let closestLocality = '';
    let minDistance = Infinity;

    for (const locality of DUBAI_LOCALITIES) {
        const distance = calculateDistance(
            lat,
            lng,
            locality.lat,
            locality.lng
        );
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
export function findClosestLocalityWithDistance(
    lat: number,
    lng: number
): { locality: string; distance: number } {
    let closestLocality = '';
    let minDistance = Infinity;

    for (const locality of DUBAI_LOCALITIES) {
        const distance = calculateDistance(
            lat,
            lng,
            locality.lat,
            locality.lng
        );
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
    return DUBAI_LOCALITIES.map((locality) => locality.name);
}

/**
 * Validate if a locality name exists in our predefined list
 * @param localityName The locality name to validate
 * @returns True if the locality exists in our list
 */
export function isValidLocality(localityName: string): boolean {
    return DUBAI_LOCALITIES.some(
        (locality) => locality.name.toLowerCase() === localityName.toLowerCase()
    );
}

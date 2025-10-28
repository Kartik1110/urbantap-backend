import {
    findClosestLocality,
    findClosestLocalityWithDistance,
} from './dubai-localities';

/**
 * Assign locality directly from coordinates using proximity-based calculation
 * This function doesn't require Google Maps API and works purely with coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns Object with assigned locality and distance
 */
export function assignLocalityFromCoordinates(
    lat: number,
    lng: number
): { locality: string; distance: number } {
    return findClosestLocalityWithDistance(lat, lng);
}

/**
 * Get the closest locality name from coordinates (without distance info)
 * @param lat Latitude
 * @param lng Longitude
 * @returns The name of the closest locality
 */
export function getClosestLocality(lat: number, lng: number): string {
    return findClosestLocality(lat, lng);
}

/**
 * Enhanced geocoding with proximity-based locality assignment
 * This combines Google's geocoding with our predefined locality assignment
 * @param address Address to geocode
 * @returns Enhanced geocode result with proximity-based locality
 */
export async function geocodeWithProximityLocality(address: string): Promise<{
    formatted_address: string;
    lat: number;
    lng: number;
    locality: string;
    locality_distance: number;
} | null> {
    // Import geocodeAddress dynamically to avoid circular dependencies
    const { geocodeAddress } = await import('./geocoding');

    const result = await geocodeAddress(address);

    if (result && result.lat && result.lng) {
        const localityResult = assignLocalityFromCoordinates(
            result.lat,
            result.lng
        );

        return {
            formatted_address: result.formatted_address,
            lat: result.lat,
            lng: result.lng,
            locality: localityResult.locality,
            locality_distance: localityResult.distance,
        };
    }

    return null;
}

/**
 * Enhanced reverse geocoding with proximity-based locality assignment
 * @param lat Latitude
 * @param lng Longitude
 * @returns Enhanced reverse geocode result with proximity-based locality
 */
export async function reverseGeocodeWithProximityLocality(
    lat: number,
    lng: number
): Promise<{
    formatted_address: string;
    locality: string;
    locality_distance: number;
} | null> {
    // Import reverseGeocode dynamically to avoid circular dependencies
    const { reverseGeocode } = await import('./geocoding');

    const result = await reverseGeocode(lat, lng);

    if (result) {
        const localityResult = assignLocalityFromCoordinates(lat, lng);

        return {
            formatted_address: result.formatted_address,
            locality: localityResult.locality,
            locality_distance: localityResult.distance,
        };
    }

    return null;
}

import logger from './logger';

// Use global fetch (available in Node.js 18+)
declare const fetch: typeof globalThis.fetch;

// Interfaces for geocoding
interface AddressComponent {
    long_name: string;
    types: string[];
}

interface GeocodeResponse {
    status: string;
    results: Array<{
        formatted_address: string;
        address_components: AddressComponent[];
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }>;
}

export interface GeocodeResult {
    formatted_address: string;
    lat: number;
    lng: number;
    locality: string | null;
}

// Locality extraction utility functions
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

function extractLocality(components: AddressComponent[]): string | null {
    // First try to find neighborhood
    for (const component of components) {
        if (component.types.includes('neighborhood')) {
            return component.long_name;
        }
    }

    // Then try sublocality
    for (const component of components) {
        if (component.types.includes('sublocality')) {
            return component.long_name;
        }
    }

    // Finally try locality
    for (const component of components) {
        if (component.types.includes('locality')) {
            return component.long_name;
        }
    }

    return null;
}

export async function geocodeAddress(
    address: string
): Promise<GeocodeResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn('GOOGLE_MAPS_API_KEY not configured, skipping geocoding');
        return null;
    }

    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const data: GeocodeResponse = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            const locality = extractLocality(result.address_components);

            return {
                formatted_address: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                locality,
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        logger.error('Geocoding error:', error);
        return null;
    }
}

export async function reverseGeocode(
    lat: number,
    lng: number
): Promise<{ formatted_address: string; locality: string | null } | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn(
            'GOOGLE_MAPS_API_KEY not configured, skipping reverse geocoding'
        );
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const data: GeocodeResponse = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            const locality = extractLocality(result.address_components);

            return {
                formatted_address: result.formatted_address,
                locality,
            };
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        logger.error('Reverse geocoding error:', error);
        return null;
    }
}

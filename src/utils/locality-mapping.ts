import LOCALITIES from '@/data/localities';

const uniqueLocalitiesList: string[] = LOCALITIES;

export interface AddressComponent {
    long_name: string;
    types: string[];
}

export interface GeocodeResult {
    formatted_address: string;
    lat: number;
    lng: number;
    locality: string | null;
    components: AddressComponent[];
}

export interface ReverseGeocodeResult {
    formatted_address: string;
    locality: string | null;
    components: AddressComponent[];
}

/**
 * Maps address components to one of the 187 unique localities
 * @param components - Array of address components from Google Maps API
 * @returns The matched unique locality or "Dubai" if no match found
 */
export function mapToUniqueLocality(components: AddressComponent[]): string {
    if (!components || components.length === 0) {
        return 'Dubai';
    }

    // Check each component against our unique localities
    for (const component of components) {
        const componentName = component.long_name;

        // Direct match
        if (uniqueLocalitiesList.includes(componentName)) {
            return componentName;
        }

        // Case-insensitive match
        const lowerCaseComponent = componentName.toLowerCase();
        for (const uniqueLocality of uniqueLocalitiesList) {
            if (uniqueLocality.toLowerCase() === lowerCaseComponent) {
                return uniqueLocality;
            }
        }
    }

    return 'Dubai';
}

/**
 * Updates locality for a single listing or project
 * @param updateData - The data to update (address, coordinates, locality)
 * @param recordId - The ID of the record to update
 * @param recordType - Either 'listing' or 'project'
 * @param prisma - Prisma client instance
 */
export async function updateRecordLocality(
    updateData: any,
    recordId: string,
    recordType: 'listing' | 'project',
    prisma: any
): Promise<void> {
    if (recordType === 'listing') {
        await prisma.listing.update({
            where: { id: recordId },
            data: updateData,
        });
    } else {
        await prisma.project.update({
            where: { id: recordId },
            data: updateData,
        });
    }
}

/**
 * Gets the unique localities list
 * @returns Array of unique locality names
 */
export function getUniqueLocalities(): string[] {
    return uniqueLocalitiesList;
}

/**
 * Checks if a locality exists in the unique localities list
 * @param locality - The locality name to check
 * @returns True if the locality exists in the list
 */
export function isUniqueLocality(locality: string): boolean {
    return uniqueLocalitiesList.includes(locality);
}

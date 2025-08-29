interface DataJsonProperty {
    newParam?: {
        floorPlan?: Array<{
            name: string;
            [key: string]: any;
        }>;
        [key: string]: any;
    };
    [key: string]: any;
}

export function extract_unit_types(property: DataJsonProperty): string[] {
    if (!property.newParam?.floorPlan || !Array.isArray(property.newParam.floorPlan)) {
        return ['1BHK']; // default fallback
    }
    
    const unitTypes = new Set<string>();
    
    for (const floorPlan of property.newParam.floorPlan) {
        if (floorPlan.name) {
            const unitType = map_floorplan_name_to_unit_type(floorPlan.name);
            if (unitType) {
                unitTypes.add(unitType);
            }
        }
    }
    
    return unitTypes.size > 0 ? Array.from(unitTypes) : ['1BHK'];
}

function map_floorplan_name_to_unit_type(name: string): string | null {
    const normalizedName = name.toLowerCase().trim();
    
    // Map to exact enum values from your schema
    if (normalizedName.includes('studio')) return 'Studio';
    if (normalizedName.includes('1 bedroom') || normalizedName.includes('1 bed')) return '1BHK';
    if (normalizedName.includes('2 bedroom') || normalizedName.includes('2 bed')) return '2BHK';
    if (normalizedName.includes('3 bedroom') || normalizedName.includes('3 bed')) return '3BHK';
    if (normalizedName.includes('4 bedroom') || normalizedName.includes('4 bed')) return '4BHK';
    if (normalizedName.includes('5 bedroom') || normalizedName.includes('5 bed')) return '5BHK';
    if (normalizedName.includes('6 bedroom') || normalizedName.includes('6 bed')) return '6BHK';
    if (normalizedName.includes('villa')) return 'Villa';
    if (normalizedName.includes('apartment')) return 'Apartment';
    if (normalizedName.includes('penthouse') || normalizedName.includes('ph')) return 'PentHouse';
    if (normalizedName.includes('resort')) return 'Resort';
    if (normalizedName.includes('duplex')) return 'Duplex';
    
    return null;
}

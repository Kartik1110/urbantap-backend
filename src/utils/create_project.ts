import { PrismaClient, Currency, Category, City, Furnished, Payment_Plan } from '@prisma/client';
import { extract_developer, check_developer_in_db } from './extract_developer';
import { extract_unit_types } from './extract_unit_types';

const prisma = new PrismaClient();

interface DataJsonProperty {
    id: number;
    title: string;
    description: string;
    photos: string[];
    price: number;
    developer: string;
    developerLogo?: string;
    region: string;
    cityName: string;
    amenities: string[];
    bedRooms: number;
    newParam?: {
        handoverTime?: string;
        maxSize?: number;
        minSize?: number;
        bedroomMax?: string;
        bedroomMin?: string;
        paymentPlan?: string;
        position?: string;
        totalFloor?: string;
        floorPlan?: Array<{
            name: string;
            area?: number;
            [key: string]: any;
        }>;
        [key: string]: any;
    };
    [key: string]: any;
}

export async function create_project(property: DataJsonProperty) {
    try {
        // Extract developer and check in DB
        const developerName = property.developer;
        const developerResult = await check_developer_in_db(developerName);
        
        // Only create project if developer match found
        if (!developerResult.matchFound || !developerResult.developerId) {
            console.log(`Cannot create project - no developer match for: ${developerName}`);
            return null;
        }
        
        // Extract unit types from floor plan
        const unitTypes = extract_unit_types(property);
        
        // Extract floor plan images from S3
        const floorPlanImages = extract_floor_plan_images(property);
        
        // Parse coordinates from position string
        const coordinates = parseCoordinates(property.newParam?.position);
        
        // Parse payment plan
        const paymentPlan2 = parsePaymentPlan(property.newParam?.paymentPlan);
        const paymentPlanDetails = extractPaymentPlanDetails(property.newParam?.paymentPlan);
        
        // Parse handover time
        const handoverTime = property.newParam?.handoverTime ? new Date(property.newParam.handoverTime) : null;
        
        // Map amenities
        const mappedAmenities = mapAmenities(property.amenities);
        
        // Map city
        const city = mapCity(property.cityName);
        
        const project = await prisma.project.create({
            data: {
                title: property.title,
                description: property.description,
                image: property.photos?.[0] || '',
                images: property.photos || [],
                floor_plans: floorPlanImages,
                currency: Currency.AED,
                min_price: 0,
                max_price: property.price || 0,
                address: property.region || '',
                city: city,
                file_url: null,
                type: Category.Off_plan,
                project_name: property.title,
                project_age: 'New',
                total_floor: property.newParam?.totalFloor && property.newParam.totalFloor !== "" ? parseInt(property.newParam.totalFloor) : null,
                min_bedrooms: property.newParam?.bedroomMin && property.newParam.bedroomMin !== "" ? parseInt(property.newParam.bedroomMin) : null,
                max_Bedrooms: property.newParam?.bedroomMax && property.newParam.bedroomMax !== "" ? parseInt(property.newParam.bedroomMax) : null,
                furnished: Furnished.Unfurnished,
                unit_size_min: property.newParam?.minSize !== null && property.newParam?.minSize !== undefined ? property.newParam.minSize : null,
                unit_size_max: property.newParam?.maxSize !== null && property.newParam?.maxSize !== undefined ? property.newParam.maxSize : null,
                plot_size: null,
                payment_plan: paymentPlan2,
                payment_plan2: paymentPlanDetails,
                unit_types: unitTypes,
                amenities: mappedAmenities,
                locality: property.region || null,
                lat: coordinates?.lat || null,
                long: coordinates?.lng || null,
                developer_id: developerResult.developerId,
                handover_time: handoverTime
            }
        });
        
        console.log(`Project created: ${project.title} with developer: ${developerResult.developerName} and unit types: ${unitTypes.join(', ')}`);
        return project;
        
    } catch (error) {
        console.error('Error creating project:', error);
        return null;
    }
}

function parseCoordinates(position?: string): { lat: number; lng: number } | null {
    if (!position) return null;
    
    const coords = position.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { lat: coords[0], lng: coords[1] };
    }
    
    return null;
}

function parsePaymentPlan(paymentPlanStr?: string): Payment_Plan {
    if (!paymentPlanStr) return Payment_Plan.Payment_Pending;
    
    try {
        const plan = JSON.parse(paymentPlanStr);
        if (plan.one && plan.two && plan.three) {
            return Payment_Plan.Payment_Pending; // Custom payment plan
        }
    } catch (error) {
        console.warn('Failed to parse payment plan:', paymentPlanStr);
    }
    
    return Payment_Plan.Payment_Pending;
}

function extractPaymentPlanDetails(paymentPlanStr?: string): string {
    if (!paymentPlanStr) return 'Standard';
    
    try {
        const plan = JSON.parse(paymentPlanStr);
        const parts = [];
        
        if (plan.one && plan.one !== '0') parts.push(`${plan.one}% on booking`);
        if (plan.two && plan.two !== '0') parts.push(`${plan.two}% during construction`);
        if (plan.three && plan.three !== '0') parts.push(`${plan.three}% on completion`);
        if (plan.four && plan.four !== '0') parts.push(`${plan.four}% after handover`);
        
        return parts.length > 0 ? parts.join(', ') : 'Standard';
    } catch (error) {
        console.warn('Failed to parse payment plan details:', paymentPlanStr);
        return 'Standard';
    }
}

function mapAmenities(amenities: string[]): string[] {
    const amenityMap: { [key: string]: string } = {
        "Children's Pool": "ChildrensPool",
        "Shared Gym": "SharedGym",
        "Balcony": "Balcony",
        "Security": "Security",
        "Covered Parking": "CoveredParking",
        "Lobby in Building": "LobbyInBuilding",
        "Shared Pool": "SharedPool",
        "Children's Play Area": "ChildrensPlayArea",
        "View of Water": "ViewOfWater",
        "View of Landmark": "ViewOfLandmark"
    };
    
    return amenities
        .map(amenity => amenityMap[amenity])
        .filter(amenity => amenity !== undefined);
}

function extract_floor_plan_images(property: DataJsonProperty): string[] {
    if (!property.newParam?.floorPlan || !Array.isArray(property.newParam.floorPlan)) {
        return [];
    }
    
    const floorPlanImages: string[] = [];
    
    for (const floorPlan of property.newParam.floorPlan) {
        if (floorPlan.imgUrl && Array.isArray(floorPlan.imgUrl)) {
            floorPlanImages.push(...floorPlan.imgUrl);
        }
    }
    
    return floorPlanImages;
}

function mapCity(cityName: string): City {
    const cityMap: { [key: string]: City } = {
        "Dubai": City.Dubai,
        "Abu Dhabi": City.Abu_Dhabi,
        "Sharjah": City.Sharjah,
        "Ajman": City.Ajman,
        "Umm Al Quwain": City.Umm_Al_Quwain,
        "Ras Al Khaimah": City.Ras_Al_Khaimah,
        "Fujairah": City.Fujairah
    };
    
    return cityMap[cityName] || City.Dubai;
}

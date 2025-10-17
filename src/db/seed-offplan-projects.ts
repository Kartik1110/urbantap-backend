import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { assignLocalityFromCoordinates } from '../utils/locality-assignment';
import prisma from '@/utils/prisma';

// Locality assignment using proximity-based calculation

interface OffPlanListing {
    title: string;
    description: string;
    photos: string[];
    price: number | string;
    region: string;
    developer: string;
    developerLogo?: string; // Developer logo URL
    cityName?: string;
    amenities?: string[];
    handoverTime?: string;
    floorPlan?: FloorPlan[]; // Root level floor plans (if any)
    position?: string;
    paymentPlan?: string;
    propertyType?: string[]; // Property types from JSON data
    newParam?: {
        position?: string;
        floorPlan?: FloorPlan[]; // Floor plans in newParam
        handoverTime?: string; // Handover time in newParam
        paymentPlan?: string; // Payment plan in newParam
        [key: string]: any;
    };
}

interface FloorPlan {
    title: string;
    imgUrl: string[]; // Array of image URLs
    price: number | string;
    area: number;
    name: string; // bedroom info (e.g., "3 Bedrooms", "Studio")
}

interface CompanyMapping {
    offplanDeveloper: string;
    matchedCompanyName: string;
    matchedCompanyId: string;
    confidence: string;
    similarity: number;
}

interface SeedingRecord {
    developerName: string;
    companyId: string;
    companyName: string;
    projectsCreated: number;
    projects: Array<{
        title: string;
        projectId: string;
        floorPlansCount: number;
    }>;
}

// City mapping
const CITY_MAPPING: { [key: string]: string } = {
    "Dubai": "Dubai",
    "Abu Dhabi": "Abu_Dhabi",
    "Sharjah": "Sharjah",
    "Ajman": "Ajman",
    "Ras Al Khaimah": "Ras_Al_Khaimah",
    "Fujairah": "Fujairah",
    "Umm Al Quwain": "Umm_Al_Quwain"
};

// Bedroom mapping from floor plan names to enum values
const BEDROOM_MAPPING: { [key: string]: string } = {
    // Handle the actual values from the JSON data
    "Studio": "Studio",
    "1 Bedroom": "One",
    "2 Bedrooms": "Two",
    "3 Bedrooms": "Three",
    "4 Bedrooms": "Four",
    "5 Bedrooms": "Five",
    "6 Bedrooms": "Six",
    "7 Bedrooms": "Seven",
    // Also handle abbreviated versions if they exist
    "ST": "Studio",
    "1 BR": "One",
    "2 BR": "Two",
    "3 BR": "Three",
    "4 BR": "Four",
    "5 BR": "Five",
    "6 BR": "Six",
    "7 BR": "Seven"
};

// Property type mapping from JSON data to Prisma Type enum values
const PROPERTY_TYPE_MAPPING: { [key: string]: string } = {
    "APARTMENT": "Apartment",
    "DUPLEX": "Duplex", 
    "PENTHOUSE": "Penthouse",
    "RESIDENTIAL_BUILDING": "Residential_Building",
    "TOWNHOUSE": "Townhouse",
    "VILLA": "Villa"
    // Note: COMMERCIAL_BUILDING, HOTEL, etc. are intentionally excluded
};

// Function to map property types to enum values
function mapPropertyTypesToEnum(propertyTypes: string[]): string[] {
    const mappedTypes = propertyTypes
        .map(type => {
            const mappedType = PROPERTY_TYPE_MAPPING[type];
            if (!mappedType) {
                console.warn(`Dropping unmapped property type: ${type}`);
                return null; // Return null for unmapped types
            }
            return mappedType;
        })
        .filter(type => type !== null) // Remove null values (unmapped types)
        .filter((type, index, arr) => arr.indexOf(type) === index); // Remove duplicates
    
    return mappedTypes;
}

// Amenity mapping from JSON data to enum values
const AMENITY_MAPPING: { [key: string]: string } = {
    "Children's Pool": "Swimming_Pool",
    "Shared Gym": "Gym", 
    "Balcony": "Balcony",
    "Security": "Security",
    "Children's Play Area": "Play_Area",
    "Shared Pool": "Swimming_Pool",
    "Covered Parking": "Parking",
    "Lobby in Building": "Lobby",
    "View of Landmark": "Scenic_View",
    "View of Water": "Scenic_View",
    "Built-in Wardrobes": "Wardrobes",
    "CentralA/C": "Air_Conditioning",
    "Shared Spa": "Spa",
    "Built-in Kitchen Appliances": "Kitchen_Appliances",
    "Barbecue Area": "Barbecue_Area",
    "Study": "Study",
    "Concierge Service": "Concierge_Service",
    // Additional common amenities that might appear in the data
    "Pool": "Swimming_Pool",
    "Gym": "Gym",
    "Parking": "Parking",
    "Garden": "Garden",
    "Elevator": "Elevator",
    "AC": "Air_Conditioning",
    "Air Conditioning": "Air_Conditioning",
    "Spa": "Spa",
    "Playground": "Play_Area",
    "Kids Play Area": "Play_Area",
    "Wardrobe": "Wardrobes",
    "Kitchen": "Kitchen_Appliances",
    "BBQ": "Barbecue_Area",
    "Barbecue": "Barbecue_Area",
    "Study Room": "Study",
    "Concierge": "Concierge_Service",
    "24/7 Security": "Security",
    "CCTV": "Security",
    "Jacuzzi": "Jaccuzi",
    "Heating": "Heating",
    "Pets Allowed": "Pets_Allowed"
};

// Track unmapped amenities for future mapping extension
const unmappedAmenities = new Map<string, number>();

// Function to map amenities to enum values
function mapAmenitiesToEnum(amenities: string[]): string[] {
    return amenities
        .map(amenity => {
            const mappedAmenity = AMENITY_MAPPING[amenity];
            if (!mappedAmenity) {
                // Track unmapped amenities
                const currentCount = unmappedAmenities.get(amenity) || 0;
                unmappedAmenities.set(amenity, currentCount + 1);
            }
            return mappedAmenity || amenity;
        })
        .filter((amenity, index, arr) => arr.indexOf(amenity) === index); // Remove duplicates
}

// Function to extract coordinates from position string
function extractCoordinates(listing: OffPlanListing): { latitude: number | null; longitude: number | null } {
    // Handle both listing.position and listing.newParam.position
    let rawPosition: string | undefined = undefined;

    if (typeof listing.position === "string") {
        rawPosition = listing.position;
    } else if (listing.hasOwnProperty("newParam") && (listing as any).newParam?.position) {
        rawPosition = (listing as any).newParam.position;
    }

    if (!rawPosition) return { latitude: null, longitude: null };
    
    const coords = rawPosition.split(",");
    if (coords.length >= 2) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        
        if (!isNaN(lat) && !isNaN(lng)) {
            console.log(`Coordinates extracted: ${lat}, ${lng}`);
            return { latitude: lat, longitude: lng };
        } else {
            console.log(`Failed to parse coordinates: "${coords[0]}" and "${coords[1]}"`);
        }
    }
    
    return { latitude: null, longitude: null };
}

// Function to get locality from coordinates using proximity-based assignment
async function getLocalityFromCoordinates(latitude: number | null, longitude: number | null): Promise<string | null> {
    if (!latitude || !longitude) {
        console.log('   No coordinates available for locality lookup');
        return null;
    }

    console.log(`   Looking up locality for coordinates: ${latitude}, ${longitude}`);
    
    try {
        const result = assignLocalityFromCoordinates(latitude, longitude);
        if (result && result.locality) {
            console.log(`   Found locality: ${result.locality} (${result.distance.toFixed(2)}km away)`);
            return result.locality;
        } else {
            console.log(`   No locality found from coordinates`);
            return null;
        }
    } catch (error) {
        console.error(`   Error getting locality from coordinates:`, error);
        return null;
    }
}

// Function to generate fallback locality for project (used when coordinates are not available)
function generateFallbackLocalityForProject(index: number): string {
    // Use the same 46 localities from our predefined list
    const dubaiLocalities = [
        "Al Barsha 1", "Al Barsha South", "Al Jaddaf", "Al Kifaf", "Al Quoz 1",
        "Al Satwa", "Al Sufouh", "Al Sufouh 1", "Al Sufouh 2", "Al Wasl",
        "Barsha Heights", "Business Bay", "City of Arabia", "Downtown Dubai",
        "Dubai Festival City", "Dubai Investments Park", "Dubai Islands", "Dubai Marina",
        "Dubai Production City", "Dubai Silicon Oasis", "Emirates Hills", "Golf City",
        "Green Community Village", "Jabal Ali Industrial First", "Jabal Ali Industrial Second",
        "Jumeirah 2", "Jumeirah 3", "Jumeirah Lake Towers", "Jumeirah Village Circle",
        "Madinat Hind 4", "Mina Jebel Ali", "Muhaisnah 1", "Muhaisnah 3",
        "Nad Al Sheba", "Nad Al Sheba 1", "Nad Al Sheba 2", "Nadd Al Hamar",
        "Ras Al Khor", "Ras Al Khor Industrial Area 1", "Saih Shuaib 2", "The Palm Jumeirah",
        "Umm Suqeim 3", "Wadi Al Safa 5", "Mirdif", "Deira", "Liwan"
    ];
    
    const localityIndex = index % dubaiLocalities.length;
    return dubaiLocalities[localityIndex];
}

// Function to find or create developer for a company
async function findOrCreateDeveloper(companyName: string): Promise<string> {
    // First find the company by name to get its ID
    const company = await prisma.company.findFirst({
        where: { 
            name: {
                equals: companyName,
                mode: 'insensitive'
            }
        }
    });

    if (!company) {
        throw new Error(`Company not found with name: ${companyName}`);
    }

    let developer = await prisma.developer.findFirst({
        where: { company_id: company.id }
    });

    if (!developer) {
        developer = await prisma.developer.create({
            data: {
                company_id: company.id,
                cover_image: faker.image.avatar(),
                total_projects: 0,
                // years_in_business: faker.number.int({ min: 1, max: 20 })
            }
        });
        console.log(`      Created new developer: ${developer.id} for company: ${companyName} (ID: ${company.id})`);
    } else {
        console.log(`      Using existing developer: ${developer.id} for company: ${companyName}`);
    }

    return developer.id;
}

// Function to update company logo if empty
async function updateCompanyLogoIfEmpty(companyName: string, logoUrl: string) {
    if (!logoUrl) return;
    
    const company = await prisma.company.findFirst({
        where: { 
            name: {
                equals: companyName,
                mode: 'insensitive'
            }
        },
        select: { id: true, logo: true, name: true }
    });
    
    if (company && (!company.logo || company.logo === "")) {
        await prisma.company.update({
            where: { id: company.id },
            data: { logo: logoUrl }
        });
        console.log(`      Updated company logo for: ${companyName} (ID: ${company.id}) with: ${logoUrl}`);
    } else if (company && company.logo && company.logo !== "") {
        console.log(`      Company ${companyName} already has a logo: ${company.logo}`);
    } else {
        console.log(`      Company ${companyName} not found`);
    }
}

// Function to create floor plans for a project
async function createFloorPlans(projectId: string, floorPlans: FloorPlan[], projectPrice?: number): Promise<number> {
    if (!floorPlans || floorPlans.length === 0) return 0;
    
    console.log(`      Creating ${floorPlans.length} floor plans for project ${projectId}`);
    let createdCount = 0;
    
    for (const floorPlan of floorPlans) {
        try {
            console.log(`         Processing floor plan: ${floorPlan.title}`);
            
            // Extract bedroom info from name field
            const bedroomName = floorPlan.name || "Studio";
            const mappedBedrooms = BEDROOM_MAPPING[bedroomName] || "Studio";
            console.log(`            Bedroom mapping: "${bedroomName}" -> "${mappedBedrooms}"`);
            
            // Process price - only use price from JSON data, keep null if not available
            let price: number | null = null;
            if (typeof floorPlan.price === 'string') {
                if (floorPlan.price.trim() !== '') {
                    const parsedPrice = parseFloat(floorPlan.price);
                    if (!isNaN(parsedPrice) && parsedPrice > 0) {
                        price = parsedPrice;
                        console.log(`            Using floor plan price from JSON: ${price}`);
                    }
                }
            } else if (typeof floorPlan.price === 'number' && floorPlan.price > 0) {
                price = floorPlan.price;
                console.log(`            Using floor plan price from JSON: ${price}`);
            }
            
            // If no valid price available, keep it null
            if (!price) {
                console.log(`            No valid price in JSON data, keeping price as null`);
            }
            
            console.log(`            Area: ${floorPlan.area} sq ft`);
            
            // Handle imgUrl - it's an array, so we need to extract the first image or use empty array
            const images = Array.isArray(floorPlan.imgUrl) ? floorPlan.imgUrl : [floorPlan.imgUrl];
            
            await prisma.floorPlan.create({
                data: {
                    title: floorPlan.title || `Floor Plan ${createdCount + 1}`,
                    image_urls: images,
                    min_price: price, // Use price from JSON or null
                    max_price: price, // Use same price for both min and max
                    unit_size: floorPlan.area || 1000,
                    bedrooms: mappedBedrooms as any,
                    project_id: projectId
                }
            });
            
            console.log(`            Created floor plan: ${floorPlan.title}`);
            createdCount++;
        } catch (error) {
            console.error(`         Error creating floor plan:`, error);
        }
    }
    
    console.log(`      Successfully created ${createdCount} floor plans`);
    return createdCount;
}

async function seedOffPlanProjects() {
    console.log("Starting Off-Plan Projects Seeding Process...");
    
    // Log locality assignment configuration
    console.log("Using proximity-based locality assignment from predefined list of 46 Dubai localities");
    console.log("   • Coordinates will be matched to closest locality from your approved list");
    console.log("   • Fallback localities will also use the same 46 predefined localities");

    try {
        // Read company mappings
        const companyMappingsPath = path.join(__dirname, 'dbCompany.json');
        const companyMappingsData = fs.readFileSync(companyMappingsPath, 'utf8');
        const companyMappings: CompanyMapping[] = JSON.parse(companyMappingsData);

        // Create a map of developer names to company info for quick lookup
        const developerToCompanyMap = new Map<string, { companyId: string; companyName: string }>();
        companyMappings.forEach(mapping => {
            if (mapping.offplanDeveloper && mapping.offplanDeveloper.trim() !== '') {
                developerToCompanyMap.set(mapping.offplanDeveloper.trim(), {
                    companyId: mapping.matchedCompanyId,
                    companyName: mapping.matchedCompanyName
                });
            }
        });

        console.log(`Found ${companyMappings.length} company mappings`);
        console.log(`Mapped ${developerToCompanyMap.size} developers to companies`);

        // Read offplan listings data
        const dataPath = path.join(__dirname, 'offPlanListingsWithS3.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const listings: OffPlanListing[] = JSON.parse(rawData);

        console.log(`Found ${listings.length} listings to process`);

        // Filter listings to only include those with exact company matches
        const eligibleListings = listings.filter(listing => {
            if (!listing.developer || listing.developer.trim() === '') {
                return false;
            }
            return developerToCompanyMap.has(listing.developer.trim());
        });

        console.log(`Found ${eligibleListings.length} eligible listings with exact company matches`);
        
        // Show which developers are missing from the mapping
        const allDevelopers = new Set(listings.map(l => l.developer?.trim()).filter(Boolean));
        const mappedDevelopers = new Set(developerToCompanyMap.keys());
        const missingDevelopers = Array.from(allDevelopers).filter(dev => !mappedDevelopers.has(dev));
        
        console.log(`Total unique developers in listings: ${allDevelopers.size}`);
        console.log(`Developers with company mappings: ${mappedDevelopers.size}`);
        console.log(`Developers missing mappings: ${missingDevelopers.length}`);
        
        if (missingDevelopers.length > 0) {
            console.log(`\nSample of developers missing company mappings:`);
            missingDevelopers.slice(0, 10).forEach(dev => {
                console.log(`   • ${dev}`);
            });
            if (missingDevelopers.length > 10) {
                console.log(`   ... and ${missingDevelopers.length - 10} more`);
            }
        }

        // Process eligible listings
        console.log(`Processing eligible listings...`);
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        let localityLookupSuccessCount = 0;
        let localityFallbackCount = 0;
        const seedingRecords: SeedingRecord[] = [];
        const processedCompanies = new Map<string, SeedingRecord>();

        for (let i = 0; i < eligibleListings.length; i++) {
            const listing = eligibleListings[i];

            try {
                // Skip if essential data is missing
                if (!listing.title || !listing.developer || !listing.price || listing.price === "") {
                    console.log(`Skipping listing ${i + 1}: Missing essential data`);
                    skippedCount++;
                    continue;
                }

                const developerName = listing.developer.trim();
                const companyInfo = developerToCompanyMap.get(developerName);

                if (!companyInfo) {
                    console.log(`Skipping listing ${i + 1}: No company match found for "${developerName}"`);
                    skippedCount++;
                    continue;
                }

                console.log(`Processing listing ${i + 1}: "${listing.title}" (Developer: ${developerName})`);
                
                // Debug: Log available fields for first few listings
                if (i < 3) {
                    console.log(`   Available fields: ${Object.keys(listing).join(', ')}`);
                }
                
                // Get payment plan from either root level or newParam
                const paymentPlan = listing.paymentPlan || listing.newParam?.paymentPlan;
                if (paymentPlan) {
                    console.log(`   Payment Plan: ${paymentPlan} -> mapped to payment_plan2`);
                } else {
                    console.log(`   Payment Plan: Not available`);
                }
                
                // Debug: Check if paymentPlan field exists in either location
                if (listing.hasOwnProperty('paymentPlan') || listing.newParam?.hasOwnProperty('paymentPlan')) {
                    console.log(`   Payment Plan field found in listing object`);
                } else {
                    console.log(`   Payment Plan field NOT found in listing object`);
                }

                // Find or create developer for this company
                const developerId = await findOrCreateDeveloper(companyInfo.companyName);
                
                // Update company logo with developer logo if available
                if (listing.developerLogo) {
                    console.log(`   Found developer logo: ${listing.developerLogo}`);
                    await updateCompanyLogoIfEmpty(companyInfo.companyName, listing.developerLogo);
                } else {
                    console.log(`   No developer logo available`);
                }

                // Process price
                const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
                if (isNaN(price) || price <= 0) {
                    console.log(`Skipping listing ${i + 1}: Invalid price ${listing.price}`);
                    skippedCount++;
                    continue;
                }

                // Process city
                const city = listing.cityName || 'Dubai';
                const mappedCity = CITY_MAPPING[city] || 'Dubai';

                // Extract coordinates
                const { latitude, longitude } = extractCoordinates(listing);

                // Get locality from coordinates using proximity-based assignment
                let locality = await getLocalityFromCoordinates(latitude, longitude);
                
                // Fallback to generated locality if coordinates are not available
                if (!locality) {
                    locality = generateFallbackLocalityForProject(i);
                    console.log(`   Using fallback locality: ${locality}`);
                    localityFallbackCount++;
                } else {
                    localityLookupSuccessCount++;
                }

                // Process property types - map to enum values
                const rawPropertyTypes = listing.propertyType || ["APARTMENT"];
                const propertyTypes = mapPropertyTypesToEnum(rawPropertyTypes);
                console.log(`   Raw property types: ${rawPropertyTypes.join(', ')}`);
                console.log(`   Mapped property types: ${propertyTypes.join(', ')}`);

                // Process amenities - map to enum values
                const rawAmenities = listing.amenities || ["Pool", "Gym", "Parking", "Garden", "Security", "Elevator"];
                const amenities = mapAmenitiesToEnum(rawAmenities);
                console.log(`   Raw amenities: ${rawAmenities.join(', ')}`);
                console.log(`   Mapped amenities: ${amenities.join(', ')}`);

                // Process handover time - check both root level and newParam
                let handoverTime: Date | null = null;
                const handoverTimeValue = listing.handoverTime || listing.newParam?.handoverTime;
                
                if (handoverTimeValue) {
                    console.log(`   Handover Time: ${handoverTimeValue}`);
                    const parsedDate = new Date(handoverTimeValue);
                    if (!isNaN(parsedDate.getTime())) {
                        handoverTime = parsedDate;
                        console.log(`   Parsed handover date: ${handoverTime.toISOString()}`);
                    } else {
                        console.log(`   Failed to parse handover date: ${handoverTimeValue}`);
                    }
                } else {
                    console.log(`   Handover Time: Not available`);
                }

                // Log what will be set for payment_plan2
                console.log(`   Setting payment_plan2 to: ${paymentPlan || 'null'}`);
                
                // Create the project
                const project = await prisma.project.create({
                    data: {
                        title: listing.title,
                        description: listing.description || 'No description available',
                        image_urls: listing.photos || [],
                        currency: "AED",
                        min_price: price, // Use actual price from data as min_price
                        max_price: null, // Keep max_price as null
                        address: listing.region || 'Dubai',
                        city: mappedCity as any,
                        brochure_url: null, // Optional field
                        category: "Off_plan" as any,
                        type: propertyTypes as any, // Use mapped property types array
                        project_name: listing.title,
                        project_age: "0", // Off-plan properties are new
                        min_bedrooms: null, // Will be set from floor plans
                        max_bedrooms: null, // Will be set from floor plans
                        furnished: "Furnished" as any,
                        property_size: null, // Will be set from floor plans
                        payment_plan: "Payment_Pending" as any,
                        unit_types: [], // Will be populated from floor plans
                        amenities: amenities as any,
                        developer_id: developerId,
                        handover_year: handoverTime ? handoverTime.getFullYear() : null,
                        latitude: latitude,
                        longitude: longitude,
                        locality: locality,
                        min_sq_ft: null, // Will be set from floor plans
                        max_sq_ft: null, // Will be set from floor plans
                        payment_structure: paymentPlan || null
                    }
                });

                // Create floor plans - check both root level and newParam level
                const floorPlans = listing.floorPlan || listing.newParam?.floorPlan || [];
                if (floorPlans.length > 0) {
                    console.log(`   Found ${floorPlans.length} floor plans to process`);
                } else {
                    console.log(`   No floor plans found for this listing`);
                }
                const floorPlansCount = await createFloorPlans(project.id, floorPlans, price);

                // Update project with aggregated data from floor plans
                if (floorPlansCount > 0) {
                    const floorPlans = await prisma.floorPlan.findMany({
                        where: { project_id: project.id },
                        select: { bedrooms: true, unit_size: true, min_price: true, max_price: true }
                    });

                    if (floorPlans.length > 0) {
                        const bedrooms = floorPlans.map(fp => fp.bedrooms).filter(Boolean) as string[];
                        const sizes = floorPlans.map(fp => fp.unit_size).filter(Boolean);
                        const prices = floorPlans.flatMap(fp => [fp.min_price, fp.max_price]).filter(Boolean);

                        // Sort bedrooms by bedroom count (Studio < One < Two < Three, etc.)
                        const bedroomOrder = ['Studio', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
                        const sortedBedrooms = bedrooms.sort((a, b) => {
                            return bedroomOrder.indexOf(a) - bedroomOrder.indexOf(b);
                        });

                        await prisma.project.update({
                            where: { id: project.id },
                            data: {
                                min_bedrooms: sortedBedrooms.length > 0 ? sortedBedrooms[0] as any : null,
                                max_bedrooms: sortedBedrooms.length > 0 ? sortedBedrooms[sortedBedrooms.length - 1] as any : null,
                                unit_types: sortedBedrooms, // Store all bedroom types in unit_types array
                                min_sq_ft: sizes.length > 0 ? Math.min(...sizes as number[]) : null,
                                max_sq_ft: sizes.length > 0 ? Math.max(...sizes as number[]) : null,
                                // Keep min_price as the original price from data and max_price as null
                                // Don't override the min_price that was set during project creation
                            }
                        });
                    }
                }

                // Update or create seeding record
                if (!processedCompanies.has(companyInfo.companyName)) {
                    processedCompanies.set(companyInfo.companyName, {
                        developerName: developerName,
                        companyId: companyInfo.companyId,
                        companyName: companyInfo.companyName,
                        projectsCreated: 0,
                        projects: []
                    });
                }

                const record = processedCompanies.get(companyInfo.companyName)!;
                record.projectsCreated++;
                record.projects.push({
                    title: listing.title,
                    projectId: project.id,
                    floorPlansCount: floorPlansCount
                });

                successCount++;
                if (successCount % 10 === 0) {
                    console.log(`Processed ${successCount} projects...`);
                }

                // No API rate limiting needed since we're using local proximity calculations

            } catch (error) {
                console.error(`Error processing listing ${i + 1}:`, error);
                errorCount++;
            }
        }

        // Convert processed companies to seeding records
        seedingRecords.push(...Array.from(processedCompanies.values()));

        console.log(`\nSeeding Summary:`);
        console.log(`   • Successfully created: ${successCount} projects`);
        console.log(`   • Errors encountered: ${errorCount} projects`);
        console.log(`   • Skipped: ${skippedCount} listings`);
        console.log(`   • Total processed: ${eligibleListings.length} eligible listings`);
        console.log(`   • Total listings available: ${listings.length}`);
        console.log(`   • Companies processed: ${processedCompanies.size}`);
        console.log(`   • Developers with mappings: ${mappedDevelopers.size}`);
        console.log(`   • Developers missing mappings: ${missingDevelopers.length}`);
        
        // Locality assignment statistics
        console.log(`\nLocality Assignment Statistics:`);
        console.log(`   • Successful proximity-based assignments: ${localityLookupSuccessCount}`);
        console.log(`   • Fallback locality used: ${localityFallbackCount}`);
        console.log(`   • Assignment success rate: ${((localityLookupSuccessCount / (localityLookupSuccessCount + localityFallbackCount)) * 100).toFixed(1)}%`);
        console.log(`   • All localities assigned from predefined list of 46 Dubai localities`);

        // Show sample of processed companies
        console.log(`\nSample Processed Companies:`);
        const sampleCompanies = Array.from(processedCompanies.values()).slice(0, 10);
        for (const record of sampleCompanies) {
            console.log(`   ${record.companyName} (${record.projectsCreated} projects)`);
        }

        // Save seeding records to JSON file
        const recordsPath = path.join(__dirname, 'seeding-records.json');
        fs.writeFileSync(recordsPath, JSON.stringify(seedingRecords, null, 2));
        console.log(`\nSeeding records saved to: seeding-records.json`);

        // Report unmapped amenities
        console.log(`\nUnmapped Amenities Report:`);
        console.log(`   Total unique unmapped amenities: ${unmappedAmenities.size}`);
        
        if (unmappedAmenities.size > 0) {
            // Sort by frequency (most common first)
            const sortedUnmapped = Array.from(unmappedAmenities.entries())
                .sort((a, b) => b[1] - a[1]);
            
            console.log(`\n   Top unmapped amenities (by frequency):`);
            sortedUnmapped.slice(0, 20).forEach(([amenity, count]) => {
                console.log(`   • "${amenity}" (${count} occurrences)`);
            });
            
            if (unmappedAmenities.size > 20) {
                console.log(`   ... and ${unmappedAmenities.size - 20} more unmapped amenities`);
            }
            
            // Save unmapped amenities to JSON file for easy reference
            const unmappedPath = path.join(__dirname, 'unmapped-amenities.json');
            const unmappedData = {
                totalUnmapped: unmappedAmenities.size,
                amenities: Object.fromEntries(sortedUnmapped)
            };
            fs.writeFileSync(unmappedPath, JSON.stringify(unmappedData, null, 2));
            console.log(`\n   Unmapped amenities saved to: unmapped-amenities.json`);
        } else {
            console.log(`   All amenities were successfully mapped! 🎉`);
        }

        console.log(`\nOff-Plan Projects seeded successfully!`);

    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
if (require.main === module) {
    seedOffPlanProjects().catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}

export { seedOffPlanProjects };

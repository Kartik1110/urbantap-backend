import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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
            console.log(`📍 Coordinates extracted: ${lat}, ${lng}`);
            return { latitude: lat, longitude: lng };
        } else {
            console.log(`⚠️ Failed to parse coordinates: "${coords[0]}" and "${coords[1]}"`);
        }
    }
    
    return { latitude: null, longitude: null };
}

// Function to generate locality for project
function generateLocalityForProject(index: number): string {
    const dubaiLocalities = [
        'Jumeirah Village Circle', 'Dubai Hills Estate', 'Dubai Marina', 'Palm Jumeirah',
        'Downtown Dubai', 'Business Bay', 'Al Barsha', 'Al Quoz', 'Al Furjan',
        'Discovery Gardens', 'International City', 'Silicon Oasis', 'Sports City',
        'Motor City', 'Al Marjan Island', 'Jumeirah Heights', 'Warsan',
        'Dubai Creek Harbour', 'Meydan City', 'Nad Al Sheba', 'Dubai Silicon Oasis',
        'Dubai Production City', 'Dubai Studio City', 'Dubai Media City', 'Dubai Internet City',
        'Dubai Knowledge Park', 'Dubai Academic City', 'Dubai Healthcare City',
        'Dubai World Central', 'Dubai South', 'Dubai Investment Park', 'Dubai Techno Park'
    ];
    
    const localityIndex = index % dubaiLocalities.length;
    return dubaiLocalities[localityIndex];
}

// Function to find or create developer for a company
async function findOrCreateDeveloper(companyId: string): Promise<string> {
    let developer = await prisma.developer.findFirst({
        where: { company_id: companyId }
    });

    if (!developer) {
        developer = await prisma.developer.create({
            data: {
                company_id: companyId,
                cover_image: faker.image.avatar(),
                total_projects: 0,
                years_in_business: faker.number.int({ min: 1, max: 20 })
            }
        });
        console.log(`      🆕 Created new developer: ${developer.id} for company: ${companyId}`);
    } else {
        console.log(`      🔄 Using existing developer: ${developer.id}`);
    }

    return developer.id;
}

// Function to update company logo if empty
async function updateCompanyLogoIfEmpty(companyId: string, logoUrl: string) {
    if (!logoUrl) return;
    
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { logo: true }
    });
    
    if (company && (!company.logo || company.logo === "")) {
        await prisma.company.update({
            where: { id: companyId },
            data: { logo: logoUrl }
        });
        console.log(`      🖼️ Updated company logo for: ${companyId} with: ${logoUrl}`);
    } else if (company && company.logo && company.logo !== "") {
        console.log(`      🖼️ Company ${companyId} already has a logo: ${company.logo}`);
    } else {
        console.log(`      ⚠️ Company ${companyId} not found`);
    }
}

// Function to create floor plans for a project
async function createFloorPlans(projectId: string, floorPlans: FloorPlan[], projectPrice?: number): Promise<number> {
    if (!floorPlans || floorPlans.length === 0) return 0;
    
    console.log(`      🏠 Creating ${floorPlans.length} floor plans for project ${projectId}`);
    let createdCount = 0;
    
    for (const floorPlan of floorPlans) {
        try {
            console.log(`         📋 Processing floor plan: ${floorPlan.title}`);
            
            // Extract bedroom info from name field
            const bedroomName = floorPlan.name || "Studio";
            const mappedBedrooms = BEDROOM_MAPPING[bedroomName] || "Studio";
            console.log(`            🛏️ Bedroom mapping: "${bedroomName}" -> "${mappedBedrooms}"`);
            
            // Process price - handle empty strings and use project price as fallback
            let price: number | null = null;
            if (typeof floorPlan.price === 'string') {
                if (floorPlan.price.trim() !== '') {
                    price = parseFloat(floorPlan.price);
                }
            } else if (typeof floorPlan.price === 'number') {
                price = floorPlan.price;
            }
            
            // If floor plan price is not available, use project price with some variation based on area
            if (!price || isNaN(price) || price <= 0) {
                if (projectPrice && floorPlan.area) {
                    // Estimate price based on area ratio (larger units cost more)
                    const basePricePerSqFt = projectPrice / 1000; // Assume 1000 sq ft as base
                    price = Math.round(floorPlan.area * basePricePerSqFt);
                    console.log(`            💰 Using estimated price: ${price} (based on project price and area)`);
                } else {
                    console.log(`            ⚠️ Skipping floor plan due to no price available and no project price fallback`);
                    continue;
                }
            } else {
                console.log(`            💰 Using floor plan price: ${price}`);
            }
            
            console.log(`            📏 Area: ${floorPlan.area} sq ft`);
            
            // Handle imgUrl - it's an array, so we need to extract the first image or use empty array
            const images = Array.isArray(floorPlan.imgUrl) ? floorPlan.imgUrl : [floorPlan.imgUrl];
            
            await prisma.floorPlan.create({
                data: {
                    title: floorPlan.title || `Floor Plan ${createdCount + 1}`,
                    images: images,
                    min_price: price, // Use calculated price
                    // max_price: price, // Use calculated price for now
                    unit_size: floorPlan.area || 1000,
                    bedrooms: mappedBedrooms as any,
                    project_id: projectId
                }
            });
            
            console.log(`            ✅ Created floor plan: ${floorPlan.title}`);
            createdCount++;
        } catch (error) {
            console.error(`         ❌ Error creating floor plan:`, error);
        }
    }
    
    console.log(`      🎉 Successfully created ${createdCount} floor plans`);
    return createdCount;
}

async function seedOffPlanProjects() {
    console.log("🚀 Starting Off-Plan Projects Seeding Process...");

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

        console.log(`📊 Found ${companyMappings.length} company mappings`);
        console.log(`📊 Mapped ${developerToCompanyMap.size} developers to companies`);

        // Read offplan listings data
        const dataPath = path.join(__dirname, 'offPlanListingsWithS3.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const listings: OffPlanListing[] = JSON.parse(rawData);

        console.log(`📊 Found ${listings.length} listings to process`);

        // Filter listings to only include those with exact company matches
        const eligibleListings = listings.filter(listing => {
            if (!listing.developer || listing.developer.trim() === '') {
                return false;
            }
            return developerToCompanyMap.has(listing.developer.trim());
        });

        console.log(`📊 Found ${eligibleListings.length} eligible listings with exact company matches`);
        
        // Show which developers are missing from the mapping
        const allDevelopers = new Set(listings.map(l => l.developer?.trim()).filter(Boolean));
        const mappedDevelopers = new Set(developerToCompanyMap.keys());
        const missingDevelopers = Array.from(allDevelopers).filter(dev => !mappedDevelopers.has(dev));
        
        console.log(`📊 Total unique developers in listings: ${allDevelopers.size}`);
        console.log(`📊 Developers with company mappings: ${mappedDevelopers.size}`);
        console.log(`📊 Developers missing mappings: ${missingDevelopers.length}`);
        
        if (missingDevelopers.length > 0) {
            console.log(`\n⚠️ Sample of developers missing company mappings:`);
            missingDevelopers.slice(0, 10).forEach(dev => {
                console.log(`   • ${dev}`);
            });
            if (missingDevelopers.length > 10) {
                console.log(`   ... and ${missingDevelopers.length - 10} more`);
            }
        }

        // Process eligible listings
        console.log(`🏠 Processing eligible listings...`);
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        const seedingRecords: SeedingRecord[] = [];
        const processedCompanies = new Map<string, SeedingRecord>();

        for (let i = 0; i < eligibleListings.length; i++) {
            const listing = eligibleListings[i];

            try {
                // Skip if essential data is missing
                if (!listing.title || !listing.developer || !listing.price || listing.price === "") {
                    console.log(`⚠️ Skipping listing ${i + 1}: Missing essential data`);
                    skippedCount++;
                    continue;
                }

                const developerName = listing.developer.trim();
                const companyInfo = developerToCompanyMap.get(developerName);

                if (!companyInfo) {
                    console.log(`⚠️ Skipping listing ${i + 1}: No company match found for "${developerName}"`);
                    skippedCount++;
                    continue;
                }

                console.log(`🔍 Processing listing ${i + 1}: "${listing.title}" (Developer: ${developerName})`);
                
                // Debug: Log available fields for first few listings
                if (i < 3) {
                    console.log(`   🔍 Available fields: ${Object.keys(listing).join(', ')}`);
                }
                
                // Get payment plan from either root level or newParam
                const paymentPlan = listing.paymentPlan || listing.newParam?.paymentPlan;
                if (paymentPlan) {
                    console.log(`   💰 Payment Plan: ${paymentPlan} -> mapped to payment_plan2`);
                } else {
                    console.log(`   💰 Payment Plan: Not available`);
                }
                
                // Debug: Check if paymentPlan field exists in either location
                if (listing.hasOwnProperty('paymentPlan') || listing.newParam?.hasOwnProperty('paymentPlan')) {
                    console.log(`   🔍 Payment Plan field found in listing object`);
                } else {
                    console.log(`   🔍 Payment Plan field NOT found in listing object`);
                }

                // Find or create developer for this company
                const developerId = await findOrCreateDeveloper(companyInfo.companyId);
                
                // Update company logo with developer logo if available
                if (listing.developerLogo) {
                    console.log(`   🖼️ Found developer logo: ${listing.developerLogo}`);
                    await updateCompanyLogoIfEmpty(companyInfo.companyId, listing.developerLogo);
                } else {
                    console.log(`   🖼️ No developer logo available`);
                }

                // Process price
                const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
                if (isNaN(price) || price <= 0) {
                    console.log(`⚠️ Skipping listing ${i + 1}: Invalid price ${listing.price}`);
                    skippedCount++;
                    continue;
                }

                // Process city
                const city = listing.cityName || 'Dubai';
                const mappedCity = CITY_MAPPING[city] || 'Dubai';

                // Extract coordinates
                const { latitude, longitude } = extractCoordinates(listing);

                // Generate locality
                const locality = generateLocalityForProject(i);

                // Process amenities
                const amenities = listing.amenities || ["Pool", "Gym", "Parking", "Garden", "Security", "Elevator"];

                // Process handover time - check both root level and newParam
                let handoverTime: Date | null = null;
                const handoverTimeValue = listing.handoverTime || listing.newParam?.handoverTime;
                
                if (handoverTimeValue) {
                    console.log(`   📅 Handover Time: ${handoverTimeValue}`);
                    const parsedDate = new Date(handoverTimeValue);
                    if (!isNaN(parsedDate.getTime())) {
                        handoverTime = parsedDate;
                        console.log(`   ✅ Parsed handover date: ${handoverTime.toISOString()}`);
                    } else {
                        console.log(`   ⚠️ Failed to parse handover date: ${handoverTimeValue}`);
                    }
                } else {
                    console.log(`   📅 Handover Time: Not available`);
                }

                // Log what will be set for payment_plan2
                console.log(`   💳 Setting payment_plan2 to: ${paymentPlan || 'null'}`);
                
                // Create the project
                const project = await prisma.project.create({
                    data: {
                        title: listing.title,
                        description: listing.description || 'No description available',
                        image: listing.photos?.[0] || '',
                        images: listing.photos || [],
                        currency: "AED",
                        min_price: price , // 10% variation
                        // max_price: price * 1.1, // 10% variation
                        address: listing.region || 'Dubai',
                        city: mappedCity as any,
                        type: "Off_plan" as any,
                        project_name: listing.title,
                        project_age: "0", // Off-plan properties are new
                        min_bedrooms: null, // Will be set from floor plans
                        max_bedrooms: null, // Will be set from floor plans
                        furnished: "Furnished" as any,
                        property_size: null, // Will be set from floor plans
                        payment_plan: "Payment_Pending" as any,
                        unit_types: [], // Will be populated from floor plans
                        amenities: amenities,
                        developer_id: developerId,
                        handover_time: handoverTime,
                        latitude: latitude,
                        longitude: longitude,
                        locality: locality,
                        min_sq_ft: null, // Will be set from floor plans
                        max_sq_ft: null, // Will be set from floor plans
                        payment_plan2: paymentPlan || null
                    }
                });

                // Create floor plans - check both root level and newParam level
                const floorPlans = listing.floorPlan || listing.newParam?.floorPlan || [];
                if (floorPlans.length > 0) {
                    console.log(`   🏠 Found ${floorPlans.length} floor plans to process`);
                } else {
                    console.log(`   🏠 No floor plans found for this listing`);
                }
                const floorPlansCount = await createFloorPlans(project.id, floorPlans, price);

                // Update project with aggregated data from floor plans
                if (floorPlansCount > 0) {
                    const floorPlans = await prisma.floorPlan.findMany({
                        where: { project_id: project.id },
                        select: { bedrooms: true, unit_size: true, min_price: true, max_price: true }
                    });

                    if (floorPlans.length > 0) {
                        const bedrooms = floorPlans.map(fp => fp.bedrooms).filter(Boolean);
                        const sizes = floorPlans.map(fp => fp.unit_size).filter(Boolean);
                        const prices = floorPlans.flatMap(fp => [fp.min_price, fp.max_price]).filter(Boolean);

                        await prisma.project.update({
                            where: { id: project.id },
                            data: {
                                min_bedrooms: bedrooms.length > 0 ? bedrooms[0] : null,
                                max_bedrooms: bedrooms.length > 0 ? bedrooms[bedrooms.length - 1] : null,
                                min_sq_ft: sizes.length > 0 ? Math.min(...sizes as number[]) : null,
                                max_sq_ft: sizes.length > 0 ? Math.max(...sizes as number[]) : null,
                                min_price: prices.length > 0 ? Math.min(...prices as number[]) : null,
                                // max_price: prices.length > 0 ? Math.max(...prices as number[]) : null
                            }
                        });
                    }
                }

                // Update or create seeding record
                if (!processedCompanies.has(companyInfo.companyId)) {
                    processedCompanies.set(companyInfo.companyId, {
                        developerName: developerName,
                        companyId: companyInfo.companyId,
                        companyName: companyInfo.companyName,
                        projectsCreated: 0,
                        projects: []
                    });
                }

                const record = processedCompanies.get(companyInfo.companyId)!;
                record.projectsCreated++;
                record.projects.push({
                    title: listing.title,
                    projectId: project.id,
                    floorPlansCount: floorPlansCount
                });

                successCount++;
                if (successCount % 10 === 0) {
                    console.log(`✅ Processed ${successCount} projects...`);
                }

            } catch (error) {
                console.error(`❌ Error processing listing ${i + 1}:`, error);
                errorCount++;
            }
        }

        // Convert processed companies to seeding records
        seedingRecords.push(...Array.from(processedCompanies.values()));

        console.log(`\n📈 Seeding Summary:`);
        console.log(`   • Successfully created: ${successCount} projects`);
        console.log(`   • Errors encountered: ${errorCount} projects`);
        console.log(`   • Skipped: ${skippedCount} listings`);
        console.log(`   • Total processed: ${eligibleListings.length} eligible listings`);
        console.log(`   • Total listings available: ${listings.length}`);
        console.log(`   • Companies processed: ${processedCompanies.size}`);
        console.log(`   • Developers with mappings: ${mappedDevelopers.size}`);
        console.log(`   • Developers missing mappings: ${missingDevelopers.length}`);

        // Show sample of processed companies
        console.log(`\n🏢 Sample Processed Companies:`);
        const sampleCompanies = Array.from(processedCompanies.values()).slice(0, 10);
        for (const record of sampleCompanies) {
            console.log(`   ✅ ${record.companyName} (${record.projectsCreated} projects)`);
        }

        // Save seeding records to JSON file
        const recordsPath = path.join(__dirname, 'seeding-records.json');
        fs.writeFileSync(recordsPath, JSON.stringify(seedingRecords, null, 2));
        console.log(`\n📝 Seeding records saved to: seeding-records.json`);

        console.log(`\n✅ Off-Plan Projects seeded successfully!`);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
if (require.main === module) {
    seedOffPlanProjects().catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

export { seedOffPlanProjects };

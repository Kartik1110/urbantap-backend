import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import prisma from '@/utils/prisma';
import { City, Bedrooms, Category, Furnished, Currency, Amenities, Type } from '@prisma/client';
import { CompanyType } from '@prisma/client';
import { uploadToS3 } from '@/utils/s3Upload';

const AUTH_TOKEN = '1958398e8c4118367eb18a9f85c3761c78005d9e6bfd5ee687746f8bad898775';
const BASE_URL = 'https://api.alnair.ae';

// Room type to Bedrooms enum mapping
const ROOM_TYPE_TO_BEDROOMS: Record<string, Bedrooms> = {
    '110': Bedrooms.Studio,
    '111': Bedrooms.One,
    '112': Bedrooms.Two,
    '113': Bedrooms.Three,
    '114': Bedrooms.Four,
    '115': Bedrooms.Five,
    '116': Bedrooms.Six,
    '117': Bedrooms.Seven,
    '164': Bedrooms.Studio, // Sometimes 164 is used for studio
};

// Convert m² to sq ft
function m2ToSqFt(m2: number): number {
    return m2 * 10.764;
}

// Download image from URL and upload to S3
async function downloadAndUploadToS3(imageUrl: string, projectId: number, imageType: 'cover' | 'logo' | 'gallery' | 'floorplan' | 'brochure', index?: number): Promise<string | null> {
    try {
        if (!imageUrl) return null;

        // Download image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            console.warn(`⚠️  Failed to download image: ${imageUrl}`);
            return null;
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        // Determine file extension from content type or URL
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('gif')) ext = 'gif';
        else if (contentType.includes('webp')) ext = 'webp';
        else if (contentType.includes('pdf')) ext = 'pdf';
        else {
            // Try to get extension from URL
            const urlMatch = imageUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
            if (urlMatch) ext = urlMatch[1].toLowerCase();
        }

        // Create unique filename
        const timestamp = Date.now();
        const randomStr = crypto.randomBytes(4).toString('hex');
        const fileName = `Al_nair/projects/${projectId}/${imageType}${index !== undefined ? `_${index}` : ''}_${timestamp}_${randomStr}.${ext}`;

        // Save to temp file
        const tempDir = path.join(__dirname, '../../uploads/temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFilePath = path.join(tempDir, `${timestamp}_${randomStr}.${ext}`);
        fs.writeFileSync(tempFilePath, Buffer.from(buffer));

        // Upload to S3
        const s3Url = await uploadToS3(tempFilePath, fileName, contentType);
        
        return s3Url;
    } catch (error) {
        console.error(`❌ Error processing image ${imageUrl}:`, error);
        return null;
    }
}

// Process array of image URLs and upload to S3
async function processImagesToS3(imageUrls: string[], projectId: number, imageType: 'cover' | 'logo' | 'gallery' | 'floorplan' | 'brochure'): Promise<string[]> {
    const s3Urls: string[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
        const s3Url = await downloadAndUploadToS3(imageUrls[i], projectId, imageType, i);
        if (s3Url) {
            s3Urls.push(s3Url);
        }
        // Small delay between uploads
        if (i < imageUrls.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
    
    return s3Urls;
}

// Extract year from date string
function extractYear(dateString: string | null): number | null {
    if (!dateString) return null;
    const match = dateString.match(/^(\d{4})/);
    return match ? parseInt(match[1]) : null;
}

// Map amenities from project description/facilities to Amenities enum
function mapAmenities(projectData: any): Amenities[] {
    const amenities: Amenities[] = [];
    const description = (projectData.description || '').toLowerCase();
    const facilities = projectData.catalogs?.project_facilities || [];

    // Check description for amenities
    if (description.includes('pool') || description.includes('swimming')) amenities.push(Amenities.Swimming_Pool);
    if (description.includes('gym') || description.includes('fitness')) amenities.push(Amenities.Gym);
    if (description.includes('parking')) amenities.push(Amenities.Parking);
    if (description.includes('security')) amenities.push(Amenities.Security);
    if (description.includes('balcony')) amenities.push(Amenities.Balcony);
    if (description.includes('garden')) amenities.push(Amenities.Garden);
    if (description.includes('spa')) amenities.push(Amenities.Spa);
    if (description.includes('restaurant') || description.includes('cafe')) amenities.push(Amenities.Restaurants_and_Cafes);
    if (description.includes('co-working') || description.includes('coworking')) amenities.push(Amenities.Co_working_Spaces);
    if (description.includes('padel') || description.includes('tennis')) amenities.push(Amenities.Padel_Tennis_Court);
    if (description.includes('golf')) amenities.push(Amenities.Golf);
    if (description.includes('basketball')) amenities.push(Amenities.Basketball_Court);
    if (description.includes('jogging') || description.includes('running')) amenities.push(Amenities.Walking_and_Jogging_Tracks);
    if (description.includes('cinema')) amenities.push(Amenities.Open_Air_Cinema);
    if (description.includes('gaming')) amenities.push(Amenities.Gaming_Area);

    return Array.from(new Set(amenities)); // Remove duplicates
}

// Format payment plan structure
function formatPaymentStructure(paymentPlans: any[]): string | null {
    if (!paymentPlans || paymentPlans.length === 0) return null;
    
    const plan = paymentPlans[0];
    const info = plan.info || {};
    
    // Map to the required format: one, two, three, four
    // one = on_booking, two = on_construction, three = on_handover, four = post_handover
    const structure: any = {
        one: info.on_booking_percent ? String(info.on_booking_percent) : "0",
        two: info.on_construction_percent ? String(info.on_construction_percent) : "0",
        three: info.on_handover_percent ? String(info.on_handover_percent) : "0",
        four: info.post_handover_percent || 0, // Keep as number if 0, otherwise convert
    };
    
    // If four is 0, keep it as number; otherwise convert to string for consistency
    if (structure.four !== 0) {
        structure.four = String(structure.four);
    }
    
    return JSON.stringify(structure);
}

// Find or create developer
async function findOrCreateDeveloper(builder: any): Promise<string> {
    const companyName = builder?.title || 'Unknown Developer';
    
    // Process logo if available
    let logoUrl: string | null = null;
    let coverImageUrl: string | null = null;
    if (builder?.logo?.src) {
        // Upload logo to S3 under developers folder
        const logoFileName = `Al_nair/developers/${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_logo_${Date.now()}.jpg`;
        const tempDir = path.join(__dirname, '../../uploads/temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        try {
            const response = await fetch(builder.logo.src);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                const contentType = response.headers.get('content-type') || 'image/jpeg';
                const ext = contentType.includes('png') ? 'png' : 'jpg';
                const tempFilePath = path.join(tempDir, `logo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`);
                fs.writeFileSync(tempFilePath, Buffer.from(buffer));
                
                logoUrl = await uploadToS3(tempFilePath, logoFileName.replace('.jpg', `.${ext}`), contentType);
                coverImageUrl = logoUrl;
            }
        } catch (error) {
            console.warn(`⚠️  Failed to download developer logo: ${builder.logo.src}`);
        }
    }
    
    // Find existing company
    let company = await prisma.company.findFirst({
        where: {
            name: {
                equals: companyName,
                mode: 'insensitive',
            },
            type: CompanyType.Developer,
        },
    });

    if (!company) {
        // Create new company
        company = await prisma.company.create({
            data: {
                name: companyName,
                type: CompanyType.Developer,
                logo: logoUrl || '',
                description: builder?.description || '',
                website: builder?.website || null,
                phone: builder?.phone ? String(builder.phone) : null,
                address: builder?.address || null,
            },
        });

        // Create developer
        const developer = await prisma.developer.create({
            data: {
                company_id: company.id,
                cover_image: coverImageUrl,
            },
        });

        // Link company to developer
        await prisma.company.update({
            where: { id: company.id },
            data: { developerId: developer.id },
        });

        console.log(`      Created developer: ${companyName} (ID: ${developer.id})`);
        return developer.id;
    }

    // Update company logo if we have a new one and it doesn't have one
    if (logoUrl && !company.logo) {
        await prisma.company.update({
            where: { id: company.id },
            data: { logo: logoUrl },
        });
    }

    // Find or create developer for existing company
    let developer = await prisma.developer.findFirst({
        where: { company_id: company.id },
    });

    if (!developer) {
        developer = await prisma.developer.create({
            data: {
                company_id: company.id,
                cover_image: coverImageUrl,
            },
        });

        // Link company to developer
        await prisma.company.update({
            where: { id: company.id },
            data: { developerId: developer.id },
        });

        console.log(`      Created developer for existing company: ${companyName} (ID: ${developer.id})`);
    } else if (coverImageUrl && !developer.cover_image) {
        // Update developer cover image if we have a new one
        await prisma.developer.update({
            where: { id: developer.id },
            data: { cover_image: coverImageUrl },
        });
    }

    return developer.id;
}

// Fetch project details
async function fetchProjectDetails(projectId: number): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}/project/look/${projectId}`, {
            headers: {
                'X-AUTH-TOKEN': AUTH_TOKEN,
            },
        });

        if (!response.ok) {
            console.error(`❌ Project ${projectId}: HTTP ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ Project ${projectId}: Error fetching details`, error);
        return null;
    }
}

// Fetch floor plans
async function fetchFloorPlans(projectId: number): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}/inventory/project/${projectId}/group?with_layouts=1`);

        if (!response.ok) {
            console.error(`❌ Project ${projectId}: HTTP ${response.status} for floor plans`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ Project ${projectId}: Error fetching floor plans`, error);
        return null;
    }
}

// Process and create project
async function importProject(projectId: number): Promise<boolean> {
    try {
        console.log(`\n[Processing] Project ${projectId}...`);

        // Fetch project details
        const projectData = await fetchProjectDetails(projectId);
        if (!projectData) {
            console.error(`❌ Project ${projectId}: No data received`);
            return false;
        }

        // Fetch floor plans
        const floorPlansData = await fetchFloorPlans(projectId);
        if (!floorPlansData) {
            console.warn(`⚠️  Project ${projectId}: No floor plans data`);
        }

        // Find or create developer
        const developerId = await findOrCreateDeveloper(projectData.builder);

        // Check if project already exists (by project_name and developer)
        const existingProject = await prisma.project.findFirst({
            where: {
                project_name: {
                    equals: projectData.title || `Project ${projectId}`,
                    mode: 'insensitive',
                },
                developer_id: developerId,
            },
        });

        // Collect image URLs from API (will be uploaded to S3)
        const imageUrlsToProcess: string[] = [];
        if (projectData.cover?.src) imageUrlsToProcess.push(projectData.cover.src);
        if (projectData.logo?.src) imageUrlsToProcess.push(projectData.logo.src);
        
        // Add gallery images
        if (projectData.galleries && Array.isArray(projectData.galleries)) {
            projectData.galleries.forEach((gallery: any) => {
                if (gallery.photos && Array.isArray(gallery.photos)) {
                    gallery.photos.forEach((photo: any) => {
                        if (photo.src && !imageUrlsToProcess.includes(photo.src)) {
                            imageUrlsToProcess.push(photo.src);
                        }
                    });
                }
            });
        }

        // Download and upload images to S3
        console.log(`   📥 Downloading and uploading ${imageUrlsToProcess.length} images to S3...`);
        const imageUrls = await processImagesToS3(imageUrlsToProcess, projectId, 'gallery');

        // Process brochure URL
        let brochureUrl: string | null = null;
        if (projectData.brochures && projectData.brochures.length > 0 && projectData.brochures[0].src) {
            console.log(`   📥 Processing brochure...`);
            brochureUrl = await downloadAndUploadToS3(projectData.brochures[0].src, projectId, 'brochure');
        }

        // Extract unit types from floor plans
        const unitTypes: string[] = [];
        if (floorPlansData) {
            Object.keys(floorPlansData).forEach((roomType) => {
                const bedroomType = ROOM_TYPE_TO_BEDROOMS[roomType];
                if (bedroomType) {
                    const name = bedroomType === Bedrooms.Studio ? 'Studio' : 
                                bedroomType === Bedrooms.One ? '1 Bedroom' :
                                bedroomType === Bedrooms.Two ? '2 Bedroom' :
                                bedroomType === Bedrooms.Three ? '3 Bedroom' :
                                bedroomType === Bedrooms.Four ? '4 Bedroom' :
                                `${bedroomType} Bedroom`;
                    if (!unitTypes.includes(name)) {
                        unitTypes.push(name);
                    }
                }
            });
        }

        // Determine min/max bedrooms
        const bedroomTypes = floorPlansData 
            ? Object.keys(floorPlansData)
                .map(rt => ROOM_TYPE_TO_BEDROOMS[rt])
                .filter(Boolean)
                .sort((a, b) => {
                    const order = [Bedrooms.Studio, Bedrooms.One, Bedrooms.Two, Bedrooms.Three, Bedrooms.Four, Bedrooms.Four_Plus, Bedrooms.Five, Bedrooms.Six, Bedrooms.Seven];
                    return order.indexOf(a) - order.indexOf(b);
                })
            : [];
        const minBedrooms = bedroomTypes.length > 0 ? bedroomTypes[0] : null;
        const maxBedrooms = bedroomTypes.length > 0 ? bedroomTypes[bedroomTypes.length - 1] : null;

        // Extract handover year
        const handoverYear = extractYear(projectData.planned_at || projectData.predicted_completion_at);

        // Get payment structure
        const paymentStructure = projectData.payment_plans && projectData.payment_plans.length > 0
            ? formatPaymentStructure(projectData.payment_plans)
            : null;

        // Get amenities
        const amenities = mapAmenities(projectData);

        // Determine category based on completion status
        const isCompleted = projectData.completed_at !== null || 
                           projectData.construction_percent === "100.00" ||
                           projectData.construction_percent === 100;
        const category = isCompleted ? Category.Ready_to_move : Category.Off_plan;

        // Determine project type (default to Apartment)
        // Could be enhanced to parse from description or other fields
        const projectType: Type[] = [Type.Apartment];

        // Calculate max_sq_ft from floor plans
        const calculatedMaxSqFt = projectData.statistics?.units
            ? (() => {
                const areas = Object.values(projectData.statistics.units)
                    .map((u: any) => u.area_to)
                    .filter((a: any) => a != null && !isNaN(a));
                return areas.length > 0 ? Math.max(...areas) * 10.764 : null;
            })()
            : null;

        const projectDataToSave = {
            title: projectData.title || `Project ${projectId}`,
            description: projectData.description || '',
            project_name: projectData.title || `Project ${projectId}`,
            project_age: projectData.property_age ? String(projectData.property_age) : 'New',
            address: projectData.address || '',
            city: City.Dubai,
            latitude: projectData.latitude || null,
            longitude: projectData.longitude || null,
            locality: projectData.district?.title || null,
            currency: Currency.AED,
            min_price: projectData.statistics?.total?.price_from || null,
            max_price: projectData.statistics?.total?.price_to || null,
            max_sq_ft: calculatedMaxSqFt,
            min_bedrooms: minBedrooms,
            max_bedrooms: maxBedrooms,
            min_bathrooms: null, // Not available in API
            max_bathrooms: null,
            furnished: Furnished.Unfurnished, // Default
            min_sq_ft: projectData.statistics?.units 
                ? (() => {
                    const areas = Object.values(projectData.statistics.units)
                        .map((u: any) => u.area_from)
                        .filter((a: any) => a != null && !isNaN(a));
                    return areas.length > 0 ? Math.min(...areas) * 10.764 : null;
                })()
                : null,
            payment_plan: null, // Can be set based on payment structure
            payment_structure: paymentStructure,
            unit_types: unitTypes,
            amenities: amenities,
            handover_year: handoverYear,
            image_urls: imageUrls,
            brochure_url: brochureUrl,
            category: category,
            type: projectType,
        };

        let project;
        let floorPlansProcessed = await processFloorPlans(floorPlansData || {}, projectId);

        if (existingProject) {
            // Delete existing floor plans
            await prisma.floorPlan.deleteMany({
                where: { project_id: existingProject.id },
            });

            // Update existing project
            project = await prisma.project.update({
                where: { id: existingProject.id },
                data: {
                    ...projectDataToSave,
                    developer: {
                        connect: {
                            id: developerId,
                        },
                    },
                    floor_plans: floorPlansProcessed.length > 0 ? {
                        create: floorPlansProcessed,
                    } : undefined,
                },
                include: {
                    floor_plans: true,
                    developer: true,
                },
            });

            console.log(`🔄 Project ${projectId}: Updated successfully (${project.id})`);
            console.log(`   - ${project.floor_plans.length} floor plans created`);
        } else {
            // Create new project
            project = await prisma.project.create({
                data: {
                    ...projectDataToSave,
                    developer: {
                        connect: {
                            id: developerId,
                        },
                    },
                    floor_plans: floorPlansProcessed.length > 0 ? {
                        create: floorPlansProcessed,
                    } : undefined,
                },
                include: {
                    floor_plans: true,
                    developer: true,
                },
            });

            console.log(`✅ Project ${projectId}: Created successfully (${project.id})`);
            console.log(`   - ${project.floor_plans.length} floor plans created`);
        }

        return true;
    } catch (error: any) {
        console.error(`❌ Project ${projectId}: Error`, error.message);
        return false;
    }
}

// Process floor plans from API response
async function processFloorPlans(floorPlansData: any, projectId: number): Promise<any[]> {
    const floorPlans: any[] = [];

    for (const [roomType, roomData] of Object.entries(floorPlansData)) {
        const typedRoomData = roomData as any;
        if (!typedRoomData.items || !Array.isArray(typedRoomData.items)) continue;

        for (const item of typedRoomData.items) {
            if (!item.layout) continue;

            const bedrooms = ROOM_TYPE_TO_BEDROOMS[roomType] || null;
            const areaMin = item.area_min ? m2ToSqFt(item.area_min) : null;
            const areaMax = item.area_max ? m2ToSqFt(item.area_max) : null;
            // Use average if both available, otherwise use whichever is available
            const unitSize = areaMin && areaMax ? (areaMin + areaMax) / 2 : (areaMin || areaMax || null);

            // Process floor plan images
            let floorPlanImageUrls: string[] = [];
            if (Array.isArray(item.layout.levels) && item.layout.levels.length > 0) {
                const imageUrlsToProcess = item.layout.levels.filter((url: any) => url && typeof url === 'string');
                if (imageUrlsToProcess.length > 0) {
                    floorPlanImageUrls = await processImagesToS3(imageUrlsToProcess, projectId, 'floorplan');
                }
            }

            floorPlans.push({
                title: item.layout.title || `${bedrooms || 'Unit'} Layout`,
                image_urls: floorPlanImageUrls,
                min_price: item.price_min || null,
                max_price: item.price_max || null,
                unit_size: unitSize,
                bedrooms: bedrooms,
                bathrooms: null, // Not available in API
            });
        }
    }

    return floorPlans;
}

// Main import function
async function importAlnairProjects() {
    const projectIdsPath = path.join(__dirname, '../data/Al_Nair_project_ids.json');

    // Read project IDs
    const projectIds: number[] = JSON.parse(fs.readFileSync(projectIdsPath, 'utf-8'));

    console.log(`📋 Found ${projectIds.length} project IDs to import`);
    console.log(`🚀 Starting import process...\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each project with delay to avoid rate limiting
    for (let i = 0; i < projectIds.length; i++) {
        const projectId = projectIds[i];
        const success = await importProject(projectId);
        
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }

        // Delay to avoid rate limiting (500ms between requests)
        if (i < projectIds.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`📊 Success: ${successCount}, Errors: ${errorCount}`);
}

// Run the import
importAlnairProjects()
    .then(() => {
        console.log('Import process finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Import process failed:', error);
        process.exit(1);
    });


import prisma from '../utils/prisma';
import dotenv from 'dotenv';
import { mapToUniqueLocality, updateRecordLocality, GeocodeResult, ReverseGeocodeResult, AddressComponent } from '../utils/locality-mapping';

// Load environment variables from .env file FIRST
dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY environment variable is required');
    process.exit(1);
}

interface GeocodeResponse {
    status: string;
    results: Array<{
        formatted_address: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
        address_components: AddressComponent[];
    }>;
}

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn('GOOGLE_MAPS_API_KEY not configured, skipping geocoding');
        return null;
    }

    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Geocoding API error: ${response.status}`);
            return null;
        }

        const data: GeocodeResponse = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];

            return {
                formatted_address: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                locality: null,
                components: result.address_components,
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn('GOOGLE_MAPS_API_KEY not configured, skipping reverse geocoding');
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Reverse geocoding API error: ${response.status}`);
            return null;
        }

        const data: GeocodeResponse = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];

            return {
                formatted_address: result.formatted_address,
                locality: null,
                components: result.address_components,
            };
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

async function updateProjectsLocality() {
    console.log('🏗️ Starting projects locality update process...');

    try {
        // Fetch all projects
        const projects = await prisma.project.findMany({
            select: {
                id: true,
                address: true,
                latitude: true,
                longitude: true,
                locality: true,
            },
        });

        console.log(`📊 Found ${projects.length} projects to process`);

        let updateCount = 0;
        let unfindableCount = 0;

        for (const project of projects) {
            const hasLatitude = project.latitude !== null;
            const hasLongitude = project.longitude !== null;

            const rawAddress = `${project.address || ''}, Dubai`;

            let result: GeocodeResult | ReverseGeocodeResult | null = null;

            if (project.address && project.address.trim() !== '') {
                // Has address: forward geocode (prioritize address)
                console.log(`🔍 Forward geocoding for project ${project.id}`);
                result = await geocodeAddress(rawAddress);
            } else if (hasLatitude && hasLongitude) {
                // No address but has coordinates: reverse geocode (fallback)
                console.log(`🔍 Reverse geocoding for project ${project.id}`);
                result = await reverseGeocode(
                    project.latitude!,
                    project.longitude!
                );
            } else {
                // No address and no coordinates: skip
                console.log(`⚠️ Skipping project ${project.id} - no address or coordinates`);
                result = null;
            }

            if (result) {
                const updateData: any = {};
                const mappedLocality = mapToUniqueLocality(result.components);

                // Only update locality, not coordinates
                updateData.locality = mappedLocality;

                // Update the project using utility function
                await updateRecordLocality(updateData, project.id, 'project', prisma);

                updateCount++;
                console.log(`✅ Updated project ${project.id} with locality: ${mappedLocality}`);
            } else {
                console.log(
                    `❌ No results for project ${project.id} — raw address: ${rawAddress}`
                );
                unfindableCount++;
            }

            // Add a small delay to respect API limits
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log(`\n📈 Projects Update Summary:`);
        console.log(`   • Successfully updated: ${updateCount} projects`);
        console.log(`   • Unable to geocode: ${unfindableCount} projects`);
        console.log(`   • Total processed: ${projects.length} projects`);
    } catch (error) {
        console.error('❌ Error during projects locality update:', error);
        throw error;
    }
}

async function updateProjectsLocalityScript() {
    console.log('🚀 Starting locality update process for PROJECTS ONLY...');
    console.log('⚠️  This will process ALL project records');

    try {
        await updateProjectsLocality();
        
        console.log('\n🎉 Projects locality update process completed successfully!');
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
updateProjectsLocalityScript();

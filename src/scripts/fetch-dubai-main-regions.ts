import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY environment variable is required');
    process.exit(1);
}

interface Region {
    name: string;
    lat: number;
    lng: number;
    formatted_address: string;
    types: string[];
}

// Known main regions/districts in Dubai
const dubaiRegions = [
    'Deira',
    'Bur Dubai',
    'Downtown Dubai',
    'Dubai Marina',
    'Jumeirah',
    'Business Bay',
    'Al Barsha',
    'Al Quoz',
    'Dubai Sports City',
    'Dubai Silicon Oasis',
    'Dubai International City',
    'Dubai South',
    'Dubai Hills',
    'Arabian Ranches',
    'Dubai Motor City',
    'Dubai Production City',
    'Dubai Studio City',
    'Dubai Knowledge Park',
    'Dubai Media City',
    'Dubai Internet City',
    'Palm Jumeirah',
    'Dubai Creek Harbour',
    'Dubai Festival City',
    'Dubai Healthcare City',
    'Dubai Design District',
    'Dubai Maritime City',
    'Dubai World Central',
    'Dubai Investment Park',
    'Jebel Ali',
    'Al Sufouh',
    'Umm Suqeim',
    'Al Wasl',
    'Al Safa',
    'Al Garhoud',
    'Mirdif',
    'Al Warqa',
    'Al Qusais',
    'Al Nahda',
    'Al Mamzar',
    'Hor Al Anz',
    'Rashidiya',
    'Nad Al Sheba',
    'Meydan',
    'Al Barsha South',
    'Barsha Heights',
    'Jumeirah Village Circle',
    'Jumeirah Village Triangle',
    'Discovery Gardens',
    'The Gardens',
    'Green Community',
    'Al Furjan',
    'Jumeirah Park',
    'Jumeirah Heights',
    'Victory Heights',
    'Sports City',
    'Motor City',
    'Mudon',
    'Serena',
    'Remraam',
    'The Sustainable City',
    'Dubailand',
    'Academic City',
    'International City',
    'Dragon Mart',
    'Liwan',
    'Wadi Al Safa',
    'Nad Shamma',
    'Al Khawaneej',
    'Mushrif',
    'Al Mizhar',
    'Muhaisnah',
    'Al Awir',
    'Warsan',
    'Dubai Silicon Oasis',
    'Dubai Hills Estate',
    'Jumeirah Golf Estates',
    'Arabian Ranches 2',
    'Arabian Ranches 3',
    'Damac Hills',
    'Damac Hills 2',
    'Arjan',
    'Dubailand Residence Complex',
    'Living Legends',
    'Falcon City of Wonders',
    'The Villa',
    'Jebel Ali Industrial Area',
    'Jebel Ali Free Zone',
    'Jebel Ali Port',
    'Al Quoz Industrial Area',
    'Dubai Investments Park',
    'Techno Park',
    'Logistics City',
    'Aviation City',
    'Residential City',
    'Golf City',
    'Commercial City',
    'Hatta',
    'Margham',
    'Al Lisaili',
    'Lehbab',
];

async function geocodeRegion(name: string): Promise<Region | null> {
    try {
        const encodedName = encodeURIComponent(name + ', Dubai, UAE');
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedName}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            return {
                name: name,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formatted_address: result.formatted_address,
                types: result.types
            };
        }
    } catch (error) {
        console.error(`Error geocoding "${name}":`, error);
    }
    return null;
}

async function fetchDubaiRegions() {
    console.log('🔍 Fetching Dubai main regions...\n');

    const regions: Region[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < dubaiRegions.length; i++) {
        const regionName = dubaiRegions[i];
        console.log(`[${i + 1}/${dubaiRegions.length}] Geocoding: ${regionName}...`);

        const region = await geocodeRegion(regionName);

        if (region) {
            regions.push(region);
            successCount++;
            console.log(`✅ ${regionName}: ${region.lat}, ${region.lng}`);
        } else {
            failCount++;
            console.log(`❌ Failed: ${regionName}`);
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully geocoded: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

    // Sort alphabetically
    regions.sort((a, b) => a.name.localeCompare(b.name));

    // Generate CSV
    const csvHeader = 'region_name,coordinates_lat,coordinates_lng,formatted_address,types\n';
    const csvRows = regions.map(region => 
        `${region.name},${region.lat},${region.lng},"${region.formatted_address}","${region.types.join('|')}"`
    );
    const csvContent = csvHeader + csvRows.join('\n');

    // Save CSV
    const csvPath = path.join(__dirname, '../data/Dubai_Main_Regions.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf-8');
    console.log(`\n✅ CSV saved to: ${csvPath}`);

    // Save JSON
    const jsonPath = path.join(__dirname, '../data/Dubai_Main_Regions.json');
    fs.writeFileSync(jsonPath, JSON.stringify(regions, null, 2), 'utf-8');
    console.log(`✅ JSON saved to: ${jsonPath}\n`);

    // Display regions
    console.log('📋 All regions:');
    regions.forEach((region, i) => {
        console.log(`${i + 1}. ${region.name} (${region.lat}, ${region.lng})`);
    });
}

// Run the script
fetchDubaiRegions()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });


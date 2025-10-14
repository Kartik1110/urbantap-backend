import * as fs from 'fs';
import * as path from 'path';

interface Locality {
    name: string;
    lat: number;
    lng: number;
    formatted_address: string;
}

const data: Locality[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/Localities_display.json'), 'utf-8')
);

console.log('🔍 Extracting ALL localities (keeping duplicates)...\n');

// Extract all localities, keeping the original name
const allLocalities = data.map(loc => {
    // Split the formatted_address by " - "
    const parts = loc.formatted_address.split(' - ');
    
    // Find the index of "Dubai"
    const dubaiIndex = parts.indexOf('Dubai');
    
    let actualLocality = loc.name; // Default to original name
    
    if (dubaiIndex > 0) {
        // The locality is the part right before "Dubai"
        actualLocality = parts[dubaiIndex - 1].trim();
    }
    
    return {
        originalName: loc.name,
        actualLocality: actualLocality,
        lat: loc.lat,
        lng: loc.lng,
        fullAddress: loc.formatted_address
    };
});

console.log(`📊 Total localities: ${allLocalities.length}\n`);

// Generate CSV
const csvHeader = 'original_name,locality_name,coordinates_lat,coordinates_lng,full_address\n';
const csvRows = allLocalities.map(loc => 
    `${loc.originalName},${loc.actualLocality},${loc.lat},${loc.lng},"${loc.fullAddress}"`
);
const csvContent = csvHeader + csvRows.join('\n');

// Save CSV
const csvPath = path.join(__dirname, '../data/Localities_all.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');

console.log(`✅ CSV saved to: ${csvPath}`);

// Save JSON
const jsonPath = path.join(__dirname, '../data/Localities_all.json');
fs.writeFileSync(jsonPath, JSON.stringify(allLocalities, null, 2), 'utf-8');

console.log(`✅ JSON saved to: ${jsonPath}\n`);

// Show Damac Hills entries
console.log('📋 Damac Hills entries:');
const damacEntries = allLocalities.filter(loc => loc.originalName.toLowerCase().includes('damac'));
damacEntries.forEach((loc, i) => {
    console.log(`${i + 1}. Original: "${loc.originalName}"`);
    console.log(`   Actual Locality: "${loc.actualLocality}"`);
    console.log(`   Coordinates: (${loc.lat}, ${loc.lng})`);
    console.log(`   Address: ${loc.fullAddress}`);
    console.log('');
});

console.log(`✅ Total localities: ${allLocalities.length}`);


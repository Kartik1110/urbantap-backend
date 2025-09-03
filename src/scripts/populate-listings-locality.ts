import prisma from '../utils/prisma';

interface GeocodeResult {
    formatted_address: string;
    lat: number;
    lng: number;
    locality: string | null;
}

interface ReverseGeocodeResult {
    formatted_address: string;
    locality: string | null;
}

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

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY environment variable is required');
    process.exit(1);
}

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

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`❌ HTTP error! status: ${response.status}`);
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
        } else {
            console.error(`❌ Geocoding API error: ${data.status}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Geocoding error:', error);
        return null;
    }
}

async function reverseGeocode(
    lat: number,
    lng: number
): Promise<ReverseGeocodeResult | null> {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`❌ HTTP error! status: ${response.status}`);
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
        } else {
            console.error(`❌ Reverse geocoding API error: ${data.status}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Reverse geocoding error:', error);
        return null;
    }
}

interface PopulateOptions {
    batchSize?: number;
    delayMs?: number;
    forceUpdate?: boolean;
    dryRun?: boolean;
}

async function populateListingsLocality(options: PopulateOptions = {}) {
    const {
        batchSize = 50,
        delayMs = 100,
        forceUpdate = false,
        dryRun = false,
    } = options;

    console.log('🚀 Starting locality population for listings...');
    console.log(`📊 Configuration:`);
    console.log(`   • Batch size: ${batchSize}`);
    console.log(`   • Delay between requests: ${delayMs}ms`);
    console.log(`   • Force update existing localities: ${forceUpdate}`);
    console.log(`   • Dry run mode: ${dryRun}`);
    console.log('');

    try {
        // Build query conditions
        const whereCondition: any = {};
        if (!forceUpdate) {
            // Only process listings without locality
            whereCondition.locality = null;
        }

        // Get total count first
        const totalCount = await prisma.listing.count({
            where: whereCondition,
        });

        console.log(`📈 Found ${totalCount} listings to process`);

        if (totalCount === 0) {
            console.log('✅ No listings need locality updates!');
            return;
        }

        let processedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Track unique localities found during dry run
        const uniqueLocalities = new Set<string>();
        const localityDetails: Array<{
            locality: string;
            count: number;
            examples: string[];
        }> = [];

        // Process in batches
        for (let offset = 0; offset < totalCount; offset += batchSize) {
            console.log(
                `\n📦 Processing batch ${Math.floor(offset / batchSize) + 1} of ${Math.ceil(totalCount / batchSize)}`
            );

            const listings = await prisma.listing.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    address: true,
                    latitude: true,
                    longitude: true,
                    locality: true,
                },
                skip: offset,
                take: batchSize,
            });

            for (const listing of listings) {
                processedCount++;
                console.log(
                    `\n🔄 Processing listing ${listing.id} (${processedCount}/${totalCount})`
                );

                try {
                    let locality: string | null = null;
                    let shouldUpdate = false;

                    // Strategy 1: Use coordinates if available (reverse geocoding)
                    if (listing.latitude && listing.longitude) {
                        console.log(
                            `   📍 Using coordinates: ${listing.latitude}, ${listing.longitude}`
                        );

                        const reverseResult = await reverseGeocode(
                            listing.latitude,
                            listing.longitude
                        );
                        if (reverseResult && reverseResult.locality) {
                            locality = reverseResult.locality;
                            shouldUpdate = true;
                            console.log(
                                `   ✅ Found locality from coordinates: ${locality}`
                            );
                        } else {
                            console.log(
                                `   ⚠️  No locality found from coordinates`
                            );
                        }
                    }

                    // Strategy 2: Fallback to address if coordinates didn't work
                    if (!locality && listing.address) {
                        console.log(
                            `   🏠 Falling back to address: ${listing.address}`
                        );

                        // Enhance address with Dubai if not present
                        const enhancedAddress = listing.address
                            .toLowerCase()
                            .includes('dubai')
                            ? listing.address
                            : `${listing.address}, Dubai, UAE`;

                        const geocodeResult =
                            await geocodeAddress(enhancedAddress);
                        if (geocodeResult && geocodeResult.locality) {
                            locality = geocodeResult.locality;
                            shouldUpdate = true;
                            console.log(
                                `   ✅ Found locality from address: ${locality}`
                            );
                        } else {
                            console.log(
                                `   ⚠️  No locality found from address`
                            );
                        }
                    }

                    // Update the database
                    if (shouldUpdate && locality) {
                        // Track locality for dry run analysis
                        if (dryRun) {
                            uniqueLocalities.add(locality);
                            console.log(
                                `   🧪 DRY RUN: Would update locality to: ${locality}`
                            );
                            updatedCount++;
                        } else {
                            await prisma.listing.update({
                                where: { id: listing.id },
                                data: { locality },
                            });
                            updatedCount++;
                            console.log(
                                `   ✅ Updated locality to: ${locality}`
                            );
                        }
                    } else {
                        skippedCount++;
                        console.log(`   ⏭️  Skipped: No locality data found`);
                    }
                } catch (error) {
                    errorCount++;
                    console.error(
                        `   ❌ Error processing listing ${listing.id}:`,
                        error
                    );
                }

                // Rate limiting delay
                if (delayMs > 0) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, delayMs)
                    );
                }
            }
        }

        // Analyze unique localities for dry run
        if (dryRun && uniqueLocalities.size > 0) {
            // Create locality count map
            const localityCountMap = new Map<string, number>();
            const localityExamplesMap = new Map<string, string[]>();

            console.log(`\n🔍 Analyzing unique localities found...`);

            // Re-process to count occurrences and collect examples
            for (let offset = 0; offset < totalCount; offset += batchSize) {
                const listings = await prisma.listing.findMany({
                    where: whereCondition,
                    select: {
                        id: true,
                        address: true,
                        latitude: true,
                        longitude: true,
                        locality: true,
                    },
                    skip: offset,
                    take: batchSize,
                });

                for (const listing of listings) {
                    let locality: string | null = null;

                    // Same logic as before to determine locality
                    if (listing.latitude && listing.longitude) {
                        const reverseResult = await reverseGeocode(
                            listing.latitude,
                            listing.longitude
                        );
                        if (reverseResult && reverseResult.locality) {
                            locality = reverseResult.locality;
                        }
                    }

                    if (!locality && listing.address) {
                        const enhancedAddress = listing.address
                            .toLowerCase()
                            .includes('dubai')
                            ? listing.address
                            : `${listing.address}, Dubai, UAE`;
                        const geocodeResult =
                            await geocodeAddress(enhancedAddress);
                        if (geocodeResult && geocodeResult.locality) {
                            locality = geocodeResult.locality;
                        }
                    }

                    if (locality) {
                        localityCountMap.set(
                            locality,
                            (localityCountMap.get(locality) || 0) + 1
                        );

                        const examples =
                            localityExamplesMap.get(locality) || [];
                        if (examples.length < 3) {
                            // Store up to 3 examples
                            examples.push(
                                listing.address ||
                                    `${listing.latitude}, ${listing.longitude}`
                            );
                            localityExamplesMap.set(locality, examples);
                        }
                    }

                    // Small delay to respect rate limits
                    if (delayMs > 0) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, delayMs)
                        );
                    }
                }
            }

            // Sort localities by count (descending)
            const sortedLocalities = Array.from(
                localityCountMap.entries()
            ).sort(([, a], [, b]) => b - a);

            console.log(
                `\n🏘️  UNIQUE LOCALITIES DISCOVERED (${uniqueLocalities.size} total):`
            );
            console.log(`${'─'.repeat(80)}`);

            sortedLocalities.forEach(([locality, count], index) => {
                const examples = localityExamplesMap.get(locality) || [];
                console.log(
                    `${(index + 1).toString().padStart(3)}. ${locality.padEnd(30)} (${count} listings)`
                );
                if (examples.length > 0) {
                    console.log(
                        `     Examples: ${examples.slice(0, 2).join(' | ')}`
                    );
                }
            });

            console.log(`${'─'.repeat(80)}`);
            console.log(`📍 Most common localities:`);
            sortedLocalities.slice(0, 5).forEach(([locality, count], index) => {
                console.log(`   ${index + 1}. ${locality}: ${count} listings`);
            });
        }

        // Summary
        console.log(`\n📊 Final Summary:`);
        console.log(`   • Total processed: ${processedCount} listings`);
        console.log(`   • Successfully updated: ${updatedCount} listings`);
        console.log(`   • Skipped (no data): ${skippedCount} listings`);
        console.log(`   • Errors: ${errorCount} listings`);
        console.log(
            `   • Success rate: ${((updatedCount / processedCount) * 100).toFixed(1)}%`
        );

        if (dryRun) {
            console.log(
                `   • Unique localities found: ${uniqueLocalities.size}`
            );
            console.log(
                `\n🧪 This was a DRY RUN - no actual database changes were made`
            );
        } else {
            console.log(`\n✅ Locality population completed successfully!`);
        }
    } catch (error) {
        console.error('❌ Error during locality population:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// CLI interface when running directly
if (require.main === module) {
    const args = process.argv.slice(2);

    const options: PopulateOptions = {
        batchSize: 50,
        delayMs: 100,
        forceUpdate: false,
        dryRun: false,
    };

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--batch-size':
                options.batchSize = parseInt(args[++i]);
                break;
            case '--delay':
                options.delayMs = parseInt(args[++i]);
                break;
            case '--force':
                options.forceUpdate = true;
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--help':
                console.log(`
Usage: npm run script:populate-localities [options]

Options:
  --batch-size <number>   Number of listings to process in each batch (default: 50)
  --delay <ms>           Delay between API requests in milliseconds (default: 100)
  --force                Update localities even if they already exist
  --dry-run              Preview changes without updating the database
  --help                 Show this help message

Examples:
  npm run script:populate-localities
  npm run script:populate-localities --dry-run
  npm run script:populate-localities --force --batch-size 25
  npm run script:populate-localities --delay 200 --batch-size 30
                `);
                process.exit(0);
                break;
            default:
                console.error(`Unknown option: ${args[i]}`);
                console.log('Use --help for usage information');
                process.exit(1);
        }
    }

    populateListingsLocality(options).catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

export { populateListingsLocality };

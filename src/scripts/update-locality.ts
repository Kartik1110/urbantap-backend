import prisma from "../utils/prisma";

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

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

if (!GOOGLE_MAPS_API_KEY) {
  console.error("❌ GOOGLE_MAPS_API_KEY environment variable is required");
  process.exit(1);
}

function extractLocality(components: AddressComponent[]): string | null {
  // First try to find neighborhood
  for (const component of components) {
    if (component.types.includes("neighborhood")) {
      return component.long_name;
    }
  }

  // Then try sublocality
  for (const component of components) {
    if (component.types.includes("sublocality")) {
      return component.long_name;
    }
  }

  // Finally try locality
  for (const component of components) {
    if (component.types.includes("locality")) {
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
      return null;
    }

    const data: GeocodeResponse = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      const locality = extractLocality(result.address_components);

      return {
        formatted_address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        locality,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
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
      return null;
    }

    const data: GeocodeResponse = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      const locality = extractLocality(result.address_components);

      return {
        formatted_address: result.formatted_address,
        locality,
      };
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

async function updateListingLocality() {
  console.log("🚀 Starting locality update process...");

  try {
    // Fetch all listings
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        address: true,
        latitude: true,
        longitude: true,
        locality: true,
      },
    });

    console.log(`📊 Found ${listings.length} listings to process`);

    let updateCount = 0;
    let unfindableCount = 0;

    for (const listing of listings) {
      const hasLatitude = listing.latitude !== null;
      const hasLongitude = listing.longitude !== null;
      const hasLocality = listing.locality !== null;

      const rawAddress = `${listing.address || ""}, Dubai`;

      let result: GeocodeResult | ReverseGeocodeResult | null = null;

      if (!hasLatitude || !hasLongitude) {
        // Missing coordinates: forward geocode
        console.log(`🔍 Forward geocoding for listing ${listing.id}`);
        result = await geocodeAddress(rawAddress);
      } else if (hasLatitude && hasLongitude && !hasLocality) {
        // Has coordinates but missing locality: reverse geocode
        console.log(`🔍 Reverse geocoding for listing ${listing.id}`);
        result = await reverseGeocode(listing.latitude!, listing.longitude!);
      } else {
        // Has coordinates and locality: skip
        continue;
      }

      if (result) {
        const updateData: any = {};

        if ("lat" in result && "lng" in result) {
          // Forward geocode result
          updateData.address = result.formatted_address;
          updateData.latitude = result.lat;
          updateData.longitude = result.lng;
          updateData.locality = result.locality;
        } else {
          // Reverse geocode result
          updateData.locality = result.locality;
        }

        // Update the listing
        await prisma.listing.update({
          where: { id: listing.id },
          data: updateData,
        });

        updateCount++;
        console.log(`✅ Updated listing ${listing.id}`);
      } else {
        console.log(
          `❌ No results for listing ${listing.id} — raw address: ${rawAddress}`
        );
        unfindableCount++;
      }

      // Add a small delay to respect API limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n📈 Update Summary:`);
    console.log(`   • Successfully updated: ${updateCount} listings`);
    console.log(`   • Unable to geocode: ${unfindableCount} listings`);
    console.log(`   • Total processed: ${listings.length} listings`);
    console.log(`\n✅ Database updated successfully!`);
  } catch (error) {
    console.error("❌ Error during locality update:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  updateListingLocality().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
}

export { updateListingLocality };

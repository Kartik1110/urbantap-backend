import logger from "../utils/logger";
import prisma from "../utils/prisma";
import { Listing } from "@prisma/client";

/* Get listings */
interface ListingFilters {
  [key: string]: any; // TODO: Define the type of filters
}

export const getListingByIdService = async (id: string) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            profile_pic: true,
            country_code: true,
            w_number: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return {
        listing: {},
        broker: { id: "", name: "", profile_pic: "", country_code: "", w_number: "" },
        company: { name: "" },
      };
    }

    const { broker, ...listingWithoutBroker } = listing;
    return {
      listing: listingWithoutBroker,
      broker: {
        id: broker.id,
        name: broker.name,
        profile_pic: broker.profile_pic,
        country_code: broker.country_code,
        w_number: broker.w_number,
      },
      company: {
        name: broker.company?.name || "",
      },
    };
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};

export const getListingsService = async (
  filters: {
    looking_for?: boolean;
    category?: "Ready_to_move" | "Off_plan" | "Rent";
    min_price?: number;
    max_price?: number;
    min_sqft?: number;
    max_sqft?: number;
    city?: "Dubai" | "Abu_Dhabi" | "Sharjah" | "Ajman" | "Ras_Al_Khaimah" | "Fujairah" | "Umm_Al_Quwain";
    address?: string;
    no_of_bathrooms?: ("One" | "Two" | "Three_Plus")[];
    no_of_bedrooms?: ("Studio" | "One" | "Two" | "Three" | "Four_Plus")[];
    furnished?: ("Furnished" | "Semi_furnished" | "Unfurnished")[];
    type?: ("Apartment" | "Villa" | "Townhouse" | "Office")[];
    rental_frequency?: ("Monthly" | "Quarterly" | "Yearly" | "Lease")[];
    project_age?: ("Less_than_5_years" | "More_than_5_years")[];
    payment_plan?: ("Payment_done" | "Payment_Pending")[];
    sale_type?: ("Direct" | "Resale")[];
    amenities?: string[];
  } & ListingFilters
): Promise<
  Array<{
    listing: Partial<Listing>;
    broker: {
      id: string;
      name: string;
      profile_pic: string;
      country_code: string;
      w_number: string;
    };
    company: {
      name: string;
    };
  }>
> => {
  try {
    const {
      looking_for,
      category,
      city,
      address,
      min_price,
      max_price,
      min_sq_ft,
      max_sq_ft,
      no_of_bathrooms,
      no_of_bedrooms,
      furnished,
      type,
      rental_frequency,
      project_age,
      payment_plan,
      sale_type,
      amenities,
      ...otherFilters
    } = filters;

    const listings = await prisma.listing.findMany({
      where: {
        AND: [
          // Base filters as AND conditions
          ...(Object.keys(otherFilters).length > 0 ? [otherFilters as any] : []),
          ...(looking_for !== undefined ? [{ looking_for }] : []),
          ...(category ? [{ category }] : []),
          ...(city ? [{ city }] : []),
          ...(address ? [{ address }] : []),
          
          // Price range condition
          ...(min_price || max_price
            ? [{
                AND: [
                  ...(min_price ? [{ min_price: { gte: min_price } }] : []),
                  ...(max_price ? [{ max_price: { lte: max_price } }] : [])
                ]
              }]
            : []),

          // Square footage condition
          ...(min_sq_ft || max_sq_ft
            ? [{
                sq_ft: {
                  ...(min_sq_ft && { gte: min_sq_ft }),
                  ...(max_sq_ft && { lte: max_sq_ft })
                }
              }]
            : []),

          // Array filters as OR conditions within their groups
          ...(no_of_bathrooms ? [{ no_of_bathrooms: { in: no_of_bathrooms } }] : []),
          ...(no_of_bedrooms ? [{ no_of_bedrooms: { in: no_of_bedrooms } }] : []),
          ...(furnished ? [{ furnished: { in: furnished } }] : []),
          ...(type ? [{ type: { in: type } }] : []),
          ...(rental_frequency ? [{ rental_frequency: { in: rental_frequency } }] : []),
          ...(project_age ? [{ project_age: { in: project_age } }] : []),
          ...(payment_plan ? [{ payment_plan: { in: payment_plan } }] : []),
          ...(sale_type ? [{ sale_type: { in: sale_type } }] : []),
          ...(amenities ? [{ amenities: { hasSome: amenities } }] : [])
        ]
      },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            profile_pic: true,
            country_code: true,
            w_number: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (listings.length === 0) {
      return [{
          listing: {},
          broker: { id: "", name: "", profile_pic: "", country_code: "", w_number: "" },
          company: { name: "" },
        }
      ];
    }

    return listings.map((listing: any) => {
      const { broker, ...listingWithoutBroker } = listing;
      return {
        listing: listingWithoutBroker,
        broker: {
          id: broker.id,
          name: broker.name,
          profile_pic: broker.profile_pic,
          country_code: broker.country_code,
          w_number: broker.w_number,
        },
        company: {
          name: broker.company?.name || "",
        },
      };
    });
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};

/* Bulk insert listings */
export const bulkInsertListingsService = async (listings: Listing[]) => {
  try {
    const newListings = await prisma.listing.createMany({
      data: listings,
    });

    return newListings;
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};

/*Delete Listing by Id */
export const deleteListingbyId = async (listingId : string) => {
  try{
    const deletedListing = await prisma.listing.delete({
      where:{
        id: listingId
      }
    })

    return deletedListing
  } catch(error){
    console.error(error);
    logger.error(error);
    throw error;
  }
}


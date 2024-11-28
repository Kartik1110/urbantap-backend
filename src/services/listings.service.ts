import prisma from "../utils/prisma";
import { Listing } from "@prisma/client";

/* Get listings */
interface ListingFilters {
  [key: string]: any; // TODO: Define the type of filters
}

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
        ...otherFilters,
        ...(looking_for ? { looking_for } : {}),
        ...(category ? { category } : {}),
        ...(city ? { city } : {}),
        ...(address ? { address } : {}),
        AND: [
          {
            OR: [
              {
                min_price: {
                  gte: min_price,
                },
                max_price: {
                  lte: max_price,
                },
              },
            ],
          },
          {
            sq_ft: {
              ...(min_sq_ft && { gte: min_sq_ft }),
              ...(max_sq_ft && { lte: max_sq_ft }),
            },
          },
          ...(no_of_bathrooms
            ? [
                {
                  no_of_bathrooms: {
                    in: no_of_bathrooms,
                  },
                },
              ]
            : []),
          ...(no_of_bedrooms
            ? [
                {
                  no_of_bedrooms: {
                    in: no_of_bedrooms,
                  },
                },
              ]
            : []),
          ...(furnished
            ? [
                {
                  furnished: {
                    in: furnished,
                  },
                },
              ]
            : []),
          ...(type
            ? [
                {
                  type: {
                    in: type,
                  },
                },
              ]
            : []),
          ...(rental_frequency
            ? [
                {
                  rental_frequency: {
                    in: rental_frequency,
                  },
                },
              ]
            : []),
          ...(project_age
            ? [
                {
                  project_age: {
                    in: project_age,
                  },
                },
              ]
            : []),
          ...(payment_plan
            ? [
                {
                  payment_plan: {
                    in: payment_plan,
                  },
                },
              ]
            : []),
          ...(sale_type
            ? [
                {
                  sale_type: {
                    in: sale_type,
                  },
                },
              ]
            : []),
          ...(amenities
            ? [
                {
                  amenities: {
                    hasSome: amenities,
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            profile_pic: true,
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
      return [
        {
          listing: {},
          broker: { id: "", name: "", profile_pic: "" },
          company: { name: "" },
        },
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
        },
        company: {
          name: broker.company?.name || "",
        },
      };
    });
  } catch (error) {
    console.error(error);
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
    throw error;
  }
};

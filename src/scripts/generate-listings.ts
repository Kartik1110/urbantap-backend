import dotenv from "dotenv";
import OpenAI from "openai";
import {
  Type,
  Category,
  Rental_frequency,
  Bedrooms,
  Bathrooms,
  Furnished,
  City,
  Payment_Plan,
  Sale_Type,
} from "@prisma/client";


dotenv.config();

interface ExtractedListingFields {
  title?: string;
  description?: string;
  image?: string;
  min_price?: number | null;
  max_price?: number | null;
  sq_ft?: number | null;
  type?: Type;
  category?: Category;
  looking_for?: boolean;
  rental_frequency?: Rental_frequency | null;
  no_of_bedrooms?: Bedrooms | null;
  no_of_bathrooms?: Bathrooms | null;
  furnished?: Furnished | null;
  city?: City;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  amenities?: string[];
  image_urls?: string[];
  project_age?: number | null;
  payment_plan?: Payment_Plan | null;
  sale_type?: Sale_Type | null;
}

function cleanText(text: string): string {
  return text
    .replace(/[^\w\s.,:;\-@/]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeExtractedFields(raw: any): ExtractedListingFields {
  return {
    title: raw.title ?? null,
    description: raw.description ?? null,
    image: raw.image ?? null,
    min_price: typeof raw.min_price === "number" ? raw.min_price : null,
    max_price: typeof raw.max_price === "number" ? raw.max_price : null,
    sq_ft: typeof raw.sq_ft === "number" ? raw.sq_ft : null,
    type: raw.type ?? null,
    category: raw.category ?? null,
    looking_for: typeof raw.looking_for === "boolean" ? raw.looking_for : null,
    rental_frequency: raw.rental_frequency ?? null,
    no_of_bedrooms: raw.no_of_bedrooms ?? null,
    no_of_bathrooms: raw.no_of_bathrooms ?? null,
    furnished: raw.furnished ?? null,
    city: raw.city ?? null,
    address: raw.address ?? null,
    latitude: typeof raw.latitude === "number" ? raw.latitude : null,
    longitude: typeof raw.longitude === "number" ? raw.longitude : null,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : null,
    image_urls: Array.isArray(raw.image_urls) ? raw.image_urls : null,
    project_age: typeof raw.project_age === "number" ? raw.project_age : null,
    payment_plan: raw.payment_plan ?? null,
    sale_type: raw.sale_type ?? null,
  };
}

async function extractListingFields(text: string): Promise<any> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
Extract the following fields from the real estate listing text below. 
Return a JSON object with ALL these fields (even if null):

- title (string)
- description (string)
- image (string or null)
- min_price (number or null)
- max_price (number or null)
- sq_ft (number or null)
- type (one of: Apartment, Villa, Townhouse, Office, Shop, Plot, or null)
- category (one of: Ready_to_move, Off_plan, Rent, or null)
- looking_for (boolean or null)
- rental_frequency (one of: Monthly, Quarterly, Yearly, Lease, or null)
- no_of_bedrooms (one of: Studio, One, Two, Three, Four_Plus, or null)
- no_of_bathrooms (one of: One, Two, Three_Plus, or null)
- furnished (one of: Furnished, Semi_furnished, Unfurnished, or null)
- city (one of: Dubai, Abu_Dhabi, Sharjah, Ajman, Ras_Al_Khaimah, Fujairah, Umm_Al_Quwain, or null)
- address (string or null)
- latitude (number or null)
- longitude (number or null)
- amenities (array of strings or null)
- image_urls (array of strings or null)
- project_age (number or null)
- payment_plan (one of: Payment_done, Payment_Pending, or null)
- sale_type (one of: Direct, Resale, or null)

If a field is not present in the text, return null for it.

Listing text:
"""${text}"""
`;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that extracts structured data from real estate listings.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 500,
  });

  // Try to parse the response as JSON
  const content = response.choices[0].message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    // fallback: try to extract JSON from the response
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {};
  }
}

export default async function generateListingFromText(
  text: string
): Promise<ExtractedListingFields> {
  const cleaned = cleanText(text);
  const res = await extractListingFields(cleaned);
  return normalizeExtractedFields(res);
}

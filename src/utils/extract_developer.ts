import { PrismaClient, Company, CompanyType } from '@prisma/client';

const prisma = new PrismaClient();

// Simple string similarity function using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

// Levenshtein distance implementation
function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Normalize company name for better matching
function normalizeCompanyName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\b(inc|corp|corporation|company|co|ltd|limited|llc|group|holdings|properties|real estate|development|developments)\b/g, '') // Remove common suffixes
        .trim();
}

interface DeveloperMatch {
    company: Company;
    similarity: number;
    isExactMatch: boolean;
}

interface DeveloperMatchResult {
    matchFound: boolean;
    developerId: string | null;
    developerName: string | null;
}

export async function extract_developer(developerName: string): Promise<DeveloperMatch | null> {
    try {
        // Normalize the input developer name
        const normalizedInputName = normalizeCompanyName(developerName);
        
        // First, try to find exact matches (case-insensitive)
        const exactMatches = await prisma.company.findMany({
            where: {
                OR: [
                    {
                        name: {
                            equals: developerName,
                            mode: 'insensitive'
                        }
                    },
                    {
                        name: {
                            equals: normalizedInputName,
                            mode: 'insensitive'
                        }
                    }
                ],
                type: CompanyType.Developer
            },
            include: {
                developer: true
            }
        });

        // If exact match found, return the first one
        if (exactMatches.length > 0) {
            return {
                company: exactMatches[0],
                similarity: 100,
                isExactMatch: true
            };
        }

        // If no exact match, get all developer companies for similarity comparison
        const allDevelopers = await prisma.company.findMany({
            where: {
                type: CompanyType.Developer
            },
            include: {
                developer: true
            }
        });

        let bestMatch: DeveloperMatch | null = null;
        let highestSimilarity = 0;

        // Compare with all developer companies
        for (const company of allDevelopers) {
            const normalizedCompanyName = normalizeCompanyName(company.name);
            const similarity = calculateSimilarity(normalizedInputName, normalizedCompanyName);
            
            // Also check with original names
            const originalSimilarity = calculateSimilarity(developerName.toLowerCase(), company.name.toLowerCase());
            
            const maxSimilarity = Math.max(similarity, originalSimilarity);
            
            if (maxSimilarity > highestSimilarity) {
                highestSimilarity = maxSimilarity;
                bestMatch = {
                    company,
                    similarity: maxSimilarity * 100, // Convert to percentage
                    isExactMatch: false
                };
            }
        }

        // Return best match only if similarity is >= 95%
        if (bestMatch && bestMatch.similarity >= 95) {
            return bestMatch;
        }

        // If no match found with >= 95% similarity, return null
        return null;

    } catch (error) {
        console.error('Error in extract_developer:', error);
        return null;
    }
}

// Check if developer exists in DB and return match result
export async function check_developer_in_db(developerName: string): Promise<DeveloperMatchResult> {
    try {
        const developer = await prisma.company.findFirst({
            where: {
                name: { equals: developerName, mode: 'insensitive' },
                type: CompanyType.Developer
            },
            include: { developer: true }
        });
        
        if (developer && developer.developer) {
            return {
                matchFound: true,
                developerId: developer.developer.id,
                developerName: developer.name
            };
        } else {
            return {
                matchFound: false,
                developerId: null,
                developerName: null
            };
        }
    } catch (error) {
        console.error('Error checking developer in DB:', error);
        return {
            matchFound: false,
            developerId: null,
            developerName: null
        };
    }
}

// Helper function to get developer details by company ID
export async function getDeveloperByCompanyId(companyId: string) {
    try {
        return await prisma.developer.findFirst({
            where: {
                company_id: companyId
            },
            include: {
                company: true
            }
        });
    } catch (error) {
        console.error('Error getting developer by company ID:', error);
        return null;
    }
}

// Helper function to create a new developer if needed
export async function createDeveloperIfNotExists(companyData: {
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
}) {
    try {
        // First check if company already exists
        const existingCompany = await prisma.company.findFirst({
            where: {
                name: {
                    equals: companyData.name,
                    mode: 'insensitive'
                },
                type: CompanyType.Developer
            }
        });

        if (existingCompany) {
            return existingCompany;
        }

        // Create new company and developer
        const newCompany = await prisma.company.create({
            data: {
                name: companyData.name,
                description: companyData.description || '',
                logo: companyData.logo || '',
                website: companyData.website || '',
                email: companyData.email || '',
                phone: companyData.phone || '',
                address: companyData.address || '',
                type: CompanyType.Developer,
                developer: {
                    create: {}
                }
            },
            include: {
                developer: true
            }
        });

        return newCompany;
    } catch (error) {
        console.error('Error creating developer:', error);
        return null;
    }
}

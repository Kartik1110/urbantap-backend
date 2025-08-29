import { PrismaClient, CompanyType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface DataJsonProperty {
    developer: string;
    developerLogo?: string;
    developerId?: string;
    description?: string;
    email?: string;
    phone?: string;
    title?: string;
    region?: string;
    cityName?: string;
    [key: string]: any;
}

// Helper function to calculate total projects for a developer
async function calculateTotalProjects(developerName: string): Promise<number> {
    try {
        const dataPath = path.join(__dirname, '../../data.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const properties: DataJsonProperty[] = JSON.parse(rawData);
        
        // Count all properties for this developer
        const projectCount = properties.filter(p => p.developer === developerName).length;
        return projectCount;
    } catch (error) {
        console.error('Error calculating total projects:', error);
        return 0;
    }
}

// Helper function to estimate years in business (placeholder - you might want to add this data to your JSON)
function estimateYearsInBusiness(developerName: string): number {
    // This is a placeholder - you could:
    // 1. Add a "founded_year" field to your data.json
    // 2. Use a mapping of known developer founding years
    // 3. Estimate based on project count or other criteria
    
    // For now, estimate based on project count (more projects = likely older company)
    // This is just a rough estimate - you should replace this with actual data
    return 5; // Default to 5 years
}

export async function create_developer(property: DataJsonProperty) {
    try {
        const developerName = property.developer;
        
        if (!developerName || !developerName.trim()) {
            console.log(`Cannot create developer - no developer name found`);
            return null;
        }
        
        // Check if company already exists
        const existingCompany = await prisma.company.findFirst({
            where: { 
                name: developerName, 
                type: CompanyType.Developer 
            },
            include: { developer: true }
        });
        
        if (existingCompany) {
            console.log(`Developer already exists: ${developerName}`);
            return existingCompany;
        }
        
        // Extract developer information from property
        const developerLogo = property.developerLogo || '';
        const description = property.description || '';
        const email = property.email || '';
        const phone = property.phone || '';
        const region = property.region || '';
        const cityName = property.cityName || '';
        
        // Calculate total projects and years in business
        const totProjects = await calculateTotalProjects(developerName);
        const yearsInBiz = estimateYearsInBusiness(developerName);
        
        // Create company and developer according to your schema
        const newCompany = await prisma.company.create({
            data: {
                name: developerName,
                type: CompanyType.Developer,
                description: description,
                logo: developerLogo,
                email: email,
                phone: phone,
                address: region ? `${region}, ${cityName}`.trim() : '',
                developer: { 
                    create: {
                        // These fields match your Developer schema
                        cover_image: null,
                        developerlogo: developerLogo || null,
                        tot_projects: totProjects,
                        years_in_biz: yearsInBiz,
                        overview: description || null // Use description as overview
                    } 
                }
            },
            include: { developer: true }
        });
        
        console.log(`Developer created: ${developerName} with ID: ${newCompany.developer?.id}`);
        return newCompany;
        
    } catch (error) {
        console.error('Error creating developer:', error);
        return null;
    }
}

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { create_project } from '../utils/create_project';

const prisma = new PrismaClient();

interface DataJsonProperty {
    id: number;
    title: string;
    description: string;
    photos: string[];
    price: number;
    developer: string;
    developerLogo?: string;
    region: string;
    cityName: string;
    amenities: string[];
    bedRooms: number;
    newParam?: {
        handoverTime?: string;
        maxSize?: number;
        minSize?: number;
        bedroomMax?: string;
        bedroomMin?: string;
        paymentPlan?: string;
        position?: string;
        totalFloor?: string;
        floorPlan?: Array<{
            name: string;
            area?: number;
            [key: string]: any;
        }>;
        [key: string]: any;
    };
    [key: string]: any;
}

async function process_projects() {
    try {
        // Read data.json
        const dataPath = path.join(__dirname, '../../data.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const properties: DataJsonProperty[] = JSON.parse(rawData);
        
        console.log(`Found ${properties.length} properties to process`);
        
        let created = 0;
        let skipped = 0;
        let errors = 0;
        
        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            
            try {
                console.log(`\nProcessing ${i + 1}/${properties.length}: ${property.title}`);
                
                const result = await create_project(property);
                
                if (result) {
                    created++;
                    console.log(`✅ Created project: ${property.title}`);
                } else {
                    skipped++;
                    console.log(`⏭️ Skipped project: ${property.title} (no developer match)`);
                }
                
            } catch (error) {
                errors++;
                console.error(`❌ Error processing ${property.title}:`, error);
            }
            
            // Add a small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`✅ Created: ${created} projects`);
        console.log(`⏭️ Skipped: ${skipped} projects (no developer match)`);
        console.log(`❌ Errors: ${errors} projects`);
        console.log(`📈 Success rate: ${((created / properties.length) * 100).toFixed(1)}%`);
        
    } catch (error) {
        console.error('Error processing projects:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
process_projects();

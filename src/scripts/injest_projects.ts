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

async function ingest_projects() {
    try {
        // Read data.json
        const dataPath = path.join(__dirname, '../../data.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const properties: DataJsonProperty[] = JSON.parse(rawData);
        
        console.log(`🚀 Starting project ingestion...`);
        console.log(` Found ${properties.length} properties to process`);
        console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
        
        let created = 0;
        let skipped = 0;
        let errors = 0;
        
        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            
            try {
                console.log(` Processing ${i + 1}/${properties.length}: ${property.title}`);
                
                const result = await create_project(property);
                
                if (result) {
                    created++;
                    console.log(`✅ Created: ${property.title} (Developer: ${property.developer})`);
                } else {
                    skipped++;
                    console.log(`⏭️ Skipped: ${property.title} (No developer match: ${property.developer})`);
                }
                
            } catch (error) {
                errors++;
                console.error(`❌ Error processing ${property.title}:`, error);
            }
            
            // Progress indicator every 50 properties
            if ((i + 1) % 50 === 0) {
                console.log(`\n📈 Progress: ${i + 1}/${properties.length} (${((i + 1) / properties.length * 100).toFixed(1)}%)\n`);
            }
            
            // Add a small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`\n Ingestion Complete!`);
        console.log(`⏰ Finished at: ${new Date().toLocaleString()}`);
        console.log(`\n Final Summary:`);
        console.log(`✅ Successfully created: ${created} projects`);
        console.log(`⏭️ Skipped (no developer): ${skipped} projects`);
        console.log(`❌ Errors: ${errors} projects`);
        console.log(` Success rate: ${((created / properties.length) * 100).toFixed(1)}%`);
        
        if (created > 0) {
            console.log(`\n🎯 Database now contains ${created} new projects!`);
        }
        
    } catch (error) {
        console.error(' Fatal error during ingestion:', error);
    } finally {
        await prisma.$disconnect();
        console.log(`\n🔌 Database connection closed`);
    }
}

// Run the ingestion
ingest_projects();

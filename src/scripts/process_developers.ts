import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { create_developer } from '../utils/create_developer';

const prisma = new PrismaClient();

interface DataJsonProperty {
    developer: string;
    developerLogo?: string;
    [key: string]: any;
}

async function process_developers() {
    try {
        // Read data.json
        const dataPath = path.join(__dirname, '../../data.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const properties: DataJsonProperty[] = JSON.parse(rawData);
        
        // Get unique developers
        const uniqueDevelopers = [...new Set(properties.map(p => p.developer).filter(d => d && d.trim()))];
        
        console.log(`🚀 Starting developer processing...`);
        console.log(`📊 Found ${uniqueDevelopers.length} unique developers`);
        console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
        
        let created = 0;
        let skipped = 0;
        let errors = 0;
        
        for (let i = 0; i < uniqueDevelopers.length; i++) {
            const developerName = uniqueDevelopers[i];
            
            try {
                console.log(`📝 Processing ${i + 1}/${uniqueDevelopers.length}: ${developerName}`);
                
                // Find a property with this developer name to pass to create_developer
                const developerProperty = properties.find(p => p.developer === developerName);
                
                if (!developerProperty) {
                    console.log(`❌ No property found for developer: ${developerName}`);
                    errors++;
                    continue;
                }
                
                const result = await create_developer(developerProperty);
                
                if (result) {
                    created++;
                    console.log(`✅ Created: ${developerName}`);
                } else {
                    skipped++;
                    console.log(`⏭️ Skipped: ${developerName} (already exists or error)`);
                }
                
            } catch (error) {
                errors++;
                console.error(`❌ Error processing ${developerName}:`, error);
            }
            
            // Progress indicator every 50 developers
            if ((i + 1) % 50 === 0) {
                console.log(`\n📈 Progress: ${i + 1}/${uniqueDevelopers.length} (${((i + 1) / uniqueDevelopers.length * 100).toFixed(1)}%)\n`);
            }
            
            // Add a small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log(`\n🎉 Developer Processing Complete!`);
        console.log(`⏰ Finished at: ${new Date().toLocaleString()}`);
        console.log(`\n📊 Final Summary:`);
        console.log(`✅ Successfully created: ${created} developers`);
        console.log(`⏭️ Skipped (already exists): ${skipped} developers`);
        console.log(`❌ Errors: ${errors} developers`);
        console.log(`📈 Success rate: ${((created / uniqueDevelopers.length) * 100).toFixed(1)}%`);
        
        if (created > 0) {
            console.log(`\n🎯 Database now contains ${created} new developers!`);
        }
        
    } catch (error) {
        console.error('💥 Fatal error during developer processing:', error);
    } finally {
        await prisma.$disconnect();
        console.log(`\n🔌 Database connection closed`);
    }
}

// Run the developer processing
process_developers();

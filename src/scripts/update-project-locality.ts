import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function updateProjectLocality() {
  try {
    // Read the project names from the JSON file
    const projectListPath = path.join(__dirname, '../db/developer-projects-list.json');
    const projectNames: string[] = JSON.parse(fs.readFileSync(projectListPath, 'utf8'));

    console.log(`📋 Found ${projectNames.length} project names in the list`);
    console.log(`🔍 Starting to update locality field from address field...\n`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let alreadyHasLocalityCount = 0;
    let emptyAddressCount = 0;

    // Process projects in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < projectNames.length; i += batchSize) {
      const batch = projectNames.slice(i, i + batchSize);
      
      // Find all projects in this batch
      const projects = await prisma.project.findMany({
        where: {
          title: {
            in: batch
          }
        },
        select: {
          id: true,
          title: true,
          address: true,
          locality: true
        }
      });

      // Update each project's locality with its address value
      for (const project of projects) {
        if (!project.address || project.address.trim() === '') {
          console.log(`⚠️  "${project.title}" - address is empty, skipping`);
          emptyAddressCount++;
          continue;
        }

        if (project.locality && project.locality.trim() !== '') {
          console.log(`ℹ️  "${project.title}" - locality already exists ("${project.locality}"), updating anyway...`);
          alreadyHasLocalityCount++;
        }

        // Update the locality field with address value
        await prisma.project.update({
          where: { id: project.id },
          data: { locality: project.address }
        });

        updatedCount++;
        console.log(`✅ Updated "${project.title}": locality = "${project.address}"`);
      }

      // Check for projects not found in database
      const foundTitles = projects.map(p => p.title);
      const notFound = batch.filter(name => !foundTitles.includes(name));
      notFoundCount += notFound.length;
      
      if (notFound.length > 0) {
        notFound.forEach(title => {
          console.log(`❌ Not found in database: "${title}"`);
        });
      }

      // Small delay to avoid overwhelming the database
      if (i + batchSize < projectNames.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY:`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Successfully updated: ${updatedCount} projects`);
    console.log(`❌ Not found in database: ${notFoundCount} projects`);
    console.log(`⚠️  Empty address (skipped): ${emptyAddressCount} projects`);
    console.log(`ℹ️  Already had locality: ${alreadyHasLocalityCount} projects`);
    console.log(`📝 Total in list: ${projectNames.length} projects`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('❌ Error updating project locality:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateProjectLocality()
  .then(() => {
    console.log('✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });


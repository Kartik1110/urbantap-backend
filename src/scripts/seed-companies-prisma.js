const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCompanies() {
  try {
    console.log('Starting company seeding process with Prisma...\n');

    // Load company data from companyList.json
    const companyListPath = path.join(__dirname, '../db/companyList.json');
    const companyListData = JSON.parse(fs.readFileSync(companyListPath, 'utf8'));
    
    console.log(`Loaded company list data from: ${companyListPath}`);
    
    // Extract companies from the data structure
    const companies = Object.values(companyListData.data);
    console.log(`Total companies to seed: ${companies.length}\n`);

    // Validate company data structure
    const validCompanies = companies.filter(company => {
      return company && company.id && company.name;
    });

    console.log(`Valid companies: ${validCompanies.length}`);
    console.log(`Invalid companies: ${companies.length - validCompanies.length}\n`);

    // Show sample company structure
    if (validCompanies.length > 0) {
      console.log('Sample company structure:');
      console.log(JSON.stringify(validCompanies[0], null, 2));
      console.log('');
    }

    // Group companies by type for better organization
    const companiesByType = {};
    validCompanies.forEach(company => {
      const type = company.type || 'Other';
      if (!companiesByType[type]) {
        companiesByType[type] = [];
      }
      companiesByType[type].push(company);
    });

    console.log('Companies grouped by type:');
    Object.entries(companiesByType).forEach(([type, companiesList]) => {
      console.log(`   ${type}: ${companiesList.length} companies`);
    });
    console.log('');

    // Database seeding logic
    console.log('Starting database seeding...\n');

    let successCount = 0;
    let errorCount = 0;
    let developerCount = 0;
    let brokerageCount = 0;
    const errors = [];

    // Process companies in batches to avoid overwhelming the database
    const batchSize = 50;
    const totalBatches = Math.ceil(validCompanies.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, validCompanies.length);
      const batch = validCompanies.slice(start, end);

      console.log(`Processing batch ${i + 1}/${totalBatches} (companies ${start + 1}-${end})`);

      for (const company of batch) {
        try {
          // Map the company data to match your Prisma schema
          const companyData = {
            id: company.id,
            name: company.name || '',
            name_ar: company.name_ar || null,
            description: company.description || '',
            logo: company.logo || '',
            type: mapCompanyType(company.type),
            website: company.website || '',
            email: company.email || '',
            phone: company.phone || '',
            address: company.address || ''
          };

          // Use upsert to handle existing companies (update if exists, insert if new)
          const createdCompany = await prisma.company.upsert({
            where: { id: company.id },
            update: companyData,
            create: companyData,
          });

          // Create Developer or Brokerage based on company type
          if (companyData.type === 'Developer') {
            try {
              const developer = await prisma.developer.create({
                data: {
                  company_id: createdCompany.id,
                },
              });

              // Update company to link to developer
              await prisma.company.update({
                where: { id: createdCompany.id },
                data: { developerId: developer.id },
              });

              developerCount++;
              console.log(`   Created developer for company: ${company.name}`);
            } catch (devError) {
              console.log(`   Developer creation failed for ${company.name}: ${devError.message}`);
            }
          } else if (companyData.type === 'Brokerage') {
            try {
              const brokerage = await prisma.brokerage.create({
                data: {
                  about: company.description || 'No description provided',
                  ded: generateDED(),
                  rera: generateRERA(),
                  service_areas: ['Dubai', 'Abu Dhabi'], // Default service areas
                  company_id: createdCompany.id,
                },
              });

              // Update company to link to brokerage
              await prisma.company.update({
                where: { id: createdCompany.id },
                data: { brokerageId: brokerage.id },
              });

              brokerageCount++;
              console.log(`   Created brokerage for company: ${company.name}`);
            } catch (brokerageError) {
              console.log(`   Brokerage creation failed for ${company.name}: ${brokerageError.message}`);
            }
          }

          successCount++;
          
          // Progress indicator
          if (successCount % 100 === 0) {
            console.log(`   Processed ${successCount} companies...`);
          }
          
        } catch (error) {
          errorCount++;
          errors.push({
            company: company.name,
            error: error.message
          });
          console.log(`Error seeding company "${company.name}": ${error.message}`);
        }
      }

      console.log(`   Batch ${i + 1} completed`);
      
      // Add a small delay between batches to avoid overwhelming the database
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Final summary
    console.log('\nSEEDING COMPLETED!');
    console.log('='.repeat(50));
    console.log(`Total companies processed: ${validCompanies.length}`);
    console.log(`Successfully seeded: ${successCount}`);
    console.log(`Failed to seed: ${errorCount}`);
    console.log(`Developers created: ${developerCount}`);
    console.log(`Brokerages created: ${brokerageCount}`);
    console.log(`Success rate: ${((successCount / validCompanies.length) * 100).toFixed(2)}%`);

    if (errors.length > 0) {
      console.log('\nERRORS ENCOUNTERED:');
      errors.slice(0, 10).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.company}: ${error.error}`);
      });
      
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors`);
      }
    }

    // Save seeding report
    const seedingReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCompanies: validCompanies.length,
        successCount,
        errorCount,
        developerCount,
        brokerageCount,
        successRate: `${((successCount / validCompanies.length) * 100).toFixed(2)}%`
      },
      companiesByType,
      errors: errors.slice(0, 100), // Limit to first 100 errors
      sampleCompanies: validCompanies.slice(0, 5)
    };

    const reportPath = path.join(__dirname, '../db/company-seeding-report-prisma.json');
    fs.writeFileSync(reportPath, JSON.stringify(seedingReport, null, 2));
    console.log(`\nSeeding report saved to: ${reportPath}`);

    console.log('\nCompany seeding process completed!');
    console.log('\nNext steps:');
    console.log('   1. Check your database for seeded companies, developers, and brokerages');
    console.log('   2. Run: npx prisma studio (to view in Prisma Studio)');
    console.log('   3. Verify data integrity and relationships');
    console.log('   4. Run any necessary post-seeding operations');

  } catch (error) {
    console.error('Fatal error during seeding:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Helper function to map company types to your Prisma enum
function mapCompanyType(type) {
  if (!type) return 'Other';
  
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('developer')) {
    return 'Developer';
  } else if (typeLower.includes('brokerage')) {
    return 'Brokerage';
  } else {
    return 'Other';
  }
}

// Helper function to generate DED number
function generateDED() {
  return Math.random().toString().slice(2, 8);
}

// Helper function to generate RERA number
function generateRERA() {
  return Math.random().toString().slice(2, 6);
}

// Main execution
async function main() {
  try {
    console.log('Connecting to database via Prisma...');
    
    // Test the connection
    await prisma.$connect();
    console.log('Connected to database via Prisma\n');
    
    // Run the seeding process
    await seedCompanies();
    
  } catch (error) {
    console.error('Script execution failed:', error.message);
    process.exit(1);
  } finally {
    // Always close the connection
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedCompanies, mapCompanyType };

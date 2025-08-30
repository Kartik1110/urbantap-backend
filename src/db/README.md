# Database Seeding Guide

This document outlines the step-by-step process for seeding the database with production-based company data and off-plan projects.

## Overview

The seeding process consists of two main phases:
1. **Company Seeding**: Seed the database with production companies from `companyList.json`
2. **Off-Plan Projects Seeding**: Create off-plan projects by mapping companies from `dbCompany.json` and extracting data from `offPlanListingsWithS3.json`

## Prerequisites

- Node.js and npm installed
- Database connection configured
- Prisma client generated (`npx prisma generate`)
- Required data files present in the `src/db/` folder

## Required Data Files

Ensure the following files exist in the `src/db/` folder:

- `companyList.json` - Production company data with IDs
- `dbCompany.json` - Company mapping for off-plan developers
- `offPlanListingsWithS3.json` - Off-plan listings data with S3 image URLs
- `listings_images.json` - Listing images data
- `brokerages-logos.json` - Brokerage logo data
- `developer-logos.json` - Developer logo data

## Step 1: Seed Companies

Seed the database with production-based companies using their original IDs from `companyList.json`.

### Command
```bash
node src/scripts/seed-companies-prisma.js
```

### What This Does
- Loads company data from `companyList.json`
- Creates companies in the database with their original IDs
- Automatically creates associated `Developer` or `Brokerage` records
- Links companies to their respective developer/brokerage records
- Generates a seeding report at `company-seeding-report-prisma.json`

### Expected Output
```
🚀 Starting company seeding process with Prisma...

📁 Loaded company list data from: src/db/companyList.json
📊 Total companies to seed: [X]

💾 Starting database seeding...

📦 Processing batch 1/[Y] (companies 1-50)
   🏗️  Created developer for company: [Company Name]
   🏢 Created brokerage for company: [Company Name]
   ✅ Batch 1 completed

🎯 SEEDING COMPLETED!
==================================================
📊 Total companies processed: [X]
✅ Successfully seeded: [X]
❌ Failed to seed: [0]
🏗️  Developers created: [Z]
🏢 Brokerages created: [W]
📈 Success rate: 100.00%
```

## Step 2: Seed Off-Plan Projects

Create off-plan projects by mapping companies from `dbCompany.json` and extracting data from `offPlanListingsWithS3.json`.

### Command
```bash
npx tsx src/db/seed-offplan-projects.ts
```

### What This Does
- Reads company mappings from `dbCompany.json`
- Loads off-plan listings from `offPlanListingsWithS3.json`
- Maps developers to existing companies in the database
- Creates projects with associated floor plans
- Updates company logos if available
- Generates a seeding record at `seeding-records.json`

### Expected Output
```
🚀 Starting Off-Plan Projects Seeding Process...

📊 Found [X] company mappings
📊 Mapped [Y] developers to companies
📊 Found [Z] listings to process
📊 Found [W] eligible listings with exact company matches

🔍 Processing listing 1: "[Project Title]" (Developer: [Developer Name])
   🖼️ Found developer logo: [Logo URL]
   🏠 Found [N] floor plans to process
   ✅ Created floor plan: [Floor Plan Title]

📈 Seeding Summary:
   • Successfully created: [X] projects
   • Errors encountered: [Y] projects
   • Skipped: [Z] listings
   • Total processed: [W] eligible listings
   • Companies processed: [N]

✅ Off-Plan Projects seeded successfully!
```

## Step 3: Review Results

After both seeding steps complete, review the generated files:

### Generated Files
- `company-seeding-report-prisma.json` - Company seeding summary and statistics
- `seeding-records.json` - Off-plan projects seeding records with project details

### Database Verification
```bash
# View data in Prisma Studio
npx prisma studio

# Check specific tables
npx prisma studio --port 5556
```

## Data Flow Diagram

```
companyList.json → seed-companies-prisma.js → Database (Companies + Developers/Brokerages)
                                                      ↓
dbCompany.json + offPlanListingsWithS3.json → seed-offplan-projects.ts → Database (Projects + Floor Plans)
                                                      ↓
                                              seeding-records.json
```

## Troubleshooting

### Common Issues

1. **Missing Data Files**
   - Ensure all required JSON files exist in `src/db/` folder
   - Check file permissions and paths

2. **Database Connection Errors**
   - Verify database connection string in `.env`
   - Run `npx prisma generate` to regenerate client
   - Check if database is running and accessible

3. **Company Mapping Issues**
   - Review `dbCompany.json` for exact developer name matches
   - Check if companies were seeded in Step 1
   - Verify company IDs match between files

4. **Floor Plan Creation Errors**
   - Check if project data is valid
   - Verify floor plan schema matches Prisma model
   - Review bedroom mapping in the script

### Debug Mode

To enable detailed logging, modify the scripts to include more verbose output or add debug flags.

## File Structure

```
src/
├── db/
│   ├── README.md                           # This file
│   ├── companyList.json                    # Production company data
│   ├── dbCompany.json                      # Company mapping for off-plan
│   ├── offPlanListingsWithS3.json         # Off-plan listings data
│   ├── listings_images.json                # Listing images
│   ├── brokerages-logos.json               # Brokerage logos
│   ├── developer-logos.json                # Developer logos
│   ├── seeding-records.json                # Generated seeding records
│   └── seed-offplan-projects.ts            # Off-plan projects seeder
└── scripts/
    └── seed-companies-prisma.js            # Company seeder
```

## Next Steps

After successful seeding:

1. **Verify Data Integrity**
   - Check relationships between companies, developers, and projects
   - Validate floor plan data and pricing
   - Review image URLs and company logos

2. **Test Application**
   - Ensure the seeded data appears correctly in the application
   - Test search and filtering functionality
   - Verify developer and brokerage pages display correctly

3. **Monitor Performance**
   - Check database query performance with the new data
   - Optimize indexes if needed
   - Monitor application response times

## Support

If you encounter issues during the seeding process:

1. Check the console output for specific error messages
2. Review the generated report files for detailed information
3. Verify all required data files are present and valid
4. Check database schema matches the expected data structure

---

**Note**: Always backup your database before running seeding scripts in production environments.

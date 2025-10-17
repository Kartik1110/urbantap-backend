import { CompanyType } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import prisma from '../src/utils/prisma';

interface CompanyData {
  name: string;
  name_ar: string;
  email: string;
  phone: string;
  website: string;
}

async function cleanCompanies() {
  // Delete all existing companies
  await prisma.company.deleteMany({});
  console.log('Cleaned existing companies');
}

function parseHTMLTable(htmlContent: string): CompanyData[] {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  const table = document.querySelector('table');
  if (!table) {
    console.error('No table found in HTML');
    return [];
  }

  const rows = Array.from(table.querySelectorAll('tr'));
  const companies: CompanyData[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = Array.from(row.querySelectorAll('td'));
    
    if (cells.length >= 4) {
      const company: CompanyData = {
        name: cells[0]?.textContent?.trim() || '',
        name_ar: cells[1]?.textContent?.trim() || '',
        email: cells[3]?.textContent?.trim() || '',
        phone: cells[4]?.textContent?.trim() || '',
        website: ''
      };
      
      // Only add companies with a name and clean up 'null' strings
      if (company.name && company.name !== 'null' && !company.name.match(/^\d+$/)) {
        // Clean up 'null' values and standardize phone numbers
        company.email = company.email === 'null' ? '' : company.email;
        company.phone = company.phone === 'null' ? '' : company.phone;
        company.website = company.website === 'null' ? '' : company.website;
        
        // Clean up phone numbers
        if (company.phone.startsWith('971-')) {
          company.phone = company.phone.replace('971-', '+971 ');
        } else if (company.phone.startsWith('971|')) {
          company.phone = company.phone.replace('971|', '+971 ');
        }
        
        companies.push(company);
      }
    }
  }

  return companies;
}

function parseExcelFile(filePath: string): CompanyData[] {
  const workbook = XLSX.readFile(filePath, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet) as any[];
  const companies: CompanyData[] = [];

  for (const row of rawData) {
    const company: CompanyData = {
      name: String(row['Name English'] || row['Company Name'] || ''),
      name_ar: String(row['Name Arabic'] || row['Arabic Name'] || ''),
      website: String(row['Website'] || ''),
      phone: String(row['Phone Number'] || row['Phone'] || ''),
      email: String(row['Email'] || '')
    };

    // Only add companies with a name and clean up 'null' strings
    if (company.name && company.name !== 'null' && !company.name.match(/^\d+$/)) {
      // Clean up 'null' values and standardize phone numbers
      company.email = company.email === 'null' ? '' : company.email;
      company.phone = company.phone === 'null' ? '' : company.phone;
      company.website = company.website === 'null' ? '' : company.website;
      
      // Clean up phone numbers
      if (company.phone.startsWith('971-')) {
        company.phone = company.phone.replace('971-', '+971 ');
      } else if (company.phone.startsWith('971|')) {
        company.phone = company.phone.replace('971|', '+971 ');
      }
      
      companies.push(company);
    }
  }

  return companies;
}

async function main() {
  try {
    await cleanCompanies();

    // Read Developers HTML file
    const developersPath = path.join(__dirname, '../docs/approved_developers.xls');
    const developersHTML = fs.readFileSync(developersPath, 'utf8');
    const developersData = parseHTMLTable(developersHTML);

    // Read Brokerage Excel file
    const brokeragePath = path.join(__dirname, '../docs/Brokerage Offices Dubai DLD.xls');
    const brokerageData = parseExcelFile(brokeragePath);

    console.log(`Found ${developersData.length} developers and ${brokerageData.length} brokerages`);

    // Log sample data
    console.log('First 3 developers:', developersData.slice(0, 3));
    console.log('First 3 brokerages:', brokerageData.slice(0, 3));

    // Process developers data
    const developers = developersData.map(data => ({
      name: String(data.name),
      name_ar: String(data.name_ar),
      type: CompanyType.Developer,
      email: String(data.email),
      phone: String(data.phone),
      website: String(data.website),
      description: '',
      logo: ''
    }));

    // Process brokerage data
    const brokerages = brokerageData.map(data => ({
      name: String(data.name),
      name_ar: String(data.name_ar),
      type: CompanyType.Brokerage,
      email: String(data.email),
      phone: String(data.phone),
      website: String(data.website),
      description: '',
      logo: ''
    }));

    // Log first entries to verify data
    if (developers.length > 0) {
      console.log('First processed developer:', developers[0]);
    }
    if (brokerages.length > 0) {
      console.log('First processed brokerage:', brokerages[0]);
    }

    // Insert all companies
    if (developers.length > 0 || brokerages.length > 0) {
      await prisma.company.createMany({
        data: [...developers, ...brokerages]
      });
      console.log(`Successfully inserted ${developers.length} developers and ${brokerages.length} brokerages`);
    } else {
      console.error('No valid company data found to insert');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
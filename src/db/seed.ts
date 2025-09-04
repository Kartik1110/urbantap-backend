import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Load images and logos from files
const listingsImages = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'listings_images.json'), 'utf-8')
).records;
const brokeragesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'brokerages-logos.json'), 'utf-8')
);
const developersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'developer-logos.json'), 'utf-8')
);

async function main() {
    console.log('Clearing existing data...');

    await prisma.notification.deleteMany({});
    await prisma.reportedListing.deleteMany({});
    await prisma.listingView.deleteMany({});
    await prisma.inquiry.deleteMany({});
    await prisma.connectionRequest.deleteMany({});
    await prisma.connections.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.brokerage.deleteMany({});
    await prisma.developer.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.broker.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Creating admin and HR users...');
    const adminUser = await prisma.user.create({
        data: {
            name: 'Admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'ADMIN',
        },
    });

    const hrUser = await prisma.user.create({
        data: {
            name: 'HR Manager',
            email: 'hr@example.com',
            password: 'password123',
            role: 'HR',
        },
    });

    const allBrokers: {
        id: string;
        brokerageId?: string;
        developerId?: string;
    }[] = [];
    let listingImageIndex = 0;

    console.log('Creating developers and their brokers...');

    // Create developers (first 30 companies)
    for (let i = 0; i < 30; i++) {
        const companyData = developersData[i % developersData.length];

        // 1. Create Company
        const company = await prisma.company.create({
            data: {
                name: companyData.name,
                type: 'Developer',
                logo: companyData.logo,
                description: 'No description provided',
            },
        });

        // 2. Create Developer
        const developer = await prisma.developer.create({
            data: {
                company_id: company.id,
            },
        });

        // 3. Update company to link to developer
        await prisma.company.update({
            where: { id: company.id },
            data: { developerId: developer.id },
        });

        // 4. Create User for broker
        const user = await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                role: 'BROKER',
            },
        });

        // 5. Create Broker for Developer
        const broker = await prisma.broker.create({
            data: {
                name: user.name!,
                email: user.email,
                info: faker.lorem.sentence(),
                y_o_e: faker.number.int({ min: 1, max: 20 }),
                languages: faker.helpers.arrayElements(
                    ['English', 'Arabic', 'French', 'Hindi'],
                    2
                ),
                is_certified: faker.datatype.boolean(),
                profile_pic: faker.image.avatar(),
                cover_image: faker.image.url(),
                country_code: '+971',
                w_number: `5${faker.string.numeric(8)}`,
                ig_link: faker.internet.userName(),
                linkedin_link: faker.internet.url(),
                designation: 'Broker',
                user_id: user.id,
                company_id: company.id,
                developerId: developer.id,
                type: faker.helpers.arrayElement([
                    'Off_plan',
                    'Ready_to_move',
                    'Both',
                ]),
                specialities: faker.helpers.arrayElements(
                    ['Villa', 'Apartment', 'Townhouse', 'Office', 'Shop'],
                    2
                ),
            },
        });

        allBrokers.push({ id: broker.id, developerId: developer.id });

        // 6. Create Projects for Developer
        const numProjects = faker.number.int({ min: 5, max: 10 });
        for (let j = 0; j < numProjects; j++) {
            const projectImages =
                listingsImages[listingImageIndex % listingsImages.length]
                    .images;
            listingImageIndex++;

            await prisma.project.create({
                data: {
                    title: faker.company.catchPhrase(),
                    description: faker.lorem.paragraph(),
                    image: projectImages[0],
                    images: projectImages,
                    min_price: faker.number.float({ min: 100000, max: 5000000 }),
                    address: faker.location.streetAddress(),
                    city: 'Dubai',
                    file_url: faker.internet.url(),
                    type: 'Off_plan',
                    project_name: faker.company.name(),
                    project_age: String(faker.number.int({ min: 1, max: 10 })),
                    min_bedrooms: 'Two',
                    min_bathrooms: 'Two',
                    furnished: 'Semi_furnished',
                    property_size: faker.number.float({ min: 500, max: 5000 }),
                    payment_plan: 'Payment_Pending',
                    unit_types: ['1BHK', '2BHK'],
                    amenities: ['Pool', 'Gym', 'Parking'],
                    developer_id: developer.id,
                    currency: 'AED',
                },
            });
        }
    }

    console.log('Creating brokerages and their brokers...');

    // Create brokerages (next 30 companies)
    for (let i = 0; i < 30; i++) {
        const companyData = brokeragesData[i % brokeragesData.length];

        // 1. Create Company
        const company = await prisma.company.create({
            data: {
                name: companyData.name,
                type: 'Brokerage',
                logo: companyData.logo,
                description: 'No description provided',
            },
        });

        // 2. Create Brokerage
        const brokerage = await prisma.brokerage.create({
            data: {
                about: faker.lorem.paragraph(),
                ded: faker.string.numeric(6),
                rera: faker.string.numeric(4),
                service_areas: [faker.location.city(), faker.location.city()],
                company_id: company.id,
            },
        });

        // 3. Update company to link to brokerage
        await prisma.company.update({
            where: { id: company.id },
            data: { brokerageId: brokerage.id },
        });

        // 4. Create User for broker
        const user = await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                role: 'BROKER',
            },
        });

        // 5. Create Broker for Brokerage
        const broker = await prisma.broker.create({
            data: {
                name: user.name!,
                email: user.email,
                info: faker.lorem.sentence(),
                y_o_e: faker.number.int({ min: 1, max: 20 }),
                languages: faker.helpers.arrayElements(
                    ['English', 'Arabic', 'French', 'Hindi'],
                    2
                ),
                is_certified: faker.datatype.boolean(),
                profile_pic: faker.image.avatar(),
                cover_image: faker.image.url(),
                country_code: '+971',
                w_number: `5${faker.string.numeric(8)}`,
                ig_link: faker.internet.userName(),
                linkedin_link: faker.internet.url(),
                designation: 'Broker',
                user_id: user.id,
                company_id: company.id,
                brokerageId: brokerage.id,
                type: faker.helpers.arrayElement([
                    'Off_plan',
                    'Ready_to_move',
                    'Both',
                ]),
                specialities: faker.helpers.arrayElements(
                    ['Villa', 'Apartment', 'Townhouse', 'Office', 'Shop'],
                    2
                ),
            },
        });

        allBrokers.push({ id: broker.id, brokerageId: brokerage.id });

        // 6. Create Jobs for Brokerage
        await prisma.job.create({
            data: {
                title: faker.person.jobTitle(),
                description: `${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`,
                workplace_type: 'On_site',
                location: 'Dubai',
                job_type: 'Full_time',
                min_salary: 15000,
                max_salary: 30000,
                currency: 'AED',
                min_experience: 2,
                max_experience: 10,
                company_id: company.id,
                userId: hrUser.id,
                skills: `${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`,
            },
        });
    }

    console.log('Creating 200 listings...');

    for (let i = 0; i < 200; i++) {
        const broker = faker.helpers.arrayElement(allBrokers);
        const images =
            listingsImages[listingImageIndex % listingsImages.length].images;
        listingImageIndex++;

        const listing = await prisma.listing.create({
            data: {
                title: faker.company.catchPhrase(),
                description: faker.lorem.paragraph(),
                image: images[0],
                image_urls: images,
                min_price: faker.number.float({ min: 100000, max: 5000000 }),
                max_price: faker.number.float({ min: 5000000, max: 10000000 }),
                sq_ft: faker.number.float({ min: 500, max: 6000 }),
                address: faker.location.streetAddress(),
                city: 'Dubai',
                type: faker.helpers.arrayElement([
                    'Apartment',
                    'Villa',
                    'Office',
                ]),
                category: faker.helpers.arrayElement([
                    'Ready_to_move',
                    'Off_plan',
                    'Rent',
                ]),
                no_of_bedrooms: faker.helpers.arrayElement([
                    'Studio',
                    'One',
                    'Two',
                ]),
                no_of_bathrooms: faker.helpers.arrayElement(['One', 'Two']),
                broker_id: broker.id,
                amenities: faker.helpers.arrayElements(
                    ['Pool', 'Gym', 'Parking'],
                    3
                ),
                looking_for: faker.datatype.boolean(),
                rental_frequency: 'Yearly',
                furnished: faker.helpers.arrayElement([
                    'Furnished',
                    'Unfurnished',
                ]),
                project_age: faker.number.int({ min: 1, max: 10 }),
                payment_plan: faker.helpers.arrayElement([
                    'Payment_done',
                    'Payment_Pending',
                ]),
                sale_type: faker.helpers.arrayElement(['Direct', 'Resale']),
                admin_status: 'Approved',
                handover_year: faker.number.int({ min: 2024, max: 2030 }),
                handover_quarter: faker.helpers.arrayElement([
                    'Q1',
                    'Q2',
                    'Q3',
                    'Q4',
                ]),
                type_of_use: faker.helpers.arrayElement([
                    'Residential',
                    'Commercial',
                    'Mixed',
                ]),
                deal_type: faker.helpers.arrayElement(['Rental', 'Selling']),
                current_status: faker.helpers.arrayElement([
                    'Occupied',
                    'Vacant',
                ]),
                views: [faker.helpers.arrayElement(['Sea', 'City', 'Lagoon'])] as any,
                market: faker.helpers.arrayElement(['Primary', 'Secondary']),
                brokerage_id: broker.brokerageId ?? undefined,
            },
        });

        // Create notifications for the listing
        for (const type of [
            'General',
            'Inquiries',
            'Network',
            'Broadcast',
        ] as const) {
            await prisma.notification.create({
                data: {
                    broker_id: broker.id,
                    sent_by_id: adminUser.id,
                    text: `New ${type} alert for listing`,
                    message: faker.lorem.sentence(),
                    type,
                    listing_id: listing.id,
                },
            });
        }
    }

    console.log('Seeding complete.');
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });

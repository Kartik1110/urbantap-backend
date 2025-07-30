
// import { PrismaClient } from "@prisma/client";
// import { faker } from "@faker-js/faker";
// import fs from "fs";
// import path from "path";

// const prisma = new PrismaClient();

// // Load images and logos from files
// const listingsImages = JSON.parse(fs.readFileSync(path.join(__dirname, "listings_images.json"), "utf-8")).records;
// const brokeragesData = JSON.parse(fs.readFileSync(path.join(__dirname, "brokerages-logos.json"), "utf-8"));
// const developersData = JSON.parse(fs.readFileSync(path.join(__dirname, "developer-logos.json"), "utf-8"));
// const allUsers: any[] = [];
// const allJobs: any[] = [];

// async function main() {
//     console.log("Clearing existing data...");

//     await prisma.notification.deleteMany({});
//     await prisma.reportedListing.deleteMany({});
//     await prisma.listingView.deleteMany({});
//     await prisma.inquiry.deleteMany({});
//     await prisma.connectionRequest.deleteMany({});
//     await prisma.connections.deleteMany({});
//     await prisma.application.deleteMany({});
//     await prisma.job.deleteMany({});
//     await prisma.listing.deleteMany({});
//     await prisma.brokerage.deleteMany({});
//     await prisma.developer.deleteMany({});
//     await prisma.project.deleteMany({});
//     await prisma.broker.deleteMany({});
//     await prisma.company.deleteMany({});
//     await prisma.user.deleteMany({});

//     console.log("Creating admin and HR users...");
//     const adminUser = await prisma.user.create({
//         data: {
//             name: "Admin",
//             email: "admin@example.com",
//             password: "password123",
//             role: "ADMIN",
//         },
//     });

//     const hrUser = await prisma.user.create({
//         data: {
//             name: "HR Manager",
//             email: "hr@example.com",
//             password: "password123",
//             role: "HR",
//         },
//     });

//     const allBrokers: { id: string, brokerageId?: string, developerId?: string }[] = [];

//     let listingImageIndex = 0;

//     for (let i = 0; i < 60; i++) {
//         const isDeveloper = i < 30;

//         const companyData = isDeveloper
//             ? developersData[i % developersData.length]
//             : brokeragesData[i % brokeragesData.length];

//         const company = await prisma.company.create({
//             data: {
//                 name: companyData.name,
//                 type: isDeveloper ? "Developer" : "Brokerage",
//                 logo: companyData.logo,
//                 description: "No description provided",
//             },
//         });

//         const user = await prisma.user.create({
//             data: {
//                 name: faker.person.fullName(),
//                 email: faker.internet.email(),
//                 password: "password123",
//                 role: "BROKER",
//             },
//         });

//         allUsers.push(user);


//         if (isDeveloper) {
//             const developer = await prisma.developer.create({
//                 data: {
//                     name: company.name,
//                     logo: company.logo,
//                     description: faker.lorem.paragraph(),
//                     email: faker.internet.email(),
//                     phone: faker.phone.number(),
//                     company_id: company.id,
//                     cover_image: listingsImages[listingImageIndex % listingsImages.length].images[0],
//                 },
//             });

//             const broker = await prisma.broker.create({
//                 data: {
//                     name: user.name!,
//                     email: user.email,
//                     info: faker.lorem.sentence(),
//                     y_o_e: faker.number.int({ min: 1, max: 20 }),
//                     languages: faker.helpers.arrayElements(["English", "Arabic", "French", "Hindi"], 2),
//                     is_certified: faker.datatype.boolean(),
//                     profile_pic: faker.image.avatar(),
//                     country_code: "+971",
//                     w_number: `5${faker.string.numeric(8)}`,
//                     ig_link: faker.internet.userName(),
//                     linkedin_link: faker.internet.url(),
//                     designation: "Broker",
//                     user_id: user.id,
//                     company_id: company.id,
//                     developerId: developer.id,
//                     brokerageId: null,
//                     type: faker.helpers.arrayElement(["Off_plan", "Ready_to_move", "Both"]),
//                 },
//             });

//             allBrokers.push({ id: broker.id, developerId: developer.id });

//             const numProjects = faker.number.int({ min: 5, max: 10 });
//             for (let j = 0; j < numProjects; j++) {
//                 const projectImages = listingsImages[listingImageIndex % listingsImages.length].images;
//                 listingImageIndex++;

//                 await prisma.project.create({
//                     data: {
//                         title: faker.company.catchPhrase(),
//                         description: faker.lorem.paragraph(),
//                         image: projectImages[0],
//                         images: projectImages,
//                         floor_plans: projectImages,
//                         price: faker.number.float({ min: 100000, max: 5000000 }),
//                         address: faker.location.streetAddress(),
//                         city: "Dubai",
//                         file_url: faker.internet.url(),
//                         type: "Off_plan",
//                         project_name: faker.company.name(),
//                         project_age: String(faker.number.int({ min: 1, max: 10 })),
//                         no_of_bedrooms: "Two",
//                         no_of_bathrooms: "Two",
//                         furnished: "Semi_furnished",
//                         property_size: faker.number.float({ min: 500, max: 5000 }),
//                         payment_plan: "Payment_Pending",
//                         unit_types: ["1BHK", "2BHK"],
//                         amenities: ["Pool", "Gym", "Parking"],
//                         developer_id: developer.id,
//                     },
//                 });
//             }
//         } else {
//             const brokerage = await prisma.brokerage.create({
//                 data: {
//                     name: company.name,
//                     logo: company.logo,
//                     description: faker.lorem.paragraph(),
//                     ded: faker.string.numeric(6),
//                     rera: faker.string.numeric(4),
//                     contact_email: faker.internet.email(),
//                     contact_phone: faker.phone.number(),
//                     service_areas: [faker.location.city(), faker.location.city()],
//                     company_id: company.id,
//                 },
//             });

//             const broker = await prisma.broker.create({
//                 data: {
//                     name: user.name!,
//                     email: user.email,
//                     info: faker.lorem.sentence(),
//                     y_o_e: faker.number.int({ min: 1, max: 20 }),
//                     languages: faker.helpers.arrayElements(["English", "Arabic", "French", "Hindi"], 2),
//                     is_certified: faker.datatype.boolean(),
//                     profile_pic: faker.image.avatar(),
//                     country_code: "+971",
//                     w_number: `5${faker.string.numeric(8)}`,
//                     ig_link: faker.internet.userName(),
//                     linkedin_link: faker.internet.url(),
//                     designation: "Broker",
//                     user_id: user.id,
//                     company_id: company.id,
//                     brokerageId: brokerage.id,
//                     developerId: null,
//                     type: faker.helpers.arrayElement(["Off_plan", "Ready_to_move", "Both"]),
//                 },
//             });

//             allBrokers.push({ id: broker.id, brokerageId: brokerage.id });

//             // await prisma.job.create({
//             //   data: {
//             //     title: faker.person.jobTitle(),
//             //     description: faker.lorem.paragraph(),
//             //     workplace_type: "On_site",
//             //     location: "Dubai",
//             //     job_type: "Full_time",
//             //     min_salary: 15000,
//             //     max_salary: 30000,
//             //     currency: "AED",
//             //     min_experience: 2,
//             //     max_experience: 10,
//             //     company_id: company.id,
//             //     brokerage_id: brokerage.id,
//             //     userId: hrUser.id,
//             //   },
//             // });

//             await prisma.job.create({
//                 data: {
//                     title: faker.person.jobTitle(),
//                     description: ` ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`,
//                     workplace_type: "On_site",
//                     location: "Dubai",
//                     job_type: "Full_time",
//                     min_salary: 15000,
//                     max_salary: 30000,
//                     currency: "AED",
//                     min_experience: 2,
//                     max_experience: 10,
//                     company_id: company.id,
//                     brokerage_id: brokerage.id,
//                     userId: hrUser.id,
//                     skills: ` ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`,
//                 },

//             }
//             );



//         }
//     }

//     console.log("Creating 200 listings...");

//     for (let i = 0; i < 200; i++) {
//         const broker = faker.helpers.arrayElement(allBrokers);
//         const images = listingsImages[listingImageIndex % listingsImages.length].images;
//         listingImageIndex++;

//         const listing = await prisma.listing.create({
//             data: {
//                 title: faker.company.catchPhrase(),
//                 description: faker.lorem.paragraph(),
//                 image: images[0],
//                 image_urls: images,
//                 min_price: faker.number.float({ min: 100000, max: 5000000 }),
//                 max_price: faker.number.float({ min: 5000000, max: 10000000 }),
//                 sq_ft: faker.number.float({ min: 500, max: 6000 }),
//                 address: faker.location.streetAddress(),
//                 city: "Dubai",
//                 type: faker.helpers.arrayElement(["Apartment", "Villa", "Office"]),
//                 category: faker.helpers.arrayElement(["Ready_to_move", "Off_plan", "Rent"]),
//                 no_of_bedrooms: faker.helpers.arrayElement(["Studio", "One", "Two"]),
//                 no_of_bathrooms: faker.helpers.arrayElement(["One", "Two"]),
//                 broker_id: broker.id,
//                 amenities: faker.helpers.arrayElements(["Pool", "Gym", "Parking"], 3),
//                 looking_for: faker.datatype.boolean(),
//                 rental_frequency: "Yearly",
//                 furnished: faker.helpers.arrayElement(["Furnished", "Unfurnished"]),
//                 project_age: faker.number.int({ min: 1, max: 10 }),
//                 payment_plan: faker.helpers.arrayElement(["Payment_done", "Payment_Pending"]),
//                 sale_type: faker.helpers.arrayElement(["Direct", "Resale"]),
//                 admin_status: "Approved",
//                 handover_year: faker.number.int({ min: 2024, max: 2030 }),
//                 handover_quarter: faker.helpers.arrayElement(["Q1", "Q2", "Q3", "Q4"]),
//                 type_of_use: faker.helpers.arrayElement(["Residential", "Commercial", "Mixed"]),
//                 deal_type: faker.helpers.arrayElement(["Rental", "Selling"]),
//                 current_status: faker.helpers.arrayElement(["Occupied", "Vacant"]),
//                 views: faker.helpers.arrayElement(["Sea", "City", "Lagoon"]),
//                 market: faker.helpers.arrayElement(["Primary", "Secondary"]),
//                 brokerage_id: broker.brokerageId ?? undefined,
//             },
//         });

//         for (const type of ["General", "Inquiries", "Network", "Broadcast"] as const) {
//             await prisma.notification.create({
//                 data: {
//                     broker_id: broker.id,
//                     sent_by_id: adminUser.id,
//                     text: `New ${type} alert for listing`,
//                     message: faker.lorem.sentence(),
//                     type,
//                     listing_id: listing.id,
//                 },
//             });
//         }
//     }

//     console.log("Creating applications...");
//     for (let i = 0; i < 100; i++) {
//         const user = faker.helpers.arrayElement(allUsers);
//         const job = faker.helpers.arrayElement(allJobs);

//         await prisma.application.create({
//             data: {
//                 resume: faker.internet.url(),
//                 jobId: job.id,
//                 userId: user.id,
//                 status: faker.helpers.arrayElement(["Under_Review", "Accepted", "Rejected"]),
//             },
//         });
//     }


//     console.log("Seeding complete.");
// }

// main()
//     .then(() => prisma.$disconnect())
//     .catch((e) => {
//         console.error(e);
//         prisma.$disconnect();
//         process.exit(1);
//     });


import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Load images and logos from files
const listingsImages = JSON.parse(fs.readFileSync(path.join(__dirname, "listings_images.json"), "utf-8")).records;
const brokeragesData = JSON.parse(fs.readFileSync(path.join(__dirname, "brokerages-logos.json"), "utf-8"));
const developersData = JSON.parse(fs.readFileSync(path.join(__dirname, "developer-logos.json"), "utf-8"));

async function main() {
    console.log("Clearing existing data...");

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

    console.log("Creating admin and HR users...");
    const adminUser = await prisma.user.create({
        data: {
            name: "Admin",
            email: "admin@example.com",
            password: "password123",
            role: "ADMIN",
        },
    });

    const hrUser = await prisma.user.create({
        data: {
            name: "HR Manager",
            email: "hr@example.com",
            password: "password123",
            role: "HR",
        },
    });

    const allBrokers = [];
    const allUsers = [];
    const allJobs = [];

    let listingImageIndex = 0;

    for (let i = 0; i < 60; i++) {
        const isDeveloper = i < 30;

        const companyData = isDeveloper
            ? developersData[i % developersData.length]
            : brokeragesData[i % brokeragesData.length];

        const company = await prisma.company.create({
            data: {
                name: companyData.name,
                type: isDeveloper ? "Developer" : "Brokerage",
                logo: companyData.logo,
                description: "No description provided",
            },
        });

        const user = await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: "password123",
                role: "BROKER",
            },
        });
        allUsers.push(user);

        if (isDeveloper) {
            const developer = await prisma.developer.create({
                data: {
                    name: company.name,
                    logo: company.logo,
                    description: faker.lorem.paragraph(),
                    email: faker.internet.email(),
                    phone: faker.phone.number(),
                    company_id: company.id,
                    cover_image: listingsImages[listingImageIndex % listingsImages.length].images[0],
                },
            });

            const broker = await prisma.broker.create({
                data: {
                    name: user.name!,
                    email: user.email,
                    info: faker.lorem.sentence(),
                    y_o_e: faker.number.int({ min: 1, max: 20 }),
                    languages: faker.helpers.arrayElements(["English", "Arabic", "French", "Hindi"], 2),
                    is_certified: faker.datatype.boolean(),
                    profile_pic: faker.image.avatar(),
                    country_code: "+971",
                    w_number: `5${faker.string.numeric(8)}`,
                    ig_link: faker.internet.userName(),
                    linkedin_link: faker.internet.url(),
                    designation: "Broker",
                    user_id: user.id,
                    company_id: company.id,
                    developerId: developer.id,
                    brokerageId: null,
                    type: faker.helpers.arrayElement(["Off_plan", "Ready_to_move", "Both"]),
                },
            });

            allBrokers.push({ id: broker.id, developerId: developer.id });

            const numProjects = faker.number.int({ min: 5, max: 10 });
            for (let j = 0; j < numProjects; j++) {
                const projectImages = listingsImages[listingImageIndex % listingsImages.length].images;
                listingImageIndex++;

                await prisma.project.create({
                    data: {
                        title: faker.company.catchPhrase(),
                        description: faker.lorem.paragraph(),
                        image: projectImages[0],
                        images: projectImages,
                        floor_plans: projectImages,
                        price: faker.number.float({ min: 100000, max: 5000000 }),
                        address: faker.location.streetAddress(),
                        city: "Dubai",
                        file_url: faker.internet.url(),
                        type: "Off_plan",
                        project_name: faker.company.name(),
                        project_age: String(faker.number.int({ min: 1, max: 10 })),
                        no_of_bedrooms: "Two",
                        no_of_bathrooms: "Two",
                        furnished: "Semi_furnished",
                        property_size: faker.number.float({ min: 500, max: 5000 }),
                        payment_plan: "Payment_Pending",
                        unit_types: ["1BHK", "2BHK"],
                        amenities: ["Pool", "Gym", "Parking"],
                        developer_id: developer.id,
                    },
                });
            }
        } else {
            const brokerage = await prisma.brokerage.create({
                data: {
                    name: company.name,
                    logo: company.logo,
                    description: faker.lorem.paragraph(),
                    ded: faker.string.numeric(6),
                    rera: faker.string.numeric(4),
                    contact_email: faker.internet.email(),
                    contact_phone: faker.phone.number(),
                    service_areas: [faker.location.city(), faker.location.city()],
                    company_id: company.id,
                },
            });

            const broker = await prisma.broker.create({
                data: {
                    name: user.name!,
                    email: user.email,
                    info: faker.lorem.sentence(),
                    y_o_e: faker.number.int({ min: 1, max: 20 }),
                    languages: faker.helpers.arrayElements(["English", "Arabic", "French", "Hindi"], 2),
                    is_certified: faker.datatype.boolean(),
                    profile_pic: faker.image.avatar(),
                    country_code: "+971",
                    w_number: `5${faker.string.numeric(8)}`,
                    ig_link: faker.internet.userName(),
                    linkedin_link: faker.internet.url(),
                    designation: "Broker",
                    user_id: user.id,
                    company_id: company.id,
                    brokerageId: brokerage.id,
                    developerId: null,
                    type: faker.helpers.arrayElement(["Off_plan", "Ready_to_move", "Both"]),
                },
            });

            allBrokers.push({ id: broker.id, brokerageId: brokerage.id });

            const job = await prisma.job.create({
                data: {
                    title: faker.person.jobTitle(),
                    description: `- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`,
                    workplace_type: "On_site",
                    location: "Dubai",
                    job_type: "Full_time",
                    min_salary: 15000,
                    max_salary: 30000,
                    currency: "AED",
                    min_experience: 2,
                    max_experience: 10,
                    company_id: company.id,
                    brokerage_id: brokerage.id,
                    userId: hrUser.id,
                    skills: `- ${faker.lorem.word()}\n- ${faker.lorem.word()}\n- ${faker.lorem.word()}\n- ${faker.lorem.word()}`,
                },
            });

            allJobs.push(job);
        }
    }

    console.log("Creating 200 listings...");

    for (let i = 0; i < 200; i++) {
        const broker = faker.helpers.arrayElement(allBrokers);
        const images = listingsImages[listingImageIndex % listingsImages.length].images;
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
                city: "Dubai",
                type: faker.helpers.arrayElement(["Apartment", "Villa", "Office"]),
                category: faker.helpers.arrayElement(["Ready_to_move", "Off_plan", "Rent"]),
                no_of_bedrooms: faker.helpers.arrayElement(["Studio", "One", "Two"]),
                no_of_bathrooms: faker.helpers.arrayElement(["One", "Two"]),
                broker_id: broker.id,
                amenities: faker.helpers.arrayElements(["Pool", "Gym", "Parking"], 3),
                looking_for: faker.datatype.boolean(),
                rental_frequency: "Yearly",
                furnished: faker.helpers.arrayElement(["Furnished", "Unfurnished"]),
                project_age: faker.number.int({ min: 1, max: 10 }),
                payment_plan: faker.helpers.arrayElement(["Payment_done", "Payment_Pending"]),
                sale_type: faker.helpers.arrayElement(["Direct", "Resale"]),
                admin_status: "Approved",
                handover_year: faker.number.int({ min: 2024, max: 2030 }),
                handover_quarter: faker.helpers.arrayElement(["Q1", "Q2", "Q3", "Q4"]),
                type_of_use: faker.helpers.arrayElement(["Residential", "Commercial", "Mixed"]),
                deal_type: faker.helpers.arrayElement(["Rental", "Selling"]),
                current_status: faker.helpers.arrayElement(["Occupied", "Vacant"]),
                views: faker.helpers.arrayElement(["Sea", "City", "Lagoon"]),
                market: faker.helpers.arrayElement(["Primary", "Secondary"]),
                brokerage_id: broker.brokerageId ?? undefined,
            },
        });

        for (const type of ["General", "Inquiries", "Network", "Broadcast"] as const) {
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

    console.log("Creating applications...");
    for (let i = 0; i < 100; i++) {
        const user = faker.helpers.arrayElement(allUsers);
        const job = faker.helpers.arrayElement(allJobs);

        await prisma.application.create({
            data: {
                resume: faker.internet.url(),
                jobId: job.id,
                userId: user.id,
                status: faker.helpers.arrayElement(["Under_Review", "Accepted", "Rejected"]),
            },
        });
    }

    console.log("Seeding complete.");
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
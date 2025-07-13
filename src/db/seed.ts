import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import {
  Admin_Status,
  NotificationType,
  City,
  Bathrooms,
  Bedrooms,
  Furnished,
  Type,
  Rental_frequency,
  Payment_Plan,
  Sale_Type,
  Category,
  BrokerType,
  Quarter,
  Type_of_use,
  DealType,
  CurrentStatus,
  Views,
  Market,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");

  // Handle dependent deletions first
  await prisma.notification.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.connectionRequest.deleteMany({});
  await prisma.connections.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});

  // Handle custom table with FK constraint (e.g. ListingView)
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "ListingView";`);
  } catch (e) {
    console.log("Warning: Could not delete from ListingView (may not exist)");
  }

  await prisma.listing.deleteMany({});
  await prisma.broker.deleteMany({});
  await prisma.brokerage.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.developer.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating admin and HR users...");

  const adminUser = await prisma.user.create({
    data: {
      name: "Sarah Admin",
      email: "sarah@realestatepro.com",
      password: "password123",
      role: "ADMIN",
    },
  });

  const hrUser = await prisma.user.create({
    data: {
      name: "Mike HR",
      email: "mike@realestatepro.com",
      password: "password123",
      role: "HR",
    },
  });

  console.log("Creating core companies...");

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Real Estate Pro",
        description: "Leading real estate company in Dubai",
      },
    }),
    prisma.company.create({
      data: {
        name: "Premium Properties",
        description: "Luxury real estate solutions",
      },
    }),
  ]);

  const companyIds = companies.map((c) => c.id);

  console.log("Creating brokers and listings...");

  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "password123",
        role: "BROKER",
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
        company_id: companyIds[i % companyIds.length],
        user_id: user.id,
        type: faker.helpers.arrayElement([BrokerType.Off_plan, BrokerType.Ready_to_move, BrokerType.Both]),
      },
    });

    for (let j = 0; j < 2; j++) {
      const listing = await prisma.listing.create({
        data: {
          title: faker.company.catchPhrase(),
          description: faker.lorem.paragraph(),
          min_price: faker.number.int({ min: 100000, max: 5000000 }),
          max_price: faker.number.int({ min: 5000000, max: 10000000 }),
          sq_ft: faker.number.int({ min: 500, max: 6000 }),
          address: faker.location.streetAddress(),
          city: City.Dubai,
          image: faker.image.urlPicsumPhotos(),
          image_urls: [faker.image.urlPicsumPhotos(), faker.image.urlPicsumPhotos()],
          type: faker.helpers.arrayElement(Object.values(Type)),
          category: faker.helpers.arrayElement(Object.values(Category)),
          no_of_bedrooms: faker.helpers.arrayElement(Object.values(Bedrooms)),
          no_of_bathrooms: faker.helpers.arrayElement(Object.values(Bathrooms)),
          broker_id: broker.id,
          amenities: faker.helpers.arrayElements(["Pool", "Gym", "Parking", "Garden", "Smart Home"], 3),
          looking_for: faker.datatype.boolean(),
          rental_frequency: Rental_frequency.Yearly,
          furnished: faker.helpers.arrayElement(Object.values(Furnished)),
          project_age: faker.number.int({ min: 1, max: 10 }),
          payment_plan: faker.helpers.arrayElement(Object.values(Payment_Plan)),
          sale_type: faker.helpers.arrayElement(Object.values(Sale_Type)),
          admin_status: faker.helpers.arrayElement(Object.values(Admin_Status)),
          handover_year: faker.number.int({ min: 2024, max: 2030 }),
          handover_quarter: faker.helpers.arrayElement(Object.values(Quarter)),
          type_of_use: faker.helpers.arrayElement(Object.values(Type_of_use)),
          deal_type: faker.helpers.arrayElement(Object.values(DealType)),
          current_status: faker.helpers.arrayElement(Object.values(CurrentStatus)),
          views: faker.helpers.arrayElement(Object.values(Views)),
          market: faker.helpers.arrayElement(Object.values(Market)),
          locality: faker.location.city(),
        },
      });

      for (const type of Object.values(NotificationType)) {
        await prisma.notification.create({
          data: {
            broker_id: broker.id,
            sent_by_id: adminUser.id,
            text: `New ${type} alert for listing.`,
            message: faker.lorem.sentence(),
            type,
            listing_id: listing.id,
          },
        });
      }
    }
  }

  console.log("Creating developers and companies...");

  for (let i = 0; i < 100; i++) {
    const developerCompany = await prisma.company.create({
      data: {
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        logo: faker.image.avatar(),
        type: "Developer",
      },
    });

    const developer = await prisma.developer.create({
      data: {
        name: developerCompany.name,
        logo: faker.image.urlPicsumPhotos(),
        cover_image: faker.image.urlPicsumPhotos(),
        description: developerCompany.description,
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company_id: developerCompany.id,
      },
    });

    await prisma.company.create({
      data: {
        name: faker.company.name(),
        type: "Developer",
        description: faker.company.catchPhrase(),
        logo: faker.image.avatar(),
        developerId: developer.id,
      },
    });
  }

  console.log("Creating projects...");

  const allDevelopers = await prisma.developer.findMany();

  await Promise.all(
    Array.from({ length: 100 }).map(() =>
      prisma.project.create({
        data: {
          title: faker.company.catchPhrase(),
          description: faker.lorem.paragraph(),
          image: faker.image.urlPicsumPhotos(),
          images: [faker.image.urlPicsumPhotos(), faker.image.urlPicsumPhotos()],
          floor_plans: [faker.image.urlPicsumPhotos()],
          price: faker.number.float({ min: 100000, max: 5000000, fractionDigits: 2 }),
          address: faker.location.streetAddress(),
          city: City.Dubai,
          file_url: faker.internet.url(),
          type: Category.Off_plan,
          project_name: faker.company.name(),
          project_age: String(faker.number.int({ min: 1, max: 10 })),
          no_of_bedrooms: Bedrooms.Two,
          no_of_bathrooms: Bathrooms.Two,
          furnished: Furnished.Semi_furnished,
          property_size: faker.number.float({ min: 500, max: 5000, fractionDigits: 1 }),
          payment_plan: Payment_Plan.Payment_Pending,
          unit_types: ["1BHK", "2BHK"],
          amenities: ["Pool", "Gym", "Parking"],
          developer_id: allDevelopers[Math.floor(Math.random() * allDevelopers.length)].id,
        },
      })
    )
  );

  console.log("Creating brokerages and companies...");

  for (let i = 0; i < 100; i++) {
    // First, create a company for the brokerage to get its id
    const brokerageCompany = await prisma.company.create({
      data: {
        name: faker.company.name(),
        type: "Brokerage",
        description: faker.lorem.sentence(),
        logo: faker.image.avatar(),
      },
    });

    const brokerage = await prisma.brokerage.create({
      data: {
        name: brokerageCompany.name,
        logo: brokerageCompany.logo,
        description: brokerageCompany.description,
        ded: faker.string.numeric(6),
        rera: faker.string.numeric(4),
        contact_email: faker.internet.email(),
        contact_phone: faker.phone.number(),
        service_areas: [faker.location.city(), faker.location.city()],
        company_id: brokerageCompany.id,
      },
    });

    await prisma.company.create({
      data: {
        name: brokerage.name,
        type: "Brokerage",
        description: brokerage.description,
        logo: brokerage.logo,
        brokerageId: brokerage.id,
      },
    });
  }

  console.log("Creating job listings...");

  await prisma.job.createMany({
    data: [
      {
        title: "Senior Broker",
        description: faker.lorem.paragraph(),
        workplace_type: "On_site",
        location: "Dubai",
        job_type: "Full_time",
        min_salary: 20000,
        max_salary: 30000,
        currency: "AED",
        min_experience: 5,
        max_experience: 10,
        company_id: companyIds[0],
        userId: hrUser.id,
      },
      {
        title: "Property Consultant",
        description: faker.lorem.paragraph(),
        workplace_type: "Hybrid",
        location: "Dubai",
        job_type: "Full_time",
        min_salary: 15000,
        max_salary: 25000,
        currency: "AED",
        min_experience: 3,
        max_experience: 7,
        company_id: companyIds[1],
        userId: hrUser.id,
      },
    ],
  });

  console.log("✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

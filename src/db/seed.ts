import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.listing.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.broker.deleteMany({});
  await prisma.company.deleteMany({});

  // Create multiple users with different roles
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@realestatepro.com",
        password: "password123",
        role: "BROKER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sarah Admin",
        email: "sarah@realestatepro.com",
        password: "password123",
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Mike HR",
        email: "mike@realestatepro.com",
        password: "password123",
        role: "HR",
      },
    }),
  ]);

  // Create multiple companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Real Estate Pro",
        description: "Leading real estate company in Dubai",
        logo: "https://example.com/logo1.jpg",
      },
    }),
    prisma.company.create({
      data: {
        name: "Premium Properties",
        description: "Luxury real estate solutions",
        logo: "https://example.com/logo2.jpg",
      },
    }),
  ]);

  // Create multiple brokers
  const brokers = await Promise.all([
    prisma.broker.create({
      data: {
        name: "John Doe",
        email: "john@realestatepro.com",
        info: "Experienced real estate broker specializing in residential properties.",
        y_o_e: 15,
        languages: ["English", "Arabic"],
        is_certified: true,
        w_number: "+971585605980",
        ig_link: "johndoe_realtor",
        linkedin_link: "https://linkedin.com/in/johndoe",
        profile_pic: "https://randomuser.me/api/portraits/men/1.jpg",
        designation: "Senior Broker",
        company_id: companies[0].id,
        user_id: users[0].id,
      },
    }),
    prisma.broker.create({
      data: {
        name: "Alice Smith",
        email: "alice@premiumprop.com",
        info: "Luxury property specialist with focus on villa communities",
        y_o_e: 8,
        languages: ["English", "French", "Hindi"],
        is_certified: true,
        w_number: "+971585605981",
        profile_pic: "https://randomuser.me/api/portraits/women/1.jpg",
        designation: "Property Consultant",
        company_id: companies[1].id,
      },
    }),
  ]);

  // Create multiple listings with different conditions
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: "Luxury Downtown Apartment",
        description: "Stunning 2-bedroom apartment with Burj Khalifa view",
        min_price: 2500000,
        max_price: 3000000,
        sq_ft: 1800,
        address: "Downtown Dubai",
        city: "Dubai",
        image: "https://example.com/apt1.jpg",
        image_urls: ["https://example.com/apt1-1.jpg", "https://example.com/apt1-2.jpg"],
        type: "Apartment",
        category: "Ready_to_move",
        no_of_bedrooms: "Two",
        no_of_bathrooms: "Two",
        broker_id: brokers[0].id,
        amenities: ["Pool", "Gym", "Spa", "Parking"],
        looking_for: false,
        rental_frequency: "Yearly",
        furnished: "Furnished",
        project_age: "Less_than_5_years",
        payment_plan: "Payment_done",
        sale_type: "Direct",
      },
    }),
    prisma.listing.create({
      data: {
        title: "Off-Plan Villa Project",
        description: "Exclusive villa project in premium location",
        min_price: 5000000,
        max_price: 7000000,
        sq_ft: 4500,
        address: "Palm Jumeirah",
        city: "Dubai",
        image: "https://example.com/villa1.jpg",
        image_urls: ["https://example.com/villa1-1.jpg", "https://example.com/villa1-2.jpg"],
        type: "Villa",
        category: "Off_plan",
        no_of_bedrooms: "Four_Plus",
        no_of_bathrooms: "Three_Plus",
        broker_id: brokers[1].id,
        amenities: ["Private Pool", "Garden", "Smart Home", "Maid's Room"],
        looking_for: true,
        furnished: "Unfurnished",
        project_age: "Less_than_5_years",
        payment_plan: "Payment_Pending",
        sale_type: "Direct",
      },
    }),
    prisma.listing.create({
      data: {
        title: "Commercial Office Space",
        description: "Modern office space in Business Bay",
        min_price: 80000,
        max_price: 100000,
        sq_ft: 2500,
        address: "Business Bay",
        city: "Dubai",
        image: "https://example.com/office1.jpg",
        image_urls: ["https://example.com/office1-1.jpg", "https://example.com/office1-2.jpg"],
        type: "Office",
        category: "Rent",
        broker_id: brokers[0].id,
        amenities: ["Reception", "Meeting Rooms", "Parking", "24/7 Security"],
        looking_for: false,
        rental_frequency: "Yearly",
        furnished: "Semi_furnished",
        project_age: "More_than_5_years",
        sale_type: "Resale",
      },
    }),
  ]);

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

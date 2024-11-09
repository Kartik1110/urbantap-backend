import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.listing.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.broker.deleteMany({});
  await prisma.company.deleteMany({});

  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@realestatepro.com",
      password: "password",
    },
  });

  // Create companies
  const company = await prisma.company.create({
    data: {
      name: "Real Estate Pro",
      logo: "",
    },
  });

  // Create brokers
  const broker = await prisma.broker.create({
    data: {
      name: "John Doe",
      email: "john@realestatepro.com",
      info: "Experienced real estate broker specializing in residential properties.",
      y_o_e: 48,
      languages: ["English", "Hindi"],
      is_certified: true,
      w_number: "+971585605980",
      ig_link: "thevarunchopra",
      linkedin_link: "https://linkedin.com/in/kartik-pal-dev/",
      profile_pic: "https://randomuser.me/api/portraits",
      company_id: company.id,
      user_id: user.id,
    },
  });

  // Create listings
  await prisma.listing.create({
    data: {
      title: "Modern Downtown Apartment",
      description: "Beautiful 2-bedroom apartment in the heart of downtown",
      min_price: 500000,
      max_price: 700000,
      address: "789 Downtown Ave",
      city: "Dubai",
      image: "https://randomuser.me/api/portraits",
      image_urls: [
        "https://example.com/apt1.jpg",
        "https://example.com/apt2.jpg",
      ],
      locality: "Downtown",
      type: "Apartment",
      category: "Ready_to_move",
      no_of_bedrooms: 2,
      no_of_bathrooms: 2,
      sq_ft: 1200,
      broker_id: broker.id,
      amenities: ["Pool", "Gym", "Parking"],
      looking_for: false,
      rental_frequency: "Yearly",
      furnished: "Furnished",
    },
  });

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

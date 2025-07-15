
export const realDevelopers = [
  {
    name: "DAMAC Properties",
    logo: "https://res.cloudinary.com/drkxelewr/image/upload/v1752573585/Damac-Logo_kkfa3e.png",
    cover_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdYGL6tIObAwFLI8EKfnuiX_FZNGhMilx11R1_PPDmKgrZFOnreNMMYlf5Pl6wdaAwvhw&usqp=CAU",
    description: "DAMAC Properties has been shaping the Middle East’s luxury real estate market since 2002, delivering iconic residential, commercial, and leisure properties.",
    email: "info@damacgroup.com",
    phone: "+97143019999"
  },
  {
    name: "Binghatti Developers",
     logo: "https://res.cloudinary.com/drkxelewr/image/upload/v1752573585/binghatti_logo_imbyn3.jpg",
    cover_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhbgwnXt5Wg14On55_jRY6-mpFo1TB7FhDf-o2aQ-I_24efgpoy5ULBVhNqGfGRkifzN8&usqp=CAU",
    description: "Meraas is a Dubai-based holding company with real estate projects across residential, hospitality, and retail sectors.",
    email: "info@meraas.ae",
    phone: "+97143639000"
  },
  {
    name: "Nakheel",
     logo: "https://res.cloudinary.com/drkxelewr/image/upload/v1752573585/nakheel_logo_mcsp3z.png",
    cover_image: "https://res.cloudinary.com/drkxelewr/image/upload/v1752574134/images_3_kw1uae.jpg",
    description: "Azizi Developments is a prominent Dubai developer offering luxury residential and commercial properties across the emirate.",
    email: "info@azizidevelopments.com",
    phone: "+97144459955"
  },
  {
    name: "Ellington Properties",
     logo: "https://res.cloudinary.com/drkxelewr/image/upload/v1752573812/Ellignton_logo_n2lq4i.png",
    cover_image: "https://res.cloudinary.com/drkxelewr/image/upload/v1752574135/1741162820789_kc3vuy.jpg",
    description: "Ellington Properties is a boutique property developer in Dubai, emphasizing design-led lifestyles and quality construction.",
    email: "info@ellingtonproperties.ae",
    phone: "+97145289898"
  },
  
];

export const realBrokerages = [
  {
    name: "Allsopp & Allsopp",
    logo: "https://res.cloudinary.com/drkxelewr/image/upload/v1752573929/All_soop_qzyvob.jpg",
    description: "One of Dubai’s leading real estate brokerages with a wide range of properties and a large team of certified agents."
  },
  {
    name: "Betterhomes",
    logo: "https://res.cloudinary.com/drkxelewr/image/upload/v1752573932/betterhomes_uauahc.jpg",
    description: "A household name in Dubai real estate, known for their vast portfolio and customer-centric approach."
  },
  {
    name: "Haus & Haus",
     logo: "https://res.cloudinary.com/drkxelewr/image/upload/v1752573931/download_9_qexoyj.jpg",
    description: "Professional brokerage offering sales, rentals, and property management with expert market knowledge."
  },
  {
    name: "Fam Properties",
    logo:"https://res.cloudinary.com/drkxelewr/image/upload/v1752573930/fam_wfy7gx.png",
    description: "Tech-driven real estate agency delivering data-backed property solutions in Dubai."
  },
  {
    name: "Provident Estate",
    logo:"https://res.cloudinary.com/drkxelewr/image/upload/v1752574405/download_11_hqbjem.jpg",
    description: "Award-winning full-service brokerage with deep roots in Dubai’s real estate landscape."
  }
  // Add 15 more if needed
];

export const sampleListings = Array.from({ length: 30 }).map((_, i) => ({
  title: `Luxurious Apartment ${i + 1}`,
  description: "Experience upscale living in the heart of Dubai. This modern apartment features top-tier amenities.",
  address: `Downtown Dubai, Building ${i + 1}`,
  city: "Dubai",
  image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  image_urls: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600585154324-3794d1894711"
  ],
  min_price: 850000 + i * 10000,
  max_price: 950000 + i * 15000,
  sq_ft: 900 + i * 10,
  category: "Ready_to_move",
  type: "Apartment",
  no_of_bedrooms: "Two",
  no_of_bathrooms: "Two",
  furnished: "Furnished",
  payment_plan: "Payment_done",
  sale_type: "Direct",
  handover_year: 2025,
  handover_quarter: "Q4",
  type_of_use: "Residential",
  deal_type: "Selling",
  current_status: "Vacant",
  views: "City",
  market: "Primary",
  amenities: ["Gym", "Pool", "Parking"],
  locality: "Downtown"
}));

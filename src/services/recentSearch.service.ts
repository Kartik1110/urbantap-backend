import prisma from "../utils/prisma";

export const addSearchTerm = async (user_id: string, term: string) => {
  // Remove if it already exists
  await prisma.recentSearch.deleteMany({
    where: {
      user_id,
      term: { equals: term, mode: "insensitive" },
    },
  });

  // Insert new
  await prisma.recentSearch.create({
    data: {
      user_id,
      term,
    },
  });

  // Limit to 5 recent only
  const recent = await prisma.recentSearch.findMany({
    where: { user_id },
    orderBy: { created_at: "desc" },
  });

  if (recent.length > 5) {
    const toDelete = recent.slice(5);
    await prisma.recentSearch.deleteMany({
      where: { id: { in: toDelete.map((r) => r.id) } },
    });
  }
};

export const fetchSearchTerms = async (user_id: string) => {
  const terms = await prisma.recentSearch.findMany({
    where: { user_id },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  return terms.map((r) => r.term);
};

export const removeSearchTerm = async (user_id: string, term: string) => {
  await prisma.recentSearch.deleteMany({
    where: {
      user_id,
      term: { equals: term, mode: "insensitive" },
    },
  });
};

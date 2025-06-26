import prisma from "../utils/prisma";

export const addSearchTerm = async (userId: string, term: string) => {
  // Remove if it already exists
  await prisma.recentSearch.deleteMany({
    where: {
      userId,
      term: { equals: term, mode: "insensitive" },
    },
  });

  // Insert new
  await prisma.recentSearch.create({
    data: {
      userId,
      term,
    },
  });

  // Limit to 5 recent only
  const recent = await prisma.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (recent.length > 5) {
    const toDelete = recent.slice(5);
    await prisma.recentSearch.deleteMany({
      where: { id: { in: toDelete.map((r) => r.id) } },
    });
  }
};

export const fetchSearchTerms = async (userId: string) => {
  const terms = await prisma.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return terms.map((r) => r.term);
};

export const removeSearchTerm = async (userId: string, term: string) => {
  await prisma.recentSearch.deleteMany({
    where: {
      userId,
      term: { equals: term, mode: "insensitive" },
    },
  });
};

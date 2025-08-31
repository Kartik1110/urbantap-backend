import prisma from '../utils/prisma';

// Get company credit usage history with enriched data
export const getOrdersService = async (company_id: string) => {
    const orders = await prisma.order.findMany({
        where: { company_id },
        orderBy: { created_at: 'desc' },
        include: {
            company: true,
            admin_user: {
                include: {
                    broker: {
                        select: {
                            name: true,
                            profile_pic: true,
                        },
                    },
                },
            },
        },
    });

    // Since Prisma doesn't support conditional includes, we'll fetch related data in separate queries
    // but optimize by batching similar types together
    const jobIds = orders
        .filter((o) => o.type === 'JOB' && o.type_id)
        .map((o) => o.type_id!);
    const companyPostIds = orders
        .filter((o) => o.type === 'COMPANY_POST' && o.type_id)
        .map((o) => o.type_id!);
    const listingIds = orders
        .filter((o) => o.type === 'LISTING' && o.type_id)
        .map((o) => o.type_id!);

    // Batch fetch related data
    const [jobs, companyPosts, listings] = await Promise.all([
        jobIds.length > 0
            ? prisma.job.findMany({
                  where: { id: { in: jobIds } },
                  select: { id: true, title: true, description: true },
              })
            : [],
        companyPostIds.length > 0
            ? prisma.companyPost.findMany({
                  where: { id: { in: companyPostIds } },
                  select: {
                      id: true,
                      title: true,
                      images: true,
                  },
              })
            : [],
        listingIds.length > 0
            ? prisma.listing.findMany({
                  where: { id: { in: listingIds } },
                  select: {
                      id: true,
                      title: true,
                      image: true,
                      description: true,
                  },
              })
            : [],
    ]);

    // Create lookup maps for efficient data access
    const jobMap = new Map(jobs.map((job) => [job.id, job]));
    const companyPostMap = new Map(companyPosts.map((post) => [post.id, post]));
    const listingMap = new Map(
        listings.map((listing) => [listing.id, listing])
    );

    // Enrich orders with related data
    const enrichedOrders = orders.map((order) => {
        let relatedData = null;

        if (order.type_id && order.type !== 'CREDIT') {
            switch (order.type) {
                case 'JOB': {
                    const job = jobMap.get(order.type_id);
                    if (job) {
                        relatedData = {
                            title: job.title,
                            description: job.description,
                        };
                    }
                    break;
                }
                case 'COMPANY_POST': {
                    const companyPost = companyPostMap.get(order.type_id);
                    if (companyPost) {
                        relatedData = {
                            title: companyPost.title || 'Company Post',
                            images: companyPost.images,
                        };
                    }
                    break;
                }
                case 'LISTING': {
                    const listing = listingMap.get(order.type_id);
                    if (listing) {
                        relatedData = {
                            title: listing.title,
                            image: listing.image,
                        };
                    }
                    break;
                }
            }
        }

        return {
            ...order,
            relatedData,
        };
    });

    return enrichedOrders;
};

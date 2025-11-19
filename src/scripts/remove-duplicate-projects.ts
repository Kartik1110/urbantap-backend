import prisma from '@/utils/prisma';

/**
 * Script to remove duplicate projects based on exact title matching.
 * For duplicates, keeps the one with external_id and deletes the ones with null external_id.
 */
async function removeDuplicateProjects() {
    try {
        console.log('🔍 Checking for duplicate projects by title...\n');

        // Find all projects grouped by title
        const projects = await prisma.project.findMany({
            select: {
                id: true,
                title: true,
                external_id: true,
                project_name: true,
            },
        });

        // Group projects by exact title match (case-sensitive)
        const titleGroups = new Map<string, typeof projects>();

        for (const project of projects) {
            const title = project.title.trim();
            if (!titleGroups.has(title)) {
                titleGroups.set(title, []);
            }
            titleGroups.get(title)!.push(project);
        }

        // Find duplicates (groups with more than 1 project)
        const duplicates: Array<{
            title: string;
            projects: typeof projects;
        }> = [];

        for (const [title, projectList] of titleGroups.entries()) {
            if (projectList.length > 1) {
                duplicates.push({ title, projects: projectList });
            }
        }

        console.log(`📊 Found ${duplicates.length} duplicate title groups\n`);

        if (duplicates.length === 0) {
            console.log('✅ No duplicates found. Database is clean!');
            return;
        }

        let totalDeleted = 0;
        let totalKept = 0;

        // Process each duplicate group
        for (const { title, projects: projectList } of duplicates) {
            console.log(`\n📋 Processing duplicates for: "${title}"`);
            console.log(`   Found ${projectList.length} projects with this title`);

            // Separate projects with and without external_id
            const withExternalId = projectList.filter((p) => p.external_id !== null);
            const withoutExternalId = projectList.filter((p) => p.external_id === null);

            console.log(`   - ${withExternalId.length} with external_id`);
            console.log(`   - ${withoutExternalId.length} without external_id`);

            // Delete the ones without external_id, keep the ones with external_id
            if (withoutExternalId.length > 0) {
                console.log(`   🗑️  Deleting ${withoutExternalId.length} project(s) without external_id...`);

                for (const project of withoutExternalId) {
                    try {
                        // Delete associated floor plans first (if any)
                        await prisma.floorPlan.deleteMany({
                            where: { project_id: project.id },
                        });

                        // Delete the project
                        await prisma.project.delete({
                            where: { id: project.id },
                        });

                        console.log(`      ✅ Deleted project: ${project.id}`);
                        totalDeleted++;
                    } catch (error: any) {
                        console.error(
                            `      ❌ Error deleting project ${project.id}:`,
                            error.message
                        );
                    }
                }
            }

            // Keep the ones with external_id
            if (withExternalId.length > 0) {
                totalKept += withExternalId.length;
                console.log(
                    `   ✅ Kept ${withExternalId.length} project(s) with external_id`
                );
            }
        }

        console.log(`\n\n✅ Cleanup complete!`);
        console.log(`📊 Summary:`);
        console.log(`   - Duplicate groups processed: ${duplicates.length}`);
        console.log(`   - Projects deleted: ${totalDeleted}`);
        console.log(`   - Projects kept: ${totalKept}`);
    } catch (error: any) {
        console.error('❌ Error removing duplicates:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
removeDuplicateProjects()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });


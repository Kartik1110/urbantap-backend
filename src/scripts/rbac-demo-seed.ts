import { PrismaClient, Permission } from '@prisma/client';

const prisma = new PrismaClient();

async function createRBACDemoData() {
    console.log('🌱 Creating RBAC demo data...');

    try {
        console.log('Creating role groups...');

        const jobManagerRole = await prisma.roleGroup.create({
            data: {
                name: 'Job Manager',
                description: 'Can manage jobs',
                permissions: [
                    Permission.CREATE_JOB,
                    Permission.EDIT_JOB,
                    Permission.DELETE_JOB,
                    Permission.VIEW_JOB,
                ],
            },
        });

        const projectManagerRole = await prisma.roleGroup.create({
            data: {
                name: 'Project Manager',
                description: 'Can manage projects',
                permissions: [
                    Permission.CREATE_PROJECT,
                    Permission.EDIT_PROJECT,
                    Permission.DELETE_PROJECT,
                    Permission.VIEW_PROJECT,
                ],
            },
        });

        // const postManagerRole = await prisma.roleGroup.create({
        //     data: {
        //         name: 'Post Manager',
        //         description: 'Can manage company posts',
        //         permissions: [
        //             Permission.CREATE_COMPANY_POST,
        //             Permission.EDIT_COMPANY_POST,
        //             Permission.DELETE_COMPANY_POST,
        //             Permission.VIEW_COMPANY_POST,
        //         ],
        //     },
        // });

        // const fullAccessRole = await prisma.roleGroup.create({
        //     data: {
        //         name: 'Full Access',
        //         description: 'Can manage both jobs and company posts',
        //         permissions: [
        //             Permission.CREATE_JOB,
        //             Permission.EDIT_JOB,
        //             Permission.DELETE_JOB,
        //             Permission.VIEW_JOB,
        //             Permission.CREATE_COMPANY_POST,
        //             Permission.EDIT_COMPANY_POST,
        //             Permission.DELETE_COMPANY_POST,
        //             Permission.VIEW_COMPANY_POST,
        //         ],
        //     },
        // });

        const readOnlyRole = await prisma.roleGroup.create({
            data: {
                name: 'Read Only',
                description: 'Can only view jobs and posts',
                permissions: [
                    Permission.VIEW_JOB,
                    Permission.VIEW_COMPANY_POST,
                ],
            },
        });

        console.log('✅ Role groups created:', {
            jobManager: jobManagerRole.id,
            projectManager: projectManagerRole.id,
            // postManager: postManagerRole.id,
            // fullAccess: fullAccessRole.id,
            readOnly: readOnlyRole.id,
        });

        console.log('\n🎉 RBAC demo data created successfully!');
    } catch (error) {
        console.error('❌ Error creating RBAC demo data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
if (require.main === module) {
    createRBACDemoData()
        .then(() => {
            console.log('✅ RBAC demo data creation completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Failed to create RBAC demo data:', error);
            process.exit(1);
        });
}

export { createRBACDemoData };

import { PrismaClient, Permission, AdminUserType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createRBACDemoData() {
    console.log('🌱 Creating RBAC demo data...');

    try {
        // 1. Create demo role groups
        console.log('Creating role groups...');

        const jobManagerRole = await prisma.roleGroup.create({
            data: {
                name: 'Job Manager',
                description: 'Can manage jobs but not company posts',
                permissions: [
                    Permission.CREATE_JOB,
                    Permission.EDIT_JOB,
                    Permission.DELETE_JOB,
                    Permission.VIEW_JOB,
                ],
            },
        });

        const postManagerRole = await prisma.roleGroup.create({
            data: {
                name: 'Post Manager',
                description: 'Can manage company posts but not jobs',
                permissions: [
                    Permission.CREATE_COMPANY_POST,
                    Permission.EDIT_COMPANY_POST,
                    Permission.DELETE_COMPANY_POST,
                    Permission.VIEW_COMPANY_POST,
                ],
            },
        });

        const fullAccessRole = await prisma.roleGroup.create({
            data: {
                name: 'Full Access',
                description: 'Can manage both jobs and company posts',
                permissions: [
                    Permission.CREATE_JOB,
                    Permission.EDIT_JOB,
                    Permission.DELETE_JOB,
                    Permission.VIEW_JOB,
                    Permission.CREATE_COMPANY_POST,
                    Permission.EDIT_COMPANY_POST,
                    Permission.DELETE_COMPANY_POST,
                    Permission.VIEW_COMPANY_POST,
                ],
            },
        });

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
            postManager: postManagerRole.id,
            fullAccess: fullAccessRole.id,
            readOnly: readOnlyRole.id,
        });

        // 2. Find an existing company (assuming there's at least one)
        const company = await prisma.company.findFirst({
            include: {
                brokers: {
                    where: {
                        admin_user_id: null, // Only brokers not linked to admin users
                    },
                    take: 3,
                },
            },
        });

        if (!company) {
            console.log('❌ No company found. Please create a company first.');
            return;
        }

        if (company.brokers.length < 3) {
            console.log(
                '❌ Not enough unlinked brokers found. Please create more brokers.'
            );
            return;
        }

        console.log(
            `Found company: ${company.name} with ${company.brokers.length} available brokers`
        );

        // 3. Create team members with different roles
        console.log('Creating team members...');

        const hashedPassword = await bcrypt.hash('demo123', 10);

        // Team member 1: Job Manager
        const jobManager = await prisma.adminUser.create({
            data: {
                email: 'job-manager@demo.com',
                password: hashedPassword,
                type: AdminUserType.MEMBER,
                broker_id: company.brokers[0].id,
                role_group_id: jobManagerRole.id,
                company_id: company.id,
            },
        });

        // Update broker to link to admin user
        await prisma.broker.update({
            where: { id: company.brokers[0].id },
            data: { admin_user_id: jobManager.id },
        });

        // Team member 2: Post Manager
        const postManager = await prisma.adminUser.create({
            data: {
                email: 'post-manager@demo.com',
                password: hashedPassword,
                type: AdminUserType.MEMBER,
                broker_id: company.brokers[1].id,
                role_group_id: postManagerRole.id,
                company_id: company.id,
            },
        });

        // Update broker to link to admin user
        await prisma.broker.update({
            where: { id: company.brokers[1].id },
            data: { admin_user_id: postManager.id },
        });

        // Team member 3: Read Only
        const readOnlyUser = await prisma.adminUser.create({
            data: {
                email: 'readonly@demo.com',
                password: hashedPassword,
                type: AdminUserType.MEMBER,
                broker_id: company.brokers[2].id,
                role_group_id: readOnlyRole.id,
                company_id: company.id,
            },
        });

        // Update broker to link to admin user
        await prisma.broker.update({
            where: { id: company.brokers[2].id },
            data: { admin_user_id: readOnlyUser.id },
        });

        console.log('✅ Team members created:', {
            jobManager: { email: 'job-manager@demo.com', id: jobManager.id },
            postManager: { email: 'post-manager@demo.com', id: postManager.id },
            readOnly: { email: 'readonly@demo.com', id: readOnlyUser.id },
        });

        // 4. Create some demo jobs and posts for testing
        console.log('Creating demo content...');

        // Create a job by the job manager
        const demoJob = await prisma.job.create({
            data: {
                title: 'Senior Real Estate Agent',
                description: 'Looking for an experienced real estate agent',
                workplace_type: 'On_site',
                location: 'Dubai',
                job_type: 'Full_time',
                min_salary: 5000,
                max_salary: 8000,
                currency: 'AED',
                company_id: company.id,
                admin_user_id: jobManager.id,
            },
        });

        // Create a company post by the post manager
        const demoPost = await prisma.companyPost.create({
            data: {
                title: 'New Office Opening',
                caption:
                    'We are excited to announce our new office in Dubai Marina!',
                images: ['https://example.com/office.jpg'],
                position: 'Home',
                rank: 1,
                company_id: company.id,
                admin_user_id: postManager.id,
            },
        });

        console.log('✅ Demo content created:', {
            job: { title: demoJob.title, id: demoJob.id },
            post: { title: demoPost.title, id: demoPost.id },
        });

        console.log('\n🎉 RBAC demo data created successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('Job Manager: job-manager@demo.com / demo123');
        console.log('Post Manager: post-manager@demo.com / demo123');
        console.log('Read Only: readonly@demo.com / demo123');
        console.log('\n🧪 Test Scenarios:');
        console.log(
            '1. Login as job-manager@demo.com - should be able to create/edit jobs only'
        );
        console.log(
            '2. Login as post-manager@demo.com - should be able to create/edit posts only'
        );
        console.log(
            '3. Login as readonly@demo.com - should only be able to view content'
        );
        console.log(
            "4. Try accessing each other's created content - should be restricted"
        );
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

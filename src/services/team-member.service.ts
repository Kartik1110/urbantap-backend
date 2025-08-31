import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AdminUserType } from '@prisma/client';

export interface CreateTeamMemberDto {
    brokerId: string;
    roleGroupId: string;
}

export interface UpdateTeamMemberRoleDTO {
    roleGroupId: string;
}

export class TeamMemberService {
    /**
     * Create new team member
     */
    static async createTeamMember(
        adminUserId: string,
        teamMemberData: CreateTeamMemberDto
    ) {
        // Get admin user's company
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { company_id: true, type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can create team members');
        }

        // Validate broker belongs to the same company
        const broker = await prisma.broker.findUnique({
            where: { id: teamMemberData.brokerId },
            select: {
                company_id: true,
                admin_user_id: true,
                name: true,
                w_number: true,
            },
        });

        if (!broker) {
            throw new Error('Broker not found');
        }

        if (broker.company_id !== adminUser.company_id) {
            throw new Error('Broker does not belong to your company');
        }

        if (broker.admin_user_id) {
            throw new Error('Broker is already linked to another admin user');
        }

        // Validate role group belongs to the same company (implicit check through admin)
        const roleGroup = await prisma.roleGroup.findUnique({
            where: { id: teamMemberData.roleGroupId },
        });

        if (!roleGroup) {
            throw new Error('Role group not found');
        }

        // Generate username and password for this team member
        const username = [
            (broker.name || '').replace(' ', '').toLowerCase().trim(),
            (broker.w_number || '').trim().slice(-4),
        ].join('');

        const password = Math.random().toString(36).substring(2, 15);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create team member
        const teamMember = await prisma.adminUser.create({
            data: {
                email: username,
                password: hashedPassword,
                type: AdminUserType.MEMBER,
                broker_id: teamMemberData.brokerId,
                role_group_id: teamMemberData.roleGroupId,
                company_id: adminUser.company_id,
            },
            include: {
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role_group: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
            },
        });

        // Update broker to link to this admin user
        await prisma.broker.update({
            where: { id: teamMemberData.brokerId },
            data: { admin_user_id: teamMember.id },
        });

        return {
            username: teamMember.email,
            password,
        };
    }

    /**
     * Get all team members for a company
     */
    static async getTeamMembers(adminUserId: string) {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { company_id: true, type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can view team members');
        }

        return await prisma.adminUser.findMany({
            where: {
                company_id: adminUser.company_id,
                type: AdminUserType.MEMBER,
            },
            include: {
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role_group: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Update team member role
     */
    static async updateTeamMemberRole(
        adminUserId: string,
        teamMemberId: string,
        updateData: UpdateTeamMemberRoleDTO
    ) {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { company_id: true, type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can update team members');
        }

        // Validate team member belongs to the same company
        const teamMember = await prisma.adminUser.findUnique({
            where: { id: teamMemberId },
            select: { company_id: true, type: true },
        });

        if (!teamMember) {
            throw new Error('Team member not found');
        }

        if (teamMember.company_id !== adminUser.company_id) {
            throw new Error('Team member does not belong to your company');
        }

        if (teamMember.type !== AdminUserType.MEMBER) {
            throw new Error('Cannot update admin user role');
        }

        // Validate role group
        const roleGroup = await prisma.roleGroup.findUnique({
            where: { id: updateData.roleGroupId },
        });

        if (!roleGroup) {
            throw new Error('Role group not found');
        }

        // Update team member
        return await prisma.adminUser.update({
            where: { id: teamMemberId },
            data: { role_group_id: updateData.roleGroupId },
            include: {
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role_group: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
            },
        });
    }

    /**
     * Delete team member
     */
    static async deleteTeamMember(adminUserId: string, teamMemberId: string) {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { company_id: true, type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can delete team members');
        }

        // Validate team member belongs to the same company
        const teamMember = await prisma.adminUser.findUnique({
            where: { id: teamMemberId },
            select: { company_id: true, type: true, broker_id: true },
        });

        if (!teamMember) {
            throw new Error('Team member not found');
        }

        if (teamMember.company_id !== adminUser.company_id) {
            throw new Error('Team member does not belong to your company');
        }

        if (teamMember.type !== AdminUserType.MEMBER) {
            throw new Error('Cannot delete admin user');
        }

        // Unlink broker if linked
        if (teamMember.broker_id) {
            await prisma.broker.update({
                where: { id: teamMember.broker_id },
                data: { admin_user_id: null },
            });
        }

        // Delete team member
        await prisma.adminUser.delete({
            where: { id: teamMemberId },
        });

        return {
            success: true,
            message: 'Team member deleted successfully',
        };
    }

    /**
     * Get available brokers for team assignment
     */
    static async getAvailableBrokers(adminUserId: string) {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { company_id: true, type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can view available brokers');
        }

        return await prisma.broker.findMany({
            where: {
                company_id: adminUser.company_id,
                admin_user_id: null, // Only brokers not linked to any admin user
            },
            select: {
                id: true,
                name: true,
                email: true,
                designation: true,
                y_o_e: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    /**
     * Validate broker belongs to company
     */
    static async validateBrokerCompany(
        brokerId: string,
        companyId: string
    ): Promise<boolean> {
        const broker = await prisma.broker.findUnique({
            where: { id: brokerId },
            select: { company_id: true },
        });

        return broker?.company_id === companyId;
    }
}

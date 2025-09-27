import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma';
import { CompanyType, AdminUserType } from '@prisma/client';

export const signupAdmin = async (
    email: string,
    password: string,
    companyId: string
) => {
    const adminEmail = await prisma.adminUser.findUnique({
        where: { email },
    });
    if (adminEmail) {
        throw new Error('Email already exists');
    }

    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { developerId: true, brokerageId: true, type: true },
    });

    if (!company) throw new Error('Company not found');

    const hashedPassword = await bcrypt.hash(password, 10);

    return await prisma.adminUser.create({
        data: {
            email,
            password: hashedPassword,
            company_id: companyId,
            type: AdminUserType.ADMIN,
        },
    });
};

export const loginAdmin = async (email: string, password: string) => {
    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user) throw new Error('User not found');

    if (user.type !== AdminUserType.ADMIN && !user.role_group_id) {
        throw new Error('Access denied');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const company = await prisma.company.findUnique({
        where: { id: user.company_id },
        select: { type: true, developerId: true, brokerageId: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenPayload: any = {
        id: user.id,
        email: user.email,
        companyId: user.company_id,
        type: company?.type,
        entityId:
            company &&
            (company.type === CompanyType.Developer
                ? company.developerId
                : company.brokerageId),
        adminUserType: user.type,
        permissions: [],
        broker:
            company?.type === CompanyType.Brokerage
                ? {
                      id: company.brokerageId,
                      name: company.brokerageId,
                  }
                : undefined,
    };

    if (user.role_group_id) {
        const roleGroup = await prisma.roleGroup.findUnique({
            where: { id: user.role_group_id },
        });

        tokenPayload.permissions = roleGroup?.permissions || [];
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
    });

    return token;
};

export const changeAdminPassword = async (
    adminUserId: string,
    old_password: string,
    new_password: string
) => {
    const user = await prisma.adminUser.findUnique({
        where: { id: adminUserId },
    });

    if (!user) throw new Error('Admin user not found');

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) throw new Error('Old password is incorrect');

    const hashedNew = await bcrypt.hash(new_password, 10);

    await prisma.adminUser.update({
        where: { id: adminUserId },
        data: { password: hashedNew },
    });
};

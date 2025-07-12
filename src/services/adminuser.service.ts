import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

export const signupAdmin = async (email: string, password: string, companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { developerId: true, brokerageId: true },
  });

  if (!company) throw new Error("Company not found");

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.adminUser.create({
    data: {
      email,
      password: hashedPassword,
      companyId,
      developerId: company.developerId,
      brokerageId: company.brokerageId,
    },
  });
};

export const loginAdmin = async (email: string, password: string) => {
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return token;
};


export const changeAdminPassword = async (adminUserId: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
  });

  if (!user) throw new Error("Admin user not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  const hashedNew = await bcrypt.hash(newPassword, 10);

  await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { password: hashedNew },
  });
};

export const editLinkedDeveloper = async (adminUserId: string, updateData: any) => {
  // Find the admin user
  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
    select: { developerId: true },
  });

  if (!adminUser) {
    throw new Error("Admin user not found");
  }

  if (!adminUser.developerId) {
    throw new Error("This admin is not linked to any developer");
  }

  // Update developer
    const updatedDeveloper = await prisma.developer.update({
    where: { id: adminUser.developerId },
    data: {
      name: updateData.name,
      description: updateData.description,
      email: updateData.email,
      phone: updateData.phone,
      logo: updateData.logo,
      cover_image: updateData.cover_image,
    },
  });
  return updatedDeveloper;
};

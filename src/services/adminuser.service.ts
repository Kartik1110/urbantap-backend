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

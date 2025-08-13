import { PrismaClient } from '@prisma/client';

class PrismaInstance {
    private static instance: PrismaClient;

    private constructor() {}

    public static getInstance(): PrismaClient {
        if (!PrismaInstance.instance) {
            PrismaInstance.instance = new PrismaClient({
                // log: ['query', 'info', 'warn', 'error'],
                // errorFormat: 'pretty',
            });
        }
        return PrismaInstance.instance;
    }
}

const prisma = PrismaInstance.getInstance();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log('Database disconnected successfully');
    } catch (error) {
        console.error('Database disconnection failed:', error);
        throw error;
    }
};

export default prisma;

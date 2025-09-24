export const EMAIL_CONFIG = {
    // SMTP Configuration
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
        },
    },

    // Email settings
    from: {
        name: process.env.EMAIL_FROM_NAME || 'UrbanTap',
        email: process.env.EMAIL_FROM_EMAIL || process.env.SMTP_USER || '',
    },

    // Template settings
    templates: {
        baseUrl: process.env.EMAIL_TEMPLATE_BASE_URL || 'http://localhost:3000',
        logoUrl:
            process.env.EMAIL_LOGO_URL || 'https://your-domain.com/logo.png',
        companyName: process.env.COMPANY_NAME || 'UrbanTap',
        companyAddress: process.env.COMPANY_ADDRESS || 'Dubai, UAE',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@urbantap.io',
    },
};

export interface EmailConfig {
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    from: {
        name: string;
        email: string;
    };
    templates: {
        baseUrl: string;
        logoUrl: string;
        companyName: string;
        companyAddress: string;
        supportEmail: string;
    };
    rateLimit: {
        maxEmailsPerHour: number;
        maxEmailsPerDay: number;
    };
}

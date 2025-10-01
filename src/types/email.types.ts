export interface EmailTemplate {
    name: string;
    description: string;
}

export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface EmailTemplateData {
    [key: string]: any;
}

export interface EmailTemplateRenderer {
    (data: EmailTemplateData): Promise<{
        subject: string;
        html: string;
        text: string;
    }>;
}

export interface OtpSignupEmailData extends EmailTemplateData {
    recipientName: string;
    otpCode: string;
    expiryMinutes?: number;
    verificationUrl?: string;
    companyName: string;
    companyAddress: string;
    supportEmail: string;
}

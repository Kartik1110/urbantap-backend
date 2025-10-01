import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { EMAIL_CONFIG } from '../../config/email.config';
import logger from '../../utils/logger';
import {
    EmailTemplate,
    EmailTemplateData,
    EmailRecipient,
} from '../../types/email.types';

class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: EMAIL_CONFIG.smtp.host,
            port: EMAIL_CONFIG.smtp.port,
            secure: EMAIL_CONFIG.smtp.secure,
            auth: EMAIL_CONFIG.smtp.auth,
        });

        // Verify connection configuration
        this.verifyConnection();
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            logger.info('Email service connection verified successfully');
        } catch (error) {
            logger.error('Email service connection failed:', error);
            throw new Error('Email service configuration is invalid');
        }
    }

    /**
     * Send email using a template
     */
    async sendTemplateEmail(
        template: EmailTemplate,
        recipient: EmailRecipient,
        data: EmailTemplateData
    ): Promise<boolean> {
        try {
            const { subject, html, text } = await this.renderTemplate(
                template,
                data
            );

            const mailOptions: SendMailOptions = {
                from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
                to: recipient.email,
                subject,
                html,
                text,
                replyTo: EMAIL_CONFIG.templates.supportEmail,
            };

            // Add recipient name if provided
            if (recipient.name) {
                mailOptions.to = `${recipient.name} <${recipient.email}>`;
            }

            const result = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${recipient.email}`, {
                messageId: result.messageId,
                template: template.name,
            });

            return true;
        } catch (error) {
            logger.error(`Failed to send email to ${recipient.email}:`, error);
            return false;
        }
    }

    /**
     * Render email template with data
     */
    private async renderTemplate(
        template: EmailTemplate,
        data: EmailTemplateData
    ): Promise<{ subject: string; html: string; text: string }> {
        try {
            // Import template dynamically
            const templateModule = await import(
                `../templates/${template.name}.template`
            );

            const templateRenderer = templateModule.default;

            return await templateRenderer(data);
        } catch (error) {
            logger.error(`Failed to render template ${template.name}:`, error);
            throw new Error(`Template ${template.name} not found or invalid`);
        }
    }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;

import { EmailTemplateData } from '../../types/email.types';
import { getBaseTemplateHTML } from './base.template';

const otpSignupTemplate = async (
    data: EmailTemplateData & { companyName: string }
) => {
    const title = 'Email Verification';

    const content = `
        <p>Hi there,</p>
        
        <p>This is your one time verification code.</p>
        
        <div style="text-align: center; padding: 32px 0; margin: 32px 0;">
            <div style="display: inline-block; background: #f3f4f6; border-radius: 12px; padding: 24px 48px;">
                <div style="font-size: 32px; font-weight: 600; color: #374151; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${data.otpCode}
                </div>
            </div>
        </div>
        
        <p>This code is only active for the next ${data.expiryMinutes || 10} minutes. Once the code expires you will have to resubmit a request for a code.</p>
    `;

    return {
        subject: `Verification code: ${data.otpCode}`,
        html: getBaseTemplateHTML(title, content, data),
    };
};

export default otpSignupTemplate;

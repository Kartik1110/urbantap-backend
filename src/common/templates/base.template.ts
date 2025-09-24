export interface BaseTemplateData {
    companyName: string;
    [key: string]: any;
}

export function getBaseTemplateStyles(): string {
    return `
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #374151;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f3f4f6;
            }
            .email-container {
                background-color: #ffffff;
                width: 100%;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background-color: #ffffff;
                padding: 32px 32px 16px 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #f3f4f6;
            }
            .logo {
                width: 32px;
                height: 32px;
                background-color: #000000;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            .nav-links {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .nav-links a {
                color: #374151;
                text-decoration: none;
                font-size: 14px;
            }
            .social-icons {
                display: flex;
                gap: 12px;
            }
            .social-icon {
                width: 20px;
                height: 20px;
                color: #6b7280;
            }
            .content {
                padding: 32px;
            }
            .content p {
                margin: 0 0 24px 0;
                font-size: 16px;
                color: #374151;
            }
            .footer {
                padding: 32px;
                text-align: center;
            }
            .footer-logo {
                width: 24px;
                height: 24px;
                background-color: #000000;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            }
            .footer-text {
                font-size: 12px;
                color: #6b7280;
            }
        </style>
    `;
}

export function getBaseTemplateHTML(
    title: string,
    content: string,
    data: BaseTemplateData
): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            ${getBaseTemplateStyles()}
        </head>
        <body>
            <div class="email-container">
                <div class="content">
                    ${content}
                </div>
                
                <div class="footer" style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px;">
                    <div class="footer-text" style="margin-top: 16px; color: #9ca3af; font-size: 11px;">
                        &copy; ${new Date().getFullYear()} ${data.companyName}. All rights reserved.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

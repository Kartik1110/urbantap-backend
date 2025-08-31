export const CREDIT_CONFIG = {
    defaultExpiryDays: 30,
    creditPricing: {
        featuredJob: 250,
        featuredCompanyPost: 300,
    },
    visibilityDuration: {
        featuredJob: 7, // days
        featuredCompanyPost: 7, // days
    },
    creditPackages: {
        basic: {
            price: 500, // AED
            credits: 500,
            ratePerCredit: 1.0,
        },
        value: {
            price: 2000, // AED
            credits: 2200,
            ratePerCredit: 0.91,
        },
        pro: {
            price: 5000, // AED
            credits: 6000,
            ratePerCredit: 0.83,
        },
        enterprise: {
            price: 10000, // AED
            credits: 12500,
            ratePerCredit: 0.8,
        },
    },
};

export type CreditPackageType = keyof typeof CREDIT_CONFIG.creditPackages;

export interface CreditConfig {
    defaultExpiryDays: number;
    creditPricing: {
        featuredJob: number;
        featuredCompanyPost: number;
    };
    visibilityDuration: {
        featuredJob: number;
        featuredCompanyPost: number;
    };
}

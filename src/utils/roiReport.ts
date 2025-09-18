import logger from './logger';

// Types for the merged property data structure
export interface PropertyDataPoint {
    appreciation_perc: number;
    rent_per_sq_ft: number;
}

export interface PropertyTypeData {
    [propertyType: string]: PropertyDataPoint[];
}

export interface MergedPropertyData {
    [location: string]: PropertyTypeData;
}

const DEFFAULT_DP_RATIO = 0.4;
const DEFFAULT_INTEREST_RATE = 0.0399;

/**
 * Calculates the property ROI for a given year based on appreciation rate, rental income, and mortgage costs
 * @param propertyData - The property data from the JSON file
 * @param year - The year to calculate ROI for (0-9, where 0 is the first year)
 * @param initialInvestment - The initial investment amount in the base currency
 * @param propertySize - The property size in square feet
 * @param downPaymentToLoanRatio - The down payment to loan ratio (default: 0.4)
 * @param annualInterestRate - The annual interest rate (default: 0.0399)
 * @param monthlyRent - The monthly rent (default: undefined)
 * @returns The calculated ROI percentage, or null if data is not available
 */
export function calculatePropertyROI(
    propertyData: PropertyDataPoint[],
    year: number,
    initialInvestment: number,
    propertySize: number,
    downPaymentToLoanRatio: number = DEFFAULT_DP_RATIO,
    annualInterestRate: number = DEFFAULT_INTEREST_RATE,
    monthlyRent?: number
): number {
    // Validate inputs
    if (year < 0 || year > 9) {
        const message = 'Year must be between 0 and 9';
        logger.error(`calculatePropertyROI: ${message}`);
        throw new Error(message);
    }

    if (initialInvestment <= 0) {
        const message = 'Initial investment must be positive';
        logger.error(`calculatePropertyROI: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculatePropertyROI: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || !propertyData[year]) {
        const message = 'Property data points not provided';
        logger.error(`calculatePropertyROI: ${message}`);
        throw new Error(message);
    }

    const yearData = propertyData[year];

    // Calculate property value appreciation
    // appreciation_perc is cumulative from year 0, so we need to calculate year-over-year
    let appreciationPercentage: number;

    if (year === 0) {
        // Year 0 should use the first period's cumulative appreciation from current year
        appreciationPercentage = yearData.appreciation_perc;
    } else {
        // Get previous year's cumulative appreciation
        const previousYearData = propertyData[year - 1];
        if (!previousYearData) {
            const message = 'Previous year data not found';
            logger.error(`calculatePropertyROI: ${message}`);
            throw new Error(message);
        }

        // Calculate year-over-year appreciation
        appreciationPercentage =
            yearData.appreciation_perc - previousYearData.appreciation_perc;
    }

    const propertyValueIncrease =
        initialInvestment * (appreciationPercentage / 100);

    // Calculate rental income for the year
    const rentPerSqFt = yearData.rent_per_sq_ft;
    const annualRentalIncome = (monthlyRent || rentPerSqFt * propertySize) * 12; // Assuming 12 months

    const loanAmount = initialInvestment * (1 - downPaymentToLoanRatio);
    const downPayment = initialInvestment * downPaymentToLoanRatio;

    // Calculate annual mortgage interest payment
    const annualMortgageInterest = loanAmount * annualInterestRate;

    // Calculate net ROI (returns minus mortgage costs)
    const totalReturn = propertyValueIncrease + annualRentalIncome;
    const netReturn = totalReturn - annualMortgageInterest;

    // ROI is calculated on the actual cash invested (down payment)
    const roi = (netReturn / downPayment) * 100;

    return roi;
}

/**
 * Calculates the average annual ROI percentage over a given number of years.
 * ROI is calculated as rental yield using the average of short-term and long-term rents.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - The number of years to average over (>=1)
 * @param initialInvestment - The initial investment amount in the base currency
 * @param propertySize - The property size in square feet
 * @param roiMultiplier - The multiplier to apply to the roi (default: 1)
 * @returns The average ROI percentage per year based on rental yield
 */
export function calculateAverageROI(
    propertyData: PropertyDataPoint[],
    years: number,
    initialInvestment: number,
    propertySize: number,
    roiMultiplier: number = 1
): number {
    if (years < 1 || years > 10) {
        const message = 'Years must be between 1 and 10';
        logger.error(`calculateAverageROI: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || propertyData.length === 0) {
        const message = 'Property data not provided';
        logger.error(`calculateAverageROI: ${message}`);
        throw new Error(message);
    }

    if (initialInvestment <= 0) {
        const message = 'Initial investment must be positive';
        logger.error(`calculateAverageROI: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateAverageROI: ${message}`);
        throw new Error(message);
    }

    let totalRentalYield = 0;

    for (let year = 0; year < years; year++) {
        const yearData = propertyData[year];
        if (!yearData) {
            const message = `Year data not found for year ${year + 1}`;
            logger.error(`calculateAverageROI: ${message}`);
            throw new Error(message);
        }

        // Calculate long-term rental income (standard rate)
        const longTermAnnualIncome =
            yearData.rent_per_sq_ft * propertySize * 12;

        // Calculate short-term rental income (with rent multiplier)
        const shortTermAnnualIncome = calculateShortTermRental(
            initialInvestment,
            longTermAnnualIncome,
            roiMultiplier
        ).rent;

        // Average of short-term and long-term rental income
        const averageAnnualIncome =
            (shortTermAnnualIncome + longTermAnnualIncome) / 2;

        // Calculate rental yield as percentage of initial investment
        const rentalYield = (averageAnnualIncome / initialInvestment) * 100;
        totalRentalYield += rentalYield;
    }

    return totalRentalYield / years;
}

/**
 * Calculates the average annual rent per year over a given number of years.
 * Uses the average of short-term and long-term rental strategies.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - The initial investment amount in the base currency
 * @param years - The number of years to average over (>=1)
 * @param propertySize - The property size in square feet
 * @param roiMultiplier - The multiplier to apply to the roi (default: 1)
 * @returns The average annual rent per year
 */
export function calculateAverageRentPerYear(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    years: number,
    propertySize: number,
    roiMultiplier: number = 1
): number {
    if (years < 1 || years > 10) {
        const message = 'Years must be between 1 and 10';
        logger.error(`calculateAverageRentPerYear: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || propertyData.length === 0) {
        const message = 'Property data not provided';
        logger.error(`calculateAverageRentPerYear: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateAverageRentPerYear: ${message}`);
        throw new Error(message);
    }

    let totalAnnualRent = 0;

    for (let year = 0; year < years; year++) {
        const yearData = propertyData[year];

        // Calculate long-term rental income (standard rate)
        const longTermAnnualIncome =
            yearData.rent_per_sq_ft * propertySize * 12;

        // Calculate short-term rental income (with roi multiplier)
        const shortTermAnnualIncome = calculateShortTermRental(
            initialInvestment,
            longTermAnnualIncome,
            roiMultiplier
        ).rent;

        // Average of short-term and long-term rental income
        const averageAnnualIncome =
            (shortTermAnnualIncome + longTermAnnualIncome) / 2;

        totalAnnualRent += averageAnnualIncome;
    }

    return totalAnnualRent / years;
}

/**
 * Calculates capital gains and future value after a number of years using cumulative appreciation
 * @param propertyData - The property data from the JSON file
 * @param years - Number of years ahead (1..10). Year 1 corresponds to index 0 in data
 * @param currentValue - Current property value (today)
 * @returns Object with futureValue and capitalGains, or null if data is not available
 */
export function calculateCapitalGains(
    propertyData: PropertyDataPoint[],
    years: number,
    currentValue: number
): { futureValue: number; capitalGains: number } {
    if (years < 1 || years > 10) {
        const message = 'Years must be between 1 and 10';
        logger.error(`calculateCapitalGains: ${message}`);
        throw new Error(message);
    }

    if (currentValue <= 0) {
        const message = 'Current value must be positive';
        logger.error(`calculateCapitalGains: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || !propertyData.length) {
        const message = 'Property data points not provided';
        logger.error(`calculateCapitalGains: ${message}`);
        throw new Error(message);
    }

    const idx = years - 1; // cumulative appreciation index
    const yearData = propertyData[idx];
    if (!yearData) {
        const message = 'Year data not found';
        logger.error(`calculateCapitalGains: ${message}`);
        throw new Error(message);
    }

    const cumulativeAppreciationPerc = yearData.appreciation_perc;
    const futureValue = currentValue * (1 + cumulativeAppreciationPerc / 100);
    const capitalGains = futureValue - currentValue;

    return { futureValue, capitalGains };
}

/**
 * Builds datapoints to plot area appreciation percentage for each year.
 * Each point is { year: "2025"|"2026"|..., appreciation_perc: appreciation percentage expected at end of year }.
 * For the current year (2025), uses yearData[0] appreciation_perc.
 * For subsequent years, uses the cumulative appreciation percentage from property data.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - Number of years to include (>=1)
 * @returns Array of { year, appreciation_perc } where year is string like "2025" and appreciation_perc is percentage
 */
export function calculateAppreciationDataPoints(
    propertyData: PropertyDataPoint[]
): { year: string; appreciation_perc: number }[] {
    if (!propertyData || !propertyData.length) {
        const message = 'Property data points not provided';
        logger.error(`calculateAppreciationDataPoints: ${message}`);
        throw new Error(message);
    }

    const currentYear = new Date().getFullYear();
    const datapoints: { year: string; appreciation_perc: number }[] = [];

    for (let i = 0; i < propertyData.length; i++) {
        const yearData = propertyData[i];
        if (!yearData) {
            const message = `Year data not found for year ${i}`;
            logger.error(`calculateAppreciationDataPoints: ${message}`);
            throw new Error(message);
        }

        // Calculate the year string
        const yearString = String(currentYear + i);

        // Use the cumulative appreciation percentage from property data
        const appreciationPercentage = yearData.appreciation_perc;

        datapoints.push({
            year: yearString,
            appreciation_perc: appreciationPercentage,
        });
    }

    return datapoints;
}

/**
 * Calculates cumulative ROI over multiple years based on investment type
 * @param propertyData - The property data from the JSON file
 * @param years - The number of years to calculate cumulative ROI for
 * @param initialInvestment - The initial investment amount in the base currency
 * @param propertySize - The property size in square feet
 * @param isSelfUse - Boolean: true for self-use, false for rental
 * @param isSelfPaid - Boolean: true for self-paid, false for mortgage
 * @param downPaymentToLoanRatio - The down payment to loan ratio (default: 0.4)
 * @param annualInterestRate - The annual interest rate (default: 0.0399)
 * @returns The cumulative ROI percentage, or null if data is not available
 */
export function calculateCumulativeROIByType(
    propertyData: PropertyDataPoint[],
    years: number,
    initialInvestment: number,
    propertySize: number,
    isSelfUse: boolean,
    isSelfPaid: boolean,
    downPaymentToLoanRatio: number = DEFFAULT_DP_RATIO,
    annualInterestRate: number = DEFFAULT_INTEREST_RATE
): number {
    if (years < 1 || years > 10) {
        const message = 'Years must be between 1 and 10';
        logger.error(`calculateCumulativeROIByType: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || propertyData.length === 0) {
        const message = 'Property data not provided';
        logger.error(`calculateCumulativeROIByType: ${message}`);
        throw new Error(message);
    }

    // For self-paid investments, the initial investment is the full amount
    // For mortgage investments, we use the down payment
    const cashInvested = isSelfPaid
        ? initialInvestment
        : initialInvestment * downPaymentToLoanRatio;
    let totalNetReturnAmount = 0;

    for (let year = 0; year < years; year++) {
        const yearData = propertyData[year];
        if (!yearData) {
            const message = 'Year data not found';
            logger.error(`calculateCumulativeROIByType: ${message}`);
            throw new Error(message);
        }

        // Calculate year-over-year appreciation
        let appreciationPercentage: number;
        if (year === 0) {
            appreciationPercentage = yearData.appreciation_perc;
        } else {
            const previousYearData = propertyData[year - 1];
            if (!previousYearData) {
                const message = 'Previous year data not found';
                logger.error(`calculateCumulativeROIByType: ${message}`);
                throw new Error(message);
            }

            appreciationPercentage =
                yearData.appreciation_perc - previousYearData.appreciation_perc;
        }

        const propertyValueIncrease =
            initialInvestment * (appreciationPercentage / 100);

        // Calculate rental income (only for rental properties)
        let annualRentalIncome = 0;
        if (!isSelfUse) {
            const rentPerSqFt = yearData.rent_per_sq_ft;
            annualRentalIncome = rentPerSqFt * propertySize * 12;
        }

        // Calculate mortgage costs (only for mortgage properties)
        let annualMortgageInterest = 0;
        if (!isSelfPaid) {
            const loanAmount = initialInvestment * (1 - downPaymentToLoanRatio);
            annualMortgageInterest = loanAmount * annualInterestRate;
        }

        // Calculate net return for this year
        const netReturn =
            propertyValueIncrease + annualRentalIncome - annualMortgageInterest;
        totalNetReturnAmount += netReturn;
    }

    // ROI is calculated on the actual cash invested
    const roi = (totalNetReturnAmount / cashInvested) * 100;
    return roi;
}

/**
 * Gets the rental price for a given year.
 *
 * @param propertyData - The property data from the JSON file
 * @param propertySize - The property size in square feet
 * @param year - The year to get the rental price for (0-9)
 * @param period - Whether to return monthly or annual rent (default: 'annual')
 * @returns The rental price for the given year, or throws error if data is not available
 */
export function getRentalPriceInYear(
    propertyData: PropertyDataPoint[],
    propertySize: number,
    year: number,
    period: 'annual' | 'monthly' = 'annual'
): number {
    if (year < 0 || year > 9) {
        const message = 'Year must be between 0 and 9';
        logger.error(`getRentalPriceInYear: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || !propertyData.length) {
        const message = 'Property type not found';
        logger.error(`getRentalPriceInYear: ${message}`);
        throw new Error(message);
    }

    const monthlyRent = propertyData[year].rent_per_sq_ft * propertySize;

    if (period === 'monthly') {
        return monthlyRent;
    }

    // Default: annual rent
    return monthlyRent * 12;
}

const DEFAULT_PROPERTY_DATA = [
    //edit
    {
        appreciation_perc: 8, // Starting at 8%
        rent_per_sq_ft: 5, // Starting at 5
    },
    {
        appreciation_perc: 16.64, // 8 + (8 * 0.08) = 16.64
        rent_per_sq_ft: 5.25, // 5 + (5 * 0.05) = 5.25
    },
    {
        appreciation_perc: 25.97, // 16.64 + (16.64 * 0.08) = 25.97
        rent_per_sq_ft: 5.51, // 5.25 + (5.25 * 0.05) = 5.51
    },
    {
        appreciation_perc: 36.05, // 25.97 + (25.97 * 0.08) = 36.05
        rent_per_sq_ft: 5.79, // 5.51 + (5.51 * 0.05) = 5.79
    },
    {
        appreciation_perc: 46.93, // 36.05 + (36.05 * 0.08) = 46.93
        rent_per_sq_ft: 6.08, // 5.79 + (5.79 * 0.05) = 6.08
    },
    {
        appreciation_perc: 58.68, // 46.93 + (46.93 * 0.08) = 58.68
        rent_per_sq_ft: 6.38, // 6.08 + (6.08 * 0.05) = 6.38
    },
    {
        appreciation_perc: 71.37, // 58.68 + (58.68 * 0.08) = 71.37
        rent_per_sq_ft: 6.7, // 6.38 + (6.38 * 0.05) = 6.70
    },
    {
        appreciation_perc: 85.08, // 71.37 + (71.37 * 0.08) = 85.08
        rent_per_sq_ft: 7.04, // 6.70 + (6.70 * 0.05) = 7.04
    },
    {
        appreciation_perc: 99.89, // 85.08 + (85.08 * 0.08) = 99.89
        rent_per_sq_ft: 7.39, // 7.04 + (7.04 * 0.05) = 7.39
    },
    {
        appreciation_perc: 115.88, // 99.89 + (99.89 * 0.08) = 115.88
        rent_per_sq_ft: 7.76, // 7.39 + (7.39 * 0.05) = 7.76
    },
];

/**
 * Gets property data for a given location, property type, and years.
 *
 * @param propertiesData - The merged properties data from the JSON file
 * @param location - The specific location/area name
 * @param propertyType - The property type (e.g., "Flat", "Villa")
 * @returns Property data points for the given location, property type, and years
 */
export function getPropertyData(
    propertiesData: MergedPropertyData,
    location: string,
    propertyType: string,
    defaultPropertyData: PropertyDataPoint[] = DEFAULT_PROPERTY_DATA
): PropertyDataPoint[] {
    try {
        if (!propertiesData) {
            throw new Error('Property data not provided');
        }

        const locationData = propertiesData[location];
        if (!locationData) {
            throw new Error('Location not found for ' + location);
        }

        const propertyData = locationData[propertyType];
        if (!propertyData || propertyData.length === 0) {
            throw new Error('Property type not found');
        }

        return propertyData;
    } catch (error) {
        logger.warn(
            (error as Error).message + ', returning default property data'
        );

        return defaultPropertyData;
    }
}

/**
 * Builds datapoints to plot cumulative ROI (amount) for years based on investment type.
 * Each point is { year: "2025"|"2026"|"2027", roi: cumulative rental income accrued till that year }.
 * ROI is calculated as the total rental income accumulated from year 0 to the specified year.
 * For rental properties, this includes rent per sq ft * property size * 12 months * years.
 * For self-use properties, ROI will be 0 as no rental income is generated.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - The initial investment amount for ROI calculation base
 * @param propertySize - Property size in square feet
 * @param roiMultiplier - The roi multiplier (Default: 1)
 * @returns Array of { year, roi } for years with cumulative rental income as ROI
 */
export function calculateRoiDataPointsByType(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    propertySize: number,
    roiMultiplier: number = 1
): { year: string; roi: number }[] {
    if (!propertyData || !propertyData.length) {
        const message = 'Property data not provided';
        logger.error(`calculateRoiDataPointsByType: ${message}`);
        throw new Error(message);
    }

    if (initialInvestment <= 0) {
        const message = 'Initial investment must be positive';
        logger.error(`calculateRoiDataPointsByType: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateRoiDataPointsByType: ${message}`);
        throw new Error(message);
    }

    const yearlyRentalIncome: number[] = [];
    for (let i = 0; i < propertyData.length; i++) {
        const yearData = propertyData[i];
        if (!yearData) {
            const message = `Year data not found for year ${i}`;
            logger.error(`calculateRoiDataPointsByType: ${message}`);
            throw new Error(message);
        }

        // Calculate annual rental income for this year
        const annualRentalIncome = yearData.rent_per_sq_ft * propertySize * 12;
        const shortTermRentalIncome = calculateShortTermRental(
            initialInvestment,
            annualRentalIncome,
            roiMultiplier
        ).rent;

        // Calculate cumulative rental income till this year
        const cumulativeRentTillPrevYear =
            i === 0 ? 0 : yearlyRentalIncome[i - 1];

        const avgRentalIncomeThisYear =
            (annualRentalIncome + shortTermRentalIncome) / 2;

        // Summing up the average of short term and long term rental income
        yearlyRentalIncome.push(
            cumulativeRentTillPrevYear + avgRentalIncomeThisYear
        );
    }

    const datapoints = yearlyRentalIncome.map((roi, ind) => ({
        year: String(
            ind === 0
                ? new Date().getFullYear()
                : new Date().getFullYear() + ind
        ),
        roi,
    }));

    return datapoints;
}

export function getListingAppreciationInYear(
    propertyData: PropertyDataPoint[],
    listingPrice: number,
    year: number
): number {
    if (year === 0) {
        return 0;
    }

    if (year > 10) {
        const message = 'Year must be between 1 and 10';
        logger.error(`getListingAppreciationInYear: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || !propertyData.length) {
        const message = 'Property data not provided';
        logger.error(`getListingAppreciationInYear: ${message}`);
        throw new Error(message);
    }

    return listingPrice * (propertyData[year - 1].appreciation_perc / 100);
}

/**
 * Calculates the break-even period (in years) for a property investment based on listing price
 * and rental income accumulated over time. The break-even occurs when total rental income
 * equals the initial investment (listing price).
 *
 * @param propertyData - The property data from the JSON file
 * @param listingPrice - The initial investment amount (listing price of the property)
 * @param propertySize - The property size in square feet
 * @param roiMultiplier - Multiplier to apply to the roi (default: 1.0, use 1.6 for 60% increase)
 * @returns The break-even period in years (1-10), or 11 if not breaking even within available data
 */
export function calculateListingRentalBreakEvenPeriod(
    propertyData: PropertyDataPoint[],
    listingPrice: number,
    propertySize: number,
    roiMultiplier: number = 1
): number {
    if (listingPrice <= 0) {
        const message = 'Listing price must be positive';
        logger.error(`calculateListingRentalBreakEvenPeriod: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateListingRentalBreakEvenPeriod: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || !propertyData.length) {
        const message = 'Property data points not provided';
        logger.error(`calculateListingRentalBreakEvenPeriod: ${message}`);
        throw new Error(message);
    }

    let cumulativeRentalIncome = 0;

    for (let year = 0; year < propertyData.length; year++) {
        const yearData = propertyData[year];
        if (!yearData) {
            const message = 'Year data not found';
            logger.error(`calculateListingRentalBreakEvenPeriod: ${message}`);
            throw new Error(message);
        }

        // Calculate annual rental income for this year
        const rentPerSqFt = yearData.rent_per_sq_ft;

        let annualRentalIncome = rentPerSqFt * propertySize * 12;

        if (roiMultiplier !== 1) {
            annualRentalIncome = calculateShortTermRental(
                listingPrice,
                annualRentalIncome,
                roiMultiplier
            ).rent;
        }

        cumulativeRentalIncome += annualRentalIncome;

        // Check if cumulative rental income has reached the initial investment
        if (cumulativeRentalIncome >= listingPrice) {
            return year + 1; // convert 0-based index to 1-based years
        }
    }

    // If not breaking even within available data horizon, return 11
    logger.warn(
        'Not breaking even within available data horizon, returning 11'
    );
    return 11;
}

/**
 * Calculates the price of the property at handover.
 *
 * @param listingPrice - The initial investment amount (listing price of the property)
 * @param handoverYear - The year of handover
 * @param percIncreaseTillHandover - The percentage increase till handover (default: 10)
 * @returns The price of the property at handover
 */
export function calculateHandoverPrice(
    listingPrice: number,
    handoverYear: number,
    percIncreaseTillHandover: number = 10
): number {
    let value = listingPrice;
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i < handoverYear; i++) {
        if (i === handoverYear - 1) {
            value = value + value * (20 / 100);
        } else {
            value = value + value * (percIncreaseTillHandover / 100);
        }
    }

    return value;
}

/**
 * Calculates the price of the property after handover.
 *
 * @param propertyData - The property data from the JSON file
 * @param listingPriceAtHandover - The initial investment amount (listing price of the property at handover)
 * @param handoverYear - The year of handover
 * @param yearsAfterHandover - The number of years after handover (default: 5)
 * @returns The price of the property after handover
 */
export function calculatePriceAfterHandover(
    propertyData: PropertyDataPoint[],
    listingPriceAtHandover: number,
    handoverYear: number,
    yearsAfterHandover: number = 5
): number {
    const currentIndex = handoverYear - new Date().getFullYear();
    const yearDataAtHandover = propertyData[currentIndex];
    const percIncAfterHandover =
        propertyData[currentIndex + yearsAfterHandover].appreciation_perc -
        yearDataAtHandover.appreciation_perc;

    return (
        listingPriceAtHandover +
        listingPriceAtHandover * (percIncAfterHandover / 100)
    );
}

/**
 * Calculates the break-even period (in years) for a property investment after handover.
 * The break-even occurs when the cumulative rental income equals the listing price.
 *
 * @param propertyData - The property data from the JSON file
 * @param listingPrice - The initial investment amount (listing price of the property)
 * @param propertySize - The property size in square feet
 * @param handoverYear - The year of handover
 * @param roiMultiplier - Multiplier to apply to the roi (default: 1.0, use 1.6 for 60% increase)
 * @returns The break-even period in years
 */
export function calculateBreakEvenAfterHandover(
    propertyData: PropertyDataPoint[],
    listingPrice: number,
    propertySize: number,
    handoverYear: number,
    roiMultiplier: number = 1
): number {
    if (listingPrice <= 0) {
        const message = 'Listing price must be positive';
        logger.error(`calculateListingRentalBreakEvenPeriod: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateListingRentalBreakEvenPeriod: ${message}`);
        throw new Error(message);
    }

    if (!propertyData || !propertyData.length) {
        const message = 'Property data points not provided';
        logger.error(`calculateListingRentalBreakEvenPeriod: ${message}`);
        throw new Error(message);
    }

    const currentYear = new Date().getFullYear();
    const yearDiff = handoverYear - currentYear;

    let year = 0;
    let cumulativeRentalIncome = 0;

    while (cumulativeRentalIncome < listingPrice) {
        let rentPerSqFt = 0;

        if (yearDiff + year >= 10) {
            const baseRent = propertyData[9].rent_per_sq_ft;
            const extraYears = yearDiff + year - 10;

            // 5% increase compounded for every extra year
            rentPerSqFt = baseRent * Math.pow(1.05, extraYears);
        } else {
            rentPerSqFt = propertyData[yearDiff + year].rent_per_sq_ft;
        }

        // Calculate annual rental income for this year
        let annualRentalIncome = rentPerSqFt * propertySize * 12;

        if (roiMultiplier !== 1) {
            annualRentalIncome = calculateShortTermRental(
                listingPrice,
                annualRentalIncome,
                roiMultiplier
            ).rent;
        }

        cumulativeRentalIncome += annualRentalIncome;

        year++;
    }

    return year;
}

/**
 * Calculates the average annual ROI percentage over a given number of years after handover.
 * ROI is calculated as rental yield using the average of short-term and long-term rents.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - The number of years to average over (>=1)
 * @param initialInvestment - The initial investment amount in the base currency
 * @param propertySize - The property size in square feet
 * @param roiMultiplier - The multiplier to apply to the rent (default: 1)
 * @returns The average ROI percentage per year based on rental yield
 */
export function calculateAverageROIAfterHandover(
    propertyData: PropertyDataPoint[],
    handoverYear: number,
    years: number,
    initialInvestment: number,
    propertySize: number,
    roiMultiplier: number = 1
): number {
    if (!propertyData || propertyData.length === 0) {
        const message = 'Property data not provided';
        logger.error(`calculateAverageROI: ${message}`);
        throw new Error(message);
    }

    if (initialInvestment <= 0) {
        const message = 'Initial investment must be positive';
        logger.error(`calculateAverageROI: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateAverageROI: ${message}`);
        throw new Error(message);
    }

    const currentYear = new Date().getFullYear();
    const yearDiff = handoverYear - currentYear;

    let totalRentalYield = 0;

    for (let year = yearDiff; year < yearDiff + years; year++) {
        let rentPerSqFt = 0;

        if (yearDiff + year >= 10) {
            const baseRent = propertyData[9].rent_per_sq_ft;
            const extraYears = yearDiff + year - 10;

            // 5% increase compounded for every extra year
            rentPerSqFt = baseRent * Math.pow(1.05, extraYears);
        } else {
            rentPerSqFt = propertyData[yearDiff + year].rent_per_sq_ft;
        }

        // Calculate long-term rental income (standard rate)
        const longTermAnnualIncome = rentPerSqFt * propertySize * 12;

        // Calculate short-term rental income (with roi multiplier)
        const shortTermAnnualIncome = calculateShortTermRental(
            initialInvestment,
            longTermAnnualIncome,
            roiMultiplier
        ).rent;

        // Average of short-term and long-term rental income
        const averageAnnualIncome =
            (shortTermAnnualIncome + longTermAnnualIncome) / 2;

        // Calculate rental yield as percentage of initial investment
        const rentalYield = (averageAnnualIncome / initialInvestment) * 100;
        totalRentalYield += rentalYield;
    }

    return totalRentalYield / years;
}

export function calculateAverageRentPerYearAfterHandover(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    handoverYear: number,
    years: number,
    propertySize: number,
    roiMultiplier: number = 1
) {
    if (!propertyData || propertyData.length === 0) {
        const message = 'Property data not provided';
        logger.error(`calculateAverageRentPerYear: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateAverageRentPerYear: ${message}`);
        throw new Error(message);
    }

    const currentYear = new Date().getFullYear();
    const yearDiff = handoverYear - currentYear;

    let totalAnnualRent = 0;

    for (let year = yearDiff; year < yearDiff + years; year++) {
        let rentPerSqFt = 0;

        if (yearDiff + year >= 10) {
            const baseRent = propertyData[9].rent_per_sq_ft;
            const extraYears = yearDiff + year - 10;

            // 5% increase compounded for every extra year
            rentPerSqFt = baseRent * Math.pow(1.05, extraYears);
        } else {
            rentPerSqFt = propertyData[yearDiff + year].rent_per_sq_ft;
        }

        // Calculate long-term rental income (standard rate)
        const longTermAnnualIncome = rentPerSqFt * propertySize * 12;

        // Calculate short-term rental income (with roi multiplier)
        const shortTermAnnualIncome = calculateShortTermRental(
            initialInvestment,
            longTermAnnualIncome,
            roiMultiplier
        ).rent;

        // Average of short-term and long-term rental income
        const averageAnnualIncome =
            (shortTermAnnualIncome + longTermAnnualIncome) / 2;

        totalAnnualRent += averageAnnualIncome;
    }

    return totalAnnualRent / years;
}

/**
 * Builds datapoints to plot cumulative ROI (amount) for years based on investment type.
 * Each point is { year: 1|3|5, roi: cumulative rental income accrued till that year }.
 * ROI is calculated as the total rental income accumulated from year 0 to the specified year.
 * For rental properties, this includes rent per sq ft * property size * 12 months * years.
 * For self-use properties, ROI will be 0 as no rental income is generated.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - The initial investment amount for ROI calculation base
 * @param propertySize - Property size in square feet
 * @returns Array of { year, roi } for years with cumulative rental income as ROI
 */
export function calculateRoiDataPointsByTypeAfterHandover(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    propertySize: number,
    handoverYear: number,
    years: number,
    roiMultiplier: number = 1
): { year: string; roi: number }[] {
    if (!propertyData || !propertyData.length) {
        const message = 'Property data not provided';
        logger.error(`calculateRoiDataPointsByTypeAfterHandover: ${message}`);
        throw new Error(message);
    }

    if (initialInvestment <= 0) {
        const message = 'Initial investment must be positive';
        logger.error(`calculateRoiDataPointsByTypeAfterHandover: ${message}`);
        throw new Error(message);
    }

    if (propertySize <= 0) {
        const message = 'Property size must be positive';
        logger.error(`calculateRoiDataPointsByTypeAfterHandover: ${message}`);
        throw new Error(message);
    }

    const currentYear = new Date().getFullYear();
    const yearDiff = handoverYear - currentYear;

    const yearlyRentalIncome: number[] = [];
    for (let year = yearDiff; year < yearDiff + years; year++) {
        let rentPerSqFt = 0;

        if (yearDiff + year >= 10) {
            const baseRent = propertyData[9].rent_per_sq_ft;
            const extraYears = yearDiff + year - 10;

            // 5% increase compounded for every extra year
            rentPerSqFt = baseRent * Math.pow(1.05, extraYears);
        } else {
            rentPerSqFt = propertyData[yearDiff + year].rent_per_sq_ft;
        }

        // Calculate annual rental income for this year
        const longTermRentalIncome = rentPerSqFt * propertySize * 12;

        // Calculate short-term rental income (with roi multiplier)
        const shortTermAnnualIncome = calculateShortTermRental(
            initialInvestment,
            longTermRentalIncome,
            roiMultiplier
        ).rent;

        // Calculate cumulative rental income till this year
        const cumulativeRentTillPrevYear =
            year === yearDiff ? 0 : yearlyRentalIncome[year - yearDiff - 1];

        const avgRentalIncomeThisYear =
            (longTermRentalIncome + shortTermAnnualIncome) / 2;

        // Summing up the average of short term and long term rental income
        yearlyRentalIncome.push(
            cumulativeRentTillPrevYear + avgRentalIncomeThisYear
        );
    }

    const datapoints = yearlyRentalIncome.map((roi, ind) => ({
        year: String(
            ind === 0
                ? new Date().getFullYear() + yearDiff
                : new Date().getFullYear() + yearDiff + ind
        ),
        roi,
    }));

    return datapoints;
}

/**
 * Calculate short term rental
 * @param initialInvestment - The initial investment amount
 * @param longTermRent - The annual long term rent
 * @param shortTermRoiMultiplier - The short term roi multiplier (Default: 1.6)
 * @returns The short term rent and roi
 */
export function calculateShortTermRental(
    initialInvestment: number,
    annualLongTermRent: number,
    shortTermRoiMultiplier: number = 1.6
): { roi: number; rent: number } {
    const longTermRoi = (annualLongTermRent / initialInvestment) * 100;
    const shortTermRoi = longTermRoi * shortTermRoiMultiplier;

    const shortTermRent = (shortTermRoi / 100) * initialInvestment;

    return { roi: shortTermRoi, rent: shortTermRent };
}

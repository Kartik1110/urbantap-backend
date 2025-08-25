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
 * @returns The calculated ROI percentage, or null if data is not available
 */
export function calculatePropertyROI(
    propertyData: PropertyDataPoint[],
    year: number,
    initialInvestment: number,
    propertySize: number,
    downPaymentToLoanRatio: number = DEFFAULT_DP_RATIO,
    annualInterestRate: number = DEFFAULT_INTEREST_RATE
): number | null {
    // Validate inputs
    if (year < 0 || year > 9) {
        throw new Error('Year must be between 0 and 9');
    }

    if (initialInvestment <= 0) {
        throw new Error('Initial investment must be positive');
    }

    if (propertySize <= 0) {
        throw new Error('Property size must be positive');
    }

    if (!propertyData || !propertyData[year]) {
        throw new Error('Property data points not provided');
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
            return null; // Previous year data not available
        }

        // Calculate year-over-year appreciation
        appreciationPercentage =
            yearData.appreciation_perc - previousYearData.appreciation_perc;
    }

    const propertyValueIncrease =
        initialInvestment * (appreciationPercentage / 100);

    // Calculate rental income for the year
    const rentPerSqFt = yearData.rent_per_sq_ft;
    const annualRentalIncome = rentPerSqFt * propertySize * 12; // Assuming 12 months

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
 * Calculates cumulative ROI over multiple years including mortgage costs
 * @param propertyData - The property data from the JSON file
 * @param years - The number of years to calculate cumulative ROI for
 * @param initialInvestment - The initial investment amount in the base currency
 * @param propertySize - The property size in square feet
 * @param downPaymentToLoanRatio - The down payment to loan ratio (default: 0.4)
 * @returns The cumulative ROI percentage, or null if data is not available
 */
export function calculateCumulativeROI(
    propertyData: PropertyDataPoint[],
    years: number,
    initialInvestment: number,
    propertySize: number,
    downPaymentToLoanRatio: number = DEFFAULT_DP_RATIO
): number | null {
    if (years < 1 || years > 10) {
        throw new Error('Years must be between 1 and 10');
    }

    if (!propertyData || propertyData.length === 0) {
        throw new Error('Property data not provided');
    }

    // Use explicit net return accumulation for clarity
    const downPayment = initialInvestment * downPaymentToLoanRatio;
    let totalNetReturnAmount = 0;

    for (let year = 0; year < years; year++) {
        const yearROI = calculatePropertyROI(
            propertyData,
            year,
            initialInvestment,
            propertySize
        );

        if (yearROI === null) {
            return null; // Data not available for this year
        }

        // Convert the year's ROI percentage back to an amount, then accumulate
        totalNetReturnAmount += (yearROI / 100) * downPayment;
    }

    // Convert total net return back to a percentage on the original cash invested
    return (totalNetReturnAmount / downPayment) * 100;
}

/**
 * Calculates the average annual ROI percentage over a given number of years.
 * Arithmetic mean of yearly ROI%, where each year's ROI% is computed as
 * netReturnThisYear / downPayment.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - The number of years to average over (>=1)
 * @param initialInvestment - The initial investment amount in the base currency
 * @param propertySize - The property size in square feet
 * @param downPaymentToLoanRatio - The down payment to loan ratio (default: 0.4)
 * @param annualInterestRate - The annual interest rate (default: 0.0399)
 * @returns The average ROI percentage per year, or null if data is not available
 */
export function calculateAverageROI(
    propertyData: PropertyDataPoint[],
    years: number,
    initialInvestment: number,
    propertySize: number
): number {
    if (years < 1 || years > 10) {
        throw new Error('Years must be between 1 and 10');
    }

    if (!propertyData || propertyData.length === 0) {
        throw new Error('Property data not provided');
    }

    const cumulativeROI = calculateCumulativeROI(
        propertyData,
        years,
        initialInvestment,
        propertySize
    );

    if (!cumulativeROI) {
        throw new Error('Cumulative ROI not found');
    }

    return cumulativeROI / years;
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
        throw new Error('Years must be between 1 and 10');
    }
    if (currentValue <= 0) {
        throw new Error('Current value must be positive');
    }

    if (!propertyData || !propertyData.length) {
        throw new Error('Property data points not provided');
    }

    const idx = years - 1; // cumulative appreciation index
    const yearData = propertyData[idx];
    if (!yearData) {
        throw new Error('Year data not found');
    }

    const cumulativeAppreciationPerc = yearData.appreciation_perc;
    const futureValue = currentValue * (1 + cumulativeAppreciationPerc / 100);
    const capitalGains = futureValue - currentValue;

    return { futureValue, capitalGains };
}

/**
 * Gets all available locations from the property data
 * @param propertiesData - The merged properties data from the JSON file
 * @returns Array of available location names
 */
export function getAvailableLocations(
    propertiesData: MergedPropertyData
): string[] {
    return Object.keys(propertiesData);
}

/**
 * Gets all available property types for a specific location
 * @param propertiesData - The merged properties data from the JSON file
 * @param location - The specific location/area name
 * @returns Array of available property types, or empty array if location not found
 */
export function getAvailablePropertyTypes(
    propertiesData: MergedPropertyData,
    location: string
): string[] {
    const locationData = propertiesData[location];
    if (!locationData) {
        return [];
    }

    return Object.keys(locationData);
}

/**
 * Calculates expected rental for a given year based on rent per sq ft and property size
 * @param propertyData - The property data from the JSON file
 * @param year - The year to calculate rental for (0-9, where 0 is the current year)
 * @param propertySize - The property size in square feet
 * @param period - 'annual' (default) or 'monthly' amount to return
 * @returns The expected rental for the requested period, or null if data is not available
 */
export function calculateExpectedRental(
    propertyData: PropertyDataPoint[],
    year: number,
    propertySize: number,
    period: 'annual' | 'monthly' = 'annual'
): { today: number; long_term: number } {
    if (year < 0 || year > 9) {
        throw new Error('Year must be between 0 and 9');
    }

    if (!propertyData || propertyData.length === 0) {
        throw new Error('Property data not provided');
    }

    if (propertySize <= 0) {
        throw new Error('Property size must be positive');
    }

    if (!propertyData || !propertyData[year]) {
        throw new Error('Property data points not provided');
    }

    const yearData = propertyData[year];
    const monthlyRent = yearData.rent_per_sq_ft * propertySize;

    if (period === 'monthly') {
        return { today: monthlyRent, long_term: monthlyRent * 12 };
    }

    // Default: annual expected rental (assuming monthly rates in data)
    return { today: monthlyRent, long_term: monthlyRent * 12 };
}

/**
 * Calculates the break-even period (in years) when cumulative net returns
 * equal or exceed the initial cash invested (down payment).
 *
 * Year indexing: year 0 represents current→end of year 1 period, so a
 * returned value of 1 means break-even within the first year period.
 *
 * Net return per year = year-over-year appreciation amount
 *                     + annual rental income
 *                     - annual mortgage interest (3.99% on 60% loan)
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - Total property value today
 * @param propertySize - Property size in square feet
 * @returns The smallest integer number of years to break-even (>=1), or null if not within available data
 */
export function calculateBreakEvenPeriod(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    propertySize: number,
    downPaymentToLoanRatio: number = DEFFAULT_DP_RATIO,
    annualInterestRate: number = DEFFAULT_INTEREST_RATE
): number {
    if (initialInvestment <= 0) {
        throw new Error('Initial investment must be positive');
    }

    if (propertySize <= 0) {
        throw new Error('Property size must be positive');
    }

    if (!propertyData || !propertyData.length) {
        throw new Error('Property data points not provided');
    }

    const downPayment = initialInvestment * downPaymentToLoanRatio;
    const loanAmount = initialInvestment * (1 - downPaymentToLoanRatio);

    let cumulativeNetReturn = 0;

    for (let year = 0; year < propertyData.length; year++) {
        const yearData = propertyData[year];
        if (!yearData) {
            throw new Error('Year data not found');
        }

        // Year-over-year appreciation percentage
        let yoyAppreciationPerc: number;
        if (year === 0) {
            yoyAppreciationPerc = yearData.appreciation_perc;
        } else {
            const prev = propertyData[year - 1];
            if (!prev) {
                throw new Error('Previous year data not found');
            }
            yoyAppreciationPerc =
                yearData.appreciation_perc - prev.appreciation_perc;
        }

        const appreciationAmount =
            initialInvestment * (yoyAppreciationPerc / 100);
        const annualRent = yearData.rent_per_sq_ft * propertySize * 12;
        const annualInterest = loanAmount * annualInterestRate;

        const netReturnThisYear =
            appreciationAmount + annualRent - annualInterest;
        cumulativeNetReturn += netReturnThisYear;

        if (cumulativeNetReturn >= downPayment) {
            return year + 1; // convert 0-based index to 1-based years
        }
    }

    throw new Error('Not breaking even within available data horizon');
}

/**
 * Calculates cumulative profit per year (currency) across the available data horizon.
 * Each year's net profit = YoY appreciation + annual rent − annual mortgage interest.
 * Returns a running total array: [after year 1, after year 2, ...].
 *
 * Year indexing: year 0 = current → end of year 1 period.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - Total property value today
 * @param propertySize - Property size in square feet
 * @returns Array of cumulative profit per year, or null if data is not available
 */
export function calculateCumulativeProfitPerYear(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    propertySize: number,
    downPaymentToLoanRatio: number = DEFFAULT_DP_RATIO,
    annualInterestRate: number = DEFFAULT_INTEREST_RATE
): number[] {
    if (initialInvestment <= 0) {
        throw new Error('Initial investment must be positive');
    }

    if (propertySize <= 0) {
        throw new Error('Property size must be positive');
    }

    if (!propertyData || !propertyData.length) {
        throw new Error('Property data points not provided');
    }

    const loanAmount = initialInvestment * (1 - downPaymentToLoanRatio);
    const annualInterest = loanAmount * annualInterestRate;

    const cumulative: number[] = [];
    let runningTotal = 0;

    for (let year = 0; year < propertyData.length; year++) {
        const yearData = propertyData[year];
        if (!yearData) {
            throw new Error('Year data not found');
        }

        // Year-over-year appreciation percentage
        let yoyAppreciationPerc: number;
        if (year === 0) {
            yoyAppreciationPerc = yearData.appreciation_perc;
        } else {
            const prev = propertyData[year - 1];

            if (!prev) {
                throw new Error('Previous year data not found');
            }

            yoyAppreciationPerc =
                yearData.appreciation_perc - prev.appreciation_perc;
        }

        const appreciationAmount =
            initialInvestment * (yoyAppreciationPerc / 100);
        const annualRent = yearData.rent_per_sq_ft * propertySize * 12;
        const netProfitThisYear =
            appreciationAmount + annualRent - annualInterest;

        runningTotal += netProfitThisYear;
        cumulative.push(runningTotal);
    }

    return cumulative;
}

/**
 * Calculates monthly profit breakdown for a specific year.
 * Returns an array of 12 monthly profit values for the given year.
 *
 * Monthly profit includes:
 * - Monthly rental income (annual rent / 12)
 * - Monthly appreciation (YoY appreciation / 12)
 * - Monthly mortgage interest (annual interest / 12)
 *
 * @param propertyData - The property data from the JSON file
 * @param year - The specific year to get monthly breakdown for (0-based index)
 * @param initialInvestment - Total property value today
 * @param propertySize - Property size in square feet
 * @param downPaymentToLoanRatio - The down payment to loan ratio (default: 0.4)
 * @param annualInterestRate - The annual interest rate (default: 0.0399)
 * @returns Array of 12 monthly profit values, or null if data is not available
 */
export function calculateMonthlyProfitForYear(
    propertyData: PropertyDataPoint[],
    year: number,
    initialInvestment: number,
    propertySize: number,
    downPaymentToLoanRatio: number = DEFFAULT_DP_RATIO,
    annualInterestRate: number = DEFFAULT_INTEREST_RATE
): number {
    if (initialInvestment <= 0) {
        throw new Error('Initial investment must be positive');
    }

    if (propertySize <= 0) {
        throw new Error('Property size must be positive');
    }

    if (year < 0) {
        throw new Error('Year must be non-negative');
    }

    if (!propertyData || !propertyData.length || year >= propertyData.length) {
        throw new Error('Property data points not provided');
    }

    const yearData = propertyData[year];
    if (!yearData) {
        throw new Error('Year data not found');
    }

    // Calculate the same components as the original method
    const loanAmount = initialInvestment * (1 - downPaymentToLoanRatio);
    const monthlyInterest = (loanAmount * annualInterestRate) / 12;

    // Year-over-year appreciation percentage
    let yoyAppreciationPerc: number;
    if (year === 0) {
        yoyAppreciationPerc = yearData.appreciation_perc;
    } else {
        const prev = propertyData[year - 1];
        if (!prev) {
            throw new Error('Previous year data not found');
        }
        yoyAppreciationPerc =
            yearData.appreciation_perc - prev.appreciation_perc;
    }

    // Monthly components
    const monthlyAppreciation =
        (initialInvestment * (yoyAppreciationPerc / 100)) / 12;
    const monthlyRent = yearData.rent_per_sq_ft * propertySize;
    const monthlyNetProfit =
        monthlyAppreciation + monthlyRent - monthlyInterest;

    return monthlyNetProfit;
}

/**
 * Builds datapoints to plot cumulative ROI (amount) for years 1, 3, and 5.
 * Each point is { year: 1|3|5, roi: cumulative net return amount }.
 * Net return uses the same logic: YoY appreciation + annual rent − annual interest.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - Total property value today
 * @param propertySize - Property size in square feet
 * @returns Array of { year, roi } for years 1, 3, and 5, or null if data missing
 */
export function calculateRoiDataPoints(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    propertySize: number
): { year: number; roi: number }[] {
    if (!propertyData || !propertyData.length) {
        throw new Error('Property data not provided');
    }

    const cumulative = calculateCumulativeProfitPerYear(
        propertyData,
        initialInvestment,
        propertySize
    );

    if (!cumulative) {
        throw new Error('Cumulative ROI not found');
    }

    const datapoints: { year: number; roi: number }[] = [];

    // Always return years 1, 3, and 5
    const targetYears = [1, 3, 5];
    const targetIndices = [0, 2, 4];

    for (let i = 0; i < targetYears.length; i++) {
        const year = targetYears[i];
        const index = targetIndices[i];

        if (index < cumulative.length) {
            datapoints.push({ year, roi: cumulative[index] });
        }
    }

    return datapoints;
}

/**
 * Builds datapoints to plot cumulative appreciation percentage over years.
 * Each point is { year: 1..years, appreciation: percentage }.
 * Uses the cumulative appreciation_perc values directly from the data.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - Number of years to include (>=1)
 * @returns Array of { year, appreciation } where appreciation is percentage, or null if data missing
 */
export function calculateAppreciationDataPoints(
    propertyData: PropertyDataPoint[],
    years: number
): { year: number; appreciation_perc: number }[] {
    if (years < 1) {
        throw new Error('Years must be at least 1');
    }

    if (!propertyData || !propertyData.length) {
        throw new Error('Property data points not provided');
    }

    const limit = Math.min(years, propertyData.length);

    // Return three specific data points: today, mid-point, and final year
    const datapoints: { year: number; appreciation_perc: number }[] = [];

    // Today (year 0) - always 0% appreciation
    datapoints.push({
        year: 0,
        appreciation_perc: 0,
    });

    // Mid-point year
    const midYear = Math.ceil(limit / 2);
    if (midYear > 0) {
        const midYearData = propertyData[midYear - 1]; // Convert to 0-based index
        if (midYearData) {
            datapoints.push({
                year: midYear,
                appreciation_perc: midYearData.appreciation_perc,
            });
        }
    }

    // Final year
    const finalYearData = propertyData[limit - 1]; // Convert to 0-based index
    if (finalYearData) {
        datapoints.push({
            year: limit,
            appreciation_perc: finalYearData.appreciation_perc,
        });
    }

    return datapoints;
}

/**
 * Investment goal benefit structure with ROI calculation
 */
export interface InvestmentGoalBenefit {
    year: number;
    goal: string;
    roi: number;
}

/**
 * Retrieves investment goal benefits with ROI calculations for specific years.
 * Returns benefits for years 1, 3, 5, and 7 with calculated ROI from today.
 *
 * @param propertyData - The property data from the JSON file
 * @param isSelfUse - Boolean: true for self-use, false for rental
 * @param isSelfPaid - Boolean: true for self-paid, false for mortgage
 * @param initialInvestment - The initial investment amount in the base currency
 * @param propertySize - The property size in square feet
 * @returns Array of investment goal benefits with ROI calculations, or null if not found
 */
export function getInvestmentGoalsWithROI(
    propertyData: PropertyDataPoint[],
    isSelfUse: boolean,
    isSelfPaid: boolean,
    initialInvestment: number,
    propertySize: number
): InvestmentGoalBenefit[] {
    // Helper method to get cumulative ROI for a specific year
    const getCumulativeROI = (years: number): number => {
        return (
            calculateCumulativeROI(
                propertyData,
                years,
                initialInvestment,
                propertySize
            ) || 0
        );
    };

    if (!isSelfUse && !isSelfPaid) {
        // rental + mortgage
        return [
            {
                year: 1,
                goal: 'Rental income covers most of your mortgage, reducing out-of-pocket costs.',
                roi: getCumulativeROI(1),
            },
            {
                year: 3,
                goal: 'Accumulated rental surplus allows you to pay down a chunk of your loan principal.',
                roi: getCumulativeROI(3),
            },
            {
                year: 5,
                goal: "Tap into home equity (from both repayments & appreciation) to fund a second property's down payment.",
                roi: getCumulativeROI(5),
            },
            {
                year: 7,
                goal: 'Use combined rental profits & equity to refinance for better terms or larger investment.',
                roi: getCumulativeROI(7),
            },
        ];
    }

    if (!isSelfUse && isSelfPaid) {
        // rental + self_paid
        return [
            {
                year: 1,
                goal: 'Generate steady positive cash flow from rentals immediately.',
                roi: getCumulativeROI(1),
            },
            {
                year: 3,
                goal: 'Use accumulated rental profits to upgrade furnishings or install smart-home tech.',
                roi: getCumulativeROI(3),
            },
            {
                year: 5,
                goal: 'Leverage your built-up equity to refinance or unlock cash for a second investment.',
                roi: getCumulativeROI(5),
            },
            {
                year: 7,
                goal: 'Reinvest combined profits & equity gains into a larger renovation for even higher rental yields.',
                roi: getCumulativeROI(7),
            },
        ];
    }

    if (isSelfUse && !isSelfPaid) {
        // self_use + mortgage
        return [
            {
                year: 1,
                goal: 'Enjoy rent savings that cover part of your mortgage payment.',
                roi: getCumulativeROI(1),
            },
            {
                year: 3,
                goal: 'Property appreciation plus repayments gives you enough equity to fund a major renovation.',
                roi: getCumulativeROI(3),
            },
            {
                year: 5,
                goal: 'Refinance or tap home equity to upgrade to a larger unit or neighborhood.',
                roi: getCumulativeROI(5),
            },
            {
                year: 7,
                goal: 'Convert built-up equity into a personal vehicle loan or other lifestyle upgrade.',
                roi: getCumulativeROI(7),
            },
        ];
    }

    if (isSelfUse && isSelfPaid) {
        // self_use + self_paid
        return [
            {
                year: 1,
                goal: 'Stop renting—save on housing costs immediately while building equity.',
                roi: getCumulativeROI(1),
            },
            {
                year: 3,
                goal: 'Use rising equity to secure a home-improvement loan at favorable terms.',
                roi: getCumulativeROI(3),
            },
            {
                year: 5,
                goal: 'Reinvest profits from any occasional short-lets or equity release into a weekend getaway.',
                roi: getCumulativeROI(5),
            },
            {
                year: 7,
                goal: "Leverage your full ownership to finance your children's education or other family goals.",
                roi: getCumulativeROI(7),
            },
        ];
    }

    throw new Error('Invalid goal combination');
}

/**
 * Calculates the rental demand increase percentage from today to a specified number of years.
 * This shows how much rent will increase over the investment period.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - The investment period in years (1-10)
 * @param propertySize - The property size in square feet
 * @returns The rental demand increase percentage, or null if data is not available
 */
export function calculateRentalDemandIncrease(
    propertyData: PropertyDataPoint[],
    years: number,
    propertySize: number
): number {
    if (years < 1 || years > 10) {
        throw new Error('Years must be between 1 and 10');
    }

    if (propertySize <= 0) {
        throw new Error('Property size must be positive');
    }

    if (!propertyData || !propertyData.length) {
        throw new Error('Property type not found');
    }

    const limit = Math.min(years, propertyData.length);

    // Get today's rent (year 0)
    const todayData = propertyData[0];
    if (!todayData) {
        throw new Error('Today data not found');
    }

    const todayRent = todayData.rent_per_sq_ft * propertySize * 12;

    // Get future rent (year X)
    const futureData = propertyData[limit - 1];
    if (!futureData) {
        throw new Error('Future data not found');
    }

    const futureRent = futureData.rent_per_sq_ft * propertySize * 12;

    // Calculate and return percentage increase
    return ((futureRent - todayRent) / todayRent) * 100;
}

/**
 * Gets today's rental price for a property.
 *
 * @param propertyData - The property data from the JSON file
 * @param propertySize - The property size in square feet
 * @param period - Whether to return monthly or annual rent (default: 'annual')
 * @returns Today's rental price, or throws error if data is not available
 */
export function getCurrentRentalPrice(
    propertyData: PropertyDataPoint[],
    propertySize: number,
    period: 'annual' | 'monthly' = 'annual'
): number {
    if (propertySize <= 0) {
        throw new Error('Property size must be positive');
    }

    if (!propertyData || !propertyData.length) {
        throw new Error('Property type not found');
    }

    // Get today's data (year 0)
    const todayData = propertyData[0];
    if (!todayData) {
        throw new Error('Today data not found');
    }

    // Calculate monthly rent
    const monthlyRent = todayData.rent_per_sq_ft * propertySize;

    // Return based on period requested
    if (period === 'monthly') {
        return monthlyRent;
    }

    // Default: annual rent
    return monthlyRent * 12;
}

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
    propertyType: string
): PropertyDataPoint[] {
    if (!propertiesData) {
        throw new Error('Property data not provided');
    }

    const locationData = propertiesData[location];
    if (!locationData) {
        throw new Error('Location not found');
    }

    const propertyData = locationData[propertyType];
    if (!propertyData || propertyData.length === 0) {
        throw new Error('Property type not found');
    }

    return propertyData;
}

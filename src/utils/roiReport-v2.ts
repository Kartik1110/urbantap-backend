import logger from './logger';

// Types for the merged property data structure
export interface PropertyDataPoint {
    appreciation_perc: number;
    roi: number;
}

export interface PropertyTypeData {
    [propertyType: string]: PropertyDataPoint[];
}

export interface MergedPropertyData {
    [location: string]: PropertyTypeData;
}

export const DEFAULT_ROI_PER_YEAR = 8;
export const DEFAULT_ROI_INCREMENT_PER_YEAR = 1.1;
export const DEFAULT_INCREASE_IN_SHORT_TERM_ROI = 3.99;
export const DEFAULT_PROPERTY_APPRECIATION_PER_YEAR = 8;

/**
 * Calculates the average annual ROI percentage over a given number of years.
 * ROI is calculated as rental yield using the average of short-term and long-term rents.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - The number of years to average over (>=1)
 * @param initialInvestment - The initial investment amount in the base currency
 * @param increaseRoiBy - The increase in short term roi (Default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns The average ROI percentage per year based on rental yield
 */
export function calculateAverageROI(
    propertyData: PropertyDataPoint[],
    years: number,
    initialInvestment: number,
    increaseRoiBy: number = DEFAULT_INCREASE_IN_SHORT_TERM_ROI
): number {
    try {
        if (years < 0) {
            const message = `Years must not be negative, year: ${years}`;
            throw new Error(message);
        }

        if (!propertyData || !propertyData.length) {
            const message = 'Property data not provided';
            throw new Error(message);
        }

        if (initialInvestment <= 0) {
            const message = `Initial investment must be positive, initialInvestment: ${initialInvestment}`;
            throw new Error(message);
        }

        let avgRoiPerYear = 0;
        const initialRoi = propertyData[0].roi;

        for (let year = 0; year < years; year++) {
            const currentLongTermRoi =
                initialRoi * Math.pow(DEFAULT_ROI_INCREMENT_PER_YEAR, year);

            const currentShortTermRoi = currentLongTermRoi + increaseRoiBy;

            // Calculate average ROI per year
            avgRoiPerYear += (currentShortTermRoi + currentLongTermRoi) / 2;
        }

        return avgRoiPerYear / years;
    } catch (error) {
        logger.error(`calculateAverageROI: ${(error as Error).message}`);
        logger.error(
            `calculateAverageROI: Returning default ROI: ${DEFAULT_ROI_PER_YEAR}`
        );

        return DEFAULT_ROI_PER_YEAR; // Default ROI
    }
}

/**
 * Calculates the average annual rent per year over a given number of years.
 * Uses the average of short-term and long-term rental strategies.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - The initial investment amount in the base currency
 * @param years - The number of years to average over (>=1)
 * @param increaseRoiBy - The increase in short term roi (default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns The average annual rent per year
 */
export function calculateAverageRentPerYear(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    years: number,
    increaseRoiBy: number = DEFAULT_INCREASE_IN_SHORT_TERM_ROI
): number {
    try {
        if (initialInvestment <= 0) {
            const message = `Initial investment must be positive, initialInvestment: ${initialInvestment}`;
            throw new Error(message);
        }

        if (years < 0) {
            const message = `Years must not be negative, year: ${years}`;
            throw new Error(message);
        }

        if (!propertyData || !propertyData.length) {
            const message = 'Property data not provided';
            throw new Error(message);
        }

        const avgRoiPerYear = calculateAverageROI(
            propertyData,
            years,
            initialInvestment,
            increaseRoiBy
        );

        return (initialInvestment * avgRoiPerYear) / 100;
    } catch (error) {
        logger.error(
            `calculateAverageRentPerYear: ${(error as Error).message}`
        );

        const avgRentPerYear =
            (initialInvestment * DEFAULT_ROI_PER_YEAR) / 100 || 0;
        logger.error(
            `calculateAverageRentPerYear: Returning default rent: ${avgRentPerYear}`
        );

        return avgRentPerYear;
    }
}

/**
 * Calculates capital gains and future value after a number of years using cumulative appreciation
 * @param propertyData - The property data from the JSON file
 * @param years - Number of years ahead (1..10). Year 1 corresponds to index 0 in data
 * @param initialInvestment - initial investment amount
 * @returns Object with futureValue and capitalGains, or null if data is not available
 */
export function calculateCapitalGains(
    propertyData: PropertyDataPoint[],
    years: number,
    initialInvestment: number
): { futureValue: number; capitalGains: number } {
    try {
        if (years < 0) {
            const message = `Years must not be negative, year: ${years}`;
            throw new Error(message);
        }

        if (initialInvestment <= 0) {
            const message = `Initial investment must be positive, initialInvestment: ${initialInvestment}`;
            throw new Error(message);
        }

        if (!propertyData || !propertyData.length) {
            const message = 'Property data points not provided';
            throw new Error(message);
        }

        if (years === 0) {
            return {
                futureValue: initialInvestment,
                capitalGains: 0,
            };
        }

        const idx = years - 1; // cumulative appreciation index
        const yearData = propertyData[idx];
        let appreciationPerc;

        if (years > 10) {
            // Increment appreciation percentage by [DEFAULT_PROPERTY_APPRECIATION_PER_YEAR] for every extra year
            appreciationPerc =
                propertyData[9].appreciation_perc *
                Math.pow(
                    1 + DEFAULT_PROPERTY_APPRECIATION_PER_YEAR / 100,
                    years - 10
                );
        } else {
            appreciationPerc = yearData.appreciation_perc;
        }

        const futureValue = initialInvestment * (1 + appreciationPerc / 100);
        const capitalGains = futureValue - initialInvestment;

        return { futureValue, capitalGains };
    } catch (error) {
        logger.error(`calculateCapitalGains: ${(error as Error).message}`);
        logger.error(
            `calculateCapitalGains: Returning default capital gains: ${initialInvestment || 0}`
        );

        return {
            futureValue: initialInvestment || 0,
            capitalGains: 0,
        };
    }
}

/**
 * Builds datapoints to plot area appreciation percentage for each year.
 * Each point is { year: "2025"|"2026"|..., appreciation_perc: appreciation percentage expected at end of year }.
 * For the current year (2025), uses yearData[0] appreciation_perc.
 * For subsequent years, uses the cumulative appreciation percentage from property data.
 *
 * @param propertyData - The property data from the JSON file
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
 * Gets the rental price for a given year.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - initial investment amount
 * @param year - The year to get the rental price for (0-9)
 * @param period - Whether to return monthly or annual rent (default: 'annual')
 * @returns The rental price for the given year, or throws error if data is not available
 */
export function getRentalPriceInYear(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    year: number,
    period: 'annual' | 'monthly' = 'annual'
): number {
    try {
        if (!propertyData || !propertyData.length) {
            const message = 'Property type not found';
            logger.error(`getRentalPriceInYear: ${message}`);
            throw new Error(message);
        }

        if (year < 0) {
            const message = `Year value can not be negative, year: ${year}`;
            logger.error(`getRentalPriceInYear: ${message}`);
            throw new Error(message);
        }

        if (initialInvestment <= 0) {
            const message = `Initial investment must be positive, initialInvestment: ${initialInvestment}`;
            logger.error(`getRentalPriceInYear: ${message}`);
            throw new Error(message);
        }

        const initialRoi = propertyData[0].roi;

        const currentLongTermRoi =
            initialRoi * Math.pow(DEFAULT_ROI_INCREMENT_PER_YEAR, year);

        const currentLongTermRent =
            (currentLongTermRoi * initialInvestment) / 100;

        if (period === 'monthly') {
            return currentLongTermRent / 12;
        }

        // Default: annual rent
        return currentLongTermRent;
    } catch (error) {
        logger.error(`getRentalPriceInYear: ${(error as Error).message}`);

        const currentLongTermRent =
            (initialInvestment * DEFAULT_ROI_PER_YEAR) / 100 || 0;
        logger.error(
            `getRentalPriceInYear: Returning default rent: ${currentLongTermRent}`
        );

        return currentLongTermRent;
    }
}

const DEFAULT_PROPERTY_DATA: PropertyDataPoint[] = [
    {
        appreciation_perc: 8, // Starting at 8%
        roi: 8, // Starting at 8%
    },
    {
        appreciation_perc: 16.64, // 8 + (8 * 0.08) = 16.64
        roi: 8.8, // compounded by 10% annually
    },
    {
        appreciation_perc: 25.97, // 16.64 + (16.64 * 0.08) = 25.97
        roi: 9.68,
    },
    {
        appreciation_perc: 36.05, // 25.97 + (25.97 * 0.08) = 36.05
        roi: 10.65,
    },
    {
        appreciation_perc: 46.93, // 36.05 + (36.05 * 0.08) = 46.93
        roi: 11.71,
    },
    {
        appreciation_perc: 58.68, // 46.93 + (46.93 * 0.08) = 58.68
        roi: 12.88,
    },
    {
        appreciation_perc: 71.37, // 58.68 + (58.68 * 0.08) = 71.37
        roi: 14.17,
    },
    {
        appreciation_perc: 85.08, // 71.37 + (71.37 * 0.08) = 85.08
        roi: 15.59,
    },
    {
        appreciation_perc: 99.89, // 85.08 + (85.08 * 0.08) = 99.89
        roi: 17.15,
    },
    {
        appreciation_perc: 115.88, // 99.89 + (99.89 * 0.08) = 115.88
        roi: 18.86,
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
            throw new Error('Location not found, location: ' + location);
        }

        const propertyData = locationData[propertyType];
        if (!propertyData || !propertyData.length) {
            throw new Error(
                'Property type not found, property_type: ' + propertyType
            );
        }

        return propertyData;
    } catch (error) {
        logger.error(`getPropertyData: ${(error as Error).message}`);
        logger.error(
            `getPropertyData: Returning default property data for locality: ${location} and property_type: ${propertyType}`
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
 * @param increaseRoiBy - The increase in short term roi (Default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns Array of { year, roi } for years with cumulative rental income as ROI
 */
export function calculateRoiDataPointsByType(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    increaseRoiBy: number = DEFAULT_INCREASE_IN_SHORT_TERM_ROI
): { year: string; roi: number }[] {
    try {
        if (!propertyData || !propertyData.length) {
            const message = 'Property data not provided';
            throw new Error(message);
        }

        if (initialInvestment <= 0) {
            const message =
                'Initial investment must be positive, initialInvestment: ' +
                initialInvestment;
            throw new Error(message);
        }

        const yearlyRentalIncome: number[] = [];
        for (let i = 0; i < propertyData.length; i++) {
            const yearData = propertyData[i];
            if (!yearData) {
                const message = `No data found for year ${i}`;
                throw new Error(message);
            }

            const currentLongTermRoi = yearData.roi;
            // Calculate annual rental income for this year
            const annualRentalIncome =
                (currentLongTermRoi * initialInvestment) / 100;

            const shortTermRoi = currentLongTermRoi + increaseRoiBy;
            const shortTermRentalIncome =
                (shortTermRoi * initialInvestment) / 100;

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
    } catch (error) {
        logger.error(
            `calculateRoiDataPointsByType: ${(error as Error).message}`
        );

        const defaultRoi = (DEFAULT_ROI_PER_YEAR * initialInvestment) / 100;
        logger.error(
            `calculateRoiDataPointsByType: Returning default ROI: ${defaultRoi}`
        );

        return [
            {
                year: String(new Date().getFullYear()),
                roi: defaultRoi,
            },
        ];
    }
}

export function getListingAppreciationInYear(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    year: number
): number {
    try {
        if (year === 0) {
            return 0;
        }

        if (year > 10) {
            const message = 'Year must be between 1 and 10, year: ' + year;
            throw new Error(message);
        }

        if (!propertyData || !propertyData.length) {
            const message = 'Property data not provided';
            throw new Error(message);
        }

        return (
            initialInvestment * (propertyData[year - 1].appreciation_perc / 100)
        );
    } catch (error) {
        logger.error(
            `getListingAppreciationInYear: ${(error as Error).message}`
        );
        logger.error(`getListingAppreciationInYear: Returning 0`);

        return 0;
    }
}

/**
 * Calculates the break-even period (in years) for a property investment based on listing price
 * and rental income accumulated over time. The break-even occurs when total rental income
 * equals the initial investment (listing price).
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - The initial investment amount (listing price of the property)
 * @param increaseRoiBy - Increase in short term roi (default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns The break-even period in years (1-10), or 11 if not breaking even within available data
 */
export function calculateListingRentalBreakEvenPeriod(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    increaseRoiBy: number = 1
): number {
    try {
        if (initialInvestment <= 0) {
            const message =
                'Initial investment must be positive, initialInvestment: ' +
                initialInvestment;
            throw new Error(message);
        }

        if (!propertyData || !propertyData.length) {
            const message = 'Property data points not provided';
            throw new Error(message);
        }

        let cumulativeRentalIncome = 0;

        for (let year = 0; year < propertyData.length; year++) {
            const yearData = propertyData[year];
            if (!yearData) {
                const message = 'Year data not found, year: ' + year;
                throw new Error(message);
            }

            // Calculate annual rental income for this year
            const currentLongTermRoi = yearData.roi;

            let annualRentalIncome =
                (currentLongTermRoi * initialInvestment) / 100;

            if (increaseRoiBy !== 1) {
                annualRentalIncome = calculateShortTermRental(
                    initialInvestment,
                    currentLongTermRoi,
                    increaseRoiBy
                ).rent;
            }

            cumulativeRentalIncome += annualRentalIncome;

            // Check if cumulative rental income has reached the initial investment
            if (cumulativeRentalIncome >= initialInvestment) {
                return year + 1; // convert 0-based index to 1-based years
            }
        }

        throw new Error(
            'Not breaking even within available data horizon, returning 11'
        );
    } catch (error) {
        logger.error(
            `calculateListingRentalBreakEvenPeriod: ${(error as Error).message}`
        );
        logger.error(`calculateListingRentalBreakEvenPeriod: Returning 11`);

        return 11;
    }
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
 * @param initialInvestment - The initial investment amount (listing price of the property)
 * @param handoverYear - The year of handover
 * @param increaseRoiBy - Increase in short term roi (default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns The break-even period in years
 */
export function calculateBreakEvenAfterHandover(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    handoverYear: number,
    increaseRoiBy: number = 1
): number {
    try {
        if (initialInvestment <= 0) {
            const message =
                'Initial investment must be positive, initialInvestment: ' +
                initialInvestment;
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

        while (cumulativeRentalIncome < initialInvestment) {
            let currentTermRoi = propertyData[year].roi;
            if (yearDiff + year >= 10) {
                currentTermRoi =
                    propertyData[9].roi *
                    Math.pow(
                        DEFAULT_ROI_INCREMENT_PER_YEAR,
                        yearDiff + year - 10
                    );
            }

            // Apply increase in short term roi
            if (increaseRoiBy !== 1) {
                currentTermRoi += increaseRoiBy;
            }

            const annualRentalIncome =
                (currentTermRoi * initialInvestment) / 100;

            cumulativeRentalIncome += annualRentalIncome;
            year++;
        }

        return year;
    } catch (error) {
        logger.error(
            `calculateBreakEvenAfterHandover: ${(error as Error).message}`
        );

        return 11;
    }
}

/**
 * Calculates the average annual ROI percentage over a given number of years after handover.
 * ROI is calculated as rental yield using the average of short-term and long-term rents.
 *
 * @param propertyData - The property data from the JSON file
 * @param years - The number of years to average over (>=1)
 * @param initialInvestment - The initial investment amount in the base currency
 * @param increaseRoiBy - The increase in short term roi (default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns The average ROI percentage per year based on rental yield
 */
export function calculateAverageROIAfterHandover(
    propertyData: PropertyDataPoint[],
    handoverYear: number,
    years: number,
    initialInvestment: number,
    increaseRoiBy: number = DEFAULT_INCREASE_IN_SHORT_TERM_ROI
): number {
    try {
        if (!propertyData || propertyData.length === 0) {
            const message = 'Property data not provided';
            logger.error(`calculateAverageROI: ${message}`);
            throw new Error(message);
        }

        if (initialInvestment <= 0) {
            const message =
                'Initial investment must be positive, initialInvestment: ' +
                initialInvestment;
            throw new Error(message);
        }

        const currentYear = new Date().getFullYear();
        const yearDiff = handoverYear - currentYear;

        let avgRoiPerYear = 0;
        for (let year = yearDiff; year < yearDiff + years; year++) {
            let currentLongTermRoi = propertyData[yearDiff].roi;
            if (yearDiff + years >= 10) {
                currentLongTermRoi =
                    propertyData[9].roi *
                    Math.pow(
                        DEFAULT_ROI_INCREMENT_PER_YEAR,
                        yearDiff + years - 10
                    );
            }

            const currentShortTermRoi = currentLongTermRoi + increaseRoiBy;

            avgRoiPerYear += (currentShortTermRoi + currentLongTermRoi) / 2;
        }

        return avgRoiPerYear / years;
    } catch (error) {
        logger.error(
            `calculateAverageROIAfterHandover: ${(error as Error).message}`
        );
        logger.error(
            `calculateAverageROIAfterHandover: Returning: ${DEFAULT_ROI_PER_YEAR}`
        );

        return DEFAULT_ROI_PER_YEAR;
    }
}

/**
 * Calculates the average annual rent per year over a given number of years after handover.
 * Uses the average of short-term and long-term rental strategies.
 *
 * @param propertyData - The property data from the JSON file
 * @param initialInvestment - The initial investment amount in the base currency
 * @param handoverYear - The year of handover
 * @param years - The number of years to average over (>=1)
 * @param increaseRoiBy - The increase in short term roi (default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns The average annual rent per year based on rental yield
 */
export function calculateAverageRentPerYearAfterHandover(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    handoverYear: number,
    years: number,
    increaseRoiBy: number = DEFAULT_INCREASE_IN_SHORT_TERM_ROI
) {
    try {
        if (!propertyData || !propertyData.length) {
            const message = 'Property data not provided';
            throw new Error(message);
        }

        if (years < 0) {
            const message = 'Years must not be negative, years: ' + years;
            throw new Error(message);
        }

        if (initialInvestment <= 0) {
            const message =
                'Initial investment must be positive, initialInvestment: ' +
                initialInvestment;
            throw new Error(message);
        }

        const avgRoiPerYearAfterHandover = calculateAverageROIAfterHandover(
            propertyData,
            handoverYear,
            years,
            initialInvestment,
            increaseRoiBy
        );

        const avgRentPerYearAfterHandover =
            (avgRoiPerYearAfterHandover * initialInvestment) / 100;

        return avgRentPerYearAfterHandover;
    } catch (error) {
        logger.error(
            `calculateAverageRentPerYearAfterHandover: ${(error as Error).message}`
        );

        const defaultRentPerYearAfterHandover =
            (initialInvestment * DEFAULT_ROI_PER_YEAR) / 100 || 0;
        logger.error(
            `calculateAverageRentPerYearAfterHandover: Returning: ${defaultRentPerYearAfterHandover}`
        );

        return defaultRentPerYearAfterHandover;
    }
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
 * @param handoverYear - The year of handover
 * @param years - The number of years to average over (>=1)
 * @param increaseRoiBy - The increase in short term roi (Default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns Array of { year, roi } for years with cumulative rental income as ROI
 */
export function calculateRoiDataPointsByTypeAfterHandover(
    propertyData: PropertyDataPoint[],
    initialInvestment: number,
    handoverYear: number,
    years: number,
    increaseRoiBy: number = DEFAULT_INCREASE_IN_SHORT_TERM_ROI
): { year: string; roi: number }[] {
    try {
        if (!propertyData || !propertyData.length) {
            const message = 'Property data not provided';
            throw new Error(message);
        }

        if (initialInvestment <= 0) {
            const message = 'Initial investment must be positive';
            throw new Error(message);
        }

        const currentYear = new Date().getFullYear();
        const yearDiff = handoverYear - currentYear;

        const yearlyRentalIncome: number[] = [];
        for (let year = yearDiff; year < yearDiff + years; year++) {
            let currentLongTermRoi = propertyData[year].roi;
            if (yearDiff + year >= 10) {
                currentLongTermRoi =
                    propertyData[9].roi *
                    Math.pow(
                        DEFAULT_ROI_INCREMENT_PER_YEAR,
                        yearDiff + year - 10
                    );
            }
            // Calculate annual rental income for this year
            const longTermRentalIncome =
                (currentLongTermRoi * initialInvestment) / 100;

            // Calculate short-term rental income
            const shortTermAnnualIncome = calculateShortTermRental(
                initialInvestment,
                currentLongTermRoi,
                increaseRoiBy
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
    } catch (error) {
        logger.error(
            `calculateRoiDataPointsByTypeAfterHandover: ${(error as Error).message}`
        );

        const defaultRoi =
            (initialInvestment * DEFAULT_ROI_PER_YEAR) / 100 || 0;
        logger.error(
            `calculateRoiDataPointsByTypeAfterHandover: Returning: ${defaultRoi}`
        );

        return [
            {
                year: String(new Date().getFullYear()),
                roi: defaultRoi,
            },
        ];
    }
}

/**
 * Calculate short term rental
 * @param initialInvestment - The initial investment amount
 * @param longTermRoi - The annual long term roi
 * @param incrementRoi - The short term roi increment (Default: DEFAULT_INCREASE_IN_SHORT_TERM_ROI)
 * @returns The short term rent and roi
 */
export function calculateShortTermRental(
    initialInvestment: number,
    longTermRoi: number,
    incrementRoi: number = DEFAULT_INCREASE_IN_SHORT_TERM_ROI
): { roi: number; rent: number } {
    const shortTermRoi = longTermRoi + incrementRoi;
    const shortTermRent = (shortTermRoi * initialInvestment) / 100;

    return { roi: shortTermRoi, rent: shortTermRent };
}

/**
 * Get the long term roi percentage for a given year
 * @param propertyData - The property data from the JSON file
 * @param year - The year to get the long term roi percentage for
 * @returns The long term roi percentage for the given year
 */
export function getLongTermRoiPercentage(
    propertyData: PropertyDataPoint[],
    year: number
): number {
    try {
        if (year < 0) {
            const message = 'Year must not be negative, year: ' + year;
            throw new Error(message);
        }

        if (!propertyData || !propertyData.length) {
            const message = 'Property data not provided';
            throw new Error(message);
        }

        const initialRoi = propertyData[0].roi;
        const longTermRoi =
            initialRoi * Math.pow(DEFAULT_ROI_INCREMENT_PER_YEAR, year);

        return longTermRoi;
    } catch (error) {
        logger.error(`getLongTermRoiPercentage: ${(error as Error).message}`);
        logger.error(
            `getLongTermRoiPercentage: Returning ${DEFAULT_ROI_PER_YEAR}`
        );

        return DEFAULT_ROI_PER_YEAR;
    }
}

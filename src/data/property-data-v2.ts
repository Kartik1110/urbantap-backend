const propertyData: {
    [key: string]: {
        [key: string]: {
            appreciation_perc: number;
            rent_per_sq_ft: number;
        }[];
    };
} = {
    'Al Barsha 1': {
        Apartment: [
            {
                appreciation_perc: 11.69,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 23.38,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 30.07,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 46.76,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 60.26,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 63.76,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 87.26,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 100.76,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 99.26,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 119.57,
                rent_per_sq_ft: 19.98,
            },
        ],
    },
    'Al Barsha South': {
        Apartment: [
            {
                appreciation_perc: 3.31,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 6.61,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 4.91,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 13.21,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 19.32,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 25.43,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 31.54,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 37.65,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 28.76,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 38.67,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Jumeirah Village Circle': {
        Apartment: [
            {
                appreciation_perc: 4.84,
                rent_per_sq_ft: 8.5,
            },
            {
                appreciation_perc: 9.67,
                rent_per_sq_ft: 9.18,
            },
            {
                appreciation_perc: 9.5,
                rent_per_sq_ft: 9.91,
            },
            {
                appreciation_perc: 19.33,
                rent_per_sq_ft: 10.7,
            },
            {
                appreciation_perc: 26.48,
                rent_per_sq_ft: 11.56,
            },
            {
                appreciation_perc: 33.63,
                rent_per_sq_ft: 12.48,
            },
            {
                appreciation_perc: 40.78,
                rent_per_sq_ft: 13.48,
            },
            {
                appreciation_perc: 47.93,
                rent_per_sq_ft: 14.56,
            },
            {
                appreciation_perc: 40.08,
                rent_per_sq_ft: 15.72,
            },
            {
                appreciation_perc: 58.67,
                rent_per_sq_ft: 16.98,
            },
        ],
        Villa: [
            {
                appreciation_perc: 5.53,
                rent_per_sq_ft: 8.5,
            },
            {
                appreciation_perc: 11.05,
                rent_per_sq_ft: 9.18,
            },
            {
                appreciation_perc: 11.58,
                rent_per_sq_ft: 9.91,
            },
            {
                appreciation_perc: 22.1,
                rent_per_sq_ft: 10.7,
            },
            {
                appreciation_perc: 27.61,
                rent_per_sq_ft: 11.56,
            },
            {
                appreciation_perc: 33.12,
                rent_per_sq_ft: 12.48,
            },
            {
                appreciation_perc: 38.63,
                rent_per_sq_ft: 13.48,
            },
            {
                appreciation_perc: 44.14,
                rent_per_sq_ft: 14.56,
            },
            {
                appreciation_perc: 34.65,
                rent_per_sq_ft: 15.72,
            },
            {
                appreciation_perc: 54.16,
                rent_per_sq_ft: 16.98,
            },
        ],
    },
    'Al Quoz 1': {
        Apartment: [
            {
                appreciation_perc: 3.47,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 6.93,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 5.4,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 13.87,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 19.72,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 25.57,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 31.42,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 37.27,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 28.12,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 42.6,
                rent_per_sq_ft: 18,
            },
        ],
        Villa: [
            {
                appreciation_perc: 12.47,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 24.94,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 32.41,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 49.88,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 57.51,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 55.14,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 72.77,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 80.4,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 73.03,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 120.58,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Golf City': {
        Apartment: [
            {
                appreciation_perc: 1.31,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 2.61,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: -1.09,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 5.21,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 6.43,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: -2.35,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 8.87,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 10.09,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: -3.69,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 16.77,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Al Jaddaf': {
        Apartment: [
            {
                appreciation_perc: 1.98,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 3.95,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 0.92,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 7.89,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 8.18,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: -1.53,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 8.76,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 9.05,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: -5.66,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 15.4,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Ras Al Khor': {
        Apartment: [
            {
                appreciation_perc: 2.12,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 4.23,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 1.34,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 8.45,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 8.62,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -1.21,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 8.96,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 9.13,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -5.7,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 15.5,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Dubai Festival City': {
        Apartment: [
            {
                appreciation_perc: 2.13,
                rent_per_sq_ft: 3.5,
            },
            {
                appreciation_perc: 4.25,
                rent_per_sq_ft: 3.78,
            },
            {
                appreciation_perc: 1.37,
                rent_per_sq_ft: 4.08,
            },
            {
                appreciation_perc: 8.49,
                rent_per_sq_ft: 4.41,
            },
            {
                appreciation_perc: 9.46,
                rent_per_sq_ft: 4.76,
            },
            {
                appreciation_perc: 0.43,
                rent_per_sq_ft: 5.14,
            },
            {
                appreciation_perc: 11.4,
                rent_per_sq_ft: 5.55,
            },
            {
                appreciation_perc: 12.37,
                rent_per_sq_ft: 6,
            },
            {
                appreciation_perc: -1.66,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 17.52,
                rent_per_sq_ft: 7,
            },
        ],
        Villa: [
            {
                appreciation_perc: 2.17,
                rent_per_sq_ft: 3.5,
            },
            {
                appreciation_perc: 4.33,
                rent_per_sq_ft: 3.78,
            },
            {
                appreciation_perc: 1.49,
                rent_per_sq_ft: 4.08,
            },
            {
                appreciation_perc: 8.65,
                rent_per_sq_ft: 4.41,
            },
            {
                appreciation_perc: 9.08,
                rent_per_sq_ft: 4.76,
            },
            {
                appreciation_perc: -0.49,
                rent_per_sq_ft: 5.14,
            },
            {
                appreciation_perc: 9.94,
                rent_per_sq_ft: 5.55,
            },
            {
                appreciation_perc: 10.37,
                rent_per_sq_ft: 6,
            },
            {
                appreciation_perc: -4.2,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 15.3,
                rent_per_sq_ft: 7,
            },
        ],
    },
    'Al Kifaf': {
        Apartment: [
            {
                appreciation_perc: 6.26,
                rent_per_sq_ft: 11,
            },
            {
                appreciation_perc: 12.51,
                rent_per_sq_ft: 11.88,
            },
            {
                appreciation_perc: 13.76,
                rent_per_sq_ft: 12.83,
            },
            {
                appreciation_perc: 25.01,
                rent_per_sq_ft: 13.86,
            },
            {
                appreciation_perc: 27.54,
                rent_per_sq_ft: 14.97,
            },
            {
                appreciation_perc: 30.07,
                rent_per_sq_ft: 16.17,
            },
            {
                appreciation_perc: 32.6,
                rent_per_sq_ft: 17.46,
            },
            {
                appreciation_perc: 35.13,
                rent_per_sq_ft: 18.86,
            },
            {
                appreciation_perc: 22.66,
                rent_per_sq_ft: 20.37,
            },
            {
                appreciation_perc: 53.06,
                rent_per_sq_ft: 22,
            },
        ],
    },
    Dubai: {
        Villa: [
            {
                appreciation_perc: 2.43,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 4.86,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 2.29,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 9.72,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 7.2,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -5.32,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 2.16,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: -0.36,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -17.88,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 15.93,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Muhaisnah 3': {
        Apartment: [
            {
                appreciation_perc: 4.42,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 8.84,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 8.26,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 17.68,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 18.25,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 18.82,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 19.39,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 19.96,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 0.53,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 34.49,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Al Sufouh': {
        Apartment: [
            {
                appreciation_perc: 2.07,
                rent_per_sq_ft: 11.5,
            },
            {
                appreciation_perc: 4.14,
                rent_per_sq_ft: 12.42,
            },
            {
                appreciation_perc: 1.21,
                rent_per_sq_ft: 13.41,
            },
            {
                appreciation_perc: 8.28,
                rent_per_sq_ft: 14.48,
            },
            {
                appreciation_perc: 7.55,
                rent_per_sq_ft: 15.64,
            },
            {
                appreciation_perc: -3.18,
                rent_per_sq_ft: 16.89,
            },
            {
                appreciation_perc: 6.09,
                rent_per_sq_ft: 18.24,
            },
            {
                appreciation_perc: 5.36,
                rent_per_sq_ft: 19.7,
            },
            {
                appreciation_perc: -10.37,
                rent_per_sq_ft: 21.28,
            },
            {
                appreciation_perc: 14.09,
                rent_per_sq_ft: 22.98,
            },
        ],
    },
    'Al Sufouh 2': {
        Apartment: [
            {
                appreciation_perc: 6.51,
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 13.01,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 14.51,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 26.01,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 31.14,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 36.27,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 41.4,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 46.53,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 36.66,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 57.02,
                rent_per_sq_ft: 24,
            },
        ],
    },
    'Al Satwa': {
        Apartment: [
            {
                appreciation_perc: 1.26,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 2.52,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: -1.22,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 5.04,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 7.65,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 0.26,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 12.87,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 15.48,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 3.09,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 15.38,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Jumeirah Lake Towers': {
        Apartment: [
            {
                appreciation_perc: 1.49,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 2.97,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: -0.55,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 5.93,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 8.64,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 1.35,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 14.06,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 16.77,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 4.48,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 16.72,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 1.31,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 2.62,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: -1.07,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 5.24,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 9.47,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 3.7,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 17.93,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 22.16,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 11.39,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 14.37,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Barsha Heights': {
        Apartment: [
            {
                appreciation_perc: 3.5,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 7,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 5.5,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 14,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 16.29,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 18.58,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 20.87,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 23.16,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 20.45,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 33.04,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 1.87,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 3.74,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 0.61,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 7.48,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 7.87,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -1.74,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 8.65,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 9.04,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -5.57,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 16.24,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Al Wasl': {
        Apartment: [
            {
                appreciation_perc: 2.24,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 4.47,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 1.7,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 8.93,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 12.81,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 16.69,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 20.57,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 24.45,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 23.33,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 25.41,
                rent_per_sq_ft: 19.98,
            },
        ],
    },
    'Nad Al Sheba 1': {
        Apartment: [
            {
                appreciation_perc: 3.14,
                rent_per_sq_ft: 6,
            },
            {
                appreciation_perc: 6.27,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 4.4,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 12.53,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 13.24,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 3.95,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 14.66,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 15.37,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 1.08,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 22.89,
                rent_per_sq_ft: 11.99,
            },
        ],
    },
    'Downtown Dubai': {
        Apartment: [
            {
                appreciation_perc: 6.1,
                rent_per_sq_ft: 13,
            },
            {
                appreciation_perc: 12.2,
                rent_per_sq_ft: 14.04,
            },
            {
                appreciation_perc: 13.3,
                rent_per_sq_ft: 15.16,
            },
            {
                appreciation_perc: 24.4,
                rent_per_sq_ft: 16.37,
            },
            {
                appreciation_perc: 35.9,
                rent_per_sq_ft: 17.68,
            },
            {
                appreciation_perc: 47.4,
                rent_per_sq_ft: 19.1,
            },
            {
                appreciation_perc: 58.9,
                rent_per_sq_ft: 20.63,
            },
            {
                appreciation_perc: 70.4,
                rent_per_sq_ft: 22.28,
            },
            {
                appreciation_perc: 66.9,
                rent_per_sq_ft: 24.06,
            },
            {
                appreciation_perc: 65.79,
                rent_per_sq_ft: 26,
            },
        ],
    },
    'Business Bay': {
        Apartment: [
            {
                appreciation_perc: 2.62,
                rent_per_sq_ft: 11,
            },
            {
                appreciation_perc: 5.24,
                rent_per_sq_ft: 11.88,
            },
            {
                appreciation_perc: 2.86,
                rent_per_sq_ft: 12.83,
            },
            {
                appreciation_perc: 10.48,
                rent_per_sq_ft: 13.86,
            },
            {
                appreciation_perc: 14.46,
                rent_per_sq_ft: 14.97,
            },
            {
                appreciation_perc: 18.44,
                rent_per_sq_ft: 16.17,
            },
            {
                appreciation_perc: 22.42,
                rent_per_sq_ft: 17.46,
            },
            {
                appreciation_perc: 26.4,
                rent_per_sq_ft: 18.86,
            },
            {
                appreciation_perc: 15.38,
                rent_per_sq_ft: 20.37,
            },
            {
                appreciation_perc: 26.98,
                rent_per_sq_ft: 22,
            },
        ],
    },
    'Green Community Village': {
        Apartment: [
            {
                appreciation_perc: 2.42,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 4.84,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 2.26,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 9.68,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 6.85,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: -5.98,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 1.19,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: -1.64,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: -19.47,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 15.48,
                rent_per_sq_ft: 19.98,
            },
        ],
        Villa: [
            {
                appreciation_perc: 12.47,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 24.93,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 32.39,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 49.85,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 61.93,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 64.01,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 86.09,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 98.17,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 95.25,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 116.35,
                rent_per_sq_ft: 19.98,
            },
        ],
    },
    'Dubai Investments Park': {
        Apartment: [
            {
                appreciation_perc: 11.01,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 22.02,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 28.03,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 44.04,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 59.57,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 65.1,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 90.63,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 106.16,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 106.69,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 117.41,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 3.62,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 7.23,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 5.84,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 14.45,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 18.55,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 22.65,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 26.75,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 30.85,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 19.95,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 37.97,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Mina Jebel Ali': {
        Apartment: [
            {
                appreciation_perc: 6.77,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 13.53,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 15.29,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 27.05,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 30.45,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 33.85,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 37.25,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 40.65,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 29.05,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 63.31,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Jabal Ali Industrial First': {
        Apartment: [
            {
                appreciation_perc: 7.17,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 14.34,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 16.51,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 28.68,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 35.5,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 42.32,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 49.14,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 55.96,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 47.78,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 66.79,
                rent_per_sq_ft: 18,
            },
        ],
        Villa: [
            {
                appreciation_perc: 5.39,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 10.78,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 11.17,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 21.56,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 29.76,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 37.96,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 46.16,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 54.36,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 47.56,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 54.38,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Jabal Ali Industrial Second': {
        Apartment: [
            {
                appreciation_perc: 11.1,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 22.2,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 28.3,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 44.4,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 59.23,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 64.06,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 88.89,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 103.72,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 103.55,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 121.44,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Jumeirah 2': {
        Apartment: [
            {
                appreciation_perc: 4.29,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 8.57,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 7.85,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 17.13,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 18.55,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 19.97,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 21.39,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 22.81,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 9.23,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 37.2,
                rent_per_sq_ft: 18,
            },
        ],
        Villa: [
            {
                appreciation_perc: 8.97,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 17.93,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 21.89,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 35.85,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 49.45,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 53.05,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 76.65,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 90.25,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 88.85,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 99.35,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Jumeirah 3': {
        Apartment: [
            {
                appreciation_perc: 10.52,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 21.04,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 26.56,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 42.08,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 47.45,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 42.82,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 58.19,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 63.56,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 53.93,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 98.52,
                rent_per_sq_ft: 19.98,
            },
        ],
    },
    'Al Sufouh 1': {
        Apartment: [
            {
                appreciation_perc: 9.3,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 18.6,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 22.9,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 37.2,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 45.83,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 44.46,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 63.09,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 71.72,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 65.35,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 90.2,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Madinat Hind 4': {
        Apartment: [
            {
                appreciation_perc: 8.32,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 16.64,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 19.96,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 33.28,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 41.46,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 39.64,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 57.82,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 66,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 59.18,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 88.57,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Dubai Marina': {
        Apartment: [
            {
                appreciation_perc: 5.58,
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 11.15,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 11.72,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 22.29,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 27.2,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 32.11,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 37.02,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 41.93,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 31.84,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 51.83,
                rent_per_sq_ft: 24,
            },
        ],
        Villa: [
            {
                appreciation_perc: 11.44,
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 22.87,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 29.3,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 45.73,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 57.79,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 59.85,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 81.91,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 93.97,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 91.03,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 118.18,
                rent_per_sq_ft: 24,
            },
        ],
    },
    'Dubai Production City': {
        Apartment: [
            {
                appreciation_perc: 11.13,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 22.26,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 28.39,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 44.52,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 59.22,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 63.92,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 88.62,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 103.32,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 103.02,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 119.71,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 1.41,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 2.82,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 0.23,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 5.64,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 7.55,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -0.54,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 11.37,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 13.28,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 0.19,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 17,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    Mirdif: {
        Apartment: [
            {
                appreciation_perc: 1.84,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 3.67,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 0.5,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 7.33,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 8.43,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -0.47,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 10.63,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 11.73,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -12.17,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 14.19,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 2.21,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 4.42,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 1.63,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 8.84,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 6.73,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -5.38,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 2.51,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 0.4,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -16.71,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 16.85,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Muhaisnah 1': {
        Apartment: [
            {
                appreciation_perc: 6.59,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 13.17,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 14.75,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 26.33,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 37.52,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 48.71,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 59.9,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 71.09,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 67.28,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 74.83,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Nadd Al Hamar': {
        Apartment: [
            {
                appreciation_perc: 4.4,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 8.8,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 8.2,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 17.6,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 22.69,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 27.78,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 32.87,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 37.96,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 28.05,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 45.05,
                rent_per_sq_ft: 19.98,
            },
        ],
    },
    'Nad Al Sheba': {
        Apartment: [
            {
                appreciation_perc: 1.18,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 2.35,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: -1.48,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 4.69,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 7.33,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 4.97,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 12.61,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 15.25,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 2.89,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 14.38,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 4.72,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 9.43,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 9.14,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 18.85,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 22.41,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 15.97,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 29.53,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 33.09,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 21.65,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 46.04,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Nad Al Sheba 2': {
        Apartment: [
            {
                appreciation_perc: 8.61,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 17.21,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 20.81,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 34.41,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 38.83,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 43.25,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 47.67,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 52.09,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 41.51,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 79.38,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 10.08,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 20.16,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 25.24,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 40.32,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 47.99,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 45.66,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 63.33,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 71,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 63.67,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 103.81,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Dubai Silicon Oasis': {
        Apartment: [
            {
                appreciation_perc: 12.01,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 24.01,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 31.01,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 48.01,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 60.99,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 63.97,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 86.95,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 99.93,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 97.91,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 119.86,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Dubai Islands': {
        Apartment: [
            {
                appreciation_perc: 1.46,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 2.91,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: -0.64,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 5.81,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 6.9,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -2.01,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 9.08,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 10.17,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -3.74,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 16.35,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'The Palm Jumeirah': {
        Apartment: [
            {
                appreciation_perc: 9.94,
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 19.87,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 24.8,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 39.73,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 44.6,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 39.47,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 54.34,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 59.21,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 49.08,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 92.27,
                rent_per_sq_ft: 24,
            },
        ],
        Villa: [
            {
                appreciation_perc: 12.67,
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 25.33,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 32.99,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 50.65,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 58.77,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 56.89,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 75.01,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 83.13,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 76.25,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 123.18,
                rent_per_sq_ft: 24,
            },
        ],
    },
    'Ras Al Khor Industrial Area 1': {
        Apartment: [
            {
                appreciation_perc: 1.67,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 3.33,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 0.99,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 6.65,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 10.62,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 24.59,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 18.56,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 22.53,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 21.5,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 20.37,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    Deira: {
        Apartment: [
            {
                appreciation_perc: 9.51,
                rent_per_sq_ft: 7.25,
            },
            {
                appreciation_perc: 19.01,
                rent_per_sq_ft: 7.83,
            },
            {
                appreciation_perc: 23.51,
                rent_per_sq_ft: 8.46,
            },
            {
                appreciation_perc: 38.01,
                rent_per_sq_ft: 9.14,
            },
            {
                appreciation_perc: 48.25,
                rent_per_sq_ft: 9.87,
            },
            {
                appreciation_perc: 48.49,
                rent_per_sq_ft: 10.66,
            },
            {
                appreciation_perc: 68.73,
                rent_per_sq_ft: 11.51,
            },
            {
                appreciation_perc: 78.97,
                rent_per_sq_ft: 12.43,
            },
            {
                appreciation_perc: 74.21,
                rent_per_sq_ft: 13.42,
            },
            {
                appreciation_perc: 96.43,
                rent_per_sq_ft: 14.5,
            },
        ],
    },
    'Saih Shuaib 2': {
        Apartment: [
            {
                appreciation_perc: 12.33,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 24.66,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 31.99,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 49.32,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 59.94,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 60.56,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 81.18,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 91.8,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 87.42,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 121.44,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 11.07,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 22.13,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 28.19,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 44.25,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 58.48,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 62.71,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 86.94,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 101.17,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 100.4,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 123.2,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Umm Suqeim 3': {
        Apartment: [
            {
                appreciation_perc: 2.25,
                rent_per_sq_ft: 16,
            },
            {
                appreciation_perc: 4.5,
                rent_per_sq_ft: 17.28,
            },
            {
                appreciation_perc: 1.75,
                rent_per_sq_ft: 18.66,
            },
            {
                appreciation_perc: 9,
                rent_per_sq_ft: 20.15,
            },
            {
                appreciation_perc: 7.75,
                rent_per_sq_ft: 21.76,
            },
            {
                appreciation_perc: -3.5,
                rent_per_sq_ft: 23.5,
            },
            {
                appreciation_perc: 5.25,
                rent_per_sq_ft: 25.38,
            },
            {
                appreciation_perc: 4,
                rent_per_sq_ft: 27.41,
            },
            {
                appreciation_perc: -12.25,
                rent_per_sq_ft: 29.6,
            },
            {
                appreciation_perc: 14.55,
                rent_per_sq_ft: 31.97,
            },
        ],
    },
    Liwan: {
        Apartment: [
            {
                appreciation_perc: 12.66,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 25.31,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 32.96,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 50.61,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 61.71,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 62.81,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 83.91,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 95.01,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 91.11,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 119.42,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 2.33,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 4.65,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 1.97,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 9.29,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 8.85,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -1.59,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 7.97,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 7.53,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -7.91,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 16.72,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'City of Arabia': {
        Apartment: [
            {
                appreciation_perc: 12.94,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 25.87,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 33.8,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 51.73,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 57.98,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 54.23,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 70.48,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 76.73,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 67.98,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 119.03,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 7.39,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 14.78,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 17.17,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 29.56,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 38.15,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 36.74,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 55.33,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 63.92,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 57.51,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 73.51,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Wadi Al Safa 5': {
        Villa: [
            {
                appreciation_perc: 5.16,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 10.31,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 10.46,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 20.61,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 27.1,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 33.59,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 40.08,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 46.57,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 38.06,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 56.85,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'International City Phase(2)': {
        Apartment: [
            {
                appreciation_perc: 11.37,
                rent_per_sq_ft: 6,
            },
            {
                appreciation_perc: 22.74,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 29.11,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 45.48,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 61.6,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 67.72,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 93.84,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 109.96,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 111.08,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 116.68,
                rent_per_sq_ft: 11.99,
            },
        ],
    },
    "Za'abeel 1": {
        Apartment: [
            {
                appreciation_perc: 2.07,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 4.14,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 1.21,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 8.28,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 7.36,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: -3.56,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 5.52,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 4.6,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: -11.32,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 17.14,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Emirates Hills': {
        Villa: [
            {
                appreciation_perc: 10.59,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 21.17,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 26.75,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 42.33,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 50.62,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 48.91,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 67.2,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 75.49,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 68.78,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 107.64,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
};

export default propertyData;

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
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 26.88,
                rent_per_sq_ft: 12.8,
            },
            {
                appreciation_perc: 33.57,
                rent_per_sq_ft: 13.66,
            },
            {
                appreciation_perc: 50.26,
                rent_per_sq_ft: 14.59,
            },
            {
                appreciation_perc: 63.76,
                rent_per_sq_ft: 15.6,
            },
            {
                appreciation_perc: 77.26,
                rent_per_sq_ft: 16.69,
            },
            {
                appreciation_perc: 90.76,
                rent_per_sq_ft: 17.86,
            },
            {
                appreciation_perc: 104.26,
                rent_per_sq_ft: 19.13,
            },
            {
                appreciation_perc: 107.76,
                rent_per_sq_ft: 20.5,
            },
            {
                appreciation_perc: 111.26,
                rent_per_sq_ft: 21.98,
            },
        ],
    },
    'Al Barsha South': {
        Apartment: [
            {
                appreciation_perc: 8.31,
                rent_per_sq_ft: 11,
            },
            {
                appreciation_perc: 17.11,
                rent_per_sq_ft: 11.72,
            },
            {
                appreciation_perc: 22.61,
                rent_per_sq_ft: 12.5,
            },
            {
                appreciation_perc: 27.11,
                rent_per_sq_ft: 13.34,
            },
            {
                appreciation_perc: 36.61,
                rent_per_sq_ft: 14.25,
            },
            {
                appreciation_perc: 47.11,
                rent_per_sq_ft: 15.23,
            },
            {
                appreciation_perc: 57.61,
                rent_per_sq_ft: 16.29,
            },
            {
                appreciation_perc: 63.11,
                rent_per_sq_ft: 17.43,
            },
            {
                appreciation_perc: 74.61,
                rent_per_sq_ft: 18.66,
            },
            {
                appreciation_perc: 88.11,
                rent_per_sq_ft: 20,
            },
        ],
    },
    'Jumeirah Village Circle': {
        Apartment: [
            {
                appreciation_perc: 7.84,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 18.17,
                rent_per_sq_ft: 11.18,
            },
            {
                appreciation_perc: 26.67,
                rent_per_sq_ft: 11.91,
            },
            {
                appreciation_perc: 40.17,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 53.67,
                rent_per_sq_ft: 12.99,
            },
            {
                appreciation_perc: 67.17,
                rent_per_sq_ft: 13.18,
            },
            {
                appreciation_perc: 80.67,
                rent_per_sq_ft: 13.48,
            },
            {
                appreciation_perc: 94.17,
                rent_per_sq_ft: 14.56,
            },
            {
                appreciation_perc: 107.67,
                rent_per_sq_ft: 15.72,
            },
            {
                appreciation_perc: 122.17,
                rent_per_sq_ft: 16.98,
            },
        ],
        Villa: [
            {
                appreciation_perc: 7.53,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 14.55,
                rent_per_sq_ft: 11.18,
            },
            {
                appreciation_perc: 19.05,
                rent_per_sq_ft: 11.91,
            },
            {
                appreciation_perc: 25.55,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 35.05,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 46.55,
                rent_per_sq_ft: 13.18,
            },
            {
                appreciation_perc: 52.05,
                rent_per_sq_ft: 13.78,
            },
            {
                appreciation_perc: 62.55,
                rent_per_sq_ft: 14.56,
            },
            {
                appreciation_perc: 74.05,
                rent_per_sq_ft: 15.72,
            },
            {
                appreciation_perc: 85.55,
                rent_per_sq_ft: 16.98,
            },
        ],
    },
    'Al Quoz 1': {
        Apartment: [
            {
                appreciation_perc: 7.47,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 12.43,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 18.93,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 23.43,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 29.93,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 38.43,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 47.93,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 61.43,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 74.93,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 88.43,
                rent_per_sq_ft: 18,
            },
        ],
        Villa: [
            {
                appreciation_perc: 12.47,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 25.44,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 38.94,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 45.44,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 58.94,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 68.44,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 75.94,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 83.44,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 92.94,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 106.44,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Golf City': {
        Apartment: [
            {
                appreciation_perc: 6.31,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 12.11,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 19.61,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 29.11,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 36.61,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 42.11,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 53.61,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 62.11,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 70.61,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 78.11,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Al Jaddaf': {
        Apartment: [
            {
                appreciation_perc: 6.98,
                rent_per_sq_ft: 8,
            },
            {
                appreciation_perc: 11.45,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 16.95,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 21.45,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 27.95,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 33.45,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 41.95,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 48.45,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 53.95,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 59.45,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Ras Al Khor': {
        Apartment: [
            {
                appreciation_perc: 6.12,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 11.73,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 17.23,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 24.73,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 31.23,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 43.73,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 54.23,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 62.73,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 73.23,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 82.73,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Dubai Festival City': {
        Apartment: [
            {
                appreciation_perc: 6.13,
                rent_per_sq_ft: 3.5,
            },
            {
                appreciation_perc: 15.75,
                rent_per_sq_ft: 3.78,
            },
            {
                appreciation_perc: 24.25,
                rent_per_sq_ft: 4.08,
            },
            {
                appreciation_perc: 33.75,
                rent_per_sq_ft: 4.41,
            },
            {
                appreciation_perc: 44.25,
                rent_per_sq_ft: 4.76,
            },
            {
                appreciation_perc: 55.75,
                rent_per_sq_ft: 5.14,
            },
            {
                appreciation_perc: 66.25,
                rent_per_sq_ft: 5.55,
            },
            {
                appreciation_perc: 76.75,
                rent_per_sq_ft: 6,
            },
            {
                appreciation_perc: 85.25,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 94.75,
                rent_per_sq_ft: 7,
            },
        ],
        Villa: [
            {
                appreciation_perc: 7.17,
                rent_per_sq_ft: 3.5,
            },
            {
                appreciation_perc: 12.83,
                rent_per_sq_ft: 3.78,
            },
            {
                appreciation_perc: 20.33,
                rent_per_sq_ft: 4.08,
            },
            {
                appreciation_perc: 33.83,
                rent_per_sq_ft: 4.41,
            },
            {
                appreciation_perc: 42.33,
                rent_per_sq_ft: 4.76,
            },
            {
                appreciation_perc: 51.83,
                rent_per_sq_ft: 5.14,
            },
            {
                appreciation_perc: 64.33,
                rent_per_sq_ft: 5.55,
            },
            {
                appreciation_perc: 77.83,
                rent_per_sq_ft: 6,
            },
            {
                appreciation_perc: 89.33,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 104.83,
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
                appreciation_perc: 13.01,
                rent_per_sq_ft: 11.88,
            },
            {
                appreciation_perc: 21.51,
                rent_per_sq_ft: 12.83,
            },
            {
                appreciation_perc: 29.01,
                rent_per_sq_ft: 13.86,
            },
            {
                appreciation_perc: 36.51,
                rent_per_sq_ft: 14.97,
            },
            {
                appreciation_perc: 43.01,
                rent_per_sq_ft: 16.17,
            },
            {
                appreciation_perc: 53.51,
                rent_per_sq_ft: 17.46,
            },
            {
                appreciation_perc: 67.01,
                rent_per_sq_ft: 18.86,
            },
            {
                appreciation_perc: 80.51,
                rent_per_sq_ft: 20.37,
            },
            {
                appreciation_perc: 94.01,
                rent_per_sq_ft: 22,
            },
        ],
    },
    Dubai: {
        Villa: [
            {
                appreciation_perc: 6.43,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 15.36,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 23.86,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 35.36,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 48.86,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 62.36,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 75.86,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 89.36,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 102.86,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 116.36,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Muhaisnah 3': {
        Apartment: [
            {
                appreciation_perc: 7.42,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 12.34,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 19.84,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 25.34,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 32.84,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 39.34,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 49.84,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 63.34,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 76.84,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 89.34,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Al Sufouh': {
        Apartment: [
            {
                appreciation_perc: 6.07,
                rent_per_sq_ft: 11.5,
            },
            {
                appreciation_perc: 15.64,
                rent_per_sq_ft: 12.42,
            },
            {
                appreciation_perc: 23.14,
                rent_per_sq_ft: 13.41,
            },
            {
                appreciation_perc: 34.64,
                rent_per_sq_ft: 14.48,
            },
            {
                appreciation_perc: 42.14,
                rent_per_sq_ft: 15.64,
            },
            {
                appreciation_perc: 51.64,
                rent_per_sq_ft: 16.89,
            },
            {
                appreciation_perc: 65.14,
                rent_per_sq_ft: 18.24,
            },
            {
                appreciation_perc: 78.64,
                rent_per_sq_ft: 19.7,
            },
            {
                appreciation_perc: 89.14,
                rent_per_sq_ft: 21.28,
            },
            {
                appreciation_perc: 102.64,
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
                appreciation_perc: 16.51,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 28.01,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 41.51,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 57.01,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 67.51,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 84.01,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 97.51,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 111.01,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 126.51,
                rent_per_sq_ft: 24,
            },
        ],
    },
    'Al Satwa': {
        Apartment: [
            {
                appreciation_perc: 5.26,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 11.02,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 19.52,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 27.02,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 36.52,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 42.02,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 49.52,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 57.02,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 67.52,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 74.02,
                rent_per_sq_ft: 18,
            },
        ],
    },
    'Jumeirah Lake Towers': {
        Apartment: [
            {
                appreciation_perc: 9.49,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 21.47,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 33.97,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 48.47,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 66.97,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 80.47,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 99.97,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 117.47,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 138.97,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 159.47,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 9.31,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 22.92,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 34.42,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 52.92,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 66.42,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 79.92,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 93.42,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 116.92,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 133.42,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 156.92,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Barsha Heights': {
        Apartment: [
            {
                appreciation_perc: 13.5,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 21.5,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 34,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 47.5,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 59,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 72.5,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 80.32,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 91.5,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 105,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 118.5,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 11.87,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 22.24,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 34.74,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 44.24,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 57.74,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 71.24,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 84.74,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 98.24,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 111.74,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 135.24,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Al Wasl': {
        Apartment: [
            {
                appreciation_perc: 12.24,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 17.97,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 24.47,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 34.97,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 48.47,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 58.97,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 69.47,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 80.97,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 92.47,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 105.97,
                rent_per_sq_ft: 19.98,
            },
        ],
    },
    'Nad Al Sheba 1': {
        Apartment: [
            {
                appreciation_perc: 9.14,
                rent_per_sq_ft: 6,
            },
            {
                appreciation_perc: 19.64,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 33.14,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 46.64,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 52.14,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 63.64,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 77.14,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 90.64,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 99.14,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 113.64,
                rent_per_sq_ft: 11.99,
            },
        ],
    },
    'Downtown Dubai': {
        Apartment: [
            {
                appreciation_perc: 13.1,
                rent_per_sq_ft: 13,
            },
            {
                appreciation_perc: 25.6,
                rent_per_sq_ft: 14.04,
            },
            {
                appreciation_perc: 36.1,
                rent_per_sq_ft: 15.16,
            },
            {
                appreciation_perc: 49.6,
                rent_per_sq_ft: 16.37,
            },
            {
                appreciation_perc: 62.1,
                rent_per_sq_ft: 17.68,
            },
            {
                appreciation_perc: 79.6,
                rent_per_sq_ft: 19.1,
            },
            {
                appreciation_perc: 93.1,
                rent_per_sq_ft: 20.63,
            },
            {
                appreciation_perc: 106.6,
                rent_per_sq_ft: 22.28,
            },
            {
                appreciation_perc: 130.1,
                rent_per_sq_ft: 24.06,
            },
            {
                appreciation_perc: 146.6,
                rent_per_sq_ft: 26,
            },
        ],
    },
    'Business Bay': {
        Apartment: [
            {
                appreciation_perc: 12.62,
                rent_per_sq_ft: 11,
            },
            {
                appreciation_perc: 22.12,
                rent_per_sq_ft: 11.88,
            },
            {
                appreciation_perc: 34.62,
                rent_per_sq_ft: 12.83,
            },
            {
                appreciation_perc: 45.12,
                rent_per_sq_ft: 13.86,
            },
            {
                appreciation_perc: 58.62,
                rent_per_sq_ft: 14.97,
            },
            {
                appreciation_perc: 72.12,
                rent_per_sq_ft: 16.17,
            },
            {
                appreciation_perc: 85.62,
                rent_per_sq_ft: 17.46,
            },
            {
                appreciation_perc: 99.12,
                rent_per_sq_ft: 18.86,
            },
            {
                appreciation_perc: 122.62,
                rent_per_sq_ft: 20.37,
            },
            {
                appreciation_perc: 156.12,
                rent_per_sq_ft: 22,
            },
        ],
    },
    'Green Community Village': {
        Apartment: [
            {
                appreciation_perc: 9.42,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 17.92,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 25.42,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 34.92,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 48.42,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 61.92,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 75.42,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 88.92,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 95.42,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 105.92,
                rent_per_sq_ft: 19.98,
            },
        ],
        Villa: [
            {
                appreciation_perc: 12.47,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 28.93,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 32.43,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 39.93,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 52.43,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 62.93,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 76.43,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 89.93,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 103.43,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 116.93,
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
                appreciation_perc: 25.51,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 39.01,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 50.51,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 66.01,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 79.51,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 89.01,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 106.51,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 130.01,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 153.51,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 13.62,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 20.12,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 33.62,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 43.12,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 56.62,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 66.12,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 77.62,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 91.12,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 104.62,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 128.12,
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
                appreciation_perc: 17.27,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 22.77,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 32.27,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 39.77,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 47.27,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 54.77,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 65.27,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 72.77,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 85.27,
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
                appreciation_perc: 17.67,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 31.17,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 44.67,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 58.17,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 64.67,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 75.17,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 88.67,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 92.17,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 105.67,
                rent_per_sq_ft: 18,
            },
        ],
        Villa: [
            {
                appreciation_perc: 5.39,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 12.89,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 19.39,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 29.89,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 43.39,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 54.89,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 60.39,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 73.89,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 87.39,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 99.89,
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
                appreciation_perc: 24.6,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 33.1,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 41.6,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 55.1,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 68.6,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 82.1,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 95.6,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 109.1,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 119.6,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Jumeirah 2': {
        Apartment: [
            {
                appreciation_perc: 6.29,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 13.79,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 19.29,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 28.79,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 39.29,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 55.79,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 69.29,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 82.79,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 96.29,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 109.79,
                rent_per_sq_ft: 18,
            },
        ],
        Villa: [
            {
                appreciation_perc: 8.97,
                rent_per_sq_ft: 9,
            },
            {
                appreciation_perc: 21.47,
                rent_per_sq_ft: 9.72,
            },
            {
                appreciation_perc: 34.97,
                rent_per_sq_ft: 10.5,
            },
            {
                appreciation_perc: 48.47,
                rent_per_sq_ft: 11.34,
            },
            {
                appreciation_perc: 61.97,
                rent_per_sq_ft: 12.25,
            },
            {
                appreciation_perc: 75.47,
                rent_per_sq_ft: 13.23,
            },
            {
                appreciation_perc: 88.97,
                rent_per_sq_ft: 14.29,
            },
            {
                appreciation_perc: 102.47,
                rent_per_sq_ft: 15.43,
            },
            {
                appreciation_perc: 115.97,
                rent_per_sq_ft: 16.66,
            },
            {
                appreciation_perc: 129.47,
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
                appreciation_perc: 24.02,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 37.52,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 51.02,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 64.52,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 78.02,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 91.52,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 105.02,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 128.52,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 142.02,
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
                appreciation_perc: 22.8,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 36.3,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 49.8,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 63.3,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 76.8,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 90.3,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 103.8,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 127.3,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 150.8,
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
                appreciation_perc: 20.82,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 32.32,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 47.82,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 57.32,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 69.82,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 78.32,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 91.82,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 105.32,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 138.82,
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
                appreciation_perc: 15.08,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 28.58,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 42.08,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 55.58,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 69.08,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 82.58,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 96.08,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 119.58,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 143.08,
                rent_per_sq_ft: 24,
            },
        ],
        Villa: [
            {
                appreciation_perc: 11.44,
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 26.94,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 40.44,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 53.94,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 67.44,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 80.94,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 94.44,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 117.94,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 135.44,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 154.94,
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
                appreciation_perc: 19.63,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 26.13,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 33.63,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 39.13,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 49.63,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 63.13,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 76.63,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 90.13,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 103.63,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 8.41,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 17.91,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 21.41,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 31.91,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 43.41,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 51.91,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 65.41,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 78.91,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 89.41,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 105.91,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    Mirdif: {
        Apartment: [
            {
                appreciation_perc: 5.84,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 10.34,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 17.84,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 25.34,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 33.84,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 39.34,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 44.84,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 59.34,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 67.84,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 78.34,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 6.21,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 13.71,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 19.21,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 27.71,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 38.21,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 51.71,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 65.21,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 68.71,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 75.21,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 85.71,
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
                appreciation_perc: 17.09,
                rent_per_sq_ft: 8.64,
            },
            {
                appreciation_perc: 30.59,
                rent_per_sq_ft: 9.33,
            },
            {
                appreciation_perc: 41.09,
                rent_per_sq_ft: 10.08,
            },
            {
                appreciation_perc: 57.59,
                rent_per_sq_ft: 10.89,
            },
            {
                appreciation_perc: 62.09,
                rent_per_sq_ft: 11.76,
            },
            {
                appreciation_perc: 74.59,
                rent_per_sq_ft: 12.7,
            },
            {
                appreciation_perc: 88.09,
                rent_per_sq_ft: 13.72,
            },
            {
                appreciation_perc: 99.59,
                rent_per_sq_ft: 14.81,
            },
            {
                appreciation_perc: 115.09,
                rent_per_sq_ft: 16,
            },
        ],
    },
    'Nadd Al Hamar': {
        Apartment: [
            {
                appreciation_perc: 6.4,
                rent_per_sq_ft: 10,
            },
            {
                appreciation_perc: 12.3,
                rent_per_sq_ft: 10.8,
            },
            {
                appreciation_perc: 18.8,
                rent_per_sq_ft: 11.66,
            },
            {
                appreciation_perc: 29.3,
                rent_per_sq_ft: 12.59,
            },
            {
                appreciation_perc: 42.8,
                rent_per_sq_ft: 13.6,
            },
            {
                appreciation_perc: 56.3,
                rent_per_sq_ft: 14.69,
            },
            {
                appreciation_perc: 69.8,
                rent_per_sq_ft: 15.86,
            },
            {
                appreciation_perc: 73.3,
                rent_per_sq_ft: 17.13,
            },
            {
                appreciation_perc: 86.8,
                rent_per_sq_ft: 18.5,
            },
            {
                appreciation_perc: 100.3,
                rent_per_sq_ft: 19.98,
            },
        ],
    },
    'Nad Al Sheba': {
        Apartment: [
            {
                appreciation_perc: 5.18,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 11.68,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 18.18,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 26.68,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 37.18,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 51.68,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 64.18,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 77.68,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 91.18,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 104.68,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 6.72,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 12.22,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 19.72,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 29.22,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 42.72,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 56.22,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 69.72,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 78.22,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 96.72,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 109.22,
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
                appreciation_perc: 20.11,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 33.61,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 43.11,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 53.61,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 64.11,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 77.61,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 91.11,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 114.61,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 128.11,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 10.08,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 23.58,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 37.08,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 50.58,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 64.08,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 77.58,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 91.08,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 104.58,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 128.08,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 141.58,
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
                appreciation_perc: 27.51,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 41.01,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 54.51,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 68.01,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 81.51,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 95.01,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 118.51,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 132.01,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 155.51,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Dubai Islands': {
        Apartment: [
            {
                appreciation_perc: 6.46,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 14.96,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 21.46,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 33.96,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 43.46,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 60.96,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 74.46,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 87.96,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 101.46,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 124.96,
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
                appreciation_perc: 23.44,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 34.94,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 48.44,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 59.94,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 72.44,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 90.94,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 104.44,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 137.94,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 159.44,
                rent_per_sq_ft: 24,
            },
        ],
        Villa: [
            {
                appreciation_perc: 12.67,
                rent_per_sq_ft: 12,
            },
            {
                appreciation_perc: 28.17,
                rent_per_sq_ft: 12.96,
            },
            {
                appreciation_perc: 36.67,
                rent_per_sq_ft: 14,
            },
            {
                appreciation_perc: 49.17,
                rent_per_sq_ft: 15.12,
            },
            {
                appreciation_perc: 69.67,
                rent_per_sq_ft: 16.33,
            },
            {
                appreciation_perc: 83.17,
                rent_per_sq_ft: 17.64,
            },
            {
                appreciation_perc: 96.67,
                rent_per_sq_ft: 19.05,
            },
            {
                appreciation_perc: 110.17,
                rent_per_sq_ft: 20.57,
            },
            {
                appreciation_perc: 133.67,
                rent_per_sq_ft: 22.22,
            },
            {
                appreciation_perc: 157.17,
                rent_per_sq_ft: 24,
            },
        ],
    },
    'Ras Al Khor Industrial Area 1': {
        Apartment: [
            {
                appreciation_perc: 5.67,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 10.17,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 17.67,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 24.17,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 33.67,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 41.17,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 51.67,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 68.17,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 74.67,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 85.17,
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
                appreciation_perc: 23.01,
                rent_per_sq_ft: 7.83,
            },
            {
                appreciation_perc: 32.51,
                rent_per_sq_ft: 8.46,
            },
            {
                appreciation_perc: 40.01,
                rent_per_sq_ft: 9.14,
            },
            {
                appreciation_perc: 48.51,
                rent_per_sq_ft: 9.87,
            },
            {
                appreciation_perc: 57.01,
                rent_per_sq_ft: 10.66,
            },
            {
                appreciation_perc: 67.51,
                rent_per_sq_ft: 11.51,
            },
            {
                appreciation_perc: 77.01,
                rent_per_sq_ft: 12.43,
            },
            {
                appreciation_perc: 86.51,
                rent_per_sq_ft: 13.42,
            },
            {
                appreciation_perc: 101.01,
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
                appreciation_perc: 28.83,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 42.33,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 55.83,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 69.33,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 82.83,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 96.33,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 119.83,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 137.33,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 156.83,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 11.07,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 25.57,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 39.07,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 52.57,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 66.07,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 79.57,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 93.07,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 109.57,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 130.07,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 143.57,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
    'Umm Suqeim 3': {
        Apartment: [
            {
                appreciation_perc: 5.25,
                rent_per_sq_ft: 16,
            },
            {
                appreciation_perc: 12.75,
                rent_per_sq_ft: 17.28,
            },
            {
                appreciation_perc: 21.25,
                rent_per_sq_ft: 18.66,
            },
            {
                appreciation_perc: 26.75,
                rent_per_sq_ft: 20.15,
            },
            {
                appreciation_perc: 38.25,
                rent_per_sq_ft: 21.76,
            },
            {
                appreciation_perc: 51.75,
                rent_per_sq_ft: 23.5,
            },
            {
                appreciation_perc: 65.25,
                rent_per_sq_ft: 25.38,
            },
            {
                appreciation_perc: 78.75,
                rent_per_sq_ft: 27.41,
            },
            {
                appreciation_perc: 92.25,
                rent_per_sq_ft: 29.6,
            },
            {
                appreciation_perc: 105.75,
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
                appreciation_perc: 27.16,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 42.66,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 56.16,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 69.66,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 83.16,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 96.66,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 110.16,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 133.66,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 157.16,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 5.33,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 12.83,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 18.33,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 24.83,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 32.33,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 41.83,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 55.33,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 68.83,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 82.33,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 95.83,
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
                appreciation_perc: 27.44,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 43.94,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 56.44,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 69.94,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 72.44,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 86.94,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 100.44,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 113.94,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 137.44,
                rent_per_sq_ft: 13.99,
            },
        ],
        Villa: [
            {
                appreciation_perc: 7.39,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 17.89,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 31.39,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 44.89,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 58.39,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 71.89,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 85.39,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 98.89,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 112.39,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 135.89,
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
                appreciation_perc: 12.66,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 18.16,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 28.66,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 39.16,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 52.66,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 60.16,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 73.66,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 87.16,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 102.66,
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
                appreciation_perc: 25.87,
                rent_per_sq_ft: 6.48,
            },
            {
                appreciation_perc: 39.37,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 52.87,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 66.37,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 79.87,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 83.37,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 96.87,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 110.37,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 133.87,
                rent_per_sq_ft: 11.99,
            },
        ],
    },
    "Za'abeel 1": {
        Apartment: [
            {
                appreciation_perc: 5.07,
                rent_per_sq_ft: 7,
            },
            {
                appreciation_perc: 11.57,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 17.07,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 25.57,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 36.07,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 51.57,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 65.07,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 78.57,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 88.07,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 99.57,
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
                appreciation_perc: 24.09,
                rent_per_sq_ft: 7.56,
            },
            {
                appreciation_perc: 37.59,
                rent_per_sq_ft: 8.16,
            },
            {
                appreciation_perc: 43.09,
                rent_per_sq_ft: 8.81,
            },
            {
                appreciation_perc: 54.59,
                rent_per_sq_ft: 9.52,
            },
            {
                appreciation_perc: 68.09,
                rent_per_sq_ft: 10.28,
            },
            {
                appreciation_perc: 79.59,
                rent_per_sq_ft: 11.1,
            },
            {
                appreciation_perc: 89.09,
                rent_per_sq_ft: 11.99,
            },
            {
                appreciation_perc: 108.59,
                rent_per_sq_ft: 12.95,
            },
            {
                appreciation_perc: 122.09,
                rent_per_sq_ft: 13.99,
            },
        ],
    },
};

export default propertyData;

import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp(),
                format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                })
            )
        }),
        new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: format.combine(
                format.timestamp(),
                format.json()
            )
        }),
        new transports.File({
            filename: 'logs/combined.log',
            format: format.combine(
                format.timestamp(),
                format.json()
            )
        }),
    ],
});

export default logger;

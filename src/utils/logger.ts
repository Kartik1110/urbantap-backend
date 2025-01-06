import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        // Console transport with color
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ timestamp, level, message, stack }) => {
                    if (stack) {
                        return `${timestamp} ${level}: ${message}\n${stack}`;
                    }
                    return `${timestamp} ${level}: ${message}`;
                })
            )
        }),
        // Daily Rotate File for all logs
        new transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
            format: format.combine(
                format.printf(({ timestamp, level, message, stack }) => {
                    if (stack) {
                        return `${timestamp} ${level}: ${message}\n${stack}`;
                    }
                    return `${timestamp} ${level}: ${message}`;
                })
            )
        }),
        // Daily Rotate File for error logs
        new transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
            level: 'error',
            format: format.combine(
                format.printf(({ timestamp, level, message, stack }) => {
                    if (stack) {
                        return `${timestamp} ${level}: ${message}\n${stack}`;
                    }
                    return `${timestamp} ${level}: ${message}`;
                })
            )
        })
    ]
});

export default logger;

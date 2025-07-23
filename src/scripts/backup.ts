import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { exec } from 'child_process';
import logger from '../utils/logger';
import { uploadToS3 } from '../utils/s3Upload';

dotenv.config();

// Configuration from environment variables
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.PGHOST || 'localhost';
const DB_PORT = process.env.PGPORT || '5432';
const BACKUP_DIR = process.env.BACKUP_DIR || '/tmp/backup';
const S3_FOLDER = process.env.S3_FOLDER || 'backups';

function getBackupFileName(): string {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    return `${DB_NAME}_backup_${date}.sql.gz`;
}

async function performBackup(): Promise<void> {
    if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
        logger.error(
            'Database credentials are not set in environment variables.'
        );
        return;
    }
    if (!process.env.S3_BUCKET_NAME) {
        logger.error('S3_BUCKET_NAME is not set in environment variables.');
        return;
    }

    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const backupFileName = getBackupFileName();
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    logger.info('Starting PostgreSQL backup...');
    logger.info(
        `Database: ${DB_NAME}, Host: ${DB_HOST}, Port: ${DB_PORT}, User: ${DB_USER}`
    );

    // Create environment with PGPASSWORD
    const env = { ...process.env, PGPASSWORD: DB_PASSWORD };

    // Construct pg_dump command without shell escaping issues
    const dumpCmd = `pg_dump -U "${DB_USER}" -h "${DB_HOST}" -p "${DB_PORT}" "${DB_NAME}" | gzip > "${backupFilePath}"`;

    logger.info('Executing backup command...');

    return new Promise((resolve, reject) => {
        exec(
            dumpCmd,
            { env, shell: '/bin/bash' },
            async (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    logger.error('Database backup failed:', error.message);
                    reject(error);
                    return;
                }

                if (stderr && !stderr.includes('WARNING')) {
                    logger.error('pg_dump stderr:', stderr);
                }

                // Check if backup file was created and has content
                try {
                    if (!fs.existsSync(backupFilePath)) {
                        const error = new Error('Backup file was not created');
                        logger.error('Backup file was not created');
                        reject(error);
                        return;
                    }

                    const stats = fs.statSync(backupFilePath);
                    if (stats.size === 0) {
                        const error = new Error('Backup file is empty');
                        logger.error('Backup file is empty - backup failed');
                        reject(error);
                        return;
                    }

                    logger.info(
                        `Database backup completed: ${backupFilePath} (${stats.size} bytes)`
                    );

                    // Upload to S3
                    try {
                        const s3Key = `${S3_FOLDER}/${backupFileName}`;
                        await uploadToS3(backupFilePath, s3Key);
                        logger.info(
                            `Backup successfully uploaded to S3: ${s3Key}`
                        );
                    } catch (err) {
                        logger.error('Failed to upload backup to S3:', err);
                        reject(err);
                        return;
                    }

                    // Cleanup local backup file
                    try {
                        fs.unlinkSync(backupFilePath);
                        logger.info('Local backup file cleaned up.');
                    } catch (err) {
                        logger.error(
                            'Failed to delete local backup file:',
                            err
                        );
                        // Don't reject here as the backup was successful
                    }

                    resolve();
                } catch (err) {
                    logger.error('Error checking backup file:', err);
                    reject(err);
                }
            }
        );
    });
}

// Schedule the backup to run daily at 12am
cron.schedule('0 0 * * *', () => {
    logger.info('Running scheduled database backup...');
    performBackup().catch((err) => {
        logger.error('Scheduled backup failed:', err);
    });
});

// If run directly, perform backup immediately
if (require.main === module) {
    performBackup().catch((err) => {
        logger.error('Backup failed:', err);
        process.exit(1);
    });
}

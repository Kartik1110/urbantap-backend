import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { exec } from 'child_process';
import logger from '../utils/logger';
import { uploadToS3 } from '../utils/s3Upload';

dotenv.config();

// **Environment vars**
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const S3_BUCKET = process.env.S3_BUCKET_NAME;
const BACKUP_DIR = process.env.BACKUP_DIR || '/tmp/backup';
const S3_FOLDER = process.env.S3_FOLDER || 'backups';

// Docker container name (as seen in `docker ps`)
const PG_CONTAINER = process.env.PG_CONTAINER || 'postgres-dev';

function getBackupFileName(): string {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    return `${DB_NAME}_backup_${date}.sql.gz`;
}

export async function performBackup(): Promise<void> {
    if (!DB_NAME || !DB_USER) {
        logger.error('DB_NAME and DB_USER must be set');
        return;
    }
    if (!S3_BUCKET) {
        logger.error('S3_BUCKET_NAME must be set');
        return;
    }

    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const backupFileName = getBackupFileName();
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    logger.info('Starting PostgreSQL backup via docker exec...');
    logger.info(`Container: ${PG_CONTAINER}, DB: ${DB_NAME}, User: ${DB_USER}`);

    // use the container's pg_dump to avoid version mismatches
    const dumpCmd = `
    docker exec -i ${PG_CONTAINER} \
      pg_dump -U "${DB_USER}" "${DB_NAME}" \
    | gzip > "${backupFilePath}"
  `.trim();

    return new Promise<void>((resolve, reject) => {
        exec(
            dumpCmd,
            { shell: '/bin/bash' },
            async (error, _stdout, stderr) => {
                if (error) {
                    logger.error('Database backup failed:', error.message);
                    return reject(error);
                }
                if (stderr) {
                    logger.error('pg_dump stderr:', stderr.trim());
                }

                // verify file
                if (!fs.existsSync(backupFilePath)) {
                    const err = new Error('Backup file not created');
                    logger.error(err.message);
                    return reject(err);
                }
                const stats = fs.statSync(backupFilePath);
                if (stats.size === 0) {
                    const err = new Error('Backup file is empty');
                    logger.error(err.message);
                    return reject(err);
                }

                logger.info(
                    `Backup completed: ${backupFilePath} (${stats.size} bytes)`
                );

                // upload
                try {
                    const s3Key = `${S3_FOLDER}/${backupFileName}`;
                    await uploadToS3(backupFilePath, s3Key);
                    logger.info(`Uploaded to S3: ${s3Key}`);
                } catch (uploadErr) {
                    logger.error('Upload failed:', uploadErr);
                    return reject(uploadErr);
                }

                // cleanup
                // try {
                //     fs.unlinkSync(backupFilePath);
                //     logger.info('Local backup file deleted.');
                // } catch (cleanupErr) {
                //     logger.error('Cleanup failed:', cleanupErr);
                // }

                resolve();
            }
        );
    });
}

// schedule daily at midnight
cron.schedule('0 0 * * *', () => {
    logger.info('Scheduled backup triggered');
    performBackup().catch((err) => {
        logger.error('Scheduled backup error:', err);
    });
});

// allow `node backup.js` to run one-off
if (require.main === module) {
    performBackup()
        .then(() => process.exit(0))
        .catch((err) => {
            logger.error('Immediate backup failed:', err);
            process.exit(1);
        });
}

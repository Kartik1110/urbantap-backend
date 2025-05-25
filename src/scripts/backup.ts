import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cron from "node-cron";
import { exec } from "child_process";
import { uploadToS3 } from "../utils/s3Upload";

dotenv.config();

// Configuration from environment variables
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.PGHOST || "localhost";
const DB_PORT = process.env.PGPORT || "5432";
const BACKUP_DIR = process.env.BACKUP_DIR || "/tmp/backup";
const S3_FOLDER = process.env.S3_FOLDER || "backups";

function getBackupFileName(): string {
  const date = new Date().toISOString().replace(/[:.]/g, "-");
  return `${DB_NAME}_backup_${date}.sql.gz`;
}

async function performBackup(): Promise<void> {
  if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
    console.error("Database credentials are not set in environment variables.");
    return;
  }
  if (!process.env.S3_BUCKET_NAME) {
    console.error("S3_BUCKET_NAME is not set in environment variables.");
    return;
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const backupFileName = getBackupFileName();
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  // Construct pg_dump command
  const dumpCmd = `PGPASSWORD=\"${DB_PASSWORD}\" pg_dump -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} ${DB_NAME} | gzip > ${backupFilePath}`;

  console.log("Starting PostgreSQL backup...");
  exec(
    dumpCmd,
    { env: process.env, shell: "/bin/bash" },
    async (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        console.error("Database backup failed:", error.message);
        return;
      }
      if (stderr) {
        console.error("pg_dump stderr:", stderr);
      }
      console.log("Database backup completed:", backupFilePath);

      // Upload to S3
      try {
        const s3Key = `${S3_FOLDER}/${backupFileName}`;
        await uploadToS3(backupFilePath, s3Key);
        console.log(`Backup successfully uploaded to S3: ${s3Key}`);
      } catch (err) {
        console.error("Failed to upload backup to S3:", err);
        return;
      }

      // Cleanup local backup file
      try {
        fs.unlinkSync(backupFilePath);
        console.log("Local backup file cleaned up.");
      } catch (err) {
        console.error("Failed to delete local backup file:", err);
      }
    }
  );
}

// Schedule the backup to run daily at 12am
cron.schedule("0 0 * * *", () => {
  console.log("Running scheduled database backup...");
  performBackup();
});

// If run directly, perform backup immediately
if (require.main === module) {
  performBackup();
}

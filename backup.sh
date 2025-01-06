#!/bin/bash

# Configuration
DB_NAME="your_database_name"
DB_USER="your_database_user"
DB_HOST="your_database_host" # e.g., localhost or an IP address
DB_PORT="5432"              # Default PostgreSQL port
BACKUP_DIR="/path/to/backup/dir" # Local directory to store temporary backups
S3_BUCKET="your-s3-bucket-name"
S3_FOLDER="backups"         # Folder inside the S3 bucket (optional)
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${DATE}.sql.gz"

# AWS Configuration (Optional if already configured globally)
AWS_PROFILE="your_aws_profile"  # Use default if no profile is set
AWS_REGION="your_aws_region"    # e.g., us-east-1

# Step 1: Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Step 2: Perform the database backup
echo "Starting PostgreSQL backup for database: $DB_NAME"
pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -ne 0 ]; then
  echo "Database backup failed!"
  exit 1
fi

echo "Database backup completed: $BACKUP_FILE"

# Step 3: Upload the backup file to S3
echo "Uploading backup to S3..."
aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/${S3_FOLDER}/${DB_NAME}_backup_${DATE}.sql.gz" \
  --profile "$AWS_PROFILE" --region "$AWS_REGION"

if [ $? -ne 0 ]; then
  echo "Failed to upload the backup to S3!"
  exit 1
fi

echo "Backup successfully uploaded to S3: s3://${S3_BUCKET}/${S3_FOLDER}/${DB_NAME}_backup_${DATE}.sql.gz"

# Step 4: (Optional) Cleanup local backup file
echo "Cleaning up local backup file..."
rm -f "$BACKUP_FILE"

echo "Backup process completed successfully!"

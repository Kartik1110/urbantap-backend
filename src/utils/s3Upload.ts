import fs from 'fs/promises';
import logger from '@/utils/logger';
import { createReadStream } from 'fs';
import { config } from '@/config/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
    },
});

// MIME type mapping for better maintainability
const MIME_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
};

/**
 * Detects content type from file extension
 */
function detectContentType(fileName: string, providedType?: string): string {
    if (providedType) return providedType;

    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext && MIME_TYPES[ext]
        ? MIME_TYPES[ext]
        : 'application/octet-stream';
}

/**
 * Uploads a file to S3 using streams for memory efficiency
 * @param filePath - Local file path to upload
 * @param fileName - S3 key/filename
 * @param contentType - Optional MIME type (auto-detected if not provided)
 * @returns S3 URL of uploaded file
 */
export async function uploadToS3(
    filePath: string,
    fileName: string,
    contentType?: string
): Promise<string> {
    try {
        // Verify file exists before attempting upload
        await fs.access(filePath);

        const detectedContentType = detectContentType(fileName, contentType);

        // Use stream for better memory efficiency with large files
        const fileStream = createReadStream(filePath);

        const params = {
            Bucket: config.s3BucketName,
            Key: fileName,
            Body: fileStream,
            ContentType: detectedContentType,
        };

        await s3Client.send(new PutObjectCommand(params));

        // Delete the file after successful upload
        await fs.unlink(filePath);

        return `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${fileName}`;
    } catch (error) {
        logger.error('Error uploading file to S3:', error);

        // Provide more specific error context
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            throw new Error(`File not found: ${filePath}`);
        }

        throw new Error(
            `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

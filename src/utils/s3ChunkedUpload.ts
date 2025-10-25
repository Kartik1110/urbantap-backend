import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { config } from '../config/config';
import fs from 'fs';
import logger from './logger';

const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
    },
});

export async function uploadToS3Chunked(
    filePath: string,
    fileName: string,
    chunkSize: number = 10 * 1024 * 1024 // 10MB chunks by default
): Promise<string> {
    try {
        logger.info(`🚀 Starting chunked upload for file: ${fileName}`);
        logger.info(`📁 File path: ${filePath}`);
        logger.info(`📦 Chunk size: ${chunkSize / (1024 * 1024)}MB`);
        
        const fileStats = fs.statSync(filePath);
        logger.info(`📊 File size: ${(fileStats.size / (1024 * 1024)).toFixed(2)}MB`);
        
        const fileStream = fs.createReadStream(filePath);
        
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: config.s3BucketName,
                Key: fileName,
                Body: fileStream,
                ContentType: getContentType(fileName),
            },
            partSize: chunkSize,
            queueSize: 4, // Number of parts to upload in parallel
        });

        logger.info(`🔄 Upload initialized with ${Math.ceil(fileStats.size / chunkSize)} expected parts`);

        // Track upload progress
        upload.on('httpUploadProgress', (progress) => {
            if (progress.loaded && progress.total) {
                const percentage = Math.round((progress.loaded / progress.total) * 100);
                logger.info(`📈 Upload progress: ${percentage}% (${(progress.loaded / (1024 * 1024)).toFixed(2)}MB / ${(progress.total / (1024 * 1024)).toFixed(2)}MB)`);
            }
        });

        logger.info(`⏳ Starting multipart upload to S3...`);
        await upload.done();
        logger.info(`✅ Chunked upload completed successfully for: ${fileName}`);

        // Delete the file after uploading
        fs.unlinkSync(filePath);
        logger.info(`🗑️ Temporary file deleted: ${filePath}`);

        const finalUrl = `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${fileName}`;
        logger.info(`🔗 Final URL: ${finalUrl}`);
        
        return finalUrl;
    } catch (error) {
        logger.error('❌ Error uploading file to S3 with chunking:', error);
        throw new Error('Failed to upload file to S3 with chunking');
    }
}

function getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
    };
    
    return contentTypes[ext || ''] || 'application/octet-stream';
}

// Function to check if file should use chunked upload based on size
export function shouldUseChunkedUpload(fileSize: number, threshold: number = 9 * 1024 * 1024): boolean {
    const useChunking = fileSize > threshold;
    logger.info(`🔍 File size check: ${(fileSize / (1024 * 1024)).toFixed(2)}MB vs threshold ${(threshold / (1024 * 1024))}MB - ${useChunking ? 'Using chunked upload' : 'Using regular upload'}`);
    return useChunking; // Use chunking for files larger than 9MB
}

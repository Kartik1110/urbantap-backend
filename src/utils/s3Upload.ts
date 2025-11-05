import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/config';
import fs from 'fs';
const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
    },
});

export async function uploadToS3(
    filePath: string,
    fileName: string,
    contentType?: string
): Promise<string> {
    // Determine content type from file extension if not provided
    let detectedContentType = contentType || 'image/jpeg';
    if (!contentType) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'png') detectedContentType = 'image/png';
        else if (ext === 'gif') detectedContentType = 'image/gif';
        else if (ext === 'webp') detectedContentType = 'image/webp';
        else if (ext === 'pdf') detectedContentType = 'application/pdf';
        else if (ext === 'jpg' || ext === 'jpeg') detectedContentType = 'image/jpeg';
    }

    const params = {
        Bucket: config.s3BucketName,
        Key: fileName,
        Body: fs.readFileSync(filePath),
        ContentType: detectedContentType,
    };
    try {
        await s3Client.send(new PutObjectCommand(params));

        // delete the file after uploading
        fs.unlinkSync(filePath);

        return `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('Failed to upload file to S3');
    }
}

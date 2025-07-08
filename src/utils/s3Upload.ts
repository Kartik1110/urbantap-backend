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
    fileName: string
): Promise<string> {
    const params = {
        Bucket: config.s3BucketName,
        Key: fileName,
        Body: fs.readFileSync(filePath),
        ContentType: 'image/jpeg',
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

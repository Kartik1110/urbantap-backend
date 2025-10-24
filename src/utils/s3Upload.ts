import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';
import logger from './logger';

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

// Project-specific upload function with enhanced logging
export async function uploadToS3ForProject(
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

        const fileUrl = `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${fileName}`;
        
        return fileUrl;
    } catch (error) {
        logger.error('Error uploading project file to S3:', error);
        throw new Error('Failed to upload project file to S3');
    }
}

export interface PresignedUrlResponse {
    presignedUrl: string;
    fileUrl: string;
    fileName: string;
}

export async function generatePresignedUrl(
    fileName: string,
    contentType: string = 'image/jpeg',
    expiresIn: number = 3600 // 1 hour default
): Promise<PresignedUrlResponse> {
    try {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2);
        const fileExtension = path.extname(fileName);
        const baseName = path.basename(fileName, fileExtension);
        const uniqueFileName = `${baseName}_${timestamp}_${randomString}${fileExtension}`;

        const key = `uploads/${uniqueFileName}`;

        const command = new PutObjectCommand({
            Bucket: config.s3BucketName,
            Key: key,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn,
        });

        const fileUrl = `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;

        return {
            presignedUrl,
            fileUrl,
            fileName: uniqueFileName,
        };
    } catch (error) {
        logger.error('Error generating presigned URL:', error);
        throw new Error('Failed to generate presigned URL');
    }
}

export async function generatePresignedUrlForProject(
    fileType: 'image' | 'brochure' | 'inventory' | 'floor_plan',
    originalFileName: string,
    contentType: string = 'image/jpeg',
    expiresIn: number = 3600
): Promise<PresignedUrlResponse> {
    try {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2);
        const fileExtension = path.extname(originalFileName);
        const baseName = path.basename(originalFileName, fileExtension);

        let folderPath: string;
        let uniqueFileName: string;

        switch (fileType) {
            case 'image':
                folderPath = 'projects/images';
                uniqueFileName = `${baseName}_${timestamp}_${randomString}${fileExtension}`;
                break;
            case 'brochure':
                folderPath = 'projects/brochures';
                uniqueFileName = `${timestamp}_brochure${fileExtension}`;
                break;
            case 'inventory':
                folderPath = 'projects/inventory';
                uniqueFileName = `${timestamp}_inventory${fileExtension}`;
                break;
            case 'floor_plan':
                folderPath = 'projects/floor_plans';
                uniqueFileName = `${timestamp}_floor_plan_${randomString}${fileExtension}`;
                break;
            default:
                logger.error(`Invalid file type provided: ${fileType}`);
                throw new Error('Invalid file type');
        }

        const key = `${folderPath}/${uniqueFileName}`;

        const command = new PutObjectCommand({
            Bucket: config.s3BucketName,
            Key: key,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn,
        });

        const fileUrl = `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;

        return {
            presignedUrl,
            fileUrl,
            fileName: uniqueFileName,
        };
    } catch (error) {
        logger.error('Error generating presigned URL for project:', error);
        throw new Error('Failed to generate presigned URL for project');
    }
}

export async function generatePresignedUrlForMultipleFiles(
    files: Array<{
        fileType: 'image' | 'brochure' | 'inventory' | 'floor_plan';
        originalFileName: string;
        contentType?: string;
    }>,
    expiresIn: number = 3600
): Promise<PresignedUrlResponse[]> {
    try {
        const promises = files.map((file) => {
            return generatePresignedUrlForProject(
                file.fileType,
                file.originalFileName,
                file.contentType,
                expiresIn
            );
        });

        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        logger.error('Error generating multiple presigned URLs:', error);
        throw new Error('Failed to generate multiple presigned URLs');
    }
}

// Utility interfaces for file handling
export interface ProjectFileUrls {
    images: string[];
    brochure?: string;
    inventory: string[];
    floorPlans: { [index: number]: string };
}

export interface ProjectFileHandlingResult {
    imageUrls: string[];
    brochureUrl?: string;
    inventoryFiles: string[];
    floorPlanImages: { [index: number]: string };
}

// Reusable function to parse uploaded file URLs from presigned uploads
export function parseUploadedFileUrls(uploadedFileUrls: string): ProjectFileUrls {
    const parsedUrls = JSON.parse(uploadedFileUrls);
    
    const result: ProjectFileUrls = {
        images: parsedUrls.images || [],
        brochure: parsedUrls.brochure,
        inventory: parsedUrls.inventory || [],
        floorPlans: parsedUrls.floorPlans || {}
    };
    
    return result;
}

// Reusable function to handle direct file uploads (legacy approach)
export async function handleDirectFileUploads(files: Express.Multer.File[]): Promise<ProjectFileHandlingResult> {
    const organizedFiles: { [key: string]: Express.Multer.File[] } = {};
    files.forEach((file) => {
        if (!organizedFiles[file.fieldname]) {
            organizedFiles[file.fieldname] = [];
        }
        organizedFiles[file.fieldname].push(file);
    });

    const result: ProjectFileHandlingResult = {
        imageUrls: [],
        brochureUrl: undefined,
        inventoryFiles: [],
        floorPlanImages: {}
    };

    // Upload project images
    if (organizedFiles.image_urls) {
        for (const file of organizedFiles.image_urls) {
            const ext = file.originalname.split('.').pop();
            const url = await uploadToS3ForProject(
                file.path,
                `projects/images/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
            );
            result.imageUrls.push(url);
        }
    }

    // Upload project brochure
    if (organizedFiles.file_url?.[0]) {
        const ext = organizedFiles.file_url[0].originalname.split('.').pop();
        result.brochureUrl = await uploadToS3ForProject(
            organizedFiles.file_url[0].path,
            `projects/brochures/${Date.now()}_brochure.${ext}`
        );
    }

    // Upload inventory file
    if (organizedFiles.inventory_file?.[0]) {
        const ext = organizedFiles.inventory_file[0].originalname.split('.').pop();
        const url = await uploadToS3ForProject(
            organizedFiles.inventory_file[0].path,
            `projects/inventory/${Date.now()}_inventory.${ext}`
        );
        result.inventoryFiles.push(url);
    }

    // Upload floor plan images dynamically
    for (const fieldName in organizedFiles) {
        if (fieldName.startsWith('floor_plan_image_')) {
            const index = parseInt(fieldName.replace('floor_plan_image_', ''));
            if (!isNaN(index) && organizedFiles[fieldName][0]) {
                const file = organizedFiles[fieldName][0];
                const ext = file.originalname.split('.').pop();
                const url = await uploadToS3ForProject(
                    file.path,
                    `projects/floor_plans/${Date.now()}_floor_plan_${index}.${ext}`
                );
                result.floorPlanImages[index] = url;
            }
        }
    }

    return result;
}

// Main reusable function to handle project file uploads (both presigned and direct)
export async function handleProjectFileUploads(
    files: Express.Multer.File[] | undefined,
    uploadedFileUrls: string | undefined,
    operation: 'create' | 'update'
): Promise<ProjectFileHandlingResult> {
    let result: ProjectFileHandlingResult;

    if (uploadedFileUrls) {
        const parsedUrls = parseUploadedFileUrls(uploadedFileUrls);
        result = {
            imageUrls: parsedUrls.images,
            brochureUrl: parsedUrls.brochure,
            inventoryFiles: parsedUrls.inventory,
            floorPlanImages: parsedUrls.floorPlans
        };
    } else if (files && Array.isArray(files)) {
        result = await handleDirectFileUploads(files);
    } else {
        result = {
            imageUrls: [],
            brochureUrl: undefined,
            inventoryFiles: [],
            floorPlanImages: {}
        };
    }

    return result;
}

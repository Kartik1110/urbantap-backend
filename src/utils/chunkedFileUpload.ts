import fs from 'fs';
import path from 'path';
import logger from './logger';
import { Express } from 'express';

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB
const TEMP_DIR = path.join(process.cwd(), 'uploads', 'chunks');
const ASSEMBLED_DIR = path.join(process.cwd(), 'uploads', 'assembled');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Ensure assembled directory exists
if (!fs.existsSync(ASSEMBLED_DIR)) {
    fs.mkdirSync(ASSEMBLED_DIR, { recursive: true });
}

interface ChunkInfo {
    fileId: string;
    chunkIndex: number;
    totalChunks: number;
    fileName: string;
    mimeType: string;
}

/**
 * Process chunked file upload
 * Assembles chunks and returns the complete file path
 */
export async function processChunkedFile(
    chunk: Express.Multer.File,
    chunkInfo: ChunkInfo
): Promise<string | null> {
    const { fileId, chunkIndex, totalChunks, fileName, mimeType } = chunkInfo;

    // Validate chunk info
    if (!fileId || chunkIndex === undefined || !totalChunks || !fileName) {
        throw new Error('Invalid chunk information');
    }

    logger.info(
        `Processing chunk ${chunkIndex + 1}/${totalChunks} for file: ${fileName}`
    );

    // Save chunk to temporary directory
    const chunkDir = path.join(TEMP_DIR, fileId);
    if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir, { recursive: true });
    }

    const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);

    // Read chunk data - multer may store on disk or in memory
    let chunkData: Buffer;
    if (chunk.buffer) {
        // File is in memory
        chunkData = chunk.buffer;
    } else if (chunk.path) {
        // File is on disk, read it
        chunkData = fs.readFileSync(chunk.path);

        // Clean up multer's temporary file
        try {
            fs.unlinkSync(chunk.path);
            logger.info(`Cleaned up multer temp file: ${chunk.path}`);
        } catch (error) {
            logger.error(
                `Error cleaning up multer temp file ${chunk.path}:`,
                error
            );
        }
    } else {
        throw new Error('Chunk has neither buffer nor path');
    }

    fs.writeFileSync(chunkPath, chunkData);

    // Check if all chunks are received
    const receivedChunks = fs
        .readdirSync(chunkDir)
        .filter((f) => f.startsWith('chunk_')).length;

    // If all chunks are received, assemble the file
    if (receivedChunks === totalChunks) {
        logger.info(`All chunks received, assembling file: ${fileName}`);
        return await assembleChunks(fileId, fileName, mimeType);
    }

    return null; // File not complete yet
}

/**
 * Assemble all chunks into a complete file
 */
async function assembleChunks(
    fileId: string,
    fileName: string,
    mimeType: string
): Promise<string> {
    const chunkDir = path.join(TEMP_DIR, fileId);
    const assembledDir = path.join(process.cwd(), 'uploads', 'assembled');

    if (!fs.existsSync(assembledDir)) {
        fs.mkdirSync(assembledDir, { recursive: true });
    }

    const assembledFilePath = path.join(assembledDir, `${fileId}_${fileName}`);
    const writeStream = fs.createWriteStream(assembledFilePath);

    // Get all chunk files sorted by index
    const chunkFiles = fs
        .readdirSync(chunkDir)
        .filter((f) => f.startsWith('chunk_'))
        .sort((a, b) => {
            const indexA = parseInt(a.split('_')[1]);
            const indexB = parseInt(b.split('_')[1]);
            return indexA - indexB;
        });

    // Read and append each chunk in order
    for (const chunkFile of chunkFiles) {
        const chunkPath = path.join(chunkDir, chunkFile);
        const chunkData = fs.readFileSync(chunkPath);
        writeStream.write(chunkData);
    }

    writeStream.end();

    // Wait for stream to finish
    await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
    });

    logger.info(`File assembled successfully: ${fileName}`);

    // Clean up chunks directory
    try {
        fs.rmSync(chunkDir, { recursive: true, force: true });
        logger.info(`Cleaned up chunks directory for file: ${fileName}`);
    } catch (error) {
        logger.error(`Error cleaning up chunks directory: ${error}`);
    }

    return assembledFilePath;
}

/**
 * Check if file upload is chunked based on request headers
 */
export function isChunkedUpload(req: any): boolean {
    return req.headers['x-chunked-upload'] === 'true';
}

/**
 * Extract chunk information from request headers
 */
export function getChunkInfo(req: any): ChunkInfo | null {
    const fileId = req.headers['x-file-id'];
    const chunkIndex = parseInt(req.headers['x-chunk-index']);
    const totalChunks = parseInt(req.headers['x-total-chunks']);
    const fileName = req.headers['x-file-name'];
    const mimeType = req.headers['x-mime-type'];

    if (!fileId || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName) {
        return null;
    }

    return {
        fileId,
        chunkIndex,
        totalChunks,
        fileName,
        mimeType: mimeType || 'application/octet-stream',
    };
}

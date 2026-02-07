"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/aws/s3";
import { env } from "@/lib/env";
import { z } from "zod";

const generateUploadUrlSchema = z.object({
    fileName: z.string().min(1),
    contentType: z.enum(["application/pdf"]),
});

export async function getPresignedUploadUrl(fileName: string, contentType: string) {
    // 1. Validate input
    const result = generateUploadUrlSchema.safeParse({ fileName, contentType });

    if (!result.success) {
        throw new Error("Invalid input: Only PDF files are allowed.");
    }

    // 2. Generate unique key
    const uniqueKey = `${crypto.randomUUID()}-${fileName}`;

    // 3. Create command
    const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: uniqueKey,
        ContentType: contentType,
    });

    // 4. Generate signed URL
    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        return { url, key: uniqueKey };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw new Error("Failed to generate upload URL");
    }
}

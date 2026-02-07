import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

export const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function deleteFileFromS3(key: string) {
    if (!key) return;

    const command = new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key,
    });

    try {
        await s3Client.send(command);
        console.log(`Deleted S3 file: ${key}`);
    } catch (error) {
        console.error(`Failed to delete S3 file ${key}:`, error);
        // We generally don't want to throw here to avoid blocking the main flow
    }
}

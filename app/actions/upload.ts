"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/aws/s3";
import { env } from "@/lib/env";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

import { processBill, ExtractedData } from "@/lib/gemini";

export async function uploadAuditFiles(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const files = formData.getAll("files") as File[];
    const results: { key: string; analysis: ExtractedData | null }[] = [];

    for (const file of files) {
        if (!file.name) continue;

        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        const key = `uploads/${userId}/${randomUUID()}-${file.name}`;

        let analysis: ExtractedData | null = null;

        // Parallelize Upload and Analysis for speed
        try {
            const uploadPromise = s3Client.send(
                new PutObjectCommand({
                    Bucket: env.AWS_S3_BUCKET_NAME,
                    Key: key,
                    Body: buffer,
                    ContentType: file.type,
                })
            );

            // Only analyze PDFs or Images logic could be added here, 
            // but Gemini handles most. We'll try.
            const analysisPromise = processBill(buffer, file.type).catch(err => {
                console.error("AI Analysis Failed for " + file.name, err);
                return null;
            });

            const [_, extracted] = await Promise.all([uploadPromise, analysisPromise]);
            analysis = extracted;

            results.push({ key, analysis });
        } catch (error) {
            console.error("S3 Upload Error:", error);
            throw new Error("Failed to upload file: " + file.name);
        }
    }

    return results;
}

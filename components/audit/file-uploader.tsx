"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getPresignedUploadUrl } from "@/app/actions/storage";

interface FileUploaderProps {
    onUploadComplete: (s3Keys: string[]) => void;
    maxFiles?: number;
}

export function FileUploader({ onUploadComplete, maxFiles = 50 }: FileUploaderProps) {
    const [uploadState, setUploadState] = useState<"IDLE" | "UPLOADING" | "SUCCESS" | "ERROR">("IDLE");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        // 10MB Limit Check per file
        for (const file of acceptedFiles) {
            if (file.size > 10 * 1024 * 1024) {
                setErrorMsg(`File ${file.name} exceeds 10MB limit.`);
                setUploadState("ERROR");
                return;
            }
        }

        setUploadState("UPLOADING");
        setProgress(0);
        setErrorMsg(null);

        const uploadedKeys: string[] = [];
        let totalBytes = acceptedFiles.reduce((acc, f) => acc + f.size, 0);
        let loadedBytes = 0;

        try {
            for (const file of acceptedFiles) {
                // 1. Get Presigned URL
                const { url, key } = await getPresignedUploadUrl(file.name, file.type);

                // 2. Upload to S3 using XMLHttpRequest for progress tracking
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", url);
                    xhr.setRequestHeader("Content-Type", file.type);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            // This is progress for THIS file
                            // We need global progress.
                            // Simple approximation: add this file's loaded part to global loadedBytes
                            // But keeping track of previous file's loaded bytes is tricky in this loop without state.
                            // Simplified: Just ignore granular progress or track per-file.
                            // Let's do a simple per-file progress contribution.
                        }
                    };

                    // Since precise global progress with XHR in loop is complex, 
                    // let's just increment progress by file count for simplicity or try to estimate.
                    // Or just use the 'load' event to increment.

                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            loadedBytes += file.size;
                            setProgress(Math.round((loadedBytes / totalBytes) * 100));
                            resolve();
                        } else {
                            reject(new Error("Upload failed"));
                        }
                    };

                    xhr.onerror = () => reject(new Error("Network error"));
                    xhr.send(file);
                });

                uploadedKeys.push(key);
            }

            setUploadState("SUCCESS");
            onUploadComplete(uploadedKeys);

        } catch (err) {
            setUploadState("ERROR");
            setErrorMsg("Failed to upload one or more files.");
            console.error(err);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles, // Updated to allow multiple files
        disabled: uploadState === "UPLOADING" || uploadState === "SUCCESS"
    });

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${uploadState === "UPLOADING" ? "pointer-events-none opacity-50" : "hover:border-primary/50 hover:bg-muted/50"}
            ${uploadState === "SUCCESS" ? "border-green-500 bg-green-50" : ""}
            ${uploadState === "ERROR" ? "border-red-500 bg-red-50" : ""}
          `}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center justify-center gap-4">
                        {uploadState === "IDLE" && (
                            <>
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground">{isDragActive ? "Drop the files here" : "Upload up to 50 PDF bills"}</p>
                                </div>
                                <Button variant="secondary" onClick={(e) => { e.stopPropagation(); open(); }}>
                                    Select Files
                                </Button>
                            </>
                        )}

                        {uploadState === "UPLOADING" && (
                            <div className="w-full max-w-xs space-y-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <Progress value={progress} className="w-full" />
                                <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
                            </div>
                        )}

                        {uploadState === "SUCCESS" && (
                            <>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-green-900">Upload Complete</p>
                                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Success</Badge>
                                </div>
                            </>
                        )}

                        {uploadState === "ERROR" && (
                            <>
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-red-900">Upload Failed</p>
                                    <p className="text-sm text-red-600">{errorMsg || "An error occurred"}</p>
                                    <Button variant="outline" size="sm" onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadState("IDLE");
                                    }}>
                                        Try Again
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

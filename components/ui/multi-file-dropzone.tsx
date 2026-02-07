"use client";

import * as React from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MultiFileDropzoneProps {
    value: File[];
    onChange: (files: File[]) => void;
    onUpload?: (files: File[]) => Promise<void>;
    isUploading?: boolean;
}

export function MultiFileDropzone({
    value,
    onChange,
    onUpload,
    isUploading = false,
}: MultiFileDropzoneProps) {
    const onDrop = React.useCallback(
        (acceptedFiles: File[]) => {
            onChange([...value, ...acceptedFiles]);
        },
        [value, onChange]
    );

    const removeFile = (fileToRemove: File) => {
        onChange(value.filter((file) => file !== fileToRemove));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    return (
        <div className="w-full space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-10 transition-colors duration-200 ease-in-out flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[250px]",
                    isDragActive
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50/50"
                )}
            >
                <input {...getInputProps()} />
                <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
                    <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-lg font-medium text-slate-700">
                        Drag & drop execution bills here
                    </p>
                    <p className="text-sm text-slate-500">
                        Supports PDF, JPG, PNG (up to 10MB)
                    </p>
                </div>
                {value.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 animate-in fade-in zoom-in duration-300">
                        Forensic Analysis Activated
                    </Badge>
                )}
            </div>

            {value.length > 0 && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-900">Staging List ({value.length})</h4>
                        {onUpload && (
                            <Button onClick={() => onUpload(value)} disabled={isUploading} size="sm">
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isUploading ? "Uploading..." : "Start Upload"}
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {value.map((file, i) => (
                            <div
                                key={`${file.name}-${i}`}
                                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-slate-100 rounded-md">
                                        <FileIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-red-500"
                                    onClick={() => removeFile(file)}
                                    disabled={isUploading}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

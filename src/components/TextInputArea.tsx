"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export interface UploadedFile {
  name: string;
  type: string;
  base64: string;
  preview?: string;
}

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  placeholder?: string;
}

export default function TextInputArea({
  value,
  onChange,
  files,
  onFilesChange,
  placeholder = "Paste your lecture notes, article, or any text you want to learn from...",
}: TextInputAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const processFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = [];

    for (const file of fileList) {
      // Handle text files - read as text
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        onChange(value + (value ? "\n\n" : "") + text);
        continue;
      }

      // Handle images and other files - convert to base64
      const base64 = await fileToBase64(file);
      const uploadedFile: UploadedFile = {
        name: file.name,
        type: file.type,
        base64,
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await processFiles(selectedFiles);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    // Revoke preview URL to prevent memory leaks
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const acceptedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain",
  ].join(",");

  return (
    <div className="space-y-4">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group"
            >
              {file.preview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-600">
                  <Image
                    src={file.preview}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-slate-700/50 border border-slate-600 flex flex-col items-center justify-center p-2">
                  <svg
                    className="w-8 h-8 text-slate-400 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-xs text-slate-400 text-center truncate w-full">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}
              {/* Remove button */}
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* File name tooltip */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 truncate max-w-[100px] text-center">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-cyan-400 bg-cyan-500/5"
            : "border-slate-700 hover:border-slate-600"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-80 p-6 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-lg leading-relaxed"
        />

        {/* File upload overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-2xl">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-cyan-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-cyan-400 font-medium">Drop your files here</p>
              <p className="text-slate-500 text-sm mt-1">Images, PDFs, or text files</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4 text-slate-500">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          {files.length > 0 && (
            <span className="text-cyan-400">{files.length} file{files.length > 1 ? "s" : ""} attached</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={acceptedTypes}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upload Files
          </button>

          {(value || files.length > 0) && (
            <button
              onClick={() => {
                onChange("");
                // Revoke all preview URLs
                files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
                onFilesChange([]);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Supported formats hint */}
      <p className="text-xs text-slate-600 text-center">
        Supports: PNG, JPEG, WebP, GIF, PDF, and text files. Gemini AI will analyze all content.
      </p>
    </div>
  );
}

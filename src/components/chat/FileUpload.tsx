import { useState, useRef } from "react";
import { Paperclip, X, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "document";
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function FileUpload({
  files,
  onFilesChange,
  disabled = false,
  maxFiles = 5,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const remainingSlots = maxFiles - files.length;
    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    const newFiles: UploadedFile[] = filesToAdd.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: crypto.randomUUID(),
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
        type: isImage ? "image" : "document",
      };
    });

    onFilesChange([...files, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt,.md,.doc,.docx"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || files.length >= maxFiles}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || files.length >= maxFiles}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Paperclip className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface FilePreviewListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function FilePreviewList({ files, onRemove, disabled }: FilePreviewListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-secondary/50 rounded-t-xl border border-b-0 border-border">
      {files.map((file) => (
        <div
          key={file.id}
          className="relative group bg-muted rounded-lg overflow-hidden flex items-center gap-2 pr-2"
        >
          {file.type === "image" && file.preview ? (
            <img
              src={file.preview}
              alt={file.file.name}
              className="w-12 h-12 object-cover"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-accent">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="text-xs text-foreground max-w-[100px] truncate">
            {file.file.name}
          </span>
          <button
            onClick={() => onRemove(file.id)}
            disabled={disabled}
            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

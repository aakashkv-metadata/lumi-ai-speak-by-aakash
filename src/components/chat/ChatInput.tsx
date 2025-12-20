import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUpload, FilePreviewList, UploadedFile } from "./FileUpload";

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Message Lumina AI...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if ((input.trim() || files.length > 0) && !disabled) {
      onSend(input.trim(), files.length > 0 ? files : undefined);
      setInput("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(files.filter((f) => f.id !== id));
  };

  return (
    <div className="relative">
      <FilePreviewList files={files} onRemove={handleRemoveFile} disabled={disabled} />
      <div className={cn("relative", files.length > 0 && "rounded-t-none")}>
        <div className="absolute left-2 bottom-2 z-10">
          <FileUpload files={files} onFilesChange={setFiles} disabled={disabled} />
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "chat-input pl-12",
            disabled && "opacity-50 cursor-not-allowed",
            files.length > 0 && "rounded-t-none border-t-0"
          )}
        />
        <Button
          onClick={handleSubmit}
          disabled={(!input.trim() && files.length === 0) || disabled}
          size="icon"
          className={cn(
            "absolute right-2 bottom-2 w-8 h-8 rounded-lg transition-all",
            (input.trim() || files.length > 0) && !disabled
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

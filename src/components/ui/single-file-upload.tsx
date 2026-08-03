import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface SingleFileUploadProps {
  onFileChange: (file: File | null) => void;
  label?: string;
  accept?: string;
  currentImageUrl?: string;
}

export interface SingleFileUploadRef {
  reset: () => void;
}

const SingleFileUpload = forwardRef<SingleFileUploadRef, SingleFileUploadProps>(({ 
  onFileChange, 
  label = "Upload File", 
  accept = ".csv",
  currentImageUrl
}, ref) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelectedFile(null);
      onFileChange(null);
    }
  }));

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (accept === "image/*" && !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    onFileChange(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Current Image Preview (for edit mode) */}
      {currentImageUrl && !selectedFile && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Current image:</p>
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden border">
            <img
              src={currentImageUrl}
              alt="Current"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium mb-1">Drag and drop {accept === "image/*" ? "an image" : "a file"} here</p>
        <p className="text-xs text-muted-foreground">or click to browse</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {selectedFile && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {currentImageUrl ? "New file selected:" : "Selected file:"}
          </p>
          <div className="relative inline-block">
            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden border">
              {accept === "image/*" ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  {selectedFile.name.split('.').pop()?.toUpperCase()}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeFile}
              className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SingleFileUpload;

import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  label?: string;
  multiple?: boolean;
  accept?: string;
}

export interface FileUploadRef {
  reset: () => void;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({ 
  onFilesChange, 
  label = "Upload Files", 
  multiple = true,
  accept = ".csv"
}, ref) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelectedFiles([]);
      onFilesChange([]);
    }
  }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="files">{label}</Label>
      <Input
        id="files"
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
      />
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selected {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}:
          </p>
          <div className="space-y-1">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default FileUpload;
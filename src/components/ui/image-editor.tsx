import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Loader2 } from "lucide-react";
import { BASE_URL } from "@/constants/api";
import { toast } from "sonner";

interface ImageEditorProps {
  initialImages: string[];
  onImagesChange: (finalImages: string[], newFiles: File[], deletedImages: string[]) => void;
  label?: string;
  disabled?: boolean;
}

const ImageEditor = ({ 
  initialImages = [], 
  onImagesChange, 
  label = "Images", 
  disabled = false 
}: ImageEditorProps) => {
  const [finalImages, setFinalImages] = useState<string[]>(initialImages);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFinalImages(initialImages);
    setDeletedImages([]);
  }, [initialImages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const updatedNewFiles = [...newFiles, ...files];
    setNewFiles(updatedNewFiles);
    onImagesChange(finalImages, updatedNewFiles, deletedImages);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (imageUrl: string) => {
    setDeletingImage(imageUrl);
    
    setTimeout(() => {
      const updatedImages = finalImages.filter(img => img !== imageUrl);
      const updatedDeletedImages = [...deletedImages, imageUrl];
      setFinalImages(updatedImages);
      setDeletedImages(updatedDeletedImages);
      onImagesChange(updatedImages, newFiles, updatedDeletedImages);
      setDeletingImage(null);
      toast.success("Image will be deleted on save");
    }, 300);
  };

  const removeNewFile = (index: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    onImagesChange(finalImages, updatedFiles, deletedImages);
  };

  const totalImages = finalImages.length + newFiles.length;

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* File Input */}
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Add Images
        </Button>
      </div>

      {/* Current Images Display */}
      {totalImages > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {totalImages} image{totalImages > 1 ? 's' : ''} selected
          </p>

          {/* Existing Images */}
          {finalImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Images:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {finalImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={`${imageUrl}`}
                        alt={`Current image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {deletingImage === imageUrl && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExistingImage(imageUrl)}
                      disabled={disabled || deletingImage === imageUrl}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Files */}
          {newFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">New Images to Upload:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {newFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeNewFile(index)}
                      disabled={disabled}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="bg-black/70 text-white text-xs p-1 rounded truncate">
                        {file.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
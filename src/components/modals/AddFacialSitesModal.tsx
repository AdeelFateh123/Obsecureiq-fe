import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload, { ImageUploadRef } from "@/components/ui/image-upload";

interface AddFacialSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    siteName: string;
    imageFiles: FileList;
  }) => Promise<void>;
}

const AddFacialSitesModal = ({ isOpen, onClose, onAdd }: AddFacialSitesModalProps) => {
  const [siteName, setSiteName] = useState("PimEyes");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  const handleSubmit = async () => {
    if (imageFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Convert File[] to FileList-like object
      const fileList = {
        length: imageFiles.length,
        item: (index: number) => imageFiles[index],
        [Symbol.iterator]: function* () {
          for (let i = 0; i < imageFiles.length; i++) {
            yield imageFiles[i];
          }
        }
      } as FileList;
      
      await onAdd({ siteName, imageFiles: fileList });
      handleClose();
    } catch (error) {
      console.error('Failed to add facial sites record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSiteName("PimEyes");
    setImageFiles([]);
    imageUploadRef.current?.reset();
    onClose();
  };

  const handleImagesChange = (files: File[]) => {
    setImageFiles(files);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Facial Recognition Site Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="siteName">Site Name *</Label>
            <Select value={siteName} onValueChange={setSiteName}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="PimEyes">PimEyes</SelectItem>
                <SelectItem value="FaceCheck.ID">FaceCheck.ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUpload
            ref={imageUploadRef}
            onImagesChange={handleImagesChange}
            label="Upload Images *"
            multiple={true}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="action" 
            onClick={handleSubmit}
            disabled={imageFiles.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Adding..." : `Add Record${imageFiles.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacialSitesModal;

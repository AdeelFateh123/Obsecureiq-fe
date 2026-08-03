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

interface AddHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    imageType: string;
    imageFiles: File[];
  }) => Promise<void>;
}

const AddHeatmapModal = ({ isOpen, onClose, onAdd }: AddHeatmapModalProps) => {
  const [imageType, setImageType] = useState("Heatmap");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  const handleSubmit = async () => {
    if (imageFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onAdd({ imageType, imageFiles });
      handleClose();
    } catch (error) {
      console.error('Failed to add heatmap:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setImageType("Heatmap");
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
          <DialogTitle>Add Heatmap Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="imageType">Image Type *</Label>
            <Select value={imageType} onValueChange={setImageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Heatmap">Heatmap</SelectItem>
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

export default AddHeatmapModal;
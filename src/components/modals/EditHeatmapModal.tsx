import { useState, useEffect, useRef } from "react";
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
import SingleFileUpload, { SingleFileUploadRef } from "@/components/ui/single-file-upload";
import { BASE_URL } from "@/constants/api";

interface HeatmapRecord {
  id: string;
  imageType: string;
  imageUrl: string;
}

interface EditHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HeatmapRecord;
  onUpdate: (record: HeatmapRecord, newImageFile?: File) => Promise<void>;
}

const EditHeatmapModal = ({ isOpen, onClose, record, onUpdate }: EditHeatmapModalProps) => {
  const [imageType, setImageType] = useState("Heatmap");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileUploadRef = useRef<SingleFileUploadRef>(null);

  useEffect(() => {
    setImageType(record.imageType || "Heatmap");
    setImageFile(null);
    fileUploadRef.current?.reset();
  }, [record]);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...record, imageType }, imageFile);
      onClose();
    } catch (error) {
      console.error('Failed to update heatmap:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Heatmap Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-imageType">Image Type *</Label>
            <Select value={imageType} onValueChange={setImageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Heatmap">Heatmap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Current image:</p>
            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden border">
              <img
                src={`${record.imageUrl}`}
                alt="Current image"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Image not found
              </div>
            </div>
          </div>

          <SingleFileUpload
            ref={fileUploadRef}
            onFileChange={handleFileChange}
            label="Upload New Image *"
            accept="image/*"
          />
          <p className="text-sm text-muted-foreground">
            Select a new image to replace the current one
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="action" 
            onClick={handleSubmit}
            disabled={!imageFile || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditHeatmapModal;
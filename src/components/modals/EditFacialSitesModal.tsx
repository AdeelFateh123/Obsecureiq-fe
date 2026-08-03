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
import ImageUpload, { ImageUploadRef } from "@/components/ui/image-upload";
import { X } from "lucide-react";

interface FacialSitesRecord {
  id: string;
  site_name: string;
  images: string[];
}

interface EditFacialSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FacialSitesRecord;
  onUpdate: (record: any) => Promise<void>;
}

const EditFacialSitesModal = ({ isOpen, onClose, record, onUpdate }: EditFacialSitesModalProps) => {
  const [siteName, setSiteName] = useState(record.site_name);
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  useEffect(() => {
    if (record) {
      setSiteName(record.site_name);
      setImages(record.images || []);
      setNewImageFiles([]);
      imageUploadRef.current?.reset();
    }
  }, [record]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate({
        ...record,
        site_name: siteName,
        remainingImages: images, // Images that user kept (after removing some)
        newImageFiles, // New images user uploaded
      });
      onClose();
    } catch (error) {
      console.error('Failed to update facial sites record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewImagesChange = (files: File[]) => {
    setNewImageFiles(files);
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImages(prev => prev.filter(img => img !== imageUrl));
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Facial Recognition Site Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-siteName">Site Name *</Label>
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

          {/* Existing Images */}
          {images.length > 0 && (
            <div className="space-y-2">
              <Label>Existing Images (Click × to remove)</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                      <img
                        src={`${imageUrl}`}
                        alt={`Existing image ${index + 1}`}
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
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove this image"
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <ImageUpload
            ref={imageUploadRef}
            onImagesChange={handleNewImagesChange}
            label="Upload New Images"
            multiple={true}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="action" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFacialSitesModal;

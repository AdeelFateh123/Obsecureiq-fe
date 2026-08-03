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

interface AddBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    brokerName: string;
    imageFiles: FileList;
  }) => Promise<void>;
}

const AddBrokerModal = ({ isOpen, onClose, onAdd }: AddBrokerModalProps) => {
  const [brokerName, setBrokerName] = useState("Infotracer");
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
      
      await onAdd({ brokerName, imageFiles: fileList });
      handleClose();
    } catch (error) {
      console.error('Failed to add broker record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBrokerName("Infotracer");
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
          <DialogTitle>Add Broker Screen Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="brokerName">Broker Name *</Label>
            <Select value={brokerName} onValueChange={setBrokerName}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="Infotracer">Infotracer</SelectItem>
                <SelectItem value="Intelius">Intelius</SelectItem>
                <SelectItem value="BeenVerified">BeenVerified</SelectItem>
                <SelectItem value="Instant Checkmate">Instant Checkmate</SelectItem>
                <SelectItem value="US Search">US Search</SelectItem>
                <SelectItem value="Social Catfish">Social Catfish</SelectItem>
                <SelectItem value="NumLookup">NumLookup</SelectItem>
                <SelectItem value="WhitePages">WhitePages</SelectItem>
                <SelectItem value="IDCrawl">IDCrawl</SelectItem>
                <SelectItem value="Radaris">Radaris</SelectItem>
                <SelectItem value="Reverse Phone Check">Reverse Phone Check</SelectItem>
                <SelectItem value="Search Public Records">Search Public Records</SelectItem>
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
            disabled={isSubmitting || imageFiles.length === 0}
          >
            {isSubmitting ? "Adding..." : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBrokerModal;

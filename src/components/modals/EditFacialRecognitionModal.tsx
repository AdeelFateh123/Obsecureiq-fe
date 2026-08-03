import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FacialRecognitionRecord {
  id: string;
  url: string;
}

interface EditFacialRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FacialRecognitionRecord;
  onUpdate: (record: FacialRecognitionRecord) => Promise<void>;
}

const EditFacialRecognitionModal = ({ isOpen, onClose, record, onUpdate }: EditFacialRecognitionModalProps) => {
  const [url, setUrl] = useState(record.url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUrl(record.url);
  }, [record]);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...record, url });
      onClose();
    } catch (error) {
      console.error('Failed to update facial recognition record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Facial Recognition Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-url">Recognition URL *</Label>
            <Input
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
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

export default EditFacialRecognitionModal;

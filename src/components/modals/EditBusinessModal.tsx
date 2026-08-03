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
import { Textarea } from "@/components/ui/textarea";

interface BusinessRecord {
  id: string;
  business_name: string;
  business_information: string;
}

interface EditBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BusinessRecord;
  onUpdate: (record: BusinessRecord) => Promise<void>;
}

const EditBusinessModal = ({ isOpen, onClose, record, onUpdate }: EditBusinessModalProps) => {
  const [businessName, setBusinessName] = useState(record.business_name);
  const [businessInformation, setBusinessInformation] = useState(record.business_information);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBusinessName(record.business_name);
    setBusinessInformation(record.business_information);
  }, [record]);

  const handleSubmit = async () => {
    if (!businessName.trim() || !businessInformation.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...record, business_name: businessName, business_information: businessInformation });
      onClose();
    } catch (error) {
      console.error('Failed to update business record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Business Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-businessName">Business Name *</Label>
            <Input
              id="edit-businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
            />
          </div>

          <div>
            <Label htmlFor="edit-businessInformation">Business Information *</Label>
            <Textarea
              id="edit-businessInformation"
              value={businessInformation}
              onChange={(e) => setBusinessInformation(e.target.value)}
              placeholder="Enter business information..."
              rows={6}
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
            disabled={isSubmitting || !businessName.trim() || !businessInformation.trim()}
          >
            {isSubmitting ? "Updating..." : "Update Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBusinessModal;

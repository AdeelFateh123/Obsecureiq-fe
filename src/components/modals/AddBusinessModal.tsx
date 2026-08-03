import { useState } from "react";
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

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (records: Array<{
    businessName: string;
    businessInformation: string;
  }>) => Promise<void>;
}

const AddBusinessModal = ({ isOpen, onClose, onAdd }: AddBusinessModalProps) => {
  const [businessName, setBusinessName] = useState("");
  const [businessInformation, setBusinessInformation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!businessName.trim() || !businessInformation.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAdd([{ businessName, businessInformation }]);
      handleClose();
    } catch (error) {
      console.error('Failed to add business record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBusinessName("");
    setBusinessInformation("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Business Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
            />
          </div>

          <div>
            <Label htmlFor="businessInformation">Business Information *</Label>
            <Textarea
              id="businessInformation"
              value={businessInformation}
              onChange={(e) => setBusinessInformation(e.target.value)}
              placeholder="Enter business information..."
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="action" 
            onClick={handleSubmit}
            disabled={isSubmitting || !businessName.trim() || !businessInformation.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBusinessModal;

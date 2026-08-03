import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhoneRecord {
  id: string;
  phoneNumber: string;
  clientProvided: string;
}

interface EditPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: PhoneRecord;
  onUpdate: (phone: PhoneRecord) => Promise<void>;
}

const EditPhoneModal = ({ isOpen, onClose, phone, onUpdate }: EditPhoneModalProps) => {
  const [formData, setFormData] = useState(phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(phone);
  }, [phone]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.phoneNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...formData, phoneNumber: formData.phoneNumber.trim() });
      // Only close modal if operation was successful
      onClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to update phone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Phone Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="clientProvided">Client Provided</Label>
            <Select
              value={formData.clientProvided}
              onValueChange={(value) =>
                setFormData({ ...formData, clientProvided: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="action" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPhoneModal;

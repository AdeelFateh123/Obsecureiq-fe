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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailRecord {
  id: string;
  email: string;
  validationSource: string;
  status: string;
  emailTagAutomation: boolean;
}

interface EditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: EmailRecord;
  onUpdate: (email: EmailRecord) => Promise<void>;
}

const EditEmailModal = ({ isOpen, onClose, email, onUpdate }: EditEmailModalProps) => {
  const [formData, setFormData] = useState(email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(email);
  }, [email]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...formData, email: formData.email.trim() });
      // Only close modal if operation was successful
      onClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to update email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Email Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label>Validation Source (Multi-select)</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-osint"
                  checked={formData.validationSource.includes("OSINT")}
                  onCheckedChange={(checked) => {
                    const sources = formData.validationSource.split(", ").filter(s => s);
                    if (checked) {
                      setFormData({ ...formData, validationSource: [...sources, "OSINT"].join(", ") });
                    } else {
                      setFormData({ ...formData, validationSource: sources.filter(s => s !== "OSINT").join(", ") });
                    }
                  }}
                />
                <Label htmlFor="edit-osint" className="cursor-pointer">OSINT</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-snusbase"
                  checked={formData.validationSource.includes("Snusbase")}
                  onCheckedChange={(checked) => {
                    const sources = formData.validationSource.split(", ").filter(s => s);
                    if (checked) {
                      setFormData({ ...formData, validationSource: [...sources, "Snusbase"].join(", ") });
                    } else {
                      setFormData({ ...formData, validationSource: sources.filter(s => s !== "Snusbase").join(", ") });
                    }
                  }}
                />
                <Label htmlFor="edit-snusbase" className="cursor-pointer">Snusbase</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Client Provided">Client Provided</SelectItem>
                <SelectItem value="Low Confidence">Low Confidence</SelectItem>
                <SelectItem value="Low/Medium Confidence">Low/Medium Confidence</SelectItem>
                <SelectItem value="Medium Confidence">Medium Confidence</SelectItem>
                <SelectItem value="Medium/High Confidence">Medium/High Confidence</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailTagAutomation"
              checked={formData.emailTagAutomation}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, emailTagAutomation: checked as boolean })
              }
            />
            <Label htmlFor="emailTagAutomation">Email Tag Automation</Label>
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

export default EditEmailModal;

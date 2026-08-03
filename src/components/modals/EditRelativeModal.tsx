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

interface RelativeRecord {
  id: string;
  relationship: string;
  name: string;
}

interface EditRelativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  relative: RelativeRecord;
  onUpdate: (relative: RelativeRecord) => Promise<void>;
}

const EditRelativeModal = ({ isOpen, onClose, relative, onUpdate }: EditRelativeModalProps) => {
  const [relationship, setRelationship] = useState(relative.relationship);
  const [name, setName] = useState(relative.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setRelationship(relative.relationship);
    setName(relative.name);
  }, [relative]);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...relative, relationship, name: name.trim() });
      // Only close modal if operation was successful
      onClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to update relative:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Relative Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>

          <div>
            <Label htmlFor="edit-relationship">Relationship</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Associate">Associate</SelectItem>
                <SelectItem value="Relative">Relative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="action" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRelativeModal;

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddVoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (records: Array<{
    voterRecord: string;
  }>) => Promise<void>;
}

const AddVoterModal = ({ isOpen, onClose, onAdd }: AddVoterModalProps) => {
  const [voterRecord, setVoterRecord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!voterRecord.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAdd([{ voterRecord }]);
      handleClose();
    } catch (error) {
      console.error('Failed to add voter record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVoterRecord("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Voter Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="voterRecord">Voter Record *</Label>
            <Textarea
              id="voterRecord"
              value={voterRecord}
              onChange={(e) => setVoterRecord(e.target.value)}
              placeholder="Enter voter record details..."
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="action" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVoterModal;

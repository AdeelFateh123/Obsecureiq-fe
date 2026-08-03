import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VoterRecord {
  id: string;
  voter_record: string;
}

interface EditVoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: VoterRecord;
  onUpdate: (record: VoterRecord) => Promise<void>;
}

const EditVoterModal = ({ isOpen, onClose, record, onUpdate }: EditVoterModalProps) => {
  const [voterRecord, setVoterRecord] = useState(record.voter_record);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setVoterRecord(record.voter_record);
  }, [record]);

  const handleSubmit = async () => {
    if (!voterRecord.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...record, voter_record: voterRecord });
      onClose();
    } catch (error) {
      console.error('Failed to update voter record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Voter Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-voterRecord">Voter Record *</Label>
            <Textarea
              id="edit-voterRecord"
              value={voterRecord}
              onChange={(e) => setVoterRecord(e.target.value)}
              placeholder="Enter voter record details..."
              rows={6}
            />
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

export default EditVoterModal;

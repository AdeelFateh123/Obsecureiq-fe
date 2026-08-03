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

interface DmvRecord {
  id: string;
  dvm_record: string;
}

interface EditDmvModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DmvRecord;
  onUpdate: (record: DmvRecord) => Promise<void>;
}

const EditDmvModal = ({ isOpen, onClose, record, onUpdate }: EditDmvModalProps) => {
  const [dmvRecord, setDmvRecord] = useState(record.dvm_record);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDmvRecord(record.dvm_record);
  }, [record]);

  const handleSubmit = async () => {
    if (!dmvRecord.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...record, dvm_record: dmvRecord });
      onClose();
    } catch (error) {
      console.error('Failed to update DMV record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit DMV Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-dmvRecord">DMV Record *</Label>
            <Textarea
              id="edit-dmvRecord"
              value={dmvRecord}
              onChange={(e) => setDmvRecord(e.target.value)}
              placeholder="Enter DMV record details..."
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

export default EditDmvModal;

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

interface AddDmvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (records: Array<{
    dvmRecord: string;
  }>) => Promise<void>;
}

const AddDmvModal = ({ isOpen, onClose, onAdd }: AddDmvModalProps) => {
  const [dvmRecord, setDvmRecord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!dvmRecord.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAdd([{ dvmRecord }]);
      handleClose();
    } catch (error) {
      console.error('Failed to add DMM record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDvmRecord("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add DMV Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="dvmRecord">DMV Record *</Label>
            <Textarea
              id="dvmRecord"
              value={dvmRecord}
              onChange={(e) => setDvmRecord(e.target.value)}
              placeholder="Enter DMV record details..."
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
            disabled={isSubmitting || !dvmRecord.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDmvModal;

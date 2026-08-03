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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GovernmentRecord {
  id: string;
  record_type: string;
  record: string;
}

interface EditGovernmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: GovernmentRecord;
  onUpdate: (record: GovernmentRecord) => Promise<void>;
}

const EditGovernmentModal = ({ isOpen, onClose, record, onUpdate }: EditGovernmentModalProps) => {
  const [recordType, setRecordType] = useState(record.record_type);
  const [recordInformation, setRecordInformation] = useState(record.record);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRecordType(record.record_type);
    setRecordInformation(record.record);
  }, [record]);

  const handleSubmit = async () => {
    if (!recordInformation.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...record, record_type: recordType, record: recordInformation });
      onClose();
    } catch (error) {
      console.error('Failed to update government record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Government Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-recordType">Record Type</Label>
            <Select value={recordType} onValueChange={setRecordType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Citations">Citations</SelectItem>
                <SelectItem value="Liens">Liens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-recordInformation">Record Information *</Label>
            <Textarea
              id="edit-recordInformation"
              value={recordInformation}
              onChange={(e) => setRecordInformation(e.target.value)}
              placeholder="Enter record information..."
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

export default EditGovernmentModal;

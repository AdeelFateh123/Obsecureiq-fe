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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddGovernmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (records: Array<{
    recordType: string;
    record: string;
  }>) => Promise<void>;
}

const AddGovernmentModal = ({ isOpen, onClose, onAdd }: AddGovernmentModalProps) => {
  const [recordType, setRecordType] = useState("Citations");
  const [record, setRecord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!record.trim()) {
      alert("Record information is required");
      return;
    }
    
    if (!recordType.trim()) {
      alert("Record type is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAdd([{ recordType, record }]);
      handleClose();
    } catch (error) {
      console.error('Failed to add government record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRecordType("Citations");
    setRecord("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Government Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="recordType">Record Type</Label>
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
            <Label htmlFor="record">Record Information *</Label>
            <Textarea
              id="record"
              value={record}
              onChange={(e) => setRecord(e.target.value)}
              placeholder="Enter record information..."
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
            disabled={isSubmitting || !record.trim() || !recordType.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGovernmentModal;

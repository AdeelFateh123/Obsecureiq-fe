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

interface AddDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (csvFile: File) => Promise<void>;
}

const AddDonorModal = ({ isOpen, onClose, onAdd }: AddDonorModalProps) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!csvFile) {
      alert("Please select a CSV file");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAdd(csvFile);
      handleClose();
    } catch (error) {
      console.error('Failed to add donor record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCsvFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Donor Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="csvFile">Upload CSV File *</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload a CSV file containing donor records
            </p>
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

export default AddDonorModal;

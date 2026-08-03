import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DonorRecord {
  id: string;
  contributor_name: string | null;
  recipient: string | null;
  recipient_date: string | null;
  contribution_amount: string | null;
  csv_file: string | null;
}

interface EditDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DonorRecord;
  onUpdate: (record: DonorRecord, newCsvFile?: File) => Promise<void>;
}

const EditDonorModal = ({ isOpen, onClose, record, onUpdate }: EditDonorModalProps) => {
  const [contributorName, setContributorName] = useState(record.contributor_name || '');
  const [recipient, setRecipient] = useState(record.recipient || '');
  const [recipientDate, setRecipientDate] = useState(record.recipient_date || '');
  const [contributionAmount, setContributionAmount] = useState(record.contribution_amount || '');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setContributorName(record.contributor_name || '');
    setRecipient(record.recipient || '');
    setRecipientDate(record.recipient_date || '');
    setContributionAmount(record.contribution_amount || '');
    setCsvFile(null);
    setIsSubmitting(false);
  }, [record]);

  const handleSubmit = async () => {
    // Validate required fields
    if (!contributorName.trim()) {
      alert("Contributor name is required");
      return;
    }
    if (!recipient.trim()) {
      alert("Recipient is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate({
        ...record,
        contributor_name: contributorName.trim(),
        recipient: recipient.trim(),
        recipient_date: recipientDate || null,
        contribution_amount: contributionAmount.trim() || null
      }, csvFile || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to update donor record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Donor Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-contributorName">Contributor Name *</Label>
            <Input
              id="edit-contributorName"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="Enter contributor name"
            />
          </div>

          <div>
            <Label htmlFor="edit-recipient">Recipient *</Label>
            <Input
              id="edit-recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient"
            />
          </div>

          <div>
            <Label htmlFor="edit-recipientDate">Recipient Date</Label>
            <Input
              id="edit-recipientDate"
              type="date"
              value={recipientDate}
              onChange={(e) => setRecipientDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="edit-contributionAmount">Contribution Amount</Label>
            <Input
              id="edit-contributionAmount"
              type="text"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              placeholder="Enter amount (e.g., 1000.00)"
            />
          </div>

          {record.csv_file && (
            <div>
              <Label>Current CSV File</Label>
              <p className="text-sm text-muted-foreground">
                A CSV file is already attached to this record
              </p>
            </div>
          )}
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

export default EditDonorModal;

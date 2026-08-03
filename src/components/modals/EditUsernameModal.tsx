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
import { useToast } from "@/hooks/use-toast";

interface UsernameRecord {
  id: string;
  username: string;
}

interface EditUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: UsernameRecord;
  onUpdate: (username: UsernameRecord) => Promise<void>;
}

const EditUsernameModal = ({ isOpen, onClose, username, onUpdate }: EditUsernameModalProps) => {
  const [usernameValue, setUsernameValue] = useState(username.username);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setUsernameValue(username.username);
  }, [username]);

  const handleSubmit = async () => {
    // Validation
    if (!usernameValue.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onUpdate({ ...username, username: usernameValue.trim() });
      // Only close modal if operation was successful
      onClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to update username:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Username Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-username">Username *</Label>
            <Input
              id="edit-username"
              value={usernameValue}
              onChange={(e) => setUsernameValue(e.target.value)}
              placeholder="Enter username"
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

export default EditUsernameModal;

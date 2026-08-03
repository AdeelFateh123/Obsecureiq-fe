import { Dialog, DialogContent } from "@/components/ui/dialog";
import ClientForm from "@/components/forms/ClientForm";
import { useState } from "react";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (clientData: any) => Promise<void>;
}

const AddClientModal = ({ isOpen, onClose, onAdd }: AddClientModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (clientData: any) => {
    setIsLoading(true);
    try {
      await onAdd(clientData);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <ClientForm
            onSave={handleSave}
            onCancel={onClose}
            isLoading={isLoading}
            title="Add New Client"
            saveButtonText="Add Client"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;

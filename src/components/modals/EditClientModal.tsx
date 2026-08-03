import { Dialog, DialogContent } from "@/components/ui/dialog";
import ClientForm from "@/components/forms/ClientForm";
import { useState } from "react";

interface Client {
  ID: string;
  full_name: string;
  other_names?: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  sex?: string;
  organization?: string;
  employer?: string;
  darkside_module: boolean;
  snubase_module: boolean;
  profile_photo_url?: string;
}

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (clientData: any) => Promise<void>;
  client: Client | null;
}

const EditClientModal = ({ isOpen, onClose, onUpdate, client }: EditClientModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (clientData: any) => {
    setIsLoading(true);
    try {
      await onUpdate(clientData);
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
            initialData={client}
            onSave={handleSave}
            onCancel={onClose}
            isLoading={isLoading}
            title="Edit Client"
            saveButtonText="Update Client"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientModal;

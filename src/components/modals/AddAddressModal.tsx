import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (records: Array<{
    address: string;
    client_provided: string;
  }>, bulkText?: string) => Promise<void>;
}

const AddAddressModal = ({ isOpen, onClose, onAdd }: AddAddressModalProps) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [address, setAddress] = useState("");
  const [clientProvided, setClientProvided] = useState("Yes");
  const [bulkText, setBulkText] = useState("");
  const [bulkClientProvided, setBulkClientProvided] = useState("Yes");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (mode === "single") {
        if (!address.trim()) return;
        
        await onAdd([{
          address: address.trim(),
          client_provided: clientProvided
        }]);
        handleClose();
      } else {
        if (!bulkText.trim()) return;
        
        // Use bulk upload API
        await onAdd([], bulkText.trim(), bulkClientProvided);
        handleClose();
      }
    } catch (error) {
      console.error("Error adding address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAddress("");
    setClientProvided("Yes");
    setBulkText("");
    setBulkClientProvided("Yes");
    setMode("single");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Address Record</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">One-by-One</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street, Suite 100, New York, NY 10001"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="clientProvided">Client Provided</Label>
              <Select value={clientProvided} onValueChange={setClientProvided}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="bulkAddresses">Enter Addresses</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter addresses in any format. One address per line.
              </p>
              <Textarea
                id="bulkAddresses"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`123 Main St, Suite 100, New York, NY 10001
456 Oak Ave, Beverly Hills, CA 90210`}
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="bulkClientProvided">Client Provided</Label>
              <Select value={bulkClientProvided} onValueChange={setBulkClientProvided}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="action" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : `Add Record${mode === "bulk" ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAddressModal;

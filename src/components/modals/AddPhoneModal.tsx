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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface AddPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (phones: Array<{
    phoneNumber: string;
    clientProvided: string;
  }>) => Promise<void>;
}

const AddPhoneModal = ({ isOpen, onClose, onAdd }: AddPhoneModalProps) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [clientProvided, setClientProvided] = useState("Yes");
  const [bulkText, setBulkText] = useState("");
  const [bulkClientProvided, setBulkClientProvided] = useState("No");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validation for single mode
    if (mode === "single") {
      if (!phoneNumber.trim()) {
        toast({
          title: "Validation Error",
          description: "Phone number is required",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validation for bulk mode
    if (mode === "bulk") {
      if (!bulkText.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one phone number",
          variant: "destructive",
        });
        return;
      }
      
      const phones = bulkText.split("\n").map((p) => p.trim()).filter((p) => p);
      if (phones.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one valid phone number",
          variant: "destructive",
        });
        return;
      }
      
      // Check if any line contains comma-separated phone numbers
      const linesWithCommas = phones.filter(phone => phone.includes(","));
      if (linesWithCommas.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please add phone numbers according to the instructions provided. Enter one phone number per line, not comma-separated.",
          variant: "destructive",
        });
        return;
      }
      

    }
    
    setIsSubmitting(true);
    try {
      if (mode === "single") {
        await onAdd([{ phoneNumber: phoneNumber.trim(), clientProvided: clientProvided || "Yes" }]);
      } else {
        const phones = bulkText.split("\n").map((p) => p.trim()).filter((p) => p);
        const records = phones.map((p) => ({
          phoneNumber: p,
          clientProvided: bulkClientProvided,
        }));
        await onAdd(records);
      }
      // Only close modal if operation was successful
      handleClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to add phone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    setClientProvided("Yes");
    setBulkText("");
    setBulkClientProvided("No");
    setMode("single");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Phone Record</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">One-by-One</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
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

            <div>
              <Label htmlFor="bulkPhones">Enter Phone Numbers</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter one phone number per line.
              </p>
              <Textarea
                id="bulkPhones"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`+1 555-123-4567
+44 20 7946 0958
+91 98765 43210
+33 1 42 86 83 26`}
                rows={8}
              />
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

export default AddPhoneModal;

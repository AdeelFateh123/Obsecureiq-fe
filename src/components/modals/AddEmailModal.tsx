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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface AddEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (emails: Array<{
    email: string;
    validationSource: string;
    status: string;
    emailTagAutomation: boolean;
  }>, isBulkMode?: boolean) => Promise<void>;
}

const AddEmailModal = ({ isOpen, onClose, onAdd }: AddEmailModalProps) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [email, setEmail] = useState("");
  const [validationSources, setValidationSources] = useState<string[]>([]);
  const [status, setStatus] = useState("Client Provided");
  const [emailTagAutomation, setEmailTagAutomation] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkStatus, setBulkStatus] = useState("Client Provided");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validation for single mode
    if (mode === "single") {
      if (!email.trim()) {
        toast({
          title: "Validation Error",
          description: "Email is required",
          variant: "destructive",
        });
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
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
          description: "Please enter at least one email address",
          variant: "destructive",
        });
        return;
      }
      
      const emails = bulkText.split("\n").map((e) => e.trim()).filter((e) => e);
      if (emails.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one valid email address",
          variant: "destructive",
        });
        return;
      }
      
      // Check if any line contains comma-separated emails
      const linesWithCommas = emails.filter(email => email.includes(","));
      if (linesWithCommas.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please add emails according to the instructions provided. Enter one email per line, not comma-separated.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate each email in bulk
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(e => !emailRegex.test(e));
      if (invalidEmails.length > 0) {
        toast({
          title: "Validation Error",
          description: `Invalid email format: ${invalidEmails.slice(0, 3).join(', ')}${invalidEmails.length > 3 ? '...' : ''}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (mode === "single") {
        const validationSource = validationSources.join(", ");
        await onAdd([{ email: email.trim(), validationSource, status, emailTagAutomation }], false);
      } else {
        const emails = bulkText.split("\n").map((e) => e.trim()).filter((e) => e);
        const records = emails.map((e) => ({
          email: e,
          validationSource: "",
          status: bulkStatus,
          emailTagAutomation: false,
        }));
        await onAdd(records, true);
      }
      // Only close modal if operation was successful
      handleClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to add email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setValidationSources([]);
    setStatus("Client Provided");
    setEmailTagAutomation(false);
    setBulkText("");
    setBulkStatus("Client Provided");
    setMode("single");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Email Record</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">One-by-One</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label>Validation Source (Multi-select)</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="osint"
                    checked={validationSources.includes("OSINT")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValidationSources([...validationSources, "OSINT"]);
                      } else {
                        setValidationSources(validationSources.filter(s => s !== "OSINT"));
                      }
                    }}
                  />
                  <Label htmlFor="osint" className="cursor-pointer">OSINT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="snusbase"
                    checked={validationSources.includes("Snusbase")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValidationSources([...validationSources, "Snusbase"]);
                      } else {
                        setValidationSources(validationSources.filter(s => s !== "Snusbase"));
                      }
                    }}
                  />
                  <Label htmlFor="snusbase" className="cursor-pointer">Snusbase</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client Provided">Client Provided</SelectItem>
                  <SelectItem value="Low Confidence">Low Confidence</SelectItem>
                  <SelectItem value="Low/Medium Confidence">Low/Medium Confidence</SelectItem>
                  <SelectItem value="Medium Confidence">Medium Confidence</SelectItem>
                  <SelectItem value="Medium/High Confidence">Medium/High Confidence</SelectItem>
                  <SelectItem value="Validated">Validated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailTagAutomation"
                checked={emailTagAutomation}
                onCheckedChange={(checked) => setEmailTagAutomation(checked as boolean)}
              />
              <Label htmlFor="emailTagAutomation">Email Tag Automation</Label>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="bulkStatus">Status</Label>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client Provided">Client Provided</SelectItem>
                  <SelectItem value="Low Confidence">Low Confidence</SelectItem>
                  <SelectItem value="Low/Medium Confidence">Low/Medium Confidence</SelectItem>
                  <SelectItem value="Medium Confidence">Medium Confidence</SelectItem>
                  <SelectItem value="Medium/High Confidence">Medium/High Confidence</SelectItem>
                  <SelectItem value="Validated">Validated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulkEmails">Enter Emails</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter one email per line.
              </p>
              <Textarea
                id="bulkEmails"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`user@example.com
admin@company.org
contact@business.net
support@service.io`}
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

export default AddEmailModal;

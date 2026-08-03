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

interface AddRelativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (relatives: Array<{
    relationship: string;
    name: string;
  }>) => Promise<void>;
}

const AddRelativeModal = ({ isOpen, onClose, onAdd }: AddRelativeModalProps) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [relationship, setRelationship] = useState("Associate");
  const [bulkRelationship, setBulkRelationship] = useState("Associate");
  const [name, setName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validation for single mode
    if (mode === "single") {
      if (!name.trim()) {
        toast({
          title: "Validation Error",
          description: "Name is required",
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
          description: "Please enter at least one name",
          variant: "destructive",
        });
        return;
      }
      
      const names = bulkText.split("\n").map((n) => n.trim()).filter((n) => n);
      if (names.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one valid name",
          variant: "destructive",
        });
        return;
      }
      
      // Check if any line contains comma-separated names
      const linesWithCommas = names.filter(name => name.includes(","));
      if (linesWithCommas.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please add names according to the instructions provided. Enter one name per line, not comma-separated.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (mode === "single") {
        await onAdd([{ relationship, name: name.trim() }]);
      } else {
        const names = bulkText.split("\n").map((n) => n.trim()).filter((n) => n);
        const records = names.map((n) => ({
          relationship: bulkRelationship,
          name: n,
        }));
        await onAdd(records);
      }
      // Only close modal if operation was successful
      handleClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to add relative:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRelationship("Associate");
    setBulkRelationship("Associate");
    setName("");
    setBulkText("");
    setMode("single");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Relative Record</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">One-by-One</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Associate">Associate</SelectItem>
                  <SelectItem value="Relative">Relative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="bulkRelationship">Relationship</Label>
              <Select value={bulkRelationship} onValueChange={setBulkRelationship}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Associate">Associate</SelectItem>
                  <SelectItem value="Relative">Relative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulkNames">Enter Names</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter one name per line. The relationship type above will be applied to all names.
              </p>
              <Textarea
                id="bulkNames"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`John Smith
Jane Doe
Robert Johnson
Michael Brown`}
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

export default AddRelativeModal;

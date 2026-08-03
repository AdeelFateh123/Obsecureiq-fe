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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface AddUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (usernames: Array<{
    username: string;
  }>, isBulkMode?: boolean) => Promise<void>;
}

const AddUsernameModal = ({ isOpen, onClose, onAdd }: AddUsernameModalProps) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [username, setUsername] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validation for single mode
    if (mode === "single") {
      if (!username.trim()) {
        toast({
          title: "Validation Error",
          description: "Username is required",
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
          description: "Please enter at least one username",
          variant: "destructive",
        });
        return;
      }
      
      const usernames = bulkText.split("\n").map((u) => u.trim()).filter((u) => u);
      if (usernames.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one valid username",
          variant: "destructive",
        });
        return;
      }
      
      // Check if any line contains comma-separated usernames
      const linesWithCommas = usernames.filter(username => username.includes(","));
      if (linesWithCommas.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please add usernames according to the instructions provided. Enter one username per line, not comma-separated.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (mode === "single") {
        await onAdd([{ username: username.trim() }], false);
      } else {
        const usernames = bulkText.split("\n").map((u) => u.trim()).filter((u) => u);
        const records = usernames.map((u) => ({ username: u }));
        await onAdd(records, true);
      }
      // Only close modal if operation was successful
      handleClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to add username:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setBulkText("");
    setMode("single");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Username Record</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">One-by-One</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="bulkUsernames">Enter Usernames</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter one username per line.
              </p>
              <Textarea
                id="bulkUsernames"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`john_doe
jane_smith
user123
admin_user`}
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

export default AddUsernameModal;

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

interface AddFacialRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    urls: string[];
    isBulk: boolean;
  }) => Promise<void>;
}

const AddFacialRecognitionModal = ({ isOpen, onClose, onAdd }: AddFacialRecognitionModalProps) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [url, setUrl] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validation for bulk mode
    if (mode === "bulk") {
      if (!bulkText.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one URL",
          variant: "destructive",
        });
        return;
      }
      
      const urls = bulkText.split("\n").map((u) => u.trim()).filter((u) => u);
      if (urls.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one valid URL",
          variant: "destructive",
        });
        return;
      }
      
      // Check if any line contains comma-separated URLs
      const linesWithCommas = urls.filter(url => url.includes(","));
      if (linesWithCommas.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please add URLs according to the instructions provided. Enter one URL per line, not comma-separated.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (mode === "single") {
        if (!url.trim()) return;
        await onAdd({ urls: [url], isBulk: false });
      } else {
        const urls = bulkText
          .split("\n")
          .map((u) => u.trim())
          .filter((u) => u);
        await onAdd({ urls, isBulk: true });
      }
      handleClose();
    } catch (error) {
      console.error('Failed to add facial recognition records:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setBulkText("");
    setMode("single");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Facial Recognition Record</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">One-by-One</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="url">Recognition URL *</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="bulkUrls">Enter Recognition URLs</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter one recognition URL per line.
              </p>
              <Textarea
                id="bulkUrls"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`https://example.com/recognition1
https://example.com/recognition2
https://example.com/recognition3
https://example.com/recognition4`}
                rows={8}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="action" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : `Add Record${mode === "bulk" ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacialRecognitionModal;

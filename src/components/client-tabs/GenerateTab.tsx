import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface GenerateTabProps {
  clientId: string;
}

const GenerateTab = ({ clientId }: GenerateTabProps) => {
  const { apiCall } = useApi();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/generate-document`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Document generation initiated successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate document");
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate document",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Generate Client Document</h2>
        <p className="text-muted-foreground max-w-md">
          Compile all client information into a comprehensive document
        </p>
        <Button 
          variant="action" 
          size="lg"
          onClick={handleGenerateDocument}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Document"}
        </Button>
      </div>
    </div>
  );
};

export default GenerateTab;

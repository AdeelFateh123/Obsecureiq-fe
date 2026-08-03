import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";
import ViewDataModal from "@/components/modals/ViewDataModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

interface MatchingResult {
  id: string;
  client_id: string;
  matching_result: string;
  client_data: string;
  module_data: string;
  email: string;
  module: string;
  created_at: string;
  updated_at: string;
}

interface MatchingResultTabProps {
  clientId: string;
}

const ITEMS_PER_PAGE = 10;

const MatchingResultTab = ({ clientId }: MatchingResultTabProps) => {
  const { apiCall } = useApi();
  const [results, setResults] = useState<MatchingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDataModal, setViewDataModal] = useState<{
    isOpen: boolean;
    title: string;
    data: string;
    type?: "json" | "text";
  }>({ isOpen: false, title: "", data: "", type: "json" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [clientId]);

  const fetchResults = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/matching-results`);

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Error fetching matching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = (resultId: string) => {
    setDeletingResultId(resultId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingResultId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/matching-results/${deletingResultId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setResults(results.filter(r => r.id !== deletingResultId));
      toast({
        title: "Success",
        description: "Matching result deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete matching result",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingResultId(null);
    }
  };



  const parseJsonData = (jsonString: string) => {
    try {
      return JSON.parse(jsonString.replace(/&quot;/g, '"'));
    } catch {
      return null;
    }
  };

  const getFinalBand = (matchingResult: string) => {
    const data = parseJsonData(matchingResult);
    if (!data) return "N/A";
    
    // For Snubase format
    if (data.overall && data.overall.final_band) {
      return data.overall.final_band;
    }
    
    // For Dark Side format
    if (data.overall && data.overall.final_band) {
      return data.overall.final_band;
    }
    
    // For OSINT format
    if (data.band) {
      return data.band;
    }
    
    return "N/A";
  };

  const formatJsonForModal = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString.replace(/&quot;/g, '"'));
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const handleViewDetails = (result: MatchingResult) => {
    // Parse and structure the data for better display
    const matchingResult = parseJsonData(result.matching_result);
    const moduleData = parseJsonData(result.module_data);
    const clientData = parseJsonData(result.client_data);
    
    // Reorder matching result to show overall first
    let reorderedMatchingResult = matchingResult;
    if (matchingResult && matchingResult.overall) {
      const { overall, ...rest } = matchingResult;
      reorderedMatchingResult = { overall, ...rest };
    }
    
    // Create a structured object for the modal
    const structuredData = {
      "Matching Result": reorderedMatchingResult || "No data available",
      "Module Data": moduleData || "No data available", 
      "Client Data": clientData || "No data available"
    };
    
    setViewDataModal({ 
      isOpen: true, 
      title: "Matching Result Details", 
      data: JSON.stringify(structuredData), 
      type: "json" 
    });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading matching results...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">No matching results found for this client.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Matching Results</h2>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Final Band</TableHead>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[150px]">Module</TableHead>
              <TableHead className="text-right w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentResults.map((result) => {
              const finalBand = getFinalBand(result.matching_result);

              return (
                <TableRow key={result.id}>
                  <TableCell>
                    <Badge 
                      variant={finalBand === "None" ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {finalBand}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{result.email}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{result.module}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="action"
                        size="sm"
                        onClick={() => handleViewDetails(result)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(result.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <ViewDataModal
        isOpen={viewDataModal.isOpen}
        onClose={() => setViewDataModal({ isOpen: false, title: "", data: "", type: "json" })}
        title={viewDataModal.title}
        data={viewDataModal.data}
        type={viewDataModal.type}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingResultId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this matching result? This action cannot be undone."
      />
    </div>
  );
};

export default MatchingResultTab;

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
import { Trash2, Eye } from "lucide-react";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import ViewDataModal from "@/components/modals/ViewDataModal";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisRecord {
  id: string;
  model: string;
  query: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

const AIAnalysisTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const { toast } = useToast();
  const [records, setRecords] = useState<AIAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [viewDataModal, setViewDataModal] = useState<{
    isOpen: boolean;
    title: string;
    data: string;
  }>({ isOpen: false, title: "", data: "" });

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    fetchRecords();
  }, [clientId]);

  const fetchRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/ai-analysis`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching AI analysis records:", error);
      toast({
        title: "Error",
        description: "Failed to load AI analysis records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingRecordId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingRecordId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/ai-analysis/${deletingRecordId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRecords();
        toast({
          title: "Success",
          description: "AI analysis record deleted successfully",
        });
      } else {
        throw new Error("Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error",
        description: "Failed to delete AI analysis record",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingRecordId(null);
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewData = (title: string, data: string) => {
    setViewDataModal({ isOpen: true, title, data });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading AI analysis records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">No AI analysis records found for this client.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">AI Analysis Records</h2>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Query</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.model}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={record.query}>
                    {record.query}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{truncateText(record.answer)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewData("Answer - " + record.model, record.answer)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
        onClose={() => setViewDataModal({ isOpen: false, title: "", data: "" })}
        title={viewDataModal.title}
        data={viewDataModal.data}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRecordId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete AI Analysis Record"
        description="Are you sure you want to delete this AI analysis record? This action cannot be undone."
      />
    </div>
  );
};

export default AIAnalysisTab;

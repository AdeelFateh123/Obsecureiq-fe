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
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";
import ViewDataModal from "@/components/modals/ViewDataModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

interface LeakedDataset {
  id: string;
  client_id: string;
  dataset_name: string;
  email: string;
  leak_data: string;
  module: string | null;
  created_at: string;
  updated_at: string;
}

interface LeakedDatasetTabProps {
  clientId: string;
}

const ITEMS_PER_PAGE = 10;

const LeakedDatasetTab = ({ clientId }: LeakedDatasetTabProps) => {
  const { apiCall } = useApi();
  const [datasets, setDatasets] = useState<LeakedDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDataModal, setViewDataModal] = useState<{
    isOpen: boolean;
    title: string;
    data: string;
  }>({ isOpen: false, title: "", data: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDatasetId, setDeletingDatasetId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDatasets();
  }, [clientId]);

  const fetchDatasets = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/leaked-datasets`);

      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
      }
    } catch (error) {
      console.error("Error fetching leaked datasets:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(datasets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDatasets = datasets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getVisiblePages = () => {
    if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
    
    if (currentPage <= 2) return [1, 2, 3, 4];
    if (currentPage >= totalPages - 1) return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    
    return [currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const handleDelete = (datasetId: string) => {
    setDeletingDatasetId(datasetId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingDatasetId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/leaked-datasets/${deletingDatasetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setDatasets(datasets.filter(d => d.id !== deletingDatasetId));
      toast({
        title: "Success",
        description: "Leaked dataset deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leaked dataset",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingDatasetId(null);
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
        <p className="text-muted-foreground">Loading leaked datasets...</p>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">No leaked datasets found for this client.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Leaked Datasets</h2>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dataset Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Leak Data</TableHead>
              <TableHead>Module</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDatasets.map((dataset) => (
              <TableRow key={dataset.id}>
                <TableCell className="font-medium">{dataset.dataset_name}</TableCell>
                <TableCell>{dataset.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{truncateText(dataset.leak_data)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewData("Leak Data - " + dataset.dataset_name, dataset.leak_data)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {dataset.module ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      {dataset.module}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      None
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(dataset.id)}
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
            {getVisiblePages().map((page) => (
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
          setDeletingDatasetId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this leaked dataset? This action cannot be undone."
      />
    </div>
  );
};

export default LeakedDatasetTab;

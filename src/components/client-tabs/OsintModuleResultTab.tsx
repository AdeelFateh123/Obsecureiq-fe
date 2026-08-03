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

interface OsintModuleResult {
  id: string;
  client_id: string;
  module_name: string;
  module_data: string | null;
  query: string | null;
  created_at: string;
  updated_at: string;
}

interface OsintModuleResultTabProps {
  clientId: string;
}

const ITEMS_PER_PAGE = 10;

const OsintModuleResultTab = ({ clientId }: OsintModuleResultTabProps) => {
  const { apiCall } = useApi();
  const [results, setResults] = useState<OsintModuleResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDataModal, setViewDataModal] = useState<{
    isOpen: boolean;
    title: string;
    data: string;
    type?: "json" | "text";
  }>({ isOpen: false, title: "", data: "", type: "text" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [clientId]);

  const fetchResults = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/osint-module-results`);

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Error fetching OSINT module results:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getVisiblePages = () => {
    if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
    
    if (currentPage <= 2) return [1, 2, 3, 4];
    if (currentPage >= totalPages - 1) return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    
    return [currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const handleDelete = (resultId: string) => {
    setDeletingResultId(resultId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingResultId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/osint-module-results/${deletingResultId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setResults(results.filter(r => r.id !== deletingResultId));
      toast({
        title: "Success",
        description: "OSINT module result deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete OSINT module result",
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

  const renderJsonPreview = (data: any) => {
    if (!data) return <span className="text-muted-foreground text-xs">Invalid JSON</span>;

    const renderValue = (key: string, value: any, level: number = 0): string[] => {
      const lines: string[] = [];
      const indent = '  '.repeat(level);
      const maxLineLength = 40;

      if (value === null || value === undefined || value === 'N/A') {
        return lines;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${indent}${key.replace(/_/g, ' ')}:`);
        Object.entries(value).forEach(([subKey, subValue]) => {
          lines.push(...renderValue(subKey, subValue, level + 1));
        });
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          const displayValue = value.map(item => {
            if (typeof item === 'object') {
              return JSON.stringify(item);
            }
            return item;
          }).join(', ');
          if (displayValue !== 'N/A') {
            const truncatedValue = displayValue.length > maxLineLength 
              ? displayValue.substring(0, maxLineLength) + '...' 
              : displayValue;
            lines.push(`${indent}${key.replace(/_/g, ' ')}: ${truncatedValue}`);
          }
        }
      } else {
        const truncatedValue = value.toString().length > maxLineLength 
          ? value.toString().substring(0, maxLineLength) + '...' 
          : value;
        lines.push(`${indent}${key.replace(/_/g, ' ')}: ${truncatedValue}`);
      }

      return lines;
    };

    const allLines: string[] = [];
    Object.entries(data).forEach(([key, value]) => {
      allLines.push(...renderValue(key, value));
    });

    const displayLines = allLines.slice(0, 2);
    const hasMore = allLines.length > 2;

    return (
      <div className="space-y-1">
        {displayLines.map((line, index) => (
          <div key={index} className="text-xs">
            {line}
          </div>
        ))}
        {hasMore && <div className="text-xs text-muted-foreground">...</div>}
      </div>
    );
  };

  const formatJsonForModal = (jsonString: string) => {
    try {
      // Replace HTML entities and parse JSON
      const cleanedString = jsonString.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const parsed = JSON.parse(cleanedString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If JSON parsing fails, try to clean up the string for better readability
      return jsonString.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewData = (title: string, data: string, type: "json" | "text" = "json") => {
    const formattedData = type === "json" ? formatJsonForModal(data) : data;
    setViewDataModal({ isOpen: true, title, data: formattedData, type });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading OSINT module results...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">No OSINT module results found for this client.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">OSINT Module Results</h2>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module Name</TableHead>
              <TableHead>Query</TableHead>
              <TableHead>Module Data</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.module_name}</TableCell>
                <TableCell>
                  {result.query && result.query.trim() ? (
                    <span className="text-sm font-mono">{truncateText(result.query)}</span>
                  ) : (
                    <span className="text-muted-foreground">No Query</span>
                  )}
                </TableCell>
                <TableCell>
                  {result.module_data ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewData("Module Data - " + result.module_name, result.module_data!, "json")}
                    >
                      View Details
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">No Data</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(result.id)}
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
        onClose={() => setViewDataModal({ isOpen: false, title: "", data: "", type: "text" })}
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
        message="Are you sure you want to delete this OSINT module result? This action cannot be undone."
      />
    </div>
  );
};

export default OsintModuleResultTab;

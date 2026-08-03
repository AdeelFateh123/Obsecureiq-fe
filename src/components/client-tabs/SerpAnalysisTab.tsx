import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

const ITEMS_PER_PAGE = 10;

interface SerpAnalysis {
  id: string;
  title: string | null;
  type: string | null;
  page_rank: number | null;
  domain: string | null;
}

interface SerpAnalysisTabProps {
  clientId: string;
}

function SerpAnalysisTab({ clientId }: SerpAnalysisTabProps) {
  const { apiCall } = useApi();
  const [serpAnalysis, setSerpAnalysis] = useState<SerpAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  });
  const { toast } = useToast();

  const totalPages = Math.ceil(serpAnalysis.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSerpAnalysis = serpAnalysis.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const fetchSerpAnalysis = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/serp-analysis`);

      if (response.ok) {
        const data = await response.json();
        setSerpAnalysis(data);
      }
    } catch (error) {
      console.error('Error fetching SERP analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/serp-analysis/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSerpAnalysis(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Success",
          description: "SERP analysis record deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete record",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting record",
        variant: "destructive",
      });
    }
    setDeleteModal({ open: false, id: null });
  };

  useEffect(() => {
    fetchSerpAnalysis();
  }, [clientId]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading SERP analysis data...</p>
      </div>
    );
  }

  if (serpAnalysis.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">SERP Analysis</h2>
        <p className="text-muted-foreground">No SERP analysis data found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">SERP Analysis</h2>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Page Rank</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSerpAnalysis.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title || '-'}</TableCell>
                <TableCell>{item.type || '-'}</TableCell>
                <TableCell>{item.page_rank || '-'}</TableCell>
                <TableCell>{item.domain || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteModal({ open: true, id: item.id })}
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

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        message="Are you sure you want to delete this SERP analysis record? This action cannot be undone."
      />
    </div>
  );
}

export default SerpAnalysisTab;

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Trash2 } from "lucide-react";
import { SCRAPER_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface ScraperRun {
  id: string;
  platform: string;
  status: string;
  urls: string[];
  created_at: string;
  completed_at: string | null;
}

interface ScraperResult {
  id: string;
  page_type: string;
  profile_url: string;
  screenshot_url: string;
  extracted_data: any;
}

const ITEMS_PER_PAGE = 5;

const ScrapingTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const { toast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);
  const [runs, setRuns] = useState<ScraperRun[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [results, setResults] = useState<ScraperResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedExtractedData, setSelectedExtractedData] = useState<any>(null);
  const [isExtractedDataModalOpen, setIsExtractedDataModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null);

  useEffect(() => {
    fetchRuns();
  }, [clientId]);

  const fetchRuns = async () => {
    try {
      const response = await apiCall(`${SCRAPER_URL}/scrape/runs/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setRuns(data.runs || []);
      }
    } catch (error) {
      console.error("Error fetching runs:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRunResults = async (runId: string) => {
    setSelectedRun(runId);
    setIsResultsModalOpen(true);
    setResultsLoading(true);
    setResults([]);

    try {
      const response = await apiCall(`${SCRAPER_URL}/scrape/run/${runId}/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
    } finally {
      setResultsLoading(false);
    }
  };

  const handleDeleteRun = async (runId: string) => {
    setDeletingRunId(runId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingRunId) return;

    try {
      const response = await apiCall(`${SCRAPER_URL}/scrape/run/${deletingRunId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete run");
      }

      toast({
        title: "Success",
        description: "Run deleted successfully",
      });
      fetchRuns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete run",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingRunId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span>;
    } else if (status === "running") {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Processing</span>;
    } else if (status === "queued") {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">In Queue</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Failed</span>;
    }
  };

  const totalPages = Math.ceil(runs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRuns = runs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleViewExtractedData = (data: any) => {
    setSelectedExtractedData(data);
    setIsExtractedDataModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Social Media Scraping</h2>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Social Media Scraping Results</h3>
        </div>

        {initialLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading social media scraping runs...
          </div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No executions found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium capitalize">
                      {run.platform}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {run.urls && run.urls.length > 0 ? (
                        <a
                          href={run.urls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block truncate"
                        >
                          {run.urls[0]}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No URL</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {run.status === "completed" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchRunResults(run.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRun(run.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="p-4 border-t">
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Results Modal */}
      <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Social Media Scraping Results</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            {resultsLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading results...</p>
            ) : results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No results found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Type</TableHead>
                    <TableHead>Profile URL</TableHead>
                    <TableHead>Extracted Data</TableHead>
                    <TableHead>Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium capitalize">{result.page_type}</TableCell>
                      <TableCell className="max-w-xs">
                        <a
                          href={result.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block truncate"
                        >
                          {result.profile_url}
                        </a>
                      </TableCell>
                      <TableCell>
                        {result.extracted_data ? (
                          <Button variant="outline" size="sm" onClick={() => handleViewExtractedData(result.extracted_data)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Data
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleViewImage(result.screenshot_url)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Screenshot</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img src={selectedImage} alt="Screenshot" className="w-full h-auto rounded" />
          )}
        </DialogContent>
      </Dialog>

      {/* Extracted Data Modal */}
      <Dialog open={isExtractedDataModalOpen} onOpenChange={setIsExtractedDataModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extracted Data</DialogTitle>
          </DialogHeader>
          {selectedExtractedData && (
            <div className="space-y-3">
              {Object.entries(selectedExtractedData).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <h3 className="text-lg font-semibold capitalize text-foreground">{key}</h3>
                  {Array.isArray(value) ? (
                    value.map((item: any, index: number) => (
                      <div key={index} className="bg-gradient-to-br from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent/90 to-primary/60 flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent"></div>
                        </div>
                        <div className="space-y-2 pl-10">
                          {typeof item === 'object' && item !== null ? (
                            Object.entries(item).map(([itemKey, itemValue]) => (
                              <div key={itemKey} className="flex gap-3">
                                <span className="font-semibold capitalize text-foreground min-w-[120px]">{itemKey.replace(/_/g, ' ')}:</span>
                                <span className="text-muted-foreground flex-1 whitespace-pre-wrap">
                                  {typeof itemValue === 'object' && itemValue !== null
                                    ? JSON.stringify(itemValue, null, 2)
                                    : String(itemValue)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">{String(item)}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : typeof value === 'object' && value !== null ? (
                    <div className="bg-gradient-to-br from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20 shadow-sm">
                      <div className="space-y-2">
                        {Object.entries(value).map(([itemKey, itemValue]) => (
                          <div key={itemKey} className="flex gap-3">
                            <span className="font-semibold capitalize text-foreground min-w-[120px]">{itemKey.replace(/_/g, ' ')}:</span>
                            <span className="text-muted-foreground flex-1 whitespace-pre-wrap">
                              {typeof itemValue === 'object' && itemValue !== null
                                ? JSON.stringify(itemValue, null, 2)
                                : String(itemValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20 shadow-sm">
                      <span className="text-muted-foreground">{String(value)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRunId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this scraping run? This action cannot be undone and will delete all associated results."
      />
    </div>
  );
};

export default ScrapingTab;

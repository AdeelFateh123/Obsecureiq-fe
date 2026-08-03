import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditableText, EditableDropdown } from "@/components/ui/editable-cell";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import ImageViewer from "@/components/ui/image-viewer";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

// Import existing modals
import AddFacialRecognitionModal from "@/components/modals/AddFacialRecognitionModal";
import EditFacialRecognitionModal from "@/components/modals/EditFacialRecognitionModal";
import AddFacialSitesModal from "@/components/modals/AddFacialSitesModal";
import EditFacialSitesModal from "@/components/modals/EditFacialSitesModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

const ITEMS_PER_PAGE = 10;
const FACIAL_SITES = ["PimEyes", "FaceCheck.ID"];

interface FacialRecognitionRecord {
  id: string;
  url: string;
}

interface FacialSitesRecord {
  id: string;
  site_name: string;
  images: string[];
}

interface FacialRecognitionConsolidatedTabProps {
  clientId: string;
}

const FacialRecognitionConsolidatedTab = ({ clientId }: FacialRecognitionConsolidatedTabProps) => {
  const { toast } = useToast();
  const { apiCall } = useApi();

  // Facial Recognition URLs State
  const [facialRecords, setFacialRecords] = useState<FacialRecognitionRecord[]>([]);
  const [facialLoading, setFacialLoading] = useState(true);
  const [facialCurrentPage, setFacialCurrentPage] = useState(1);
  const [isAddFacialModalOpen, setIsAddFacialModalOpen] = useState(false);
  const [isEditFacialModalOpen, setIsEditFacialModalOpen] = useState(false);
  const [editingFacial, setEditingFacial] = useState<FacialRecognitionRecord | null>(null);

  // Facial Sites State
  const [sitesRecords, setSitesRecords] = useState<FacialSitesRecord[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesCurrentPage, setSitesCurrentPage] = useState(1);
  const [isAddSitesModalOpen, setIsAddSitesModalOpen] = useState(false);
  const [isEditSitesModalOpen, setIsEditSitesModalOpen] = useState(false);
  const [editingSites, setEditingSites] = useState<FacialSitesRecord | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => Promise<void>) | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    fetchAllRecords();
  }, [clientId]);

  const fetchAllRecords = async () => {
    await Promise.all([
      fetchFacialRecords(),
      fetchSitesRecords()
    ]);
  };

  // Facial Recognition URLs Functions
  const fetchFacialRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-urls`);
      if (response.ok) {
        const data = await response.json();
        setFacialRecords(data);
      }
    } catch (error) {
      console.error("Error fetching facial recognition URLs:", error);
    } finally {
      setFacialLoading(false);
    }
  };

  // Facial Sites Functions
  const fetchSitesRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-sites`);
      if (response.ok) {
        const data = await response.json();
        setSitesRecords(data);
      }
    } catch (error) {
      console.error("Error fetching facial sites records:", error);
    } finally {
      setSitesLoading(false);
    }
  };

  // Inline update functions
  const handleFacialInlineUpdate = async (id: string, field: keyof FacialRecognitionRecord, value: string) => {
    if (field === 'url') {
      try {
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-urls/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });
        if (response.ok) await fetchFacialRecords();
      } catch (error) {
        toast({ title: "Error", description: "Failed to update facial recognition URL", variant: "destructive" });
      }
    }
  };

  const handleSitesInlineUpdate = async (id: string, field: keyof FacialSitesRecord, value: string) => {
    if (field === 'site_name') {
      try {
        const formData = new FormData();
        const recordData = { site_name: value, remaining_images: [] };
        formData.append('data', JSON.stringify(recordData));
        
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-sites/${id}`, {
          method: "PUT",
          body: formData,
        });
        if (response.ok) await fetchSitesRecords();
      } catch (error) {
        toast({ title: "Error", description: "Failed to update site name", variant: "destructive" });
      }
    }
  };

  // Delete functions
  const deleteFacialRecord = (id: string) => {
    setDeleteAction(() => async () => {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-urls/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete facial recognition URL");
      }
      await fetchFacialRecords();
      toast({ title: "Success", description: "Facial recognition URL deleted successfully" });
    });
    setDeleteTitle("Delete Facial Recognition URL");
    setDeleteMessage("Are you sure you want to delete this facial recognition URL? This action cannot be undone.");
    setIsDeleteModalOpen(true);
  };

  const deleteSitesRecord = (id: string) => {
    setDeleteAction(() => async () => {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-sites/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete facial recognition site record");
      }
      await fetchSitesRecords();
      toast({ title: "Success", description: "Facial recognition site record deleted successfully" });
    });
    setDeleteTitle("Delete Facial Recognition Site Record");
    setDeleteMessage("Are you sure you want to delete this facial recognition site record? This action cannot be undone.");
    setIsDeleteModalOpen(true);
  };

  // Pagination calculations
  const facialTotalPages = Math.ceil(facialRecords.length / ITEMS_PER_PAGE);
  const facialStartIndex = (facialCurrentPage - 1) * ITEMS_PER_PAGE;
  const facialCurrentRecords = facialRecords.slice(facialStartIndex, facialStartIndex + ITEMS_PER_PAGE);

  const sitesTotalPages = Math.ceil(sitesRecords.length / ITEMS_PER_PAGE);
  const sitesStartIndex = (sitesCurrentPage - 1) * ITEMS_PER_PAGE;
  const sitesCurrentRecords = sitesRecords.slice(sitesStartIndex, sitesStartIndex + ITEMS_PER_PAGE);

  if (facialLoading || sitesLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading facial recognition data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Facial Recognition URLs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Facial Recognition URLs</h2>
          <Button variant="action" onClick={() => setIsAddFacialModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add URL
          </Button>
        </div>

        {facialRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No facial recognition URLs found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recognition URL</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facialCurrentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="p-0 max-w-xl">
                        <EditableText
                          value={record.url}
                          onSave={(value) => handleFacialInlineUpdate(record.id, 'url', value)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="action" size="sm" onClick={() => {
                            setEditingFacial(record);
                            setIsEditFacialModalOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteFacialRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {facialTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setFacialCurrentPage(Math.max(1, facialCurrentPage - 1))}
                      className={facialCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: facialTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setFacialCurrentPage(page)}
                        isActive={page === facialCurrentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setFacialCurrentPage(Math.min(facialTotalPages, facialCurrentPage + 1))}
                      className={facialCurrentPage === facialTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Facial Recognition Sites Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Facial Recognition Sites</h2>
          <Button variant="action" onClick={() => setIsAddSitesModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Site Record
          </Button>
        </div>

        {sitesRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No facial recognition site records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitesCurrentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="p-0">
                        <EditableDropdown
                          value={record.site_name}
                          options={FACIAL_SITES.map(site => ({ value: site, label: site }))}
                          onSave={(value) => handleSitesInlineUpdate(record.id, 'site_name', value)}
                        />
                      </TableCell>
                      <TableCell>
                        <ImageViewer images={record.images || []} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="action" size="sm" onClick={() => {
                            setEditingSites(record);
                            setIsEditSitesModalOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteSitesRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sitesTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setSitesCurrentPage(Math.max(1, sitesCurrentPage - 1))}
                      className={sitesCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: sitesTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setSitesCurrentPage(page)}
                        isActive={page === sitesCurrentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setSitesCurrentPage(Math.min(sitesTotalPages, sitesCurrentPage + 1))}
                      className={sitesCurrentPage === sitesTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddFacialRecognitionModal
        isOpen={isAddFacialModalOpen}
        onClose={() => setIsAddFacialModalOpen(false)}
        onAdd={async (data: { urls: string[]; isBulk: boolean }) => {
          try {
            if (data.isBulk) {
              const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-urls/bulk-upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls_text: data.urls.join('\n') }),
              });
              if (!response.ok) throw new Error("Failed to bulk upload URLs");
            } else {
              for (const url of data.urls) {
                const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-urls`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url }),
                });
                if (!response.ok) throw new Error("Failed to add URL");
              }
            }
            await fetchFacialRecords();
            toast({ title: "Success", description: "Facial recognition URL(s) added successfully" });
          } catch (error) {
            toast({ title: "Error", description: "Failed to add facial recognition URL(s)", variant: "destructive" });
          }
        }}
      />

      {editingFacial && (
        <EditFacialRecognitionModal
          isOpen={isEditFacialModalOpen}
          onClose={() => {
            setIsEditFacialModalOpen(false);
            setEditingFacial(null);
          }}
          record={editingFacial}
          onUpdate={async (updatedRecord) => {
            try {
              const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-urls/${updatedRecord.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: updatedRecord.url }),
              });
              if (response.ok) {
                await fetchFacialRecords();
                toast({ title: "Success", description: "Facial recognition URL updated successfully" });
              }
            } catch (error) {
              toast({ title: "Error", description: "Failed to update facial recognition URL", variant: "destructive" });
            }
          }}
        />
      )}

      <AddFacialSitesModal
        isOpen={isAddSitesModalOpen}
        onClose={() => setIsAddSitesModalOpen(false)}
        onAdd={async (data: { siteName: string; imageFiles: FileList }) => {
          try {
            const formData = new FormData();
            formData.append("site_name", data.siteName);
            Array.from(data.imageFiles).forEach((file) => {
              formData.append("images", file);
            });
            const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-sites`, {
              method: "POST",
              body: formData,
            });
            if (response.ok) {
              await fetchSitesRecords();
              toast({ title: "Success", description: "Facial recognition site record added successfully" });
            } else {
              throw new Error("Failed to add facial sites record");
            }
          } catch (error) {
            toast({ title: "Error", description: "Failed to add facial recognition site record", variant: "destructive" });
            throw error;
          }
        }}
      />

      {editingSites && (
        <EditFacialSitesModal
          isOpen={isEditSitesModalOpen}
          onClose={() => {
            setIsEditSitesModalOpen(false);
            setEditingSites(null);
          }}
          record={editingSites}
          onUpdate={async (updatedRecord: any) => {
            try {
              const formData = new FormData();
              
              const recordData = {
                site_name: updatedRecord.site_name,
                remaining_images: updatedRecord.remainingImages || [],
              };
              formData.append('data', JSON.stringify(recordData));
              
              if (updatedRecord.newImageFiles && updatedRecord.newImageFiles.length > 0) {
                for (const file of updatedRecord.newImageFiles) {
                  formData.append('images', file);
                }
              }
              
              const response = await apiCall(`${BASE_URL}/clients/${clientId}/facial-recognition-sites/${updatedRecord.id}`, {
                method: "PUT",
                body: formData,
              });
              if (response.ok) {
                await fetchSitesRecords();
                toast({ title: "Success", description: "Facial recognition site record updated successfully" });
              } else {
                throw new Error("Failed to update facial recognition site record");
              }
            } catch (error) {
              toast({ title: "Error", description: "Failed to update facial recognition site record", variant: "destructive" });
              throw error;
            }
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteAction(null);
        }}
        onConfirm={deleteAction || (() => Promise.resolve())}
        title={deleteTitle}
        message={deleteMessage}
      />
    </div>
  );
};

export default FacialRecognitionConsolidatedTab;

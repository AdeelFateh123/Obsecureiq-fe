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
import { EditableText, EditableDropdown } from "@/components/ui/editable-cell";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddHeatmapModal from "@/components/modals/AddHeatmapModal";
import EditHeatmapModal from "@/components/modals/EditHeatmapModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface HeatmapRecord {
  id: string;
  imageType: string;
  imageUrl: string;
}

const ITEMS_PER_PAGE = 10;

const HeatmapTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const [records, setRecords] = useState<HeatmapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HeatmapRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [clientId]);

  const fetchImages = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/residential-heatmap-images`);

      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          imageType: item.image_type,
          imageUrl: item.image_url,
        }));
        setRecords(mappedData);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddRecords = async (newRecords: { imageType: string; imageFiles: File[] }): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("image_type", newRecords.imageType);
      
      newRecords.imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/residential-heatmap-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }
      
      await fetchImages();
      toast({
        title: "Success",
        description: "Image(s) uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image(s)",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEdit = (record: HeatmapRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: HeatmapRecord, newImageFile?: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("image_type", updatedRecord.imageType);
      
      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/residential-heatmap-images/${updatedRecord.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update image");
      }
      
      await fetchImages();
      toast({
        title: "Success",
        description: "Image updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof HeatmapRecord, value: string) => {
    if (field === 'imageType') {
      try {
        const formData = new FormData();
        formData.append("image_type", value);

        const response = await apiCall(`${BASE_URL}/clients/${clientId}/residential-heatmap-images/${id}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          await fetchImages();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update image type",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeletingRecordId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingRecordId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/residential-heatmap-images/${deletingRecordId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete image");
      }
      
      await fetchImages();
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingRecordId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading images...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Image Record
        </Button>
        <AddHeatmapModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddRecords}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Heatmap Records</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image Type</TableHead>
              <TableHead>Image URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={record.imageType}
                    options={[
                      { value: "Heatmap", label: "Heatmap" },
                    ]}
                    onSave={(value) => handleInlineUpdate(record.id, 'imageType', value)}
                  />
                </TableCell>
                <TableCell className="p-0 max-w-xs">
                  <div className="px-4 py-3">
                    <a 
                      href={`${record.imageUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline truncate block"
                    >
                      View Image
                    </a>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

      <AddHeatmapModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRecords}
      />

      {editingRecord && (
        <EditHeatmapModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRecord(null);
          }}
          record={editingRecord}
          onUpdate={handleUpdateRecord}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRecordId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this image record? This action cannot be undone."
      />
    </div>
  );
};

export default HeatmapTab;

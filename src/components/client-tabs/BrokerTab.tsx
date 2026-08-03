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
import AddBrokerModal from "@/components/modals/AddBrokerModal";
import EditBrokerModal from "@/components/modals/EditBrokerModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import ImageViewer from "@/components/ui/image-viewer";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface BrokerRecord {
  id: string;
  broker_name: string;
  images: string[];
}

const BROKER_OPTIONS = [
  "Infotracer", "Intelius", "BeenVerified", "Instant Checkmate", "US Search",
  "Social Catfish", "NumLookup", "WhitePages", "IDCrawl", "Radaris",
  "Reverse Phone Check", "Search Public Records"
];

const FACIAL_SITES = ["PimEyes", "FaceCheck.ID"];

const ITEMS_PER_PAGE = 10;

const BrokerTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const { toast } = useToast();
  const [records, setRecords] = useState<BrokerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BrokerRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchBrokerRecords();
  }, [clientId]);

  const fetchBrokerRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/broker-screen-records`);
      if (response.ok) {
        const data = await response.json();
        // Filter out facial recognition sites as they're handled in the consolidated facial recognition tab
        const brokerRecords = data.filter((record: any) => 
          !FACIAL_SITES.includes(record.broker_name)
        );
        setRecords(brokerRecords);
      }
    } catch (error) {
      console.error("Error fetching broker records:", error);
      toast({
        title: "Error",
        description: "Failed to load broker records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddRecords = async (data: { brokerName: string; imageFiles: FileList }) => {
    try {
      const formData = new FormData();
      formData.append("broker_name", data.brokerName);
      
      Array.from(data.imageFiles).forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/broker-screen-records`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchBrokerRecords();
        toast({
          title: "Success",
          description: "Broker record added successfully",
        });
      } else {
        throw new Error("Failed to add broker record");
      }
    } catch (error) {
      console.error("Error adding broker record:", error);
      toast({
        title: "Error",
        description: "Failed to add broker record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEdit = (record: BrokerRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        broker_name: updatedRecord.broker_name,
        remaining_images: updatedRecord.remainingImages || [], // Images user kept
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add new image files
      if (updatedRecord.newImageFiles && updatedRecord.newImageFiles.length > 0) {
        for (const file of updatedRecord.newImageFiles) {
          formData.append('images', file);
        }
      }

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/broker-screen-records/${updatedRecord.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        await fetchBrokerRecords();
        toast({
          title: "Success",
          description: "Broker record updated successfully",
        });
      } else {
        throw new Error("Failed to update broker record");
      }
    } catch (error) {
      console.error("Error updating broker record:", error);
      toast({
        title: "Error",
        description: "Failed to update broker record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof BrokerRecord, value: string) => {
    if (field === 'broker_name') {
      try {
        const formData = new FormData();
        formData.append("broker_name", value);

        const response = await apiCall(`${BASE_URL}/clients/${clientId}/broker-screen-records/${id}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          await fetchBrokerRecords();
        }
      } catch (error) {
        console.error("Error updating broker name:", error);
        toast({
          title: "Error",
          description: "Failed to update broker name",
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
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/broker-screen-records/${deletingRecordId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBrokerRecords();
        toast({
          title: "Success",
          description: "Broker record deleted successfully",
        });
      } else {
        throw new Error("Failed to delete broker record");
      }
    } catch (error) {
      console.error("Error deleting broker record:", error);
      toast({
        title: "Error",
        description: "Failed to delete broker record",
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
        <p className="text-muted-foreground">Loading broker records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Broker Record
        </Button>
        <AddBrokerModal
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
        <h2 className="text-2xl font-bold text-foreground">Broker Screen Records</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broker Name</TableHead>
              <TableHead>Images</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={record.broker_name}
                    options={BROKER_OPTIONS.map(broker => ({ value: broker, label: broker }))}
                    onSave={(value) => handleInlineUpdate(record.id, 'broker_name', value)}
                  />
                </TableCell>
                <TableCell>
                  <ImageViewer images={record.images || []} />
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

      <AddBrokerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRecords}
      />

      {editingRecord && (
        <EditBrokerModal
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
        message="Are you sure you want to delete this broker record? This action cannot be undone."
      />
    </div>
  );
};

export default BrokerTab;

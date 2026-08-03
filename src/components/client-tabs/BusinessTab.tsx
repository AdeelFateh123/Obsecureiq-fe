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
import { EditableText, EditableTextarea } from "@/components/ui/editable-cell";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddBusinessModal from "@/components/modals/AddBusinessModal";
import EditBusinessModal from "@/components/modals/EditBusinessModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface BusinessRecord {
  id: string;
  business_name: string;
  business_information: string;
  created_at?: string;
  updated_at?: string;
}

const ITEMS_PER_PAGE = 10;

const BusinessTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const { toast } = useToast();
  const [records, setRecords] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BusinessRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessRecords();
  }, [clientId]);

  const fetchBusinessRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/business-info`);
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching business records:", error);
      toast({
        title: "Error",
        description: "Failed to load business records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddRecords = async (newRecords: Array<{ businessName: string; businessInformation: string }>) => {
    try {
      for (const record of newRecords) {
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/business-info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_name: record.businessName,
            business_information: record.businessInformation,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add business record");
        }
      }

      await fetchBusinessRecords();
      toast({
        title: "Success",
        description: "Business record(s) added successfully",
      });
    } catch (error) {
      console.error("Error adding business records:", error);
      toast({
        title: "Error",
        description: "Failed to add business record(s)",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEdit = (record: BusinessRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: BusinessRecord) => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/business-info/${updatedRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: updatedRecord.business_name,
          business_information: updatedRecord.business_information,
        }),
      });

      if (response.ok) {
        await fetchBusinessRecords();
        toast({
          title: "Success",
          description: "Business record updated successfully",
        });
      } else {
        throw new Error("Failed to update business record");
      }
    } catch (error) {
      console.error("Error updating business record:", error);
      toast({
        title: "Error",
        description: "Failed to update business record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof BusinessRecord, value: string) => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/business-info/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        await fetchBusinessRecords();
      }
    } catch (error) {
      console.error("Error updating business record:", error);
      toast({
        title: "Error",
        description: "Failed to update business record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingRecordId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingRecordId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/business-info/${deletingRecordId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBusinessRecords();
        toast({
          title: "Success",
          description: "Business record deleted successfully",
        });
      } else {
        throw new Error("Failed to delete business record");
      }
    } catch (error) {
      console.error("Error deleting business record:", error);
      toast({
        title: "Error",
        description: "Failed to delete business record",
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
        <p className="text-muted-foreground">Loading business records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Business Record
        </Button>
        <AddBusinessModal
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
        <h2 className="text-2xl font-bold text-foreground">Business Information</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Business Information</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="p-0">
                  <EditableText
                    value={record.business_name}
                    onSave={(value) => handleInlineUpdate(record.id, 'business_name', value)}
                  />
                </TableCell>
                <TableCell className="p-0 max-w-lg">
                  <EditableTextarea
                    value={record.business_information}
                    onSave={(value) => handleInlineUpdate(record.id, 'business_information', value)}
                    rows={2}
                  />
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

      <AddBusinessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRecords}
      />

      {editingRecord && (
        <EditBusinessModal
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
        message="Are you sure you want to delete this business record? This action cannot be undone."
      />
    </div>
  );
};

export default BusinessTab;

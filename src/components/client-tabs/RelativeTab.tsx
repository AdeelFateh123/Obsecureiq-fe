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
import AddRelativeModal from "@/components/modals/AddRelativeModal";
import EditRelativeModal from "@/components/modals/EditRelativeModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface RelativeRecord {
  id: string;
  relationship: string;
  name: string;
}

const ITEMS_PER_PAGE = 10;

const RelativeTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const [relatives, setRelatives] = useState<RelativeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRelative, setEditingRelative] = useState<RelativeRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRelativeId, setDeletingRelativeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatives();
  }, [clientId]);

  const fetchRelatives = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/relatives`);
      
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          relationship: item.relationship_type || '',
        }));
        setRelatives(mappedData);
      }
    } catch (error) {
      console.error("Error fetching relatives:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(relatives.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRelatives = relatives.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddRelatives = async (
    newRelatives: Omit<RelativeRecord, "id">[]
  ): Promise<void> => {
    try {
      const isBulkUpload =
        newRelatives.length > 1 &&
        newRelatives.every(r => r.relationship === newRelatives[0].relationship);

      if (isBulkUpload) {
        const relativesText = newRelatives.map(r => r.name).join("\n");
        const relationshipType = newRelatives[0].relationship || "Associate";

        const response = await apiCall(
          `${BASE_URL}/clients/${clientId}/relatives/bulk-upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              relatives_text: relativesText,
              relationship_type: relationshipType,
            }),
          }
        );

        const result = await response.json();

        if (result.success === false) {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
          throw new Error("RELATIVE_ALREADY_EXISTS");
        }
      } else {
        for (const relativeData of newRelatives) {
          const response = await apiCall(
            `${BASE_URL}/clients/${clientId}/relatives`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: relativeData.name,
                relationship_type: relativeData.relationship,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();

            if (
              response.status === 400 &&
              typeof errorData.detail === "string" &&
              errorData.detail.toLowerCase().includes("already exists")
            ) {
              toast({
                title: "Error",
                description: errorData.detail,
                variant: "destructive",
              });
              throw new Error("RELATIVE_ALREADY_EXISTS");
            }

            throw new Error(errorData.detail || "Failed to add relative");
          }
        }
      }

      await fetchRelatives();

      toast({
        title: "Success",
        description: "Relative(s) added successfully",
      });
    } catch (error: any) {
      if (error.message !== "RELATIVE_ALREADY_EXISTS") {
        toast({
          title: "Error",
          description: "Failed to add relative(s)",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleEdit = (relative: RelativeRecord) => {
    setEditingRelative(relative);
    setIsEditModalOpen(true);
  };

  const handleUpdateRelative = async (updatedRelative: RelativeRecord): Promise<void> => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/relatives/${updatedRelative.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedRelative.name,
          relationship_type: updatedRelative.relationship,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update relative");
      }
      
      await fetchRelatives();
      toast({
        title: "Success",
        description: "Relative updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update relative",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof RelativeRecord, value: string) => {
    try {
      let updateData: any = {};
      
      if (field === 'name') {
        updateData.name = value;
      } else if (field === 'relationship') {
        updateData.relationship_type = value;
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/relatives/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        await fetchRelatives();
        toast({
          title: "Success",
          description: "Relative updated successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update relative",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update relative",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingRelativeId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingRelativeId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/relatives/${deletingRelativeId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete relative");
      }
      
      await fetchRelatives();
      toast({
        title: "Success",
        description: "Relative deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete relative",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingRelativeId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading relatives...</p>
      </div>
    );
  }

  if (relatives.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Relative Record
        </Button>
        <AddRelativeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddRelatives}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Relatives & Associates Records</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRelatives.map((relative) => (
              <TableRow key={relative.id}>
                <TableCell className="p-0">
                  <EditableText
                    value={relative.name}
                    onSave={(value) => handleInlineUpdate(relative.id, 'name', value)}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={relative.relationship}
                    options={[
                      { value: "Relative", label: "Relative" },
                      { value: "Associate", label: "Associate" },
                    ]}
                    onSave={(value) => handleInlineUpdate(relative.id, 'relationship', value)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => handleEdit(relative)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(relative.id)}
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

      <AddRelativeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRelatives}
      />

      {editingRelative && (
        <EditRelativeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRelative(null);
          }}
          relative={editingRelative}
          onUpdate={handleUpdateRelative}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRelativeId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this relative record? This action cannot be undone."
      />
    </div>
  );
};

export default RelativeTab;

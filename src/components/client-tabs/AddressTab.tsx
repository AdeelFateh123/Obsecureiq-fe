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
import AddAddressModal from "@/components/modals/AddAddressModal";
import EditAddressModal from "@/components/modals/EditAddressModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface AddressRecord {
  id: string;
  address: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  client_provided: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

const AddressTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const totalPages = Math.ceil(addresses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAddresses = addresses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    fetchAddresses();
  }, [clientId]);

  const fetchAddresses = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/addresses`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddresses = async (newAddresses: Array<{ address: string; client_provided: string }>, bulkText?: string, bulkClientProvided?: string): Promise<void> => {
    try {
      if (bulkText) {
        // Use bulk upload API
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/addresses/bulk-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            addresses_text: bulkText,
            client_provided: bulkClientProvided || "Yes"
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to upload addresses");
        }

        const result = await response.json();
        await fetchAddresses();
        toast({
          title: "Success",
          description: result.message || "Addresses uploaded successfully",
        });
      } else {
        // Process addresses one by one
        for (const addressData of newAddresses) {
          const response = await apiCall(`${BASE_URL}/clients/${clientId}/addresses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          });

          if (!response.ok) {
            throw new Error("Failed to add address");
          }
        }
        
        await fetchAddresses();
        toast({
          title: "Success",
          description: `Address${newAddresses.length > 1 ? 'es' : ''} added successfully`,
        });
      }
    } catch (error) {
      console.error("Error adding addresses:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add address",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEdit = (address: AddressRecord) => {
    setEditingAddress(address);
    setIsEditModalOpen(true);
  };

  const handleUpdateAddress = async (updatedData: Partial<AddressRecord>): Promise<void> => {
    if (!editingAddress) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/addresses/${editingAddress.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        await fetchAddresses();
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
      } else {
        throw new Error("Failed to update address");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof AddressRecord, value: string) => {
    // Only allow editing parsed address fields, not the raw address field
    const allowedFields = ['address_line_1', 'address_line_2', 'city', 'state', 'zip', 'client_provided'];
    
    if (allowedFields.includes(field)) {
      try {
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/addresses/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [field]: value }),
        });

        if (response.ok) {
          await fetchAddresses();
        }
      } catch (error) {
        console.error("Error updating address:", error);
        toast({
          title: "Error",
          description: "Failed to update address",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeletingAddressId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingAddressId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/addresses/${deletingAddressId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAddresses();
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingAddressId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading addresses...</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address Record
        </Button>
        <AddAddressModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddAddresses}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Address Records</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Address Line 1</TableHead>
              <TableHead>Address Line 2</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>ZIP</TableHead>
              <TableHead>Client Provided</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAddresses.map((address) => (
              <TableRow key={address.id}>
                <TableCell className="max-w-xs text-sm text-muted-foreground">
                  {address.address || "-"}
                </TableCell>
                <TableCell className="p-0">
                  <EditableText
                    value={address.address_line_1 || ""}
                    onSave={(value) => handleInlineUpdate(address.id, 'address_line_1', value)}
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableText
                    value={address.address_line_2 || ""}
                    onSave={(value) => handleInlineUpdate(address.id, 'address_line_2', value)}
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableText
                    value={address.city || ""}
                    onSave={(value) => handleInlineUpdate(address.id, 'city', value)}
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableText
                    value={address.state || ""}
                    onSave={(value) => handleInlineUpdate(address.id, 'state', value)}
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableText
                    value={address.zip || ""}
                    onSave={(value) => handleInlineUpdate(address.id, 'zip', value)}
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={address.client_provided || "No"}
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                    ]}
                    onSave={(value) => handleInlineUpdate(address.id, 'client_provided', value)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
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

      <AddAddressModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAddresses}
      />

      {editingAddress && (
        <EditAddressModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAddress(null);
          }}
          address={editingAddress}
          onUpdate={handleUpdateAddress}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAddressId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Address"
        description="Are you sure you want to delete this address record? This action cannot be undone."
      />
    </div>
  );
};

export default AddressTab;

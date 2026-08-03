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
import AddPhoneModal from "@/components/modals/AddPhoneModal";
import EditPhoneModal from "@/components/modals/EditPhoneModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface PhoneRecord {
  id: string;
  phoneNumber: string;
  clientProvided: string;
}

const ITEMS_PER_PAGE = 10;

const PhoneTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPhoneId, setDeletingPhoneId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhones();
  }, [clientId]);

  const fetchPhones = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/phone-numbers`);
      
      if (response.ok) {
        const data = await response.json();
        // Map backend data to frontend format
        const mappedData = data.map((item: any) => ({
          id: item.id,
          phoneNumber: item.phone_number,
          clientProvided: item.client_provided || '',
        }));
        setPhones(mappedData);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(phones.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPhones = phones.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddPhones = async (newPhones: Omit<PhoneRecord, "id">[]): Promise<void> => {
    try {
      // Check if this is bulk upload (multiple phones OR single phone with "No" client_provided from bulk tab)
      const isBulkUpload = newPhones.length > 1 || (newPhones.length === 1 && newPhones[0].clientProvided === "No");
      
      if (isBulkUpload) {
        // Use bulk upload API
        const phonesText = newPhones.map(p => p.phoneNumber).join('\n');
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/phone-numbers/bulk-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            phone_numbers_text: phonesText,
            client_provided: newPhones[0].clientProvided
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to bulk upload phone numbers");
        }
      } else {
        // Use single phone API
        for (const phoneData of newPhones) {
          const backendData = {
            phone_number: phoneData.phoneNumber,
            client_provided: phoneData.clientProvided || "Yes",
          };
          
          const response = await apiCall(`${BASE_URL}/clients/${clientId}/phone-numbers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(backendData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400 && errorData.detail === "Phone number already exists") {
              toast({
                title: "Error",
                description: "Phone number already exists for this client",
                variant: "destructive",
              });
              throw new Error("DUPLICATE_PHONE");
            }
            throw new Error(errorData.detail || "Failed to add phone number");
          }
        }
      }
      
      await fetchPhones();
      toast({
        title: "Success",
        description: "Phone number(s) added successfully",
      });
    } catch (error: any) {
      if (error.message !== "DUPLICATE_PHONE") {
        toast({
          title: "Error",
          description: "Failed to add phone number(s)",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleEdit = (phone: PhoneRecord) => {
    setEditingPhone(phone);
    setIsEditModalOpen(true);
  };

  const handleUpdatePhone = async (updatedPhone: PhoneRecord): Promise<void> => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/phone-numbers/${updatedPhone.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: updatedPhone.phoneNumber,
          client_provided: updatedPhone.clientProvided,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.detail === "Phone number already exists") {
          toast({
            title: "Error",
            description: "Phone number already exists for this client",
            variant: "destructive",
          });
          throw new Error("DUPLICATE_PHONE");
        }
        throw new Error(errorData.detail || "Failed to update phone number");
      }
      
      await fetchPhones();
      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
    } catch (error: any) {
      if (error.message !== "DUPLICATE_PHONE") {
        toast({
          title: "Error",
          description: "Failed to update phone number",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof PhoneRecord, value: string | boolean) => {
    try {
      let updateData: any = {};
      
      // Map frontend fields to backend fields
      if (field === 'phoneNumber') {
        updateData.phone_number = value;
      } else if (field === 'clientProvided') {
        updateData.client_provided = value;
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/phone-numbers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        await fetchPhones();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update phone number",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingPhoneId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingPhoneId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/phone-numbers/${deletingPhoneId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete phone number");
      }
      
      await fetchPhones();
      toast({
        title: "Success",
        description: "Phone number deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete phone number",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingPhoneId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading phone numbers...</p>
      </div>
    );
  }

  if (phones.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Phone Record
        </Button>
        <AddPhoneModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddPhones}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Phone Records</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone Number</TableHead>
              <TableHead>Client Provided</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPhones.map((phone) => (
              <TableRow key={phone.id}>
                <TableCell className="p-0">
                  <EditableText
                    value={phone.phoneNumber}
                    onSave={(value) => handleInlineUpdate(phone.id, 'phoneNumber', value)}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={phone.clientProvided}
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                    ]}
                    onSave={(value) => handleInlineUpdate(phone.id, 'clientProvided', value)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => handleEdit(phone)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(phone.id)}
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

      <AddPhoneModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPhones}
      />

      {editingPhone && (
        <EditPhoneModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPhone(null);
          }}
          phone={editingPhone}
          onUpdate={handleUpdatePhone}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPhoneId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this phone record? This action cannot be undone."
      />
    </div>
  );
};

export default PhoneTab;

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
import { EditableText } from "@/components/ui/editable-cell";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddUsernameModal from "@/components/modals/AddUsernameModal";
import EditUsernameModal from "@/components/modals/EditUsernameModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface UsernameRecord {
  id: string;
  username: string;
}

const ITEMS_PER_PAGE = 10;

const UsernameTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const [usernames, setUsernames] = useState<UsernameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<UsernameRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUsernameId, setDeletingUsernameId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsernames();
  }, [clientId]);

  const fetchUsernames = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/usernames`);

      if (response.ok) {
        const data = await response.json();
        setUsernames(data);
      }
    } catch (error) {
      console.error("Error fetching usernames:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(usernames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsernames = usernames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddUsernames = async (newUsernames: Omit<UsernameRecord, "id">[], isBulkMode?: boolean): Promise<void> => {
    try {
      const isBulkUpload = isBulkMode || false;

      if (isBulkUpload) {
        const usernamesText = newUsernames.map(u => u.username).join('\n');
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/usernames/bulk-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usernames_text: usernamesText }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to bulk upload usernames");
        }
      } else {
        for (const usernameData of newUsernames) {
          const response = await apiCall(`${BASE_URL}/clients/${clientId}/usernames`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: usernameData.username }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to add username");
          }
        }
      }

      await fetchUsernames();
      toast({
        title: "Success",
        description: "Username(s) added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add username(s)",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEdit = (username: UsernameRecord) => {
    setEditingUsername(username);
    setIsEditModalOpen(true);
  };

  const handleUpdateUsername = async (updatedUsername: UsernameRecord): Promise<void> => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/usernames/${updatedUsername.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: updatedUsername.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update username");
      }

      await fetchUsernames();
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof UsernameRecord, value: string) => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/usernames/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: value }),
      });

      if (response.ok) {
        await fetchUsernames();
        toast({
          title: "Success",
          description: "Username updated successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update username",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingUsernameId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingUsernameId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/usernames/${deletingUsernameId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete username");
      }
      
      await fetchUsernames();
      toast({
        title: "Success",
        description: "Username deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete username",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingUsernameId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading usernames...</p>
      </div>
    );
  }

  if (usernames.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Username Record
        </Button>
        <AddUsernameModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddUsernames}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Username Records</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsernames.map((username) => (
              <TableRow key={username.id}>
                <TableCell className="p-0">
                  <EditableText
                    value={username.username}
                    onSave={(value) => handleInlineUpdate(username.id, 'username', value)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => handleEdit(username)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(username.id)}
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

      <AddUsernameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUsernames}
      />

      {editingUsername && (
        <EditUsernameModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUsername(null);
          }}
          username={editingUsername}
          onUpdate={handleUpdateUsername}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUsernameId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this username record? This action cannot be undone."
      />
    </div>
  );
};

export default UsernameTab;

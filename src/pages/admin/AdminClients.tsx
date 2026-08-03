import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, UserPlus, UserCheck, UserX, Trash2, Edit } from "lucide-react";
import { EditableText, EditableDropdown } from "@/components/ui/editable-cell";
import { Checkbox } from "@/components/ui/checkbox";
import AdminLayout from "@/components/AdminLayout";
import AssignClientModal from "@/components/modals/AssignClientModal";
import AddClientModal from "@/components/modals/AddClientModal";
import EditClientModal from "@/components/modals/EditClientModal";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { BASE_URL } from "@/constants/api";

interface Client {
  ID: string;
  full_name: string;
  email: string;
  phone_number: string;
  organization: string;
  status: string;
  risk_score: string;
  tier?: string;
  darkside_module: boolean;
  snubase_module: boolean;
  analyst_id: number | null;
  created_at: string;
  other_names?: string;
  date_of_birth?: string;
  sex?: string;
  employer?: string;
  profile_photo_url?: string;
}

const ITEMS_PER_PAGE = 10;

const AdminClients = () => {
  const { apiCall } = useApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [assigningClientId, setAssigningClientId] = useState<string | null>(null);
  const [unassigningClientId, setUnassigningClientId] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients`);
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.other_names?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone_number?.includes(searchQuery) ||
      client.organization?.toLowerCase().includes(searchLower) ||
      client.employer?.toLowerCase().includes(searchLower) ||
      client.sex?.toLowerCase().includes(searchLower) ||
      client.status?.toLowerCase().includes(searchLower) ||
      client.risk_score?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentClients = filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAssign = (clientId: string) => {
    const client = clients.find(c => c.ID === clientId);
    if (client) {
      setSelectedClient(client);
      setIsAssignModalOpen(true);
    }
  };

  const handleAssignSubmit = async (email: string) => {
    if (selectedClient) {
      setAssigningClientId(selectedClient.ID);
      try {
        const response = await apiCall(`${BASE_URL}/clients/${selectedClient.ID}/assign`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ analyst_email: email }),
        });
        
        if (response.ok) {
          await fetchClients(); // Refresh the list
          toast({
            title: "Client Assigned",
            description: `Client ${selectedClient.full_name} has been assigned to ${email}`,
          });
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: typeof errorData.detail === 'string' ? errorData.detail : "Failed to assign client.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setAssigningClientId(null);
      }
    }
  };

  const handleUnassign = async (clientId: string) => {
    const client = clients.find(c => c.ID === clientId);
    if (!client) return;

    setUnassigningClientId(clientId);
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/unassign`, {
        method: "PUT",
      });
      
      if (response.ok) {
        await fetchClients(); // Refresh the list
        toast({
          title: "Client Unassigned",
          description: `Client ${client.full_name} has been unassigned successfully`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: typeof errorData.detail === 'string' ? errorData.detail : "Failed to unassign client.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUnassigningClientId(null);
    }
  };

  const handleDelete = async (clientId: string) => {
    const client = clients.find(c => c.ID === clientId);
    if (!client) return;

    setDeletingClientId(clientId);
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchClients(); // Refresh the list
        toast({
          title: "Client Deleted",
          description: `Client ${client.full_name} has been deleted successfully`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: typeof errorData.detail === 'string' ? errorData.detail : "Failed to delete client.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleEdit = (clientId: string) => {
    const client = clients.find(c => c.ID === clientId);
    if (client) {
      setClientToEdit(client);
      setIsEditClientModalOpen(true);
    }
  };

  const handleEditClient = async (clientData: any) => {
    if (!clientToEdit) return;
    
    try {
      const formData = new FormData();
      Object.keys(clientData).forEach(key => {
        if (key === 'profile_photo' && clientData[key]) {
          formData.append('profile_photo', clientData[key]);
        } else if (key !== 'profile_photo') {
          formData.append(key, clientData[key]);
        }
      });
      
      const response = await apiCall(`${BASE_URL}/clients/${clientToEdit.ID}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) {
        await fetchClients();
        toast({
          title: "Client Updated",
          description: `Client ${clientData.full_name} has been updated successfully`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: typeof errorData.detail === 'string' ? errorData.detail : "Failed to update client.",
          variant: "destructive",
        });
        throw new Error("Failed to update client");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleAddClient = async (clientData: any) => {
    try {
      const formData = new FormData();
      Object.keys(clientData).forEach(key => {
        if (key === 'profile_photo' && clientData[key]) {
          formData.append('profile_photo', clientData[key]);
        } else if (key !== 'profile_photo') {
          formData.append(key, clientData[key]);
        }
      });
      
      const response = await apiCall(`${BASE_URL}/clients`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        await fetchClients();
        toast({
          title: "Client Added",
          description: `Client ${clientData.full_name} has been added successfully`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: typeof errorData.detail === 'string' ? errorData.detail : "Failed to add client.",
          variant: "destructive",
        });
        throw new Error("Failed to add client");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInlineUpdate = async (clientId: string, field: keyof Client, value: any) => {
    try {
      const formData = new FormData();
      formData.append(field, value);

      const response = await apiCall(`${BASE_URL}/clients/${clientId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        await fetchClients();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading clients...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground text-base">Manage all client information</p>
          </div>
          <Button className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all" onClick={() => setIsAddClientModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name, email, phone, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-medium overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Darkside Module</TableHead>
                <TableHead>Snubase Module</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.length > 0 ? (
                currentClients.map((client) => (
                  <TableRow key={client.ID}>
                    <TableCell className="p-0">
                      <EditableText
                        value={client.full_name}
                        onSave={(value) => handleInlineUpdate(client.ID, 'full_name', value)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableText
                        value={client.email ? client.email.split('\n')[0] : ''}
                        onSave={(value) => handleInlineUpdate(client.ID, 'emails', value)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableText
                        value={client.phone_number ? client.phone_number.split('\n')[0] : ''}
                        onSave={(value) => handleInlineUpdate(client.ID, 'phone_numbers', value)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableText
                        value={client.organization}
                        onSave={(value) => handleInlineUpdate(client.ID, 'organization', value)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableDropdown
                        value={client.tier || ""}
                        options={[
                          { value: "STANDARD", label: "Standard" },
                          { value: "RESTRICTED", label: "Restricted" },
                        ]}
                        onSave={(value) => handleInlineUpdate(client.ID, 'tier', value)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <div className="px-4 py-3">
                        <Checkbox
                          checked={client.darkside_module}
                          onCheckedChange={(checked) => handleInlineUpdate(client.ID, 'darkside_module', checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="p-0">
                      <div className="px-4 py-3">
                        <Checkbox
                          checked={client.snubase_module}
                          onCheckedChange={(checked) => handleInlineUpdate(client.ID, 'snubase_module', checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(client.ID)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {client.analyst_id ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={unassigningClientId === client.ID || deletingClientId === client.ID}
                            onClick={() => handleUnassign(client.ID)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            {unassigningClientId === client.ID ? "Unassigning..." : "Unassign"}
                          </Button>
                        ) : (
                          <Button 
                            className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
                            size="sm"
                            disabled={assigningClientId === client.ID || deletingClientId === client.ID}
                            onClick={() => handleAssign(client.ID)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {assigningClientId === client.ID ? "Assigning..." : "Assign"}
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={deletingClientId === client.ID || assigningClientId === client.ID || unassigningClientId === client.ID}
                          onClick={() => handleDelete(client.ID)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {searchQuery ? `No clients found matching "${searchQuery}"` : "No clients found"}
                  </TableCell>
                </TableRow>
              )}
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

        <AssignClientModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedClient(null);
          }}
          onAssign={handleAssignSubmit}
          clientName={selectedClient?.full_name || ""}
        />

        <AddClientModal
          isOpen={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
          onAdd={handleAddClient}
        />

        <EditClientModal
          isOpen={isEditClientModalOpen}
          onClose={() => {
            setIsEditClientModalOpen(false);
            setClientToEdit(null);
          }}
          onUpdate={handleEditClient}
          client={clientToEdit}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminClients;

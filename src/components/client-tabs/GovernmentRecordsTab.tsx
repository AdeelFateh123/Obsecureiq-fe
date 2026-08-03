import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditableTextarea, EditableText, EditableDropdown } from "@/components/ui/editable-cell";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { handleApiResponse } from "@/contexts/AuthContext";

// Import existing modals
import AddVoterModal from "@/components/modals/AddVoterModal";
import EditVoterModal from "@/components/modals/EditVoterModal";
import AddDonorModal from "@/components/modals/AddDonorModal";
import AddDvmModal from "@/components/modals/AddDmvModal";
import EditDvmModal from "@/components/modals/EditDmvModal";
import AddGovernmentModal from "@/components/modals/AddGovernmentModal";
import EditGovernmentModal from "@/components/modals/EditGovernmentModal";

const ITEMS_PER_PAGE = 10;

interface VoterRecord {
  id: string;
  voter_record: string;
  created_at?: string;
  updated_at?: string;
}

interface DonorRecord {
  id: string;
  contributor_name: string | null;
  recipient: string | null;
  recipient_date: string | null;
  contribution_amount: string | null;
  csv_file: string | null;
}

interface DVMRecord {
  id: string;
  dvm_record: string;
  created_at?: string;
  updated_at?: string;
}

interface GovernmentRecord {
  id: string;
  record_type: string;
  record: string;
  created_at?: string;
  updated_at?: string;
}

interface GovernmentRecordsTabProps {
  clientId: string;
}

const GovernmentRecordsTab = ({ clientId }: GovernmentRecordsTabProps) => {
  const { apiCall } = useApi();
  const { toast } = useToast();

  // Voter Records State
  const [voterRecords, setVoterRecords] = useState<VoterRecord[]>([]);
  const [voterLoading, setVoterLoading] = useState(true);
  const [voterCurrentPage, setVoterCurrentPage] = useState(1);
  const [isAddVoterModalOpen, setIsAddVoterModalOpen] = useState(false);
  const [isEditVoterModalOpen, setIsEditVoterModalOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<VoterRecord | null>(null);
  const [isVoterDeleteModalOpen, setIsVoterDeleteModalOpen] = useState(false);
  const [deletingVoterId, setDeletingVoterId] = useState<string | null>(null);

  // Donor Records State
  const [donorRecords, setDonorRecords] = useState<DonorRecord[]>([]);
  const [donorLoading, setDonorLoading] = useState(true);
  const [donorCurrentPage, setDonorCurrentPage] = useState(1);
  const [isAddDonorModalOpen, setIsAddDonorModalOpen] = useState(false);

  const [isDonorDeleteModalOpen, setIsDonorDeleteModalOpen] = useState(false);
  const [deletingDonorId, setDeletingDonorId] = useState<string | null>(null);

  // DVM Records State
  const [dvmRecords, setDvmRecords] = useState<DVMRecord[]>([]);
  const [dvmLoading, setDvmLoading] = useState(true);
  const [dvmCurrentPage, setDvmCurrentPage] = useState(1);
  const [isAddDvmModalOpen, setIsAddDvmModalOpen] = useState(false);
  const [isEditDvmModalOpen, setIsEditDvmModalOpen] = useState(false);
  const [editingDvm, setEditingDvm] = useState<DVMRecord | null>(null);
  const [isDvmDeleteModalOpen, setIsDvmDeleteModalOpen] = useState(false);
  const [deletingDvmId, setDeletingDvmId] = useState<string | null>(null);

  // Government Records State
  const [govRecords, setGovRecords] = useState<GovernmentRecord[]>([]);
  const [govLoading, setGovLoading] = useState(true);
  const [govCurrentPage, setGovCurrentPage] = useState(1);
  const [isAddGovModalOpen, setIsAddGovModalOpen] = useState(false);
  const [isEditGovModalOpen, setIsEditGovModalOpen] = useState(false);
  const [editingGov, setEditingGov] = useState<GovernmentRecord | null>(null);
  const [isGovDeleteModalOpen, setIsGovDeleteModalOpen] = useState(false);
  const [deletingGovId, setDeletingGovId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllRecords();
  }, [clientId]);

  const fetchAllRecords = async () => {
    await Promise.all([
      fetchVoterRecords(),
      fetchDonorRecords(),
      fetchDvmRecords(),
      fetchGovRecords()
    ]);
  };

  // Voter Records Functions
  const fetchVoterRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/voter-records`);
      
      await handleApiResponse(response);
      
      if (response.ok) {
        const data = await response.json();
        setVoterRecords(data);
      }
    } catch (error) {
      console.error("Error fetching voter records:", error);
    } finally {
      setVoterLoading(false);
    }
  };

  // Donor Records Functions
  const fetchDonorRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/donor-records`);
      
      await handleApiResponse(response);
      
      if (response.ok) {
        const data = await response.json();
        setDonorRecords(data);
      }
    } catch (error) {
      console.error("Error fetching donor records:", error);
    } finally {
      setDonorLoading(false);
    }
  };

  // DVM Records Functions
  const fetchDvmRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/dvm-records`);
      
      await handleApiResponse(response);
      
      if (response.ok) {
        const data = await response.json();
        setDvmRecords(data);
      }
    } catch (error) {
      console.error("Error fetching DMV records:", error);
    } finally {
      setDvmLoading(false);
    }
  };

  // Government Records Functions
  const fetchGovRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/gov-records`);
      
      await handleApiResponse(response);
      
      if (response.ok) {
        const data = await response.json();
        setGovRecords(data);
      }
    } catch (error) {
      console.error("Error fetching government records:", error);
    } finally {
      setGovLoading(false);
    }
  };

  // Inline update functions
  const handleVoterInlineUpdate = async (id: string, field: keyof VoterRecord, value: string) => {
    if (field === 'voter_record') {
      try {
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/voter-records/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ voter_record: value }),
        });
        await handleApiResponse(response);
        if (response.ok) await fetchVoterRecords();
      } catch (error) {
        toast({ title: "Error", description: "Failed to update voter record", variant: "destructive" });
      }
    }
  };



  const handleDvmInlineUpdate = async (id: string, field: keyof DVMRecord, value: string) => {
    if (field === 'dvm_record') {
      try {
        const response = await apiCall(`${BASE_URL}/clients/${clientId}/dvm-records/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dvm_record: value }),
        });
        await handleApiResponse(response);
        if (response.ok) await fetchDvmRecords();
      } catch (error) {
        toast({ title: "Error", description: "Failed to update DMV record", variant: "destructive" });
      }
    }
  };

  const handleGovInlineUpdate = async (id: string, field: keyof GovernmentRecord, value: string) => {
    try {
      let updateData: any = {};
      if (field === 'record_type') updateData.record_type = value;
      else if (field === 'record') updateData.record = value;

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/gov-records/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      await handleApiResponse(response);
      
      if (response.ok) {
        await fetchGovRecords();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update government record");
      }
    } catch (error) {
      console.error("Error updating government record:", error);
      toast({ title: "Error", description: error.message || "Failed to update government record", variant: "destructive" });
    }
  };

  // Delete functions
  const deleteVoterRecord = (id: string) => {
    setDeletingVoterId(id);
    setIsVoterDeleteModalOpen(true);
  };

  const confirmVoterDelete = async (): Promise<void> => {
    if (!deletingVoterId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/voter-records/${deletingVoterId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete voter record");
      }
      
      await fetchVoterRecords();
      toast({ title: "Success", description: "Voter record deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete voter record", variant: "destructive" });
      throw error;
    } finally {
      setDeletingVoterId(null);
    }
  };

  const deleteDonorRecord = (id: string) => {
    setDeletingDonorId(id);
    setIsDonorDeleteModalOpen(true);
  };

  const confirmDonorDelete = async (): Promise<void> => {
    if (!deletingDonorId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/donor-records/${deletingDonorId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete donor record");
      }
      
      await fetchDonorRecords();
      toast({ title: "Success", description: "Donor record deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete donor record", variant: "destructive" });
      throw error;
    } finally {
      setDeletingDonorId(null);
    }
  };

  const deleteDvmRecord = (id: string) => {
    setDeletingDvmId(id);
    setIsDvmDeleteModalOpen(true);
  };

  const confirmDvmDelete = async (): Promise<void> => {
    if (!deletingDvmId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/dvm-records/${deletingDvmId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete DMV record");
      }
      
      await fetchDvmRecords();
      toast({ title: "Success", description: "DMV record deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete DMV record", variant: "destructive" });
      throw error;
    } finally {
      setDeletingDvmId(null);
    }
  };

  const deleteGovRecord = (id: string) => {
    setDeletingGovId(id);
    setIsGovDeleteModalOpen(true);
  };

  const confirmGovDelete = async (): Promise<void> => {
    if (!deletingGovId) return;
    
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/gov-records/${deletingGovId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete government record");
      }
      
      await fetchGovRecords();
      toast({ title: "Success", description: "Government record deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete government record", variant: "destructive" });
      throw error;
    } finally {
      setDeletingGovId(null);
    }
  };

  // Pagination calculations
  const voterTotalPages = Math.ceil(voterRecords.length / ITEMS_PER_PAGE);
  const voterStartIndex = (voterCurrentPage - 1) * ITEMS_PER_PAGE;
  const voterCurrentRecords = voterRecords.slice(voterStartIndex, voterStartIndex + ITEMS_PER_PAGE);

  const donorTotalPages = Math.ceil(donorRecords.length / ITEMS_PER_PAGE);
  const donorStartIndex = (donorCurrentPage - 1) * ITEMS_PER_PAGE;
  const donorCurrentRecords = donorRecords.slice(donorStartIndex, donorStartIndex + ITEMS_PER_PAGE);

  const dvmTotalPages = Math.ceil(dvmRecords.length / ITEMS_PER_PAGE);
  const dvmStartIndex = (dvmCurrentPage - 1) * ITEMS_PER_PAGE;
  const dvmCurrentRecords = dvmRecords.slice(dvmStartIndex, dvmStartIndex + ITEMS_PER_PAGE);

  const govTotalPages = Math.ceil(govRecords.length / ITEMS_PER_PAGE);
  const govStartIndex = (govCurrentPage - 1) * ITEMS_PER_PAGE;
  const govCurrentRecords = govRecords.slice(govStartIndex, govStartIndex + ITEMS_PER_PAGE);

  if (voterLoading || donorLoading || dvmLoading || govLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading government records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Voter Records Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Voter Records</h2>
          <Button variant="action" onClick={() => setIsAddVoterModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {voterRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No voter records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voter Record</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voterCurrentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="p-0 max-w-xl">
                        <EditableTextarea
                          value={record.voter_record}
                          onSave={(value) => handleVoterInlineUpdate(record.id, 'voter_record', value)}
                          rows={2}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="action" size="sm" onClick={() => {
                            setEditingVoter(record);
                            setIsEditVoterModalOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteVoterRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {voterTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setVoterCurrentPage(Math.max(1, voterCurrentPage - 1))}
                      className={voterCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: voterTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setVoterCurrentPage(page)}
                        isActive={page === voterCurrentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setVoterCurrentPage(Math.min(voterTotalPages, voterCurrentPage + 1))}
                      className={voterCurrentPage === voterTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Donor Records Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Donor Records</h2>
          <Button variant="action" onClick={() => setIsAddDonorModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {donorRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No donor records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CSV File</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donorCurrentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.csv_file ? (
                          <a href={record.csv_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View CSV File
                          </a>
                        ) : (
                          "No CSV file"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="destructive" size="sm" onClick={() => deleteDonorRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {donorTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setDonorCurrentPage(Math.max(1, donorCurrentPage - 1))}
                      className={donorCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: donorTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setDonorCurrentPage(page)}
                        isActive={page === donorCurrentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setDonorCurrentPage(Math.min(donorTotalPages, donorCurrentPage + 1))}
                      className={donorCurrentPage === donorTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* DMV Records Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">DMV Records</h2>
          <Button variant="action" onClick={() => setIsAddDvmModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {dvmRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No DMV records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DMV Record</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dvmCurrentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="p-0 max-w-xl">
                        <EditableTextarea
                          value={record.dvm_record}
                          onSave={(value) => handleDvmInlineUpdate(record.id, 'dvm_record', value)}
                          rows={2}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="action" size="sm" onClick={() => {
                            setEditingDvm(record);
                            setIsEditDvmModalOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteDvmRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {dvmTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setDvmCurrentPage(Math.max(1, dvmCurrentPage - 1))}
                      className={dvmCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: dvmTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setDvmCurrentPage(page)}
                        isActive={page === dvmCurrentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setDvmCurrentPage(Math.min(dvmTotalPages, dvmCurrentPage + 1))}
                      className={dvmCurrentPage === dvmTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Government Records Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Government Records</h2>
          <Button variant="action" onClick={() => setIsAddGovModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {govRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No government records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record Type</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {govCurrentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="p-0">
                        <EditableDropdown
                          value={record.record_type}
                          options={[
                            { value: "Citations", label: "Citations" },
                            { value: "Liens", label: "Liens" },
                          ]}
                          onSave={(value) => handleGovInlineUpdate(record.id, 'record_type', value)}
                        />
                      </TableCell>
                      <TableCell className="p-0 max-w-xl">
                        <EditableTextarea
                          value={record.record}
                          onSave={(value) => handleGovInlineUpdate(record.id, 'record', value)}
                          rows={2}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="action" size="sm" onClick={() => {
                            setEditingGov(record);
                            setIsEditGovModalOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteGovRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {govTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setGovCurrentPage(Math.max(1, govCurrentPage - 1))}
                      className={govCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: govTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setGovCurrentPage(page)}
                        isActive={page === govCurrentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setGovCurrentPage(Math.min(govTotalPages, govCurrentPage + 1))}
                      className={govCurrentPage === govTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddVoterModal
        isOpen={isAddVoterModalOpen}
        onClose={() => setIsAddVoterModalOpen(false)}
        onAdd={async (newRecords) => {
          try {
            const response = await apiCall(`${BASE_URL}/clients/${clientId}/voter-records`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ voter_record: newRecords[0].voterRecord }),
            });
            if (response.ok) {
              await fetchVoterRecords();
              toast({ title: "Success", description: "Voter record added successfully" });
            }
          } catch (error) {
            toast({ title: "Error", description: "Failed to add voter record", variant: "destructive" });
          }
        }}
      />

      {editingVoter && (
        <EditVoterModal
          isOpen={isEditVoterModalOpen}
          onClose={() => {
            setIsEditVoterModalOpen(false);
            setEditingVoter(null);
          }}
          record={editingVoter}
          onUpdate={async (updatedRecord) => {
            try {
              const response = await apiCall(`${BASE_URL}/clients/${clientId}/voter-records/${updatedRecord.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ voter_record: updatedRecord.voter_record }),
              });
              if (response.ok) {
                await fetchVoterRecords();
                toast({ title: "Success", description: "Voter record updated successfully" });
              }
            } catch (error) {
              toast({ title: "Error", description: "Failed to update voter record", variant: "destructive" });
            }
          }}
        />
      )}

      <AddDonorModal
        isOpen={isAddDonorModalOpen}
        onClose={() => setIsAddDonorModalOpen(false)}
        onAdd={async (csvFile): Promise<void> => {
          try {
            const formData = new FormData();
            formData.append('csv_file', csvFile);
            const response = await apiCall(`${BASE_URL}/clients/${clientId}/donor-records/csv-upload`, {
              method: "POST",
              body: formData,
            });
            if (!response.ok) throw new Error("Failed to upload CSV");
            await fetchDonorRecords();
            toast({ title: "Success", description: "Donor records uploaded successfully" });
          } catch (error) {
            toast({ title: "Error", description: "Failed to upload donor records", variant: "destructive" });
            throw error;
          }
        }}
      />



      <AddDvmModal
        isOpen={isAddDvmModalOpen}
        onClose={() => setIsAddDvmModalOpen(false)}
        onAdd={async (newRecords) => {
          try {
            const payload = { dvm_record: newRecords[0].dvmRecord };
            
            console.log("Sending DMV record payload:", payload);
            
            const response = await apiCall(`${BASE_URL}/clients/${clientId}/dvm-records`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            
            await handleApiResponse(response);
            
            if (response.ok) {
              await fetchDvmRecords();
              toast({ title: "Success", description: "DMV record added successfully" });
            } else {
              const errorData = await response.json();
              console.error("DVM API Error:", errorData);
              throw new Error(errorData.detail || "Failed to add DMV record");
            }
          } catch (error) {
            console.error("Error adding DMV record:", error);
            toast({ title: "Error", description: error.message || "Failed to add DMV record", variant: "destructive" });
            throw error;
          }
        }}
      />

      {editingDvm && (
        <EditDvmModal
          isOpen={isEditDvmModalOpen}
          onClose={() => {
            setIsEditDvmModalOpen(false);
            setEditingDvm(null);
          }}
          record={editingDvm}
          onUpdate={async (updatedRecord) => {
            try {
              const response = await apiCall(`${BASE_URL}/clients/${clientId}/dvm-records/${updatedRecord.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ dvm_record: updatedRecord.dvm_record }),
              });
              if (response.ok) {
                await fetchDvmRecords();
                toast({ title: "Success", description: "DMV record updated successfully" });
              }
            } catch (error) {
              toast({ title: "Error", description: "Failed to update DMV record", variant: "destructive" });
            }
          }}
        />
      )}

      <AddGovernmentModal
        isOpen={isAddGovModalOpen}
        onClose={() => setIsAddGovModalOpen(false)}
        onAdd={async (newRecords) => {
          try {
            const payload = {
              record_type: newRecords[0].recordType,
              record: newRecords[0].record,
            };
            
            console.log("Sending government record payload:", payload);
            
            const response = await apiCall(`${BASE_URL}/clients/${clientId}/gov-records`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            
            await handleApiResponse(response);
            
            if (response.ok) {
              await fetchGovRecords();
              toast({ title: "Success", description: "Government record added successfully" });
            } else {
              const errorData = await response.json();
              console.error("API Error:", errorData);
              throw new Error(errorData.detail || "Failed to add government record");
            }
          } catch (error) {
            console.error("Error adding government record:", error);
            toast({ title: "Error", description: error.message || "Failed to add government record", variant: "destructive" });
            throw error;
          }
        }}
      />

      {editingGov && (
        <EditGovernmentModal
          isOpen={isEditGovModalOpen}
          onClose={() => {
            setIsEditGovModalOpen(false);
            setEditingGov(null);
          }}
          record={editingGov}
          onUpdate={async (updatedRecord) => {
            try {
              const response = await apiCall(`${BASE_URL}/clients/${clientId}/gov-records/${updatedRecord.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  record_type: updatedRecord.record_type,
                  record: updatedRecord.record,
                }),
              });
              if (response.ok) {
                await fetchGovRecords();
                toast({ title: "Success", description: "Government record updated successfully" });
              }
            } catch (error) {
              toast({ title: "Error", description: "Failed to update government record", variant: "destructive" });
            }
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={isVoterDeleteModalOpen}
        onClose={() => {
          setIsVoterDeleteModalOpen(false);
          setDeletingVoterId(null);
        }}
        onConfirm={confirmVoterDelete}
        message="Are you sure you want to delete this voter record? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={isDonorDeleteModalOpen}
        onClose={() => {
          setIsDonorDeleteModalOpen(false);
          setDeletingDonorId(null);
        }}
        onConfirm={confirmDonorDelete}
        message="Are you sure you want to delete this donor record? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={isDvmDeleteModalOpen}
        onClose={() => {
          setIsDvmDeleteModalOpen(false);
          setDeletingDvmId(null);
        }}
        onConfirm={confirmDvmDelete}
        message="Are you sure you want to delete this DMV record? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={isGovDeleteModalOpen}
        onClose={() => {
          setIsGovDeleteModalOpen(false);
          setDeletingGovId(null);
        }}
        onConfirm={confirmGovDelete}
        message="Are you sure you want to delete this government record? This action cannot be undone."
      />
    </div>
  );
};

export default GovernmentRecordsTab;

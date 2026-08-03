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
import { EditableText, EditableCheckbox, EditableDropdown } from "@/components/ui/editable-cell";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddEmailModal from "@/components/modals/AddEmailModal";
import EditEmailModal from "@/components/modals/EditEmailModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import ViewDataModal from "@/components/modals/ViewDataModal";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface EmailRecord {
  id: string;
  email: string;
  validationSource: string;
  status: string;
  emailTagAutomation: boolean;
  processedCount?: number;
}

interface MatchingResult {
  id: string;
  client_id: string;
  matching_result: string;
  client_data: string;
  module_data: string;
  email: string;
  module: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

const EmailTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEmailId, setDeletingEmailId] = useState<string | null>(null);
  const [viewDataModal, setViewDataModal] = useState<{
    isOpen: boolean;
    title: string;
    data: string;
    type?: "json" | "text";
  }>({ isOpen: false, title: "", data: "", type: "json" });
  const [emailResultsModal, setEmailResultsModal] = useState<{
    isOpen: boolean;
    email: string;
    results: MatchingResult[];
  }>({ isOpen: false, email: "", results: [] });
  const [isDeleteResultModalOpen, setIsDeleteResultModalOpen] = useState(false);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // First fetch matching results
        const matchingResponse = await apiCall(`${BASE_URL}/clients/${clientId}/matching-results`);
        let matchingData = [];
        if (matchingResponse.ok) {
          matchingData = await matchingResponse.json();
          setMatchingResults(matchingData);
        }

        // Then fetch emails and calculate processed count immediately
        const emailResponse = await apiCall(`${BASE_URL}/clients/${clientId}/emails`);
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          const mappedData = emailData.map((item: any) => ({
            id: item.id,
            email: item.email,
            validationSource: item.validation_sources?.length > 0 ? item.validation_sources.join(', ') : '',
            status: item.status || '',
            emailTagAutomation: item.email_tag || false,
            processedCount: matchingData.filter((result: any) => result.email === item.email).length,
          }));
          setEmails(mappedData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const loadDataSilently = async () => {
      try {
        // Fetch matching results silently (no loading state)
        const matchingResponse = await apiCall(`${BASE_URL}/clients/${clientId}/matching-results`);
        let matchingData = [];
        if (matchingResponse.ok) {
          matchingData = await matchingResponse.json();
          setMatchingResults(matchingData);
          
          // Update emails with new processed counts
          setEmails(prevEmails => 
            prevEmails.map(email => ({
              ...email,
              processedCount: matchingData.filter((result: any) => result.email === email.email).length
            }))
          );
        }
      } catch (error) {
        console.error("Error silently loading data:", error);
      }
    };
    
    loadData();
    
    // Auto-refresh every 10 seconds silently (no page refresh, no loading state)
    const interval = setInterval(() => {
      loadDataSilently();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [clientId]);

  // Remove the separate useEffect for updating processed counts since we do it in the main load

  const fetchEmails = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/emails`);

      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          email: item.email,
          validationSource: item.validation_sources?.length > 0 ? item.validation_sources.join(', ') : '',
          status: item.status || '',
          emailTagAutomation: item.email_tag || false,
          processedCount: 0, // Will be updated by useEffect
        }));
        setEmails(mappedData);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const fetchMatchingResults = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/matching-results`);
      if (response.ok) {
        const data = await response.json();
        setMatchingResults(data);
      }
    } catch (error) {
      console.error("Error fetching matching results:", error);
    }
  };

  const totalPages = Math.ceil(emails.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEmails = emails.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddEmails = async (newEmails: Omit<EmailRecord, "id">[], isBulkMode?: boolean): Promise<void> => {
    try {
      const isBulkUpload = isBulkMode || false;

      if (isBulkUpload) {
          const emailsText = newEmails.map(e => e.email).join('\n');

          const response = await apiCall(
            `${BASE_URL}/clients/${clientId}/emails/bulk-upload`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                emails_text: emailsText,
                status: newEmails[0]?.status || "Client Provided"
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to bulk upload emails");
          }

          const result = await response.json();

          // ✅ HANDLE BACKEND RESPONSE
          if (result.status === "success") {
            toast({
              title: "Success",
              description: result.message || "Email(s) added successfully",
            });
            await fetchEmails();
            return;
          } else if (result.status === "info") {
            // Emails already exist - this is from backend when duplicates found
            toast({
              title: "Error",
              description: result.message || "Email already exists for this client",
              variant: "destructive",
            });
            await fetchEmails();
            throw new Error("DUPLICATE_EMAIL");
          }
        } else {
        for (const emailData of newEmails) {
          const backendData = {
            email: emailData.email,
            status: emailData.status || null,
            validation_sources: emailData.validationSource ? emailData.validationSource.split(', ').filter(s => s.trim()) : [],
            email_tag: emailData.emailTagAutomation,
          };

          const response = await apiCall(`${BASE_URL}/clients/${clientId}/emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(backendData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400 && errorData.detail === "Email already exists") {
              toast({
                title: "Error",
                description: "Email already exists for this client",
                variant: "destructive",
              });
              throw new Error("DUPLICATE_EMAIL");
            }
            if (response.status === 400 && errorData.detail.includes("Add at least one client provided phone number")) {
              toast({
                title: "Error",
                description: errorData.detail.replace(/&quot;/g, '"'),
                variant: "destructive",
              });
              throw new Error("EMAIL_TAG_VALIDATION");
            }
            throw new Error(errorData.detail || "Failed to add email");
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchMatchingResults();
      await fetchEmails();
      toast({
        title: "Success",
        description: "Email(s) added successfully",
      });
    } catch (error: any) {
      if (error.message !== "DUPLICATE_EMAIL" && error.message !== "EMAIL_TAG_VALIDATION") {
        toast({
          title: "Error",
          description: "Failed to add email(s)",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleEdit = (email: EmailRecord) => {
    setEditingEmail(email);
    setIsEditModalOpen(true);
  };

  const handleUpdateEmail = async (updatedEmail: EmailRecord): Promise<void> => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/emails/${updatedEmail.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updatedEmail.email,
          status: updatedEmail.status,
          validation_sources: updatedEmail.validationSource.split(', ').filter(s => s.trim()),
          email_tag: updatedEmail.emailTagAutomation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.detail === "Email already exists") {
          toast({
            title: "Error",
            description: "Email already exists for this client",
            variant: "destructive",
          });
          throw new Error("DUPLICATE_EMAIL");
        }
        if (response.status === 400 && errorData.detail.includes("Add at least one client provided phone number")) {
          toast({
            title: "Error",
            description: errorData.detail.replace(/&quot;/g, '"'),
            variant: "destructive",
          });
          throw new Error("EMAIL_TAG_VALIDATION");
        }
        throw new Error(errorData.detail || "Failed to update email");
      }

      await fetchMatchingResults();
      await fetchEmails();
      toast({
        title: "Success",
        description: "Email updated successfully",
      });
    } catch (error: any) {
      if (error.message !== "DUPLICATE_EMAIL" && error.message !== "EMAIL_TAG_VALIDATION") {
        toast({
          title: "Error",
          description: "Failed to update email",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof EmailRecord, value: string | boolean) => {
    let updateData: any = {};

    if (field === 'validationSource') {
      updateData.validation_sources = typeof value === 'string' ? value.split(', ').filter(s => s.trim()) : [];
    } else if (field === 'emailTagAutomation') {
      updateData.email_tag = value;
    } else {
      updateData[field] = value;
    }

    const response = await apiCall(`${BASE_URL}/clients/${clientId}/emails/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400 && errorData.detail) {
        // Handle HTML-encoded quotes in error message
        const cleanedMessage = errorData.detail.replace(/&quot;/g, '"');
        throw new Error(cleanedMessage);
      }
      throw new Error("Failed to update email");
    }
  };

  const handleDelete = (id: string) => {
    setDeletingEmailId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletingEmailId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/emails/${deletingEmailId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete email");
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchMatchingResults();
      await fetchEmails();
      toast({
        title: "Success",
        description: "Email deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingEmailId(null);
    }
  };

  const parseJsonData = (jsonString: string) => {
    try {
      return JSON.parse(jsonString.replace(/&quot;/g, '"'));
    } catch {
      return null;
    }
  };

  const parseModuleData = (moduleDataString: string) => {
    try {
      // Handle multiple levels of escaping
      let decoded = moduleDataString
        .replace(/&quot;/g, '"')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      
      // Parse the outer JSON structure
      let parsed = JSON.parse(decoded);
      
      // The data appears to be an object with JSON string values
      if (parsed && typeof parsed === 'object') {
        const results = [];
        
        // Extract each breach data
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string') {
            try {
              const breachData = JSON.parse(value);
              if (breachData && breachData.breach_name && breachData.extracted_data) {
                // Filter out N/A values from extracted_data
                const filteredData = {};
                for (const [field, fieldValue] of Object.entries(breachData.extracted_data)) {
                  if (Array.isArray(fieldValue)) {
                    const filtered = fieldValue.filter(item => item !== "N/A" && item !== null && item !== undefined);
                    if (filtered.length > 0) {
                      filteredData[field] = filtered;
                    }
                  } else if (fieldValue !== "N/A" && fieldValue !== null && fieldValue !== undefined) {
                    filteredData[field] = fieldValue;
                  }
                }
                
                if (Object.keys(filteredData).length > 0) {
                  results.push({
                    breach_name: breachData.breach_name,
                    extracted_data: filteredData
                  });
                }
              }
            } catch (e) {
              console.warn('Failed to parse breach data:', e);
            }
          }
        }
        
        return results.length > 0 ? results : null;
      }
      
      return null;
    } catch (e) {
      console.warn('Failed to parse module data:', e);
      return null;
    }
  };

  const getFinalBand = (matchingResult: string) => {
    const data = parseJsonData(matchingResult);
    if (!data) return "N/A";
    
    if (data.overall && data.overall.final_band) {
      return data.overall.final_band;
    }
    
    if (data.band) {
      return data.band;
    }
    
    return "N/A";
  };

  const handleViewEmailResults = (email: string) => {
    const emailResults = matchingResults.filter(result => result.email === email);
    setEmailResultsModal({ isOpen: true, email, results: emailResults });
  };

  const handleViewResultDetails = (result: MatchingResult) => {
    const matchingResult = parseJsonData(result.matching_result);
    const clientData = parseJsonData(result.client_data);
    
    let reorderedMatchingResult = matchingResult;
    if (matchingResult && matchingResult.overall) {
      const { overall, ...rest } = matchingResult;
      reorderedMatchingResult = { overall, ...rest };
    }
    
    const structuredData = {
      "Matching Result": reorderedMatchingResult || "No data available",
      "Module Data": result.module_data || "No data available", 
      "Client Data": clientData || "No data available"
    };
    
    setViewDataModal({ 
      isOpen: true, 
      title: "Matching Result Details", 
      data: JSON.stringify(structuredData), 
      type: "json" 
    });
  };

  const handleDeleteResult = (resultId: string) => {
    setDeletingResultId(resultId);
    setIsDeleteResultModalOpen(true);
  };

  const confirmDeleteResult = async (): Promise<void> => {
    if (!deletingResultId) return;

    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/matching-results/${deletingResultId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      await fetchMatchingResults();
      await fetchEmails();
      
      // Update the modal if it's open
      if (emailResultsModal.isOpen) {
        const updatedResults = emailResultsModal.results.filter(r => r.id !== deletingResultId);
        setEmailResultsModal(prev => ({ ...prev, results: updatedResults }));
      }
      
      toast({
        title: "Success",
        description: "Matching result deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete matching result",
        variant: "destructive",
      });
      throw error;
    } finally {
      setDeletingResultId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading emails...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Email Record
        </Button>
        <AddEmailModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddEmails}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Email Records</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Validation Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Tag Automation</TableHead>
              <TableHead>Processed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmails.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="p-0">
                  <EditableText
                    value={email.email}

                    // -----------------------------------------
                    // ✅ FIX: prevent duplicate inline saves
                    // -----------------------------------------
                    onSave={async (value) => {
                      if (updatingId === email.id) return;
                      try {
                        setUpdatingId(email.id);
                        await handleInlineUpdate(email.id, 'email', value);
                        await fetchMatchingResults();
                        await fetchEmails();
                        toast({
                          title: "Success",
                          description: "Email updated successfully",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to update email",
                          variant: "destructive",
                        });
                        throw error;
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                  />
                </TableCell>

                <TableCell className="p-0">
                  <EditableText
                    value={email.validationSource}

                    onSave={async (value) => {
                      if (updatingId === email.id) return;
                      try {
                        setUpdatingId(email.id);
                        await handleInlineUpdate(email.id, 'validationSource', value);
                        await fetchMatchingResults();
                        await fetchEmails();
                        toast({
                          title: "Success",
                          description: "Validation source updated successfully",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to update validation source",
                          variant: "destructive",
                        });
                        throw error;
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                  />
                </TableCell>

                <TableCell className="p-0">
                  <EditableDropdown
                    value={email.status}
                    options={[
                      { value: "Client Provided", label: "Client Provided" },
                      { value: "Low Confidence", label: "Low Confidence" },
                      { value: "Low/Medium Confidence", label: "Low/Medium Confidence" },
                      { value: "Medium Confidence", label: "Medium Confidence" },
                      { value: "Medium/High Confidence", label: "Medium/High Confidence" },
                      { value: "Validated", label: "Validated" },
                    ]}

                    onSave={async (value) => {
                      if (updatingId === email.id) return;
                      try {
                        setUpdatingId(email.id);
                        await handleInlineUpdate(email.id, 'status', value);
                        await fetchMatchingResults();
                        await fetchEmails();
                        toast({
                          title: "Success",
                          description: "Status updated successfully",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to update status",
                          variant: "destructive",
                        });
                        throw error;
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                  />
                </TableCell>

                <TableCell className="p-0">
                  <EditableCheckbox

                    value={email.emailTagAutomation}

                    onSave={async (value) => {
                      if (updatingId === email.id) return;
                      try {
                        setUpdatingId(email.id);
                        await handleInlineUpdate(email.id, 'emailTagAutomation', value);
                        await fetchMatchingResults();
                        await fetchEmails();
                        toast({
                          title: "Success",
                          description: "Email tag automation updated successfully",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to update email tag automation",
                          variant: "destructive",
                        });
                        throw error;
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                  />
                </TableCell>

                <TableCell>
                  {email.processedCount || 0}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => handleViewEmailResults(email.email)}
                      disabled={!email.processedCount || email.processedCount === 0}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => handleEdit(email)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(email.id)}
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

      <AddEmailModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEmails}
      />

      {editingEmail && (
        <EditEmailModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEmail(null);
          }}
          email={editingEmail}
          onUpdate={handleUpdateEmail}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEmailId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this email record? This action cannot be undone."
      />

      {/* Email Results Modal */}
      <Dialog open={emailResultsModal.isOpen} onOpenChange={() => setEmailResultsModal({ isOpen: false, email: "", results: [] })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Matching Results for {emailResultsModal.email}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Final Band</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[150px]">Module</TableHead>
                  <TableHead className="text-right w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailResultsModal.results.map((result) => {
                  const finalBand = getFinalBand(result.matching_result);
                  return (
                    <TableRow key={result.id}>
                      <TableCell>
                        <Badge 
                          variant={finalBand === "None" ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {finalBand}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{result.email}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{result.module}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="action"
                            size="sm"
                            onClick={() => handleViewResultDetails(result)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteResult(result.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Details Modal */}
      <ViewDataModal
        isOpen={viewDataModal.isOpen}
        onClose={() => setViewDataModal({ isOpen: false, title: "", data: "", type: "json" })}
        title={viewDataModal.title}
        data={viewDataModal.data}
        type={viewDataModal.type}
      />

      {/* Delete Result Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteResultModalOpen}
        onClose={() => {
          setIsDeleteResultModalOpen(false);
          setDeletingResultId(null);
        }}
        onConfirm={confirmDeleteResult}
        message="Are you sure you want to delete this matching result? This action cannot be undone."
      />

    </div>
  );
};

export default EmailTab;

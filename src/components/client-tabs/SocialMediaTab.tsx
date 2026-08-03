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
import AddSocialMediaModal from "@/components/modals/AddSocialMediaModal";
import EditSocialMediaModal from "@/components/modals/EditSocialMediaModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import ImageViewer from "@/components/ui/image-viewer";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface SocialMediaRecord {
  id: string;
  platform: string;
  profileUrl: string;
  privacy: string;
  whatIsExposed: string;
  engagementLevel: string;
  confidenceLevel: string;
  analystNotes: string;
  images: string[];
}

const ITEMS_PER_PAGE = 10;

const SocialMediaTab = ({ clientId }: { clientId: string }) => {
  const { apiCall } = useApi();
  const [records, setRecords] = useState<SocialMediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SocialMediaRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get unique platforms from existing records
  const getAllPlatformOptions = () => {
    const predefinedPlatforms = [
      "Facebook", "YouTube", "Instagram", "TikTok", "Telegram", 
      "Snapchat", "Spotify", "Twitter", "Pinterest", "Reddit", 
      "Quora", "Discord"
    ];
    
    // Always include predefined platforms + "Other" option
    const allOptions = [
      ...predefinedPlatforms.map(p => ({ value: p, label: p })),
      { value: "Other", label: "Other" }
    ];
    
    return allOptions;
  };

  // Check if platform is custom (not in predefined list)
  const isCustomPlatform = (platform: string) => {
    const predefinedPlatforms = [
      "Facebook", "YouTube", "Instagram", "TikTok", "Telegram", 
      "Snapchat", "Spotify", "Twitter", "Pinterest", "Reddit", 
      "Quora", "Discord"
    ];
    return !predefinedPlatforms.includes(platform);
  };

  useEffect(() => {
    fetchSocialAccounts();
  }, [clientId]);

  const fetchSocialAccounts = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/social-accounts`);

      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          platform: item.platform,
          profileUrl: item.profile_url,
          privacy: item.privacy || "",
          whatIsExposed: item.what_is_exposed ? item.what_is_exposed.join(", ") : "",
          engagementLevel: item.engagement_level || "",
          confidenceLevel: item.confidence_level || "",
          analystNotes: item.analyst_notes || "",
          images: item.images || [],
        }));
        setRecords(mappedData);
      }
    } catch (error) {
      console.error("Error fetching social accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddRecords = async (record: any): Promise<void> => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        platform: record.platform,
        profile_url: record.profileUrl,
        privacy: record.privacy || "",
        what_is_exposed: record.whatIsExposed || "",
        engagement_level: record.engagementLevel || "",
        confidence_level: record.confidenceLevel || "",
        analyst_notes: record.analystNotes || "",
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add image files
      if (record.imageFiles && record.imageFiles.length > 0) {
        for (const file of record.imageFiles) {
          formData.append('images', file);
        }
      }

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/social-accounts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to add social media account",
          variant: "destructive",
        });
        throw new Error("Failed to add social media account");
      }

      await fetchSocialAccounts();
      toast({
        title: "Success",
        description: "Social media account added successfully",
      });
    } catch (error: any) {
      if (!error.message.includes("Failed to add social media account")) {
        toast({
          title: "Error",
          description: "Failed to add social media account",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleEdit = (record: SocialMediaRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: any): Promise<void> => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        platform: updatedRecord.platform,
        profile_url: updatedRecord.profileUrl,
        privacy: updatedRecord.privacy || "",
        what_is_exposed: updatedRecord.whatIsExposed || "",
        engagement_level: updatedRecord.engagementLevel || "",
        confidence_level: updatedRecord.confidenceLevel || "",
        analyst_notes: updatedRecord.analystNotes || "",
        remaining_images: updatedRecord.remainingImages || [], // Images user kept
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add new image files
      if (updatedRecord.newImageFiles && updatedRecord.newImageFiles.length > 0) {
        for (const file of updatedRecord.newImageFiles) {
          formData.append('images', file);
        }
      }

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/social-accounts/${updatedRecord.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update social media account",
          variant: "destructive",
        });
        throw new Error("Failed to update social media account");
      }

      await fetchSocialAccounts();
      toast({
        title: "Success",
        description: "Social media account updated successfully",
      });
    } catch (error: any) {
      if (!error.message.includes("Failed to update social media account")) {
        toast({
          title: "Error",
          description: "Failed to update social media account",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof SocialMediaRecord, value: string) => {
    try {
      const formData = new FormData();
      
      // For inline updates, we only update the specific field
      const updateData = { [field]: value };
      formData.append('data', JSON.stringify(updateData));

      const response = await apiCall(`${BASE_URL}/clients/${clientId}/social-accounts/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        await fetchSocialAccounts();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update social media account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update social media account",
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
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/social-accounts/${deletingRecordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete social media account");
      }

      await fetchSocialAccounts();
      toast({
        title: "Success",
        description: "Social media account deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete social media account",
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
        <p className="text-muted-foreground">Loading social media accounts...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">No data found for this client.</p>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Social Media Record
        </Button>
        <AddSocialMediaModal
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
        <h2 className="text-2xl font-bold text-foreground">Social Media Presence</h2>
        <Button variant="action" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Profile URL</TableHead>
              <TableHead>Privacy</TableHead>
              <TableHead>What is Exposed</TableHead>
              <TableHead>Engagement Level</TableHead>
              <TableHead>Confidence Level</TableHead>
              <TableHead>Analyst Notes</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span className="text-sm">
                      {isCustomPlatform(record.platform) ? record.platform : record.platform}
                    </span>
                    {isCustomPlatform(record.platform) && (
                      <span className="text-xs text-muted-foreground">(Custom)</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-0 max-w-xs">
                  <EditableText
                    value={record.profileUrl}
                    onSave={(value) => handleInlineUpdate(record.id, 'profileUrl', value)}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={record.privacy}
                    options={[
                      { value: "Private", label: "Private" },
                      { value: "Semi-private", label: "Semi-private" },
                      { value: "Public", label: "Public" },
                    ]}
                    onSave={(value) => handleInlineUpdate(record.id, 'privacy', value)}
                  />
                </TableCell>
                <TableCell>
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    {record.whatIsExposed || "Not specified"}
                  </div>
                </TableCell>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={record.engagementLevel}
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Semi Active", label: "Semi Active" },
                      { value: "Dormant", label: "Dormant" },
                    ]}
                    onSave={(value) => handleInlineUpdate(record.id, 'engagementLevel', value)}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableDropdown
                    value={record.confidenceLevel}
                    options={[
                      { value: "Low", label: "Low" },
                      { value: "Medium", label: "Medium" },
                      { value: "High", label: "High" },
                    ]}
                    onSave={(value) => handleInlineUpdate(record.id, 'confidenceLevel', value)}
                  />
                </TableCell>
                <TableCell>
                  <div className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
                    {record.analystNotes || "No notes"}
                  </div>
                </TableCell>
                <TableCell>
                  <ImageViewer images={record.images} />
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

      <AddSocialMediaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRecords}
      />

      {editingRecord && (
        <EditSocialMediaModal
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
        message="Are you sure you want to delete this social media record? This action cannot be undone."
      />
    </div>
  );
};

export default SocialMediaTab;

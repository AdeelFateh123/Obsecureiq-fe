import { Trash2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalystLayout from "@/components/AnalystLayout";
import { useEffect, useState, useRef } from "react";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

interface Document {
  id: string;
  client_name: string;
  file_name: string;
  view_url: string;
  download_url: string;
  status: string;
  created_at: string;
}

interface ClientDocuments {
  client: {
    id: string;
    full_name: string;
    email: string;
  };
  documents: Document[];
}

const AnalystGeneratedDocuments = () => {
  const { apiCall } = useApi();
  const { toast } = useToast();
  const [clientDocuments, setClientDocuments] = useState<ClientDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{id: string, clientId: string, fileName: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDocuments();
    
    // Start polling every 5 seconds
    pollingInterval.current = setInterval(() => {
      fetchDocuments();
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/analyst/clients`);
      
      if (response.ok) {
        const clients = await response.json();
        const documentsPromises = clients.map(async (client: any) => {
          const docResponse = await apiCall(`${BASE_URL}/api/clients/${client.ID}/documents`);
          if (docResponse.ok) {
            return await docResponse.json();
          }
          return null;
        });
        
        const results = await Promise.all(documentsPromises);
        setClientDocuments(results.filter(result => result && result.documents.length > 0));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      if (loading) setLoading(false); // Only set loading false on initial load
    }
  };

  const handleView = (viewUrl: string) => {
    window.open(viewUrl, '_blank');
  };

  const handleDeleteClick = (documentId: string, clientId: string, fileName: string) => {
    setSelectedDocument({ id: documentId, clientId, fileName });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    try {
      const response = await apiCall(`${BASE_URL}/api/clients/${selectedDocument.clientId}/documents/${selectedDocument.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
        // Refresh the documents list
        fetchDocuments();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to delete document",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedDocument(null);
    }
  };

  if (loading) {
    return (
      <AnalystLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Generated Documents</h1>
            <p className="text-muted-foreground mt-2">Loading your generated documents...</p>
          </div>
        </div>
      </AnalystLayout>
    );
  }

  return (
    <AnalystLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generated Documents</h1>
          <p className="text-muted-foreground mt-2">View and download your generated documents</p>
        </div>

        {clientDocuments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No generated documents found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {clientDocuments.map((clientData) => (
              <div key={clientData.client.id} className="space-y-3">
                <h2 className="text-xl font-semibold">{clientData.client.full_name}</h2>
                {clientData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-card rounded-lg shadow-medium border border-border p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#010F3C] flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.file_name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                            doc.status === 'progress' ? 'bg-yellow-100 text-yellow-800' :
                            doc.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doc.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(doc.view_url)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(doc.id, clientData.client.id, doc.file_name)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedDocument(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Document"
          message={`Are you sure you want to delete "${selectedDocument?.fileName}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      </div>
    </AnalystLayout>
  );
};

export default AnalystGeneratedDocuments;

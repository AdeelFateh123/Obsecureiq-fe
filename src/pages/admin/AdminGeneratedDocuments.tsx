import { Trash2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState, useRef } from "react";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";

interface Document {
  id: string;
  client_name: string;
  file_name: string;
  view_url: string;
  download_url: string;
  status: string;
  created_at: string;
  client: {
    id: string;
    full_name: string;
    email: string;
    analyst_id: number;
  };
}

interface AdminDocumentsResponse {
  documents: Document[];
}

const AdminGeneratedDocuments = () => {
  const { apiCall } = useApi();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
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
      const response = await apiCall(`${BASE_URL}/api/admin/all-documents`);
      
      if (response.ok) {
        const data: AdminDocumentsResponse = await response.json();
        setDocuments(data.documents);
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

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      const response = await apiCall(`${BASE_URL}/api/admin/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the documents list
        fetchDocuments();
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Generated Documents</h1>
            <p className="text-muted-foreground text-base">Loading all generated documents...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Generated Documents</h1>
          <p className="text-muted-foreground text-base">View and download all generated documents</p>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No generated documents found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-card rounded-xl shadow-medium border border-border/50 p-5 flex items-center justify-between transition-all hover:shadow-hover hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{doc.file_name}</h3>
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
                        Client: {doc.client.full_name} • {new Date(doc.created_at).toLocaleDateString()}
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
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGeneratedDocuments;

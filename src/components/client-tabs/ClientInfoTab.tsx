import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { BASE_URL } from "@/constants/api";
import ClientForm from "@/components/forms/ClientForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientInfoTabProps {
  client: {
    ID: string;
    full_name: string;
    other_names?: string;
    email: string;
    phone_number: string;
    date_of_birth?: string;
    sex?: string;
    organization?: string;
    employer?: string;
    status?: string;
    risk_score?: string;
    created_at?: string;
    profile_photo_url?: string;
    darkside_module?: boolean;
    snubase_module?: boolean;
  };
}

const ClientInfoTab = ({ client }: ClientInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { apiCall } = useApi();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (clientData: any) => {
    if (!clientData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(clientData).forEach(key => {
        if (key === 'profile_photo' && clientData[key]) {
          formDataToSend.append('profile_photo', clientData[key]);
        } else if (key !== 'profile_photo' && clientData[key] !== null && clientData[key] !== undefined) {
          formDataToSend.append(key, clientData[key].toString());
        }
      });

      const response = await apiCall(`${BASE_URL}/clients/${client.ID}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Client information updated successfully",
        });
        setIsEditing(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update client information",
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
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      {isEditing ? (
        <ClientForm
          initialData={client}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
          title="Edit Client Information"
          saveButtonText="Save Changes"
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Client Information</h2>
            <Button 
              onClick={handleEdit}
              className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Client Info
            </Button>
          </div>
          
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile Photo</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Other Names</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Darkside Module</TableHead>
                  <TableHead>Snubase Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {client.profile_photo_url ? (
                      <img 
                        src={client.profile_photo_url} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{client.full_name || 'N/A'}</TableCell>
                  <TableCell>{client.other_names || 'N/A'}</TableCell>
                  <TableCell>{client.email ? client.email.split('\n')[0] : 'N/A'}</TableCell>
                  <TableCell>{client.phone_number ? client.phone_number.split('\n')[0] : 'N/A'}</TableCell>
                  <TableCell>{client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{client.sex || 'N/A'}</TableCell>
                  <TableCell>{client.organization || 'N/A'}</TableCell>
                  <TableCell>{client.employer || 'N/A'}</TableCell>
                  <TableCell>{client.darkside_module ? 'Enabled' : 'Disabled'}</TableCell>
                  <TableCell>{client.snubase_module ? 'Enabled' : 'Disabled'}</TableCell>
                  <TableCell>{client.status || 'N/A'}</TableCell>
                  <TableCell>{client.risk_score || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientInfoTab;

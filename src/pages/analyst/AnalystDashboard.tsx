import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search } from "lucide-react";
import AnalystLayout from "@/components/AnalystLayout";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";

interface Client {
  ID: string;
  full_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  organization: string;
  employer: string;
  other_names: string;
  sex: string;
  status: string;
  risk_score: string;
  analyst_id: number | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const AnalystDashboard = () => {
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.other_names?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone_number?.includes(searchTerm) ||
      client.organization?.toLowerCase().includes(searchLower) ||
      client.employer?.toLowerCase().includes(searchLower) ||
      client.sex?.toLowerCase().includes(searchLower) ||
      client.status?.toLowerCase().includes(searchLower) ||
      client.risk_score?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchAssignedClients();
  }, []);

  const fetchAssignedClients = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/analyst/clients`);
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching assigned clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentClients = filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = (clientId: string) => {
    navigate(`/analyst/client/${clientId}`);
  };

  return (
    <AnalystLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Assigned Clients</h1>
          <p className="text-muted-foreground text-base">View and manage your assigned clients</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients by name, email, phone, organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-medium overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading assigned clients...
                  </TableCell>
                </TableRow>
              ) : currentClients.length > 0 ? (
                currentClients.map((client) => (
                  <TableRow key={client.ID}>
                    <TableCell className="font-medium">{client.full_name}</TableCell>
                    <TableCell>{client.email ? client.email.split('\n')[0] : ''}</TableCell>
                    <TableCell>{client.phone_number ? client.phone_number.split('\n')[0] : ''}</TableCell>
                    <TableCell>{client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="action"
                        size="sm"
                        onClick={() => handleViewDetails(client.ID)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm ? `No clients found matching "${searchTerm}"` : "No assigned clients found"}
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
      </div>
    </AnalystLayout>
  );
};

export default AnalystDashboard;

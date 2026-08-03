import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trash2 } from "lucide-react";

// Mock data
const mockClients = [
  { id: "1", name: "ACME Corporation", email: "contact@acme.com", phone: "+1 (555) 123-4567", address: "123 Business St, New York, NY 10001" },
  { id: "2", name: "TechVision LLC", email: "info@techvision.com", phone: "+1 (555) 234-5678", address: "456 Innovation Ave, San Francisco, CA 94102" },
  { id: "3", name: "Global Solutions Inc", email: "hello@globalsolutions.com", phone: "+1 (555) 345-6789", address: "789 Enterprise Blvd, Chicago, IL 60601" },
  { id: "4", name: "NextGen Systems", email: "support@nextgen.com", phone: "+1 (555) 456-7890", address: "321 Tech Park, Austin, TX 78701" },
  { id: "5", name: "DataFlow Partners", email: "contact@dataflow.com", phone: "+1 (555) 567-8901", address: "654 Analytics Dr, Boston, MA 02101" },
  { id: "6", name: "CloudFirst Technologies", email: "info@cloudfirst.com", phone: "+1 (555) 678-9012", address: "987 Cloud Way, Seattle, WA 98101" },
  { id: "7", name: "Innovate Group", email: "hello@innovategroup.com", phone: "+1 (555) 789-0123", address: "147 Startup Lane, Miami, FL 33101" },
  { id: "8", name: "Enterprise Dynamics", email: "contact@entdynamics.com", phone: "+1 (555) 890-1234", address: "258 Corporate Plaza, Denver, CO 80201" },
  { id: "9", name: "Strategic Partners LLC", email: "info@strategic.com", phone: "+1 (555) 901-2345", address: "369 Business Center, Atlanta, GA 30301" },
  { id: "10", name: "Quantum Industries", email: "hello@quantum.com", phone: "+1 (555) 012-3456", address: "741 Industry Blvd, Houston, TX 77001" },
  { id: "11", name: "Nexus Corporation", email: "contact@nexus.com", phone: "+1 (555) 123-7890", address: "852 Commerce St, Portland, OR 97201" },
  { id: "12", name: "Velocity Systems", email: "info@velocity.com", phone: "+1 (555) 234-8901", address: "963 Speed Way, Phoenix, AZ 85001" },
];

const ITEMS_PER_PAGE = 10;

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState(mockClients);

  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClients = clients.slice(startIndex, endIndex);

  const handleViewDetails = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleDelete = (clientId: string) => {
    if (confirm("Are you sure you want to remove this client from your assigned list?")) {
      setClients(clients.filter((c) => c.id !== clientId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assigned Clients</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your assigned clients
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="action"
                        size="sm"
                        onClick={() => handleViewDetails(client.id)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="action"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
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
      </div>
    </div>
  );
};

export default Dashboard;

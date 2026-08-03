import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const navigate = useNavigate();

  const recentClients = [
    { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "(555) 123-4567", address: "123 Main St, New York, NY" },
    { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", phone: "(555) 234-5678", address: "456 Oak Ave, Los Angeles, CA" },
    { id: 3, name: "Michael Brown", email: "m.brown@example.com", phone: "(555) 345-6789", address: "789 Pine Rd, Chicago, IL" },
    { id: 4, name: "Emily Davis", email: "emily.davis@example.com", phone: "(555) 456-7890", address: "321 Elm St, Houston, TX" },
    { id: 5, name: "David Wilson", email: "d.wilson@example.com", phone: "(555) 567-8901", address: "654 Maple Dr, Phoenix, AZ" },
  ];

  const recentUsers = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", role: "Analyst", status: "Active" },
    { id: 3, name: "Bob Johnson", email: "bob.j@example.com", role: "Analyst", status: "Inactive" },
  ];

  const recentDocuments = [
    { id: 2, name: "Client Proposal - ACME Corp", type: "DOCX", date: "2024-03-14" },
    { id: 6, name: "Service Agreement", type: "DOCX", date: "2024-03-10" },
    { id: 9, name: "Legal Contract - XYZ Ltd", type: "DOCX", date: "2024-03-07" },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your workspace.</p>
        </div>

        {/* Clients Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Recent Clients</h2>
            <Button variant="action" onClick={() => navigate("/clients")}>
              View All
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow-medium border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Manage Users Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Recent Users</h2>
            <Button variant="action" onClick={() => navigate("/manage-users")}>
              View All
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow-medium border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Generated Documents Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Recent Documents (DOCX)</h2>
            <Button variant="action" onClick={() => navigate("/generated-documents")}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-card rounded-lg shadow-medium border border-border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="action">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

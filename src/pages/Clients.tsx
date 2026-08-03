import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Clients = () => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [assignEmail, setAssignEmail] = useState("");

  const clients: Client[] = [
    { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "(555) 123-4567", address: "123 Main St, New York, NY" },
    { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", phone: "(555) 234-5678", address: "456 Oak Ave, Los Angeles, CA" },
    { id: 3, name: "Michael Brown", email: "m.brown@example.com", phone: "(555) 345-6789", address: "789 Pine Rd, Chicago, IL" },
    { id: 4, name: "Emily Davis", email: "emily.davis@example.com", phone: "(555) 456-7890", address: "321 Elm St, Houston, TX" },
    { id: 5, name: "David Wilson", email: "d.wilson@example.com", phone: "(555) 567-8901", address: "654 Maple Dr, Phoenix, AZ" },
  ];

  const handleAssign = (client: Client) => {
    setSelectedClient(client);
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    console.log(`Assigning ${assignEmail} to ${selectedClient?.name}`);
    setAssignModalOpen(false);
    setAssignEmail("");
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">Clients</h1>
          <p className="text-muted-foreground">Manage your client database and assignments</p>
        </div>

        <div className="bg-card rounded-lg shadow-medium border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleAssign(client)}
                      variant="action"
                      size="sm"
                    >
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent className="bg-popover">
            <DialogHeader>
              <DialogTitle>Assign to {selectedClient?.name}</DialogTitle>
              <DialogDescription>
                Enter the email address of the user you want to assign to this client.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assign-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="assign-email"
                    type="email"
                    placeholder="user@example.com"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAssign} variant="action">
                Confirm Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Clients;

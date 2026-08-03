import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Users, User, UserCheck } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";

interface UserRecord {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Client {
  ID: string;
  full_name: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  analyst_id: number | null;
  created_at: string;
}

interface Document {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  client: {
    full_name: string;
  };
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard = ({ label, value, icon, color, onClick }: StatCardProps) => (
  <div
    className={`bg-card rounded-xl border border-border/50 shadow-medium p-5 flex items-center gap-4 transition-all hover:shadow-hover hover:scale-[1.02] ${onClick ? "cursor-pointer" : ""}`}
    onClick={onClick}
  >
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { apiCall } = useApi();

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall(`${BASE_URL}/clients`).then(r => r.ok ? r.json() : []),
      apiCall(`${BASE_URL}/users`).then(r => r.ok ? r.json() : []),
      apiCall(`${BASE_URL}/api/admin/all-documents`).then(r => r.ok ? r.json() : { documents: [] }),
    ])
      .then(([clientsData, usersData, docsData]) => {
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setDocuments(Array.isArray(docsData.documents) ? docsData.documents : []);
      })
      .catch(err => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalClients = clients.length;
  const totalUsers = users.length;
  const totalDocuments = documents.length;
  const assignedClients = clients.filter(c => c.analyst_id !== null).length;

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-base">Welcome back! Here's an overview of your workspace.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Clients"
            value={totalClients}
            icon={<Users className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate("/admin/clients")}
          />
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon={<User className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => navigate("/admin/manage-users")}
          />
          <StatCard
            label="Total Documents"
            value={totalDocuments}
            icon={<FileText className="h-5 w-5 text-white" />}
            color="bg-gradient-to-r from-accent/90 to-primary/70"
            onClick={() => navigate("/admin/generated-documents")}
          />
          <StatCard
            label="Assigned Clients"
            value={assignedClients}
            icon={<UserCheck className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => navigate("/admin/clients")}
          />
        </div>

        {/* Recent Clients */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Clients</h2>
            <Button variant="outline" onClick={() => navigate("/admin/clients")}>
              View All
            </Button>
          </div>
          <div className="bg-card rounded-xl shadow-medium border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Date of Birth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : recentClients.length > 0 ? (
                  recentClients.map((client) => (
                    <TableRow key={client.ID}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone_number}</TableCell>
                      <TableCell>
                        {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <Button variant="outline" onClick={() => navigate("/admin/manage-users")}>
              View All
            </Button>
          </div>
          <div className="bg-card rounded-xl shadow-medium border border-border/50 overflow-hidden">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "Active" ? "default" : "secondary"}
                          className={user.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600"}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Button variant="outline" onClick={() => navigate("/admin/generated-documents")}>
              View All
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : recentDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No documents found</div>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          doc.status === "completed" ? "bg-green-100 text-green-800" :
                          doc.status === "progress" ? "bg-yellow-100 text-yellow-800" :
                          doc.status === "failed" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {doc.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {doc.client?.full_name} • {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

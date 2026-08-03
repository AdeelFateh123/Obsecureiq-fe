import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Edit, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AddUserModal from "@/components/modals/AddUserModal";
import EditUserModal from "@/components/modals/EditUserModal";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { BASE_URL } from "@/constants/api";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const AdminManageUsers = () => {
  const { apiCall } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/users`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await apiCall(`${BASE_URL}/users/${userId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          // Update the users list immediately by filtering out the deleted user
          setUsers(prevUsers => prevUsers.filter((u) => u.id !== userId));
          toast({
            title: "User Deleted",
            description: "User has been successfully removed.",
          });
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.detail || "Failed to delete user.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddUser = async (newUser: { name: string; email: string; role: string; status: string }) => {
    try {
      const response = await apiCall(`${BASE_URL}/admin/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Refresh the users list to get the latest data
        await fetchUsers();
        
        toast({
          title: "User Added",
          description: data.message,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to add user.",
          variant: "destructive",
        });
        throw new Error(error.detail || "Failed to add user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the modal handle it
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const response = await apiCall(`${BASE_URL}/users/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
        }),
      });
      
      if (response.ok) {
        // Update the user in the local state immediately
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
        toast({
          title: "User Updated",
          description: "User has been successfully updated.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to update user.",
          variant: "destructive",
        });
        throw new Error(error.detail || "Failed to update user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Manage Users</h1>
            <p className="text-muted-foreground text-base">Add, edit, or remove user accounts</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, role, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-medium overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchQuery ? `No users found matching "${searchQuery}"` : "No users found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddUser}
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          onUpdate={handleUpdateUser}
          user={editingUser}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminManageUsers;

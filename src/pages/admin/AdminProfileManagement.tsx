import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, MonitorCheck, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { SCRAPER_URL } from "@/constants/api";

interface Profile {
  profile_name: string;
  proxy_server: string | null;
  proxy_username: string | null;
  has_proxy: boolean;
  is_active: boolean;
  folder_exists: boolean;
  created_at: string;
}

const AdminProfileManagement = () => {
  const { apiCall } = useApi();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    profile_name: "",
    ip: "",
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await apiCall(`${SCRAPER_URL}/profiles/list`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.profile_name.trim()) {
      toast({ title: "Error", description: "Profile name is required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiCall(`${SCRAPER_URL}/profiles/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_name: form.profile_name.trim(),
          ip: form.ip.trim() || "default",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({ title: "Success", description: data.message });
        setIsModalOpen(false);
        setForm({ profile_name: "", ip: "" });
        await fetchProfiles();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.detail || "Failed to create profile.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (profile: Profile) => {
    setProfileToDelete(profile);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;
    try {
      const response = await apiCall(`${SCRAPER_URL}/profiles/${profileToDelete.profile_name}`, { method: "DELETE" });
      if (response.ok) {
        setProfiles((prev) => prev.filter((p) => p.profile_name !== profileToDelete.profile_name));
        toast({ title: "Deleted", description: `Profile "${profileToDelete.profile_name}" deleted successfully.` });
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.detail || "Failed to delete profile.", variant: "destructive" });
        throw new Error("Delete failed");
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
      throw new Error("Delete failed");
    } finally {
      setProfileToDelete(null);
    }
  };

  const filteredProfiles = profiles.filter((p) =>
    !searchQuery.trim() || p.profile_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
            <p className="text-muted-foreground text-base">Create and manage browser profiles for scraping</p>
          </div>
          <Button
            className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Profile
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {!loading && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {searchQuery ? `${filteredProfiles.length} of ${profiles.length} profiles` : `${profiles.length} profiles`}
            </p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-medium overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile Name</TableHead>
                <TableHead>Proxy Server</TableHead>
                <TableHead>Proxy Username</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.profile_name} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MonitorCheck className="h-4 w-4 text-muted-foreground" />
                        {profile.profile_name}
                      </div>
                    </TableCell>
                    <TableCell>{profile.proxy_server || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{profile.proxy_username || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(profile)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <MonitorCheck className="h-8 w-8 opacity-40" />
                      <p>{searchQuery ? `No profiles matching "${searchQuery}"` : "No profiles yet. Create one to get started."}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProfileToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Profile"
        message={`Are you sure you want to delete profile "${profileToDelete?.profile_name}"? This action cannot be undone.`}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Profile Name <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. profile_1"
                value={form.profile_name}
                onChange={(e) => setForm({ ...form, profile_name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">IP / Location</label>
              <Input
                placeholder="e.g. us-residential-01 (optional)"
                value={form.ip}
                onChange={(e) => setForm({ ...form, ip: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used to identify proxy location. Proxy settings are configured in the server .env file.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProfileManagement;

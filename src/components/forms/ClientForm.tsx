import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, User, Save } from "lucide-react";

interface ClientData {
  full_name: string;
  other_names?: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  sex?: string;
  organization?: string;
  employer?: string;
  tier?: string;
  darkside_module?: boolean;
  snubase_module?: boolean;
  profile_photo_url?: string;
}

interface ClientFormProps {
  initialData?: ClientData;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  title: string;
  saveButtonText: string;
}

const ClientForm = ({ 
  initialData, 
  onSave, 
  onCancel, 
  isLoading, 
  title, 
  saveButtonText 
}: ClientFormProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    other_names: "",
    emails: "",
    phone_numbers: "",
    date_of_birth: "",
    sex: "",
    organization: "",
    employer: "",
    tier: "",
    darkside_module: false,
    snubase_module: false
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || "",
        other_names: initialData.other_names || "",
        emails: initialData.email || "",
        phone_numbers: initialData.phone_number || "",
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : "",
        sex: initialData.sex || "",
        organization: initialData.organization || "",
        employer: initialData.employer || "",
        tier: initialData.tier || "",
        darkside_module: initialData.darkside_module || false,
        snubase_module: initialData.snubase_module || false
      });
      // Reset photo states when initialData changes
      setProfilePhoto(null);
      setPreviewUrl(null);
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;

    const clientDataWithPhoto = {
      ...formData,
      profile_photo: profilePhoto
    };
    await onSave(clientDataWithPhoto);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <Button 
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : saveButtonText}
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Profile Photo */}
            <div className="col-span-2 space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                {previewUrl || initialData?.profile_photo_url ? (
                  <div className="relative">
                    <img 
                      src={previewUrl || initialData?.profile_photo_url} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removePhoto}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="profile-photo-form"
                  />
                  <Label 
                    htmlFor="profile-photo-form" 
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {initialData?.profile_photo_url ? "Change Photo" : "Choose Photo"}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a profile photo (optional)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_names">Other Names</Label>
              <Input
                id="other_names"
                value={formData.other_names}
                onChange={(e) => handleInputChange("other_names", e.target.value)}
                placeholder="Enter other names"
              />
            </div>

            {/* Emails - Full Width */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="emails">Emails</Label>
              <textarea
                id="emails"
                value={formData.emails}
                onChange={(e) => handleInputChange("emails", e.target.value)}
                placeholder="Enter emails (one per line)"
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                Enter each email on a new line
              </p>
            </div>

            {/* Phone Numbers - Full Width */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="phone_numbers">Phone Numbers</Label>
              <textarea
                id="phone_numbers"
                value={formData.phone_numbers}
                onChange={(e) => handleInputChange("phone_numbers", e.target.value)}
                placeholder="Enter phone numbers (one per line)"
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                Enter each phone number on a new line
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleInputChange("organization", e.target.value)}
                placeholder="Enter organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employer">Employer</Label>
              <Input
                id="employer"
                value={formData.employer}
                onChange={(e) => handleInputChange("employer", e.target.value)}
                placeholder="Enter employer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select value={formData.tier} onValueChange={(value) => handleInputChange("tier", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Darkside Module</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="darkside_module"
                  checked={formData.darkside_module}
                  onChange={(e) => handleInputChange("darkside_module", e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="darkside_module" className="text-sm font-normal">
                  Enable Darkside Module
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Snubase Module</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="snubase_module"
                  checked={formData.snubase_module}
                  onChange={(e) => handleInputChange("snubase_module", e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="snubase_module" className="text-sm font-normal">
                  Enable Snubase Module
                </Label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import ImageUpload, { ImageUploadRef } from "@/components/ui/image-upload";

interface SocialMediaRecord {
  id: string;
  platform: string;
  profileUrl: string;
  privacy: string;
  whatIsExposed: string;
  engagementLevel: string;
  confidenceLevel: string;
  analystNotes: string;
  images: string[];
}

interface EditSocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SocialMediaRecord;
  onUpdate: (record: {
    id: string;
    platform: string;
    profileUrl: string;
    privacy: string;
    whatIsExposed: string;
    engagementLevel: string;
    confidenceLevel: string;
    analystNotes: string;
    remainingImages: string[];
    newImageFiles?: File[];
  }) => Promise<void>;
}

const EditSocialMediaModal = ({ isOpen, onClose, record, onUpdate }: EditSocialMediaModalProps) => {
  const [platform, setPlatform] = useState(record.platform);
  const [customPlatform, setCustomPlatform] = useState("");
  const [profileUrl, setProfileUrl] = useState(record.profileUrl);
  const [privacy, setPrivacy] = useState(record.privacy);
  const [whatIsExposed, setWhatIsExposed] = useState<string[]>([]);
  const [engagementLevel, setEngagementLevel] = useState(record.engagementLevel);
  const [confidenceLevel, setConfidenceLevel] = useState(record.confidenceLevel);
  const [analystNotes, setAnalystNotes] = useState(record.analystNotes);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ platform?: string; customPlatform?: string; profileUrl?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  useEffect(() => {
    // Check if current platform is in predefined list
    const predefinedPlatforms = ["Facebook", "YouTube", "Instagram", "TikTok", "Telegram", "Snapchat", "Spotify", "Twitter", "Pinterest", "Reddit", "Quora", "Discord"];
    
    if (predefinedPlatforms.includes(record.platform)) {
      setPlatform(record.platform);
      setCustomPlatform("");
    } else {
      setPlatform("Other");
      setCustomPlatform(record.platform);
    }
    
    setProfileUrl(record.profileUrl);
    setPrivacy(record.privacy);
    setAnalystNotes(record.analystNotes);
    setEngagementLevel(record.engagementLevel);
    setConfidenceLevel(record.confidenceLevel);
    setCurrentImages(record.images || []);
    setNewImageFiles([]);
    imageUploadRef.current?.reset();
    
    // Parse whatIsExposed string into array
    const exposedArray = record.whatIsExposed
      .split(", ")
      .map(item => item.trim())
      .filter(item => item);
    setWhatIsExposed(exposedArray);
  }, [record]);

  const handleNewImagesChange = (files: File[]) => {
    setNewImageFiles(files);
  };

  const removeCurrentImage = (imageUrl: string) => {
    setCurrentImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleSubmit = async () => {
    const newErrors: { platform?: string; customPlatform?: string; profileUrl?: string } = {};
    
    if (!platform.trim()) {
      newErrors.platform = "This field is required";
    }
    if (platform === "Other" && !customPlatform.trim()) {
      newErrors.customPlatform = "Please specify the platform name";
    }
    if (!profileUrl.trim()) {
      newErrors.profileUrl = "This field is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const exposedString = whatIsExposed.join(", ");
      const finalPlatform = platform === "Other" ? customPlatform.trim() : platform;
      await onUpdate({
        id: record.id,
        platform: finalPlatform,
        profileUrl,
        privacy,
        whatIsExposed: exposedString,
        engagementLevel,
        confidenceLevel,
        analystNotes,
        remainingImages: currentImages,
        newImageFiles: newImageFiles.length > 0 ? newImageFiles : undefined
      });
      // Only close modal if operation was successful
      onClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to update social media:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExposed = (value: string) => {
    if (whatIsExposed.includes(value)) {
      setWhatIsExposed(whatIsExposed.filter(item => item !== value));
    } else {
      setWhatIsExposed([...whatIsExposed, value]);
    }
  };

  const getExposedOptions = (selectedPlatform: string) => {
    const currentPlatform = selectedPlatform === "Other" ? customPlatform : selectedPlatform;
    
    switch (currentPlatform) {
      case "Facebook":
        return [
          "Profile Picture", "Friends List", "Location", "Posts", "Employment Information",
          "Education Information", "Contact Information", "Check-ins", "Family Members & Relationships",
          "Reviews", "Events"
        ];
      case "YouTube":
        return ["Profile Picture", "Location", "Videos", "Shorts", "Playlists"];
      case "Instagram":
        return ["Profile Picture", "Location", "Posts", "Tagged Posts", "Followers & Following"];
      case "TikTok":
        return ["Profile Picture", "Location", "Posts", "Followers & Following"];
      case "Telegram":
        return ["Profile Picture", "Username", "Last Seen"];
      case "Snapchat":
        return ["Display name", "Username", "Public stories"];
      case "Spotify":
        return ["Display name", "Username", "Followers & Following", "Playlists"];
      case "Twitter":
        return ["Profile Picture", "Location", "Posts", "Followers & Following", "Media"];
      case "Pinterest":
        return ["Profile Picture", "Location", "Pins", "Username"];
      case "Reddit":
        return ["Profile Picture", "Location", "Posts", "Comments", "Username"];
      case "Quora":
        return ["Profile Picture", "Location", "Posts or Answers", "Comments", "Following & Followers"];
      case "Discord":
        return ["Profile Picture", "Username", "Display Name"];
      default:
        return [
          "Profile Picture", "Followers or Friends", "Location", "Posts", "Employment Information",
          "Education Information", "Contact Information", "Check-ins", "Family Members - Facebook only"
        ];
    }
  };

  const exposedOptions = getExposedOptions(platform);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Social Media Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-platform">Platform *</Label>
            <Select value={platform} onValueChange={(value) => {
              setPlatform(value);
              setCustomPlatform(""); // Reset custom platform when changing selection
              setWhatIsExposed([]); // Clear selected options when platform changes
              setErrors(prev => ({ ...prev, platform: undefined, customPlatform: undefined }));
            }}>
              <SelectTrigger className={errors.platform ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Telegram">Telegram</SelectItem>
                <SelectItem value="Snapchat">Snapchat</SelectItem>
                <SelectItem value="Spotify">Spotify</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
                <SelectItem value="Pinterest">Pinterest</SelectItem>
                <SelectItem value="Reddit">Reddit</SelectItem>
                <SelectItem value="Quora">Quora</SelectItem>
                <SelectItem value="Discord">Discord</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
          </div>

          {/* Custom Platform Input - only show when "Other" is selected */}
          {platform === "Other" && (
            <div>
              <Label htmlFor="edit-customPlatform">Platform Name *</Label>
              <Input
                id="edit-customPlatform"
                value={customPlatform}
                onChange={(e) => {
                  setCustomPlatform(e.target.value);
                  setErrors(prev => ({ ...prev, customPlatform: undefined }));
                }}
                placeholder="Enter platform name"
                className={errors.customPlatform ? "border-red-500" : ""}
              />
              {errors.customPlatform && <p className="text-red-500 text-sm mt-1">{errors.customPlatform}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="edit-profileUrl">Platform URL *</Label>
            <Input
              id="edit-profileUrl"
              value={profileUrl}
              onChange={(e) => {
                setProfileUrl(e.target.value);
                setErrors(prev => ({ ...prev, profileUrl: undefined }));
              }}
              placeholder="https://..."
              className={errors.profileUrl ? "border-red-500" : ""}
            />
            {errors.profileUrl && <p className="text-red-500 text-sm mt-1">{errors.profileUrl}</p>}
          </div>

          <div>
            <Label htmlFor="edit-privacy">Privacy</Label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Semi-private">Semi-private</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>What is Exposed (Multi-select)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {whatIsExposed.length > 0 ? `${whatIsExposed.length} selected` : "Select options"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-4 max-h-[200px] overflow-y-auto"
                align="start"
              >                <div className="space-y-2">
                  {exposedOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${option}`}
                        checked={whatIsExposed.includes(option)}
                        onCheckedChange={() => toggleExposed(option)}
                      />
                      <Label htmlFor={`edit-${option}`} className="cursor-pointer text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {whatIsExposed.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {whatIsExposed.map((item) => (
                  <div key={item} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => setWhatIsExposed(whatIsExposed.filter(i => i !== item))}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-engagementLevel">Engagement Level</Label>
            <Select value={engagementLevel} onValueChange={setEngagementLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Semi Active">Semi Active</SelectItem>
                <SelectItem value="Dormant">Dormant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-confidenceLevel">Confidence Level</Label>
            <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analyst Notes */}
          <div>
            <Label htmlFor="edit-analystNotes">Analyst Notes (Optional)</Label>
            <textarea
              id="edit-analystNotes"
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="Add any additional notes or observations..."
              className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical rounded-md"
            />
          </div>

          {/* Current Images */}
          {currentImages.length > 0 && (
            <div>
              <Label>Current Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {currentImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Current ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeCurrentImage(imageUrl)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Images */}
          <ImageUpload
            ref={imageUploadRef}
            onImagesChange={handleNewImagesChange}
            label="Add New Images (Optional)"
            multiple={true}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="action" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSocialMediaModal;

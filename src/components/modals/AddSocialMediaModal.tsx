import { useState, useRef } from "react";
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
import { ChevronDown } from "lucide-react";
import ImageUpload, { ImageUploadRef } from "@/components/ui/image-upload";

interface AddSocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (record: {
    platform: string;
    profileUrl: string;
    privacy: string;
    whatIsExposed: string;
    engagementLevel: string;
    confidenceLevel: string;
    analystNotes: string;
    imageFiles?: File[];
  }) => Promise<void>;
}

const AddSocialMediaModal = ({ isOpen, onClose, onAdd }: AddSocialMediaModalProps) => {
  const [platform, setPlatform] = useState("Facebook");
  const [customPlatform, setCustomPlatform] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [privacy, setPrivacy] = useState("Private");
  const [whatIsExposed, setWhatIsExposed] = useState<string[]>([]);
  const [engagementLevel, setEngagementLevel] = useState("Active");
  const [confidenceLevel, setConfidenceLevel] = useState("Low");
  const [analystNotes, setAnalystNotes] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ platform?: string; customPlatform?: string; profileUrl?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);

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
      await onAdd({
        platform: finalPlatform,
        profileUrl,
        privacy,
        whatIsExposed: exposedString,
        engagementLevel,
        confidenceLevel,
        analystNotes,
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined
      });
      // Only close modal if operation was successful
      handleClose();
    } catch (error) {
      // Don't close modal on error - let user retry
      console.error('Failed to add social media:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPlatform("Facebook");
    setCustomPlatform("");
    setProfileUrl("");
    setPrivacy("Private");
    setWhatIsExposed([]);
    setEngagementLevel("Active");
    setConfidenceLevel("Low");
    setAnalystNotes("");
    setImageFiles([]);
    imageUploadRef.current?.reset();
    setErrors({});
    onClose();
  };

  const handleImagesChange = (files: File[]) => {
    setImageFiles(files);
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Social Media Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Platform */}
          <div>
            <Label htmlFor="platform">Platform *</Label>
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
              <Label htmlFor="customPlatform">Platform Name *</Label>
              <Input
                id="customPlatform"
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

          {/* Profile URL */}
          <div>
            <Label htmlFor="profileUrl">Platform URL *</Label>
            <Input
              id="profileUrl"
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

          {/* Privacy */}
          <div>
            <Label htmlFor="privacy">Privacy</Label>
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

          {/* What is Exposed */}
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

              {/* Scrollable dropdown if >6 options */}
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-4 max-h-[200px] overflow-y-auto"
                align="start"
              >
                <div className="space-y-2">
                  {exposedOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`add-${option}`}
                        checked={whatIsExposed.includes(option)}
                        onCheckedChange={() => toggleExposed(option)}
                      />
                      <Label htmlFor={`add-${option}`} className="cursor-pointer text-sm">
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
                  <div
                    key={item}
                    className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
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

          {/* Engagement Level */}
          <div>
            <Label htmlFor="engagementLevel">Engagement Level</Label>
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

          {/* Confidence Level */}
          <div>
            <Label htmlFor="confidenceLevel">Confidence Level</Label>
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
            <Label htmlFor="analystNotes">Analyst Notes (Optional)</Label>
            <textarea
              id="analystNotes"
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="Add any additional notes or observations..."
              className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical rounded-md"
            />
          </div>

          {/* Multiple Images Upload */}
          <ImageUpload
            ref={imageUploadRef}
            onImagesChange={handleImagesChange}
            label="Upload Images (Optional)"
            multiple={true}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="action" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSocialMediaModal;

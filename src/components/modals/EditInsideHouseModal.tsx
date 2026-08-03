import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import ImageUpload, { ImageUploadRef } from "@/components/ui/image-upload";
import { BASE_URL } from "@/constants/api";

interface RealEstateWebsite {
  platform: string;
  url: string;
  customPlatform?: string;
}

interface EditInsideHouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  onUpdate: (record: any) => Promise<void>;
}

const EditInsideHouseModal = ({ isOpen, onClose, record, onUpdate }: EditInsideHouseModalProps) => {
  const [layoutExposure, setLayoutExposure] = useState(false);
  const [realEstateWebsites, setRealEstateWebsites] = useState<RealEstateWebsite[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  useEffect(() => {
    if (record) {
      const toBool = (value: any) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.toLowerCase() === 'yes' || value === 'true';
        return Boolean(value);
      };
      
      setLayoutExposure(toBool(record.layoutExposure));
      setImages(record.images || []);
      setNewImageFiles([]);
      imageUploadRef.current?.reset();
      
      // Parse real estate websites
      const websites = (record.realEstateWebsites || []).map((websiteStr: string) => {
        const [platform, url] = websiteStr.split(': ');
        const predefinedPlatforms = ['Zillow', 'Redfin', 'Realtor.com'];
        
        if (predefinedPlatforms.includes(platform)) {
          return { platform, url };
        } else {
          return { platform: 'Other', url, customPlatform: platform };
        }
      });
      setRealEstateWebsites(websites);
    }
  }, [record]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate that custom platform name is provided when "Other" is selected
      for (const website of realEstateWebsites) {
        if (website.platform === 'Other' && (!website.customPlatform || website.customPlatform.trim() === '')) {
          throw new Error('Please provide a custom website name when "Other" is selected.');
        }
      }
      
      const websiteStrings = realEstateWebsites.map(site => 
        `${site.platform === 'Other' ? site.customPlatform : site.platform}: ${site.url}`
      );
      
      await onUpdate({
        ...record,
        layoutExposure,
        realEstateWebsites: websiteStrings,
        remainingImages: images,
        newImageFiles,
      });
    } catch (error) {
      console.error('Failed to update record:', error);
      alert(error.message || 'Failed to update record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewImagesChange = (files: File[]) => {
    setNewImageFiles(files);
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImages(prev => prev.filter(img => img !== imageUrl));
  };

  const addRealEstateWebsite = () => {
    setRealEstateWebsites([...realEstateWebsites, { platform: "Zillow", url: "" }]);
  };

  const updateRealEstateWebsite = (index: number, field: keyof RealEstateWebsite, value: string) => {
    const updated = [...realEstateWebsites];
    updated[index] = { ...updated[index], [field]: value };
    setRealEstateWebsites(updated);
  };

  const removeRealEstateWebsite = (index: number) => {
    setRealEstateWebsites(realEstateWebsites.filter((_, i) => i !== index));
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inside the House Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="layoutExposure"
              checked={layoutExposure}
              onCheckedChange={(checked) => setLayoutExposure(!!checked)}
            />
            <Label htmlFor="layoutExposure">Layout Exposure (Is the floor plan accessible online?)</Label>
          </div>

          {/* Real Estate Websites Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Real Estate Websites</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRealEstateWebsite}>
                <Plus className="h-4 w-4 mr-1" />
                Add Website
              </Button>
            </div>
            
            {realEstateWebsites.map((website, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    value={website.platform}
                    onValueChange={(value) => updateRealEstateWebsite(index, 'platform', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zillow">Zillow</SelectItem>
                      <SelectItem value="Redfin">Redfin</SelectItem>
                      <SelectItem value="Realtor.com">Realtor.com</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {website.platform === 'Other' && (
                  <div className="flex-1">
                    <Input
                      placeholder="Custom website name"
                      value={website.customPlatform || ''}
                      onChange={(e) => updateRealEstateWebsite(index, 'customPlatform', e.target.value)}
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <Input
                    placeholder="Website URL"
                    value={website.url}
                    onChange={(e) => updateRealEstateWebsite(index, 'url', e.target.value)}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRealEstateWebsite(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Existing Images */}
          {images.length > 0 && (
            <div className="space-y-2">
              <Label>Existing Images (Click × to remove)</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                      <img
                        src={`${imageUrl}`}
                        alt={`Existing image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        Image not found
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove this image"
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <ImageUpload
            ref={imageUploadRef}
            onImagesChange={handleNewImagesChange}
            label="Upload New Images"
            multiple={true}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="action" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInsideHouseModal;

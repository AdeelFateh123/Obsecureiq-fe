import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import ImageUpload, { ImageUploadRef } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";

interface RealEstateWebsite {
  platform: string;
  url: string;
  customPlatform?: string;
}

interface AddGoogleStreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (record: any) => Promise<void>;
}

const AddGoogleStreetViewModal = ({ isOpen, onClose, onAdd }: AddGoogleStreetViewModalProps) => {
  const { toast } = useToast();
  const [homeVisibleFromStreet, setHomeVisibleFromStreet] = useState(false);
  const [exteriorLighting, setExteriorLighting] = useState(false);
  const [surveillanceCameras, setSurveillanceCameras] = useState(false);
  const [motionSensorsAlarms, setMotionSensorsAlarms] = useState(false);
  const [groundFloorWindowsAccessible, setGroundFloorWindowsAccessible] = useState(false);
  const [barsLocksReinforcedGlass, setBarsLocksReinforcedGlass] = useState(false);
  const [gateFence, setGateFence] = useState(false);
  const [obstructionOfView, setObstructionOfView] = useState("");
  const [securitySignage, setSecuritySignage] = useState(false);
  const [realEstateWebsites, setRealEstateWebsites] = useState<RealEstateWebsite[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate real estate websites
      for (const website of realEstateWebsites) {
        if (website.platform === 'Other' && (!website.customPlatform || website.customPlatform.trim() === '')) {
          toast({ title: "Error", description: "Please provide a custom website name when 'Other' is selected.", variant: "destructive" });
          return;
        }
        if (!website.url || website.url.trim() === '') {
          toast({ title: "Error", description: "Please provide a URL for all selected websites.", variant: "destructive" });
          return;
        }
      }
      
      const websiteStrings = realEstateWebsites.map(site => 
        `${site.platform === 'Other' ? site.customPlatform : site.platform}: ${site.url}`
      );
      
      await onAdd({
        homeVisibleFromStreet,
        exteriorLighting,
        surveillanceCameras,
        motionSensorsAlarms,
        groundFloorWindowsAccessible,
        barsLocksReinforcedGlass,
        gateFence,
        obstructionOfView: gateFence ? obstructionOfView : undefined,
        securitySignage,
        realEstateWebsites: websiteStrings,
        imageFiles,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to add record:', error);
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setHomeVisibleFromStreet(false);
    setExteriorLighting(false);
    setSurveillanceCameras(false);
    setMotionSensorsAlarms(false);
    setGroundFloorWindowsAccessible(false);
    setBarsLocksReinforcedGlass(false);
    setGateFence(false);
    setObstructionOfView("");
    setSecuritySignage(false);
    setRealEstateWebsites([]);
    setImageFiles([]);
    imageUploadRef.current?.reset();
    onClose();
  };

  const handleImagesChange = (files: File[]) => {
    setImageFiles(files);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Google Street View Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="homeVisible"
              checked={homeVisibleFromStreet}
              onCheckedChange={(checked) => setHomeVisibleFromStreet(!!checked)}
            />
            <Label htmlFor="homeVisible">Home Visible from Street</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="exteriorLighting"
              checked={exteriorLighting}
              onCheckedChange={(checked) => setExteriorLighting(!!checked)}
            />
            <Label htmlFor="exteriorLighting">Exterior Lighting</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="surveillanceCameras"
              checked={surveillanceCameras}
              onCheckedChange={(checked) => setSurveillanceCameras(!!checked)}
            />
            <Label htmlFor="surveillanceCameras">Surveillance Cameras</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="motionSensors"
              checked={motionSensorsAlarms}
              onCheckedChange={(checked) => setMotionSensorsAlarms(!!checked)}
            />
            <Label htmlFor="motionSensors">Signs of Motion Sensors or Alarms</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="groundFloorWindows"
              checked={groundFloorWindowsAccessible}
              onCheckedChange={(checked) => setGroundFloorWindowsAccessible(!!checked)}
            />
            <Label htmlFor="groundFloorWindows">Ground-Floor Windows Accessible from Yard</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="barsLocks"
              checked={barsLocksReinforcedGlass}
              onCheckedChange={(checked) => setBarsLocksReinforcedGlass(!!checked)}
            />
            <Label htmlFor="barsLocks">Presence of Bars, Locks, or Reinforced Glass</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="gateFence"
              checked={gateFence}
              onCheckedChange={(checked) => setGateFence(!!checked)}
            />
            <Label htmlFor="gateFence">Gate/Fence</Label>
          </div>

          {gateFence && (
            <div className="space-y-2 ml-6">
              <Label>Obstruction of View</Label>
              <Select value={obstructionOfView} onValueChange={setObstructionOfView}>
                <SelectTrigger>
                  <SelectValue placeholder="Select obstruction level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Obstruction">No Obstruction</SelectItem>
                  <SelectItem value="Partial Obstruction">Partial Obstruction</SelectItem>
                  <SelectItem value="Complete Obstruction">Complete Obstruction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="securitySignage"
              checked={securitySignage}
              onCheckedChange={(checked) => setSecuritySignage(!!checked)}
            />
            <Label htmlFor="securitySignage">Security Signage</Label>
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
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zillow">Zillow</SelectItem>
                      <SelectItem value="Realtor.com">Realtor.com</SelectItem>
                      <SelectItem value="Redfin">Redfin</SelectItem>
                      <SelectItem value="Trulia">Trulia</SelectItem>
                      <SelectItem value="Homes.com">Homes.com</SelectItem>
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
                
                <div className="flex-2">
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

          <ImageUpload
            ref={imageUploadRef}
            onImagesChange={handleImagesChange}
            label="Upload Images"
            multiple={true}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="action" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoogleStreetViewModal;

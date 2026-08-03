import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditableCheckbox, EditableDropdown } from "@/components/ui/editable-cell";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import AddFrontHouseModal from "@/components/modals/AddFrontHouseModal";
import EditFrontHouseModal from "@/components/modals/EditFrontHouseModal";
import AddBackHouseModal from "@/components/modals/AddBackHouseModal";
import EditBackHouseModal from "@/components/modals/EditBackHouseModal";
import AddInsideHouseModal from "@/components/modals/AddInsideHouseModal";
import EditInsideHouseModal from "@/components/modals/EditInsideHouseModal";
import AddGoogleStreetViewModal from "@/components/modals/AddGoogleStreetViewModal";
import EditGoogleStreetViewModal from "@/components/modals/EditGoogleStreetViewModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import ImageViewer from "@/components/ui/image-viewer";

const ITEMS_PER_PAGE = 5;

interface FrontHouseRecord {
  id: string;
  homeVisibleFromStreet: boolean;
  exteriorLighting: boolean;
  surveillanceCameras: boolean;
  motionSensorsAlarms: boolean;
  groundFloorWindowsAccessible: boolean;
  barsLocksReinforcedGlass: boolean;
  gateFence: boolean;
  obstructionOfView?: string;
  securitySignage: boolean;
  realEstateWebsites: string[];
  images: string[];
}

interface BackHouseRecord {
  id: string;
  rearEntryDoor: boolean;
  groundFloorWindowsAccessible: boolean;
  rearExteriorLighting: boolean;
  barsLocksReinforcedGlass: boolean;
  gateFence: boolean;
  obstructionOfView?: string;
  surveillanceCameras: boolean;
  landscapingConcealment: string;
  outbuildingsVisible: boolean;
  petDoorPresent: boolean;
  realEstateWebsites: string[];
  images: string[];
}

interface InsideHouseRecord {
  id: string;
  layoutExposure: boolean;
  realEstateWebsites: string[];
  images: string[];
}

interface GoogleStreetViewRecord {
  id: string;
  homeVisibleFromStreet: boolean;
  exteriorLighting: boolean;
  surveillanceCameras: boolean;
  motionSensorsAlarms: boolean;
  groundFloorWindowsAccessible: boolean;
  barsLocksReinforcedGlass: boolean;
  gateFence: boolean;
  obstructionOfView?: string;
  securitySignage: boolean;
  realEstateWebsites: string[];
  images: string[];
}

interface PropertyAssessmentTabProps {
  clientId: string;
}

const PropertyAssessmentTab = ({ clientId }: PropertyAssessmentTabProps) => {
  const { apiCall } = useApi();
  const { toast } = useToast();

  // Front of House State
  const [frontHouseRecords, setFrontHouseRecords] = useState<FrontHouseRecord[]>([]);
  const [frontHouseLoading, setFrontHouseLoading] = useState(true);
  const [frontHouseCurrentPage, setFrontHouseCurrentPage] = useState(1);
  const [isAddFrontHouseModalOpen, setIsAddFrontHouseModalOpen] = useState(false);
  const [isEditFrontHouseModalOpen, setIsEditFrontHouseModalOpen] = useState(false);
  const [editingFrontHouse, setEditingFrontHouse] = useState<FrontHouseRecord | null>(null);

  // Back of House State
  const [backHouseRecords, setBackHouseRecords] = useState<BackHouseRecord[]>([]);
  const [backHouseLoading, setBackHouseLoading] = useState(true);
  const [backHouseCurrentPage, setBackHouseCurrentPage] = useState(1);
  const [isAddBackHouseModalOpen, setIsAddBackHouseModalOpen] = useState(false);
  const [isEditBackHouseModalOpen, setIsEditBackHouseModalOpen] = useState(false);
  const [editingBackHouse, setEditingBackHouse] = useState<BackHouseRecord | null>(null);

  // Inside the House State
  const [insideHouseRecords, setInsideHouseRecords] = useState<InsideHouseRecord[]>([]);
  const [insideHouseLoading, setInsideHouseLoading] = useState(true);
  const [insideHouseCurrentPage, setInsideHouseCurrentPage] = useState(1);
  const [isAddInsideHouseModalOpen, setIsAddInsideHouseModalOpen] = useState(false);
  const [isEditInsideHouseModalOpen, setIsEditInsideHouseModalOpen] = useState(false);
  const [editingInsideHouse, setEditingInsideHouse] = useState<InsideHouseRecord | null>(null);

  // Google Street View State
  const [googleStreetViewRecords, setGoogleStreetViewRecords] = useState<GoogleStreetViewRecord[]>([]);
  const [googleStreetViewLoading, setGoogleStreetViewLoading] = useState(true);
  const [googleStreetViewCurrentPage, setGoogleStreetViewCurrentPage] = useState(1);
  const [isAddGoogleStreetViewModalOpen, setIsAddGoogleStreetViewModalOpen] = useState(false);
  const [isEditGoogleStreetViewModalOpen, setIsEditGoogleStreetViewModalOpen] = useState(false);
  const [editingGoogleStreetView, setEditingGoogleStreetView] = useState<GoogleStreetViewRecord | null>(null);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => Promise<void>) | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    fetchAllRecords();
  }, [clientId]);

  const fetchAllRecords = async () => {
    await Promise.all([
      fetchFrontHouseRecords(),
      fetchBackHouseRecords(),
      fetchInsideHouseRecords(),
      fetchGoogleStreetViewRecords()
    ]);
  };

  // API Functions
  const fetchFrontHouseRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/front-house-records`);
      if (response.ok) {
        const data = await response.json();
        // Convert snake_case to camelCase for frontend
        const convertedData = data.map((record: any) => ({
          id: record.id,
          homeVisibleFromStreet: record.home_visible_from_street,
          exteriorLighting: record.exterior_lighting,
          surveillanceCameras: record.surveillance_cameras,
          motionSensorsAlarms: record.motion_sensors_alarms,
          groundFloorWindowsAccessible: record.ground_floor_windows_accessible,
          barsLocksReinforcedGlass: record.bars_locks_reinforced_glass,
          gateFence: record.gate_fence,
          obstructionOfView: record.obstruction_of_view,
          securitySignage: record.security_signage,
          realEstateWebsites: record.real_estate_websites || [],
          images: record.images || []
        }));
        setFrontHouseRecords(convertedData);
      }
    } catch (error) {
      console.error("Error fetching front house records:", error);
    } finally {
      setFrontHouseLoading(false);
    }
  };

  const fetchBackHouseRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/back-house-records`);
      if (response.ok) {
        const data = await response.json();
        // Convert snake_case to camelCase for frontend
        const convertedData = data.map((record: any) => ({
          id: record.id,
          rearEntryDoor: record.rear_entry_door,
          groundFloorWindowsAccessible: record.ground_floor_windows_accessible,
          rearExteriorLighting: record.rear_exterior_lighting,
          barsLocksReinforcedGlass: record.bars_locks_reinforced_glass,
          gateFence: record.gate_fence,
          obstructionOfView: record.obstruction_of_view,
          surveillanceCameras: record.surveillance_cameras,
          landscapingConcealment: record.landscaping_concealment,
          outbuildingsVisible: record.outbuildings_visible,
          petDoorPresent: record.pet_door_present,
          realEstateWebsites: record.real_estate_websites || [],
          images: record.images || []
        }));
        setBackHouseRecords(convertedData);
      }
    } catch (error) {
      console.error("Error fetching back house records:", error);
    } finally {
      setBackHouseLoading(false);
    }
  };

  const fetchInsideHouseRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/inside-house-records`);
      if (response.ok) {
        const data = await response.json();
        // Convert snake_case to camelCase for frontend
        const convertedData = data.map((record: any) => ({
          id: record.id,
          layoutExposure: record.layout_exposure,
          realEstateWebsites: record.real_estate_websites || [],
          images: record.images || []
        }));
        setInsideHouseRecords(convertedData);
      }
    } catch (error) {
      console.error("Error fetching inside house records:", error);
    } finally {
      setInsideHouseLoading(false);
    }
  };

  const fetchGoogleStreetViewRecords = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/google-street-view-records`);
      if (response.ok) {
        const data = await response.json();
        // Convert snake_case to camelCase for frontend
        const convertedData = data.map((record: any) => ({
          id: record.id,
          homeVisibleFromStreet: record.home_visible_from_street,
          exteriorLighting: record.exterior_lighting,
          surveillanceCameras: record.surveillance_cameras,
          motionSensorsAlarms: record.motion_sensors_alarms,
          groundFloorWindowsAccessible: record.ground_floor_windows_accessible,
          barsLocksReinforcedGlass: record.bars_locks_reinforced_glass,
          gateFence: record.gate_fence,
          obstructionOfView: record.obstruction_of_view,
          securitySignage: record.security_signage,
          realEstateWebsites: record.real_estate_websites || [],
          images: record.images || []
        }));
        setGoogleStreetViewRecords(convertedData);
      }
    } catch (error) {
      console.error("Error fetching Google Street View records:", error);
    } finally {
      setGoogleStreetViewLoading(false);
    }
  };

  // Inline update functions
  const handleFrontHouseInlineUpdate = async (id: string, field: string, value: boolean) => {
    try {
      const formData = new FormData();
      
      // For inline updates, we only update the specific field
      const updateData = { [field]: value };
      formData.append('data', JSON.stringify(updateData));
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/front-house-records/${id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) await fetchFrontHouseRecords();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
  };

  const handleBackHouseInlineUpdate = async (id: string, field: string, value: boolean | string) => {
    try {
      const formData = new FormData();
      
      // For inline updates, we only update the specific field
      const updateData = { [field]: value };
      formData.append('data', JSON.stringify(updateData));
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/back-house-records/${id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) await fetchBackHouseRecords();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
  };

  const handleInsideHouseInlineUpdate = async (id: string, field: string, value: boolean) => {
    try {
      const formData = new FormData();
      
      // For inline updates, we only update the specific field
      const updateData = { [field]: value };
      formData.append('data', JSON.stringify(updateData));
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/inside-house-records/${id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) await fetchInsideHouseRecords();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
  };

  const handleGoogleStreetViewInlineUpdate = async (id: string, field: string, value: boolean) => {
    try {
      const formData = new FormData();
      
      // For inline updates, we only update the specific field
      const updateData = { [field]: value };
      formData.append('data', JSON.stringify(updateData));
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/google-street-view-records/${id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) await fetchGoogleStreetViewRecords();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
  };

  // Front of House Handlers
  const handleAddFrontHouse = async (record: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        home_visible_from_street: record.homeVisibleFromStreet,
        exterior_lighting: record.exteriorLighting,
        surveillance_cameras: record.surveillanceCameras,
        motion_sensors_alarms: record.motionSensorsAlarms,
        ground_floor_windows_accessible: record.groundFloorWindowsAccessible,
        bars_locks_reinforced_glass: record.barsLocksReinforcedGlass,
        gate_fence: record.gateFence,
        obstruction_of_view: record.obstructionOfView,
        security_signage: record.securitySignage,
        real_estate_websites: record.realEstateWebsites || [],
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add image files
      if (record.imageFiles && record.imageFiles.length > 0) {
        for (const file of record.imageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/front-house-records`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        await fetchFrontHouseRecords();
        toast({ title: "Success", description: "Record added successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to add record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
    }
    setIsAddFrontHouseModalOpen(false);
  };

  const handleEditFrontHouse = (record: FrontHouseRecord) => {
    setEditingFrontHouse(record);
    setIsEditFrontHouseModalOpen(true);
  };

  const handleUpdateFrontHouse = async (updatedRecord: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        home_visible_from_street: updatedRecord.homeVisibleFromStreet,
        exterior_lighting: updatedRecord.exteriorLighting,
        surveillance_cameras: updatedRecord.surveillanceCameras,
        motion_sensors_alarms: updatedRecord.motionSensorsAlarms,
        ground_floor_windows_accessible: updatedRecord.groundFloorWindowsAccessible,
        bars_locks_reinforced_glass: updatedRecord.barsLocksReinforcedGlass,
        gate_fence: updatedRecord.gateFence,
        obstruction_of_view: updatedRecord.obstructionOfView,
        security_signage: updatedRecord.securitySignage,
        real_estate_websites: updatedRecord.realEstateWebsites || [],
        remaining_images: updatedRecord.remainingImages || [], // Images user kept
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add new image files
      if (updatedRecord.newImageFiles && updatedRecord.newImageFiles.length > 0) {
        for (const file of updatedRecord.newImageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/front-house-records/${updatedRecord.id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) {
        await fetchFrontHouseRecords();
        toast({ title: "Success", description: "Record updated successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to update record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
    setIsEditFrontHouseModalOpen(false);
    setEditingFrontHouse(null);
  };

  const handleDeleteFrontHouse = (id: string) => {
    setDeleteAction(() => async () => {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/front-house-records/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchFrontHouseRecords();
        toast({ title: "Success", description: "Record deleted successfully" });
      } else {
        throw new Error('Failed to delete record');
      }
    });
    setDeleteTitle("Delete Front House Record");
    setDeleteMessage("Are you sure you want to delete this front house record? This action cannot be undone.");
    setIsDeleteModalOpen(true);
  };

  // Back of House Handlers
  const handleAddBackHouse = async (record: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        rear_entry_door: record.rearEntryDoor,
        ground_floor_windows_accessible: record.groundFloorWindowsAccessible,
        rear_exterior_lighting: record.rearExteriorLighting,
        bars_locks_reinforced_glass: record.barsLocksReinforcedGlass,
        gate_fence: record.gateFence,
        obstruction_of_view: record.obstructionOfView,
        surveillance_cameras: record.surveillanceCameras,
        landscaping_concealment: record.landscapingConcealment,
        outbuildings_visible: record.outbuildingsVisible,
        pet_door_present: record.petDoorPresent,
        real_estate_websites: record.realEstateWebsites || [],
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add image files
      if (record.imageFiles && record.imageFiles.length > 0) {
        for (const file of record.imageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/back-house-records`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        await fetchBackHouseRecords();
        toast({ title: "Success", description: "Record added successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to add record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
    }
    setIsAddBackHouseModalOpen(false);
  };

  const handleEditBackHouse = (record: BackHouseRecord) => {
    setEditingBackHouse(record);
    setIsEditBackHouseModalOpen(true);
  };

  const handleUpdateBackHouse = async (updatedRecord: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        rear_entry_door: updatedRecord.rearEntryDoor,
        ground_floor_windows_accessible: updatedRecord.groundFloorWindowsAccessible,
        rear_exterior_lighting: updatedRecord.rearExteriorLighting,
        bars_locks_reinforced_glass: updatedRecord.barsLocksReinforcedGlass,
        gate_fence: updatedRecord.gateFence,
        obstruction_of_view: updatedRecord.obstructionOfView,
        surveillance_cameras: updatedRecord.surveillanceCameras,
        landscaping_concealment: updatedRecord.landscapingConcealment,
        outbuildings_visible: updatedRecord.outbuildingsVisible,
        pet_door_present: updatedRecord.petDoorPresent,
        real_estate_websites: updatedRecord.realEstateWebsites || [],
        remaining_images: updatedRecord.remainingImages || [], // Images user kept
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add new image files
      if (updatedRecord.newImageFiles && updatedRecord.newImageFiles.length > 0) {
        for (const file of updatedRecord.newImageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/back-house-records/${updatedRecord.id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) {
        await fetchBackHouseRecords();
        toast({ title: "Success", description: "Record updated successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to update record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
    setIsEditBackHouseModalOpen(false);
    setEditingBackHouse(null);
  };

  const handleDeleteBackHouse = (id: string) => {
    setDeleteAction(() => async () => {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/back-house-records/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchBackHouseRecords();
        toast({ title: "Success", description: "Record deleted successfully" });
      } else {
        throw new Error('Failed to delete record');
      }
    });
    setDeleteTitle("Delete Back House Record");
    setDeleteMessage("Are you sure you want to delete this back house record? This action cannot be undone.");
    setIsDeleteModalOpen(true);
  };

  // Inside House Handlers
  const handleAddInsideHouse = async (record: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        layout_exposure: record.layoutExposure,
        real_estate_websites: record.realEstateWebsites || [],
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add image files
      if (record.imageFiles && record.imageFiles.length > 0) {
        for (const file of record.imageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/inside-house-records`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        await fetchInsideHouseRecords();
        toast({ title: "Success", description: "Record added successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to add record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
    }
    setIsAddInsideHouseModalOpen(false);
  };

  const handleEditInsideHouse = (record: InsideHouseRecord) => {
    setEditingInsideHouse(record);
    setIsEditInsideHouseModalOpen(true);
  };

  const handleUpdateInsideHouse = async (updatedRecord: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        layout_exposure: updatedRecord.layoutExposure,
        real_estate_websites: updatedRecord.realEstateWebsites || [],
        remaining_images: updatedRecord.remainingImages || [], // Images user kept
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add new image files
      if (updatedRecord.newImageFiles && updatedRecord.newImageFiles.length > 0) {
        for (const file of updatedRecord.newImageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/inside-house-records/${updatedRecord.id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) {
        await fetchInsideHouseRecords();
        toast({ title: "Success", description: "Record updated successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to update record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
    setIsEditInsideHouseModalOpen(false);
    setEditingInsideHouse(null);
  };

  const handleDeleteInsideHouse = (id: string) => {
    setDeleteAction(() => async () => {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/inside-house-records/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchInsideHouseRecords();
        toast({ title: "Success", description: "Record deleted successfully" });
      } else {
        throw new Error('Failed to delete record');
      }
    });
    setDeleteTitle("Delete Inside House Record");
    setDeleteMessage("Are you sure you want to delete this inside house record? This action cannot be undone.");
    setIsDeleteModalOpen(true);
  };

  // Google Street View Handlers
  const handleAddGoogleStreetView = async (record: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        home_visible_from_street: record.homeVisibleFromStreet,
        exterior_lighting: record.exteriorLighting,
        surveillance_cameras: record.surveillanceCameras,
        motion_sensors_alarms: record.motionSensorsAlarms,
        ground_floor_windows_accessible: record.groundFloorWindowsAccessible,
        bars_locks_reinforced_glass: record.barsLocksReinforcedGlass,
        gate_fence: record.gateFence,
        obstruction_of_view: record.obstructionOfView,
        security_signage: record.securitySignage,
        real_estate_websites: record.realEstateWebsites || [],
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add image files
      if (record.imageFiles && record.imageFiles.length > 0) {
        for (const file of record.imageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/google-street-view-records`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        await fetchGoogleStreetViewRecords();
        toast({ title: "Success", description: "Record added successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to add record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
    }
    setIsAddGoogleStreetViewModalOpen(false);
  };

  const handleEditGoogleStreetView = (record: GoogleStreetViewRecord) => {
    setEditingGoogleStreetView(record);
    setIsEditGoogleStreetViewModalOpen(true);
  };

  const handleUpdateGoogleStreetView = async (updatedRecord: any) => {
    try {
      const formData = new FormData();
      
      // Add JSON data
      const recordData = {
        home_visible_from_street: updatedRecord.homeVisibleFromStreet,
        exterior_lighting: updatedRecord.exteriorLighting,
        surveillance_cameras: updatedRecord.surveillanceCameras,
        motion_sensors_alarms: updatedRecord.motionSensorsAlarms,
        ground_floor_windows_accessible: updatedRecord.groundFloorWindowsAccessible,
        bars_locks_reinforced_glass: updatedRecord.barsLocksReinforcedGlass,
        gate_fence: updatedRecord.gateFence,
        obstruction_of_view: updatedRecord.obstructionOfView,
        security_signage: updatedRecord.securitySignage,
        real_estate_websites: updatedRecord.realEstateWebsites || [],
        remaining_images: updatedRecord.remainingImages || [], // Images user kept
      };
      formData.append('data', JSON.stringify(recordData));
      
      // Add new image files
      if (updatedRecord.newImageFiles && updatedRecord.newImageFiles.length > 0) {
        for (const file of updatedRecord.newImageFiles) {
          formData.append('images', file);
        }
      }
      
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/google-street-view-records/${updatedRecord.id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (response.ok) {
        await fetchGoogleStreetViewRecords();
        toast({ title: "Success", description: "Record updated successfully" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to update record", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
    setIsEditGoogleStreetViewModalOpen(false);
    setEditingGoogleStreetView(null);
  };

  const handleDeleteGoogleStreetView = (id: string) => {
    setDeleteAction(() => async () => {
      const response = await apiCall(`${BASE_URL}/clients/${clientId}/google-street-view-records/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchGoogleStreetViewRecords();
        toast({ title: "Success", description: "Record deleted successfully" });
      } else {
        throw new Error('Failed to delete record');
      }
    });
    setDeleteTitle("Delete Google Street View Record");
    setDeleteMessage("Are you sure you want to delete this Google Street View record? This action cannot be undone.");
    setIsDeleteModalOpen(true);
  };

  // Pagination calculations
  const frontHouseTotalPages = Math.ceil(frontHouseRecords.length / ITEMS_PER_PAGE);
  const frontHouseStartIndex = (frontHouseCurrentPage - 1) * ITEMS_PER_PAGE;
  const frontHouseEndIndex = frontHouseStartIndex + ITEMS_PER_PAGE;
  const frontHouseCurrentRecords = frontHouseRecords.slice(frontHouseStartIndex, frontHouseEndIndex);

  const backHouseTotalPages = Math.ceil(backHouseRecords.length / ITEMS_PER_PAGE);
  const backHouseStartIndex = (backHouseCurrentPage - 1) * ITEMS_PER_PAGE;
  const backHouseEndIndex = backHouseStartIndex + ITEMS_PER_PAGE;
  const backHouseCurrentRecords = backHouseRecords.slice(backHouseStartIndex, backHouseEndIndex);

  const insideHouseTotalPages = Math.ceil(insideHouseRecords.length / ITEMS_PER_PAGE);
  const insideHouseStartIndex = (insideHouseCurrentPage - 1) * ITEMS_PER_PAGE;
  const insideHouseEndIndex = insideHouseStartIndex + ITEMS_PER_PAGE;
  const insideHouseCurrentRecords = insideHouseRecords.slice(insideHouseStartIndex, insideHouseEndIndex);

  const googleStreetViewTotalPages = Math.ceil(googleStreetViewRecords.length / ITEMS_PER_PAGE);
  const googleStreetViewStartIndex = (googleStreetViewCurrentPage - 1) * ITEMS_PER_PAGE;
  const googleStreetViewEndIndex = googleStreetViewStartIndex + ITEMS_PER_PAGE;
  const googleStreetViewCurrentRecords = googleStreetViewRecords.slice(googleStreetViewStartIndex, googleStreetViewEndIndex);

  if (frontHouseLoading || backHouseLoading || insideHouseLoading || googleStreetViewLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading property assessment records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Front of House Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Front of House Records</h2>
          <Button variant="action" onClick={() => setIsAddFrontHouseModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {frontHouseRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground mb-4">No front of house records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Home Visible</TableHead>
                      <TableHead>Exterior Lighting</TableHead>
                      <TableHead>Surveillance</TableHead>
                      <TableHead>Motion Sensors</TableHead>
                      <TableHead>Ground Floor Windows</TableHead>
                      <TableHead>Bars/Locks/Glass</TableHead>
                      <TableHead>Gate/Fence</TableHead>
                      <TableHead>Obstruction View</TableHead>
                      <TableHead>Security Signage</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frontHouseCurrentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.homeVisibleFromStreet}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'home_visible_from_street', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.exteriorLighting}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'exterior_lighting', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.surveillanceCameras}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'surveillance_cameras', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.motionSensorsAlarms}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'motion_sensors_alarms', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.groundFloorWindowsAccessible}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'ground_floor_windows_accessible', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.barsLocksReinforcedGlass}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'bars_locks_reinforced_glass', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.gateFence}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'gate_fence', value)}
                          />
                        </TableCell>
                        <TableCell>{record.obstructionOfView || '-'}</TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.securitySignage}
                            onSave={(value) => handleFrontHouseInlineUpdate(record.id, 'security_signage', value)}
                          />
                        </TableCell>
                        <TableCell>
                          <ImageViewer images={record.images} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="action" size="sm" onClick={() => handleEditFrontHouse(record)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteFrontHouse(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {frontHouseTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setFrontHouseCurrentPage(p => Math.max(1, p - 1))}
                      className={frontHouseCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: frontHouseTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setFrontHouseCurrentPage(page)}
                        isActive={frontHouseCurrentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setFrontHouseCurrentPage(p => Math.min(frontHouseTotalPages, p + 1))}
                      className={frontHouseCurrentPage === frontHouseTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Back of House Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Back of House Records</h2>
          <Button variant="action" onClick={() => setIsAddBackHouseModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {backHouseRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground mb-4">No back of house records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rear Entry Door</TableHead>
                      <TableHead>Ground Floor Windows</TableHead>
                      <TableHead>Rear Lighting</TableHead>
                      <TableHead>Bars/Locks/Glass</TableHead>
                      <TableHead>Gate/Fence</TableHead>
                      <TableHead>Obstruction View</TableHead>
                      <TableHead>Surveillance</TableHead>
                      <TableHead>Landscaping</TableHead>
                      <TableHead>Outbuildings</TableHead>
                      <TableHead>Pet Door</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backHouseCurrentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.rearEntryDoor}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'rear_entry_door', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.groundFloorWindowsAccessible}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'ground_floor_windows_accessible', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.rearExteriorLighting}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'rear_exterior_lighting', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.barsLocksReinforcedGlass}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'bars_locks_reinforced_glass', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.gateFence}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'gate_fence', value)}
                          />
                        </TableCell>
                        <TableCell>{record.obstructionOfView || '-'}</TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.surveillanceCameras}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'surveillance_cameras', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableDropdown
                            value={record.landscapingConcealment || 'None'}
                            options={[
                              { value: "None", label: "None" },
                              { value: "Moderate", label: "Moderate" },
                              { value: "Heavy", label: "Heavy" }
                            ]}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'landscaping_concealment', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.outbuildingsVisible}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'outbuildings_visible', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.petDoorPresent}
                            onSave={(value) => handleBackHouseInlineUpdate(record.id, 'pet_door_present', value)}
                          />
                        </TableCell>
                        <TableCell>
                          <ImageViewer images={record.images} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="action" size="sm" onClick={() => handleEditBackHouse(record)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteBackHouse(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {backHouseTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setBackHouseCurrentPage(p => Math.max(1, p - 1))}
                      className={backHouseCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: backHouseTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setBackHouseCurrentPage(page)}
                        isActive={backHouseCurrentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setBackHouseCurrentPage(p => Math.min(backHouseTotalPages, p + 1))}
                      className={backHouseCurrentPage === backHouseTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Inside the House Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Inside the House Records</h2>
          <Button variant="action" onClick={() => setIsAddInsideHouseModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {insideHouseRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground mb-4">No inside house records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Layout Exposure (Floor Plan Online)</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insideHouseCurrentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="p-0">
                        <EditableCheckbox
                          value={record.layoutExposure}
                          onSave={(value) => handleInsideHouseInlineUpdate(record.id, 'layout_exposure', value)}
                        />
                      </TableCell>
                      <TableCell>
                        <ImageViewer images={record.images} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="action" size="sm" onClick={() => handleEditInsideHouse(record)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteInsideHouse(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {insideHouseTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setInsideHouseCurrentPage(p => Math.max(1, p - 1))}
                      className={insideHouseCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: insideHouseTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setInsideHouseCurrentPage(page)}
                        isActive={insideHouseCurrentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setInsideHouseCurrentPage(p => Math.min(insideHouseTotalPages, p + 1))}
                      className={insideHouseCurrentPage === insideHouseTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Google Street View Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Google Street View Records</h2>
          <Button variant="action" onClick={() => setIsAddGoogleStreetViewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {googleStreetViewRecords.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground mb-4">No Google Street View records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Home Visible</TableHead>
                      <TableHead>Exterior Lighting</TableHead>
                      <TableHead>Surveillance</TableHead>
                      <TableHead>Motion Sensors</TableHead>
                      <TableHead>Ground Floor Windows</TableHead>
                      <TableHead>Bars/Locks/Glass</TableHead>
                      <TableHead>Gate/Fence</TableHead>
                      <TableHead>Obstruction View</TableHead>
                      <TableHead>Security Signage</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {googleStreetViewCurrentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.homeVisibleFromStreet}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'home_visible_from_street', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.exteriorLighting}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'exterior_lighting', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.surveillanceCameras}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'surveillance_cameras', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.motionSensorsAlarms}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'motion_sensors_alarms', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.groundFloorWindowsAccessible}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'ground_floor_windows_accessible', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.barsLocksReinforcedGlass}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'bars_locks_reinforced_glass', value)}
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.gateFence}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'gate_fence', value)}
                          />
                        </TableCell>
                        <TableCell>{record.obstructionOfView || '-'}</TableCell>
                        <TableCell className="p-0">
                          <EditableCheckbox
                            value={record.securitySignage}
                            onSave={(value) => handleGoogleStreetViewInlineUpdate(record.id, 'security_signage', value)}
                          />
                        </TableCell>
                        <TableCell>
                          <ImageViewer images={record.images} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="action" size="sm" onClick={() => handleEditGoogleStreetView(record)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteGoogleStreetView(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {googleStreetViewTotalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setGoogleStreetViewCurrentPage(p => Math.max(1, p - 1))}
                      className={googleStreetViewCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: googleStreetViewTotalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setGoogleStreetViewCurrentPage(page)}
                        isActive={googleStreetViewCurrentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setGoogleStreetViewCurrentPage(p => Math.min(googleStreetViewTotalPages, p + 1))}
                      className={googleStreetViewCurrentPage === googleStreetViewTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddFrontHouseModal
        isOpen={isAddFrontHouseModalOpen}
        onClose={() => setIsAddFrontHouseModalOpen(false)}
        onAdd={handleAddFrontHouse}
      />
      <EditFrontHouseModal
        isOpen={isEditFrontHouseModalOpen}
        onClose={() => {
          setIsEditFrontHouseModalOpen(false);
          setEditingFrontHouse(null);
        }}
        record={editingFrontHouse}
        onUpdate={handleUpdateFrontHouse}
        clientId={clientId}
      />

      <AddBackHouseModal
        isOpen={isAddBackHouseModalOpen}
        onClose={() => setIsAddBackHouseModalOpen(false)}
        onAdd={handleAddBackHouse}
      />
      <EditBackHouseModal
        isOpen={isEditBackHouseModalOpen}
        onClose={() => {
          setIsEditBackHouseModalOpen(false);
          setEditingBackHouse(null);
        }}
        record={editingBackHouse}
        onUpdate={handleUpdateBackHouse}
      />

      <AddInsideHouseModal
        isOpen={isAddInsideHouseModalOpen}
        onClose={() => setIsAddInsideHouseModalOpen(false)}
        onAdd={handleAddInsideHouse}
      />
      <EditInsideHouseModal
        isOpen={isEditInsideHouseModalOpen}
        onClose={() => {
          setIsEditInsideHouseModalOpen(false);
          setEditingInsideHouse(null);
        }}
        record={editingInsideHouse}
        onUpdate={handleUpdateInsideHouse}
      />

      <AddGoogleStreetViewModal
        isOpen={isAddGoogleStreetViewModalOpen}
        onClose={() => setIsAddGoogleStreetViewModalOpen(false)}
        onAdd={handleAddGoogleStreetView}
      />
      <EditGoogleStreetViewModal
        isOpen={isEditGoogleStreetViewModalOpen}
        onClose={() => {
          setIsEditGoogleStreetViewModalOpen(false);
          setEditingGoogleStreetView(null);
        }}
        record={editingGoogleStreetView}
        onUpdate={handleUpdateGoogleStreetView}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteAction(null);
        }}
        onConfirm={deleteAction || (() => Promise.resolve())}
        title={deleteTitle}
        message={deleteMessage}
      />
    </div>
  );
};

export default PropertyAssessmentTab;

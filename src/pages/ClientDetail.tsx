import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import TopNavBar from "@/components/TopNavBar";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ClientInfoTab from "@/components/client-tabs/ClientInfoTab";
import EmailTab from "@/components/client-tabs/EmailTab";
import PhoneTab from "@/components/client-tabs/PhoneTab";
import AddressTab from "@/components/client-tabs/AddressTab";
import RelativeTab from "@/components/client-tabs/RelativeTab";
import SocialMediaTab from "@/components/client-tabs/SocialMediaTab";
import ScrapingTab from "@/components/client-tabs/ScrapingTab";
import UsernameTab from "@/components/client-tabs/UsernameTab";
import HeatmapTab from "@/components/client-tabs/HeatmapTab";
import GovernmentRecordsTab from "@/components/client-tabs/GovernmentRecordsTab";
import BusinessTab from "@/components/client-tabs/BusinessTab";
import FacialRecognitionConsolidatedTab from "@/components/client-tabs/FacialRecognitionConsolidatedTab";
import BrokerTab from "@/components/client-tabs/BrokerTab";
import PropertyAssessmentTab from "@/components/client-tabs/PropertyAssessmentTab";
import SerpAnalysisTab from "@/components/client-tabs/SerpAnalysisTab";
import AIAnalysisTab from "@/components/client-tabs/AIAnalysisTab";
import LeakedDatasetTab from "@/components/client-tabs/LeakedDatasetTab";
import OsintModuleResultTab from "@/components/client-tabs/OsintModuleResultTab";
import MatchingResultTab from "@/components/client-tabs/MatchingResultTab";
import GenerateTab from "@/components/client-tabs/GenerateTab";
import { BASE_URL } from "@/constants/api";
import { useApi } from "@/hooks/use-api";

interface Client {
  ID: string;
  full_name: string;
  other_names: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  sex: string;
  organization: string;
  employer: string;
  status: string;
  risk_score: string;
  created_at: string;
}

type TabType = "client-info" | "email" | "phone" | "address" | "relative" | "social-media" | "scraping" | "username" | "heatmap" | "government-records" | "business" | "facial-recognition" | "broker" | "property-assessment" | "serp-analysis" | "ai-analysis" | "leaked-datasets" | "osint-module-results" | "matching-results" | "generate";

const tabs = [
  { id: "client-info", label: "Client Info" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone Number" },
  { id: "address", label: "Address" },
  { id: "relative", label: "Relatives & Associates" },
  { id: "social-media", label: "Social Media Presence" },
  { id: "scraping", label: "Social Media Scraping" },
  { id: "username", label: "Username" },
  { id: "heatmap", label: "Heatmap & Residential Images" },
  { id: "government-records", label: "Government Records" },
  { id: "business", label: "Business Information" },
  { id: "facial-recognition", label: "Facial Recognition" },
  { id: "broker", label: "Broker Screen Record" },
  { id: "property-assessment", label: "Property Assessment" },
  { id: "serp-analysis", label: "SERP Analysis" },
  { id: "ai-analysis", label: "AI Analysis" },
  { id: "leaked-datasets", label: "Leaked Datasets" },
  { id: "osint-module-results", label: "OSINT Module Results" },
  { id: "matching-results", label: "Matching Results" },
  { id: "generate", label: "Generate Document" },
];

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("client-info");
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await apiCall(`${BASE_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      if (response.ok) {
        setIsChangePasswordOpen(false);
        toast({ title: "Success", description: "Password changed successfully." });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Failed to change password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An error occurred while changing password.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      const response = await apiCall(`${BASE_URL}/analyst/clients`);

      if (response.ok) {
        const data = await response.json();
        const clientData = data.find((c: Client) => c.ID === id);
        setClient(clientData || null);
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Loading client details...</h1>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Client not found</h1>
          <Button
            className="mt-4 bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
            onClick={() => navigate("/analyst/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id as TabType);
    }
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id as TabType);
    }
  };

  const showPrevious = activeTab !== "client-info";
  const showNext = activeTab !== "generate";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <TopNavBar />

      <div className="flex pt-16 overflow-x-hidden">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 w-64 bg-gradient-to-b from-accent/10 via-background to-primary/10 backdrop-blur-sm border-r border-accent/30 h-[calc(100vh-4rem)] shadow-medium z-30 flex flex-col">
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white shadow-soft"
                    : "text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/20 hover:scale-[1.02]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User info + actions */}
          <div className="p-4 border-t border-accent/20 flex-shrink-0 space-y-1">
            <div className="flex items-center gap-3 px-1 pb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/80 to-primary/60 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || "Analyst"}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors"
            >
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Change Password
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 min-w-0 overflow-x-auto">
          <div className="space-y-6">
            {activeTab === "client-info" && <ClientInfoTab client={client} />}
            {activeTab === "email" && <EmailTab clientId={client.ID} />}
            {activeTab === "phone" && <PhoneTab clientId={client.ID} />}
            {activeTab === "address" && <AddressTab clientId={client.ID} />}
            {activeTab === "relative" && <RelativeTab clientId={client.ID} />}
            {activeTab === "social-media" && <SocialMediaTab clientId={client.ID} />}
            {activeTab === "scraping" && <ScrapingTab clientId={client.ID} />}
            {activeTab === "username" && <UsernameTab clientId={client.ID} />}
            {activeTab === "heatmap" && <HeatmapTab clientId={client.ID} />}
            {activeTab === "government-records" && <GovernmentRecordsTab clientId={client.ID} />}
            {activeTab === "business" && <BusinessTab clientId={client.ID} />}
            {activeTab === "facial-recognition" && <FacialRecognitionConsolidatedTab clientId={client.ID} />}
            {activeTab === "broker" && <BrokerTab clientId={client.ID} />}
            {activeTab === "property-assessment" && <PropertyAssessmentTab clientId={client.ID} />}
            {activeTab === "serp-analysis" && <SerpAnalysisTab clientId={client.ID} />}
            {activeTab === "ai-analysis" && <AIAnalysisTab clientId={client.ID} />}
            {activeTab === "leaked-datasets" && <LeakedDatasetTab clientId={client.ID} />}
            {activeTab === "osint-module-results" && <OsintModuleResultTab clientId={client.ID} />}
            {activeTab === "matching-results" && <MatchingResultTab clientId={client.ID} />}
            {activeTab === "generate" && <GenerateTab clientId={client.ID} />}

            {/* Navigation Buttons */}
            {activeTab !== "generate" && (
              <div className="flex justify-between pt-4 border-t border-border">
                <div>
                  {showPrevious && (
                    <Button className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all" onClick={handlePrevious}>
                      Previous
                    </Button>
                  )}
                </div>
                <div>
                  {showNext && (
                    <Button className="bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
};

export default ClientDetail;

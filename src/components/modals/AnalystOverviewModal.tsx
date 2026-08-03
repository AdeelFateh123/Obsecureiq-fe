import { X, Users, FolderOpen, ClipboardList, Globe, BrainCircuit, FileText } from "lucide-react";

const ANALYST_STORAGE_KEY = "analystOverviewSeen";

const steps = [
  {
    icon: Users,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    number: "01",
    title: "Your Assigned Clients",
    description: "The Clients page shows only clients assigned to you by the admin. You cannot see other analysts' clients.",
  },
  {
    icon: FolderOpen,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    number: "02",
    title: "Open a Client",
    description: "Click 'View Details' on any client to open their full investigation workspace with all data tabs.",
  },
  {
    icon: ClipboardList,
    color: "bg-green-50 text-green-600 border-green-100",
    number: "03",
    title: "Fill In the Data Tabs",
    description: "Add emails, phone numbers, addresses, social media profiles, government records, and more. Email matching runs automatically in the background once an email is added.",
  },
  {
    icon: Globe,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    number: "04",
    title: "Social Media Scraping",
    description: "When you add a social media profile, scraping starts automatically. Screenshots and extracted data appear directly inside the Social Media tab — no separate tab needed.",
  },
  {
    icon: BrainCircuit,
    color: "bg-pink-50 text-pink-600 border-pink-100",
    number: "05",
    title: "Auto-Populated Tabs",
    description: "Tabs like SERP Analysis and AI Analysis are filled in as data is collected. Use AI Analysis to generate an AI summary of everything gathered on the client.",
  },
  {
    icon: FileText,
    color: "bg-teal-50 text-teal-600 border-teal-100",
    number: "06",
    title: "Generate a Report",
    description: "Go to the Generate tab and click Generate. The system automatically pulls all collected data and creates a Google Docs report. Find all reports in Generated Documents.",
  },
];

interface AnalystOverviewModalProps {
  open: boolean;
  onClose: () => void;
}

const AnalystOverviewModal = ({ open, onClose }: AnalystOverviewModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-fade-in">

        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Analyst Portal Overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">A quick guide to get you started.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-px bg-border/40 mx-6" />

        <div className="p-5 grid grid-cols-2 gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${step.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground">{step.number}</span>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent/90 to-primary/70 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Got it, let's go
          </button>
        </div>
      </div>
    </div>
  );
};

export { AnalystOverviewModal, ANALYST_STORAGE_KEY };

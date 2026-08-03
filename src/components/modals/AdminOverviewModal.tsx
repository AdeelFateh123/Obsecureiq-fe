import { X, Users, UserCog, MonitorCheck, FileText, UserPlus } from "lucide-react";

const STORAGE_KEY = "adminOverviewSeen";

const steps = [
  {
    icon: UserPlus,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    number: "01",
    title: "Add a Client",
    description: "Go to Clients → click 'Add Client', fill in the details and save.",
  },
  {
    icon: Users,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    number: "02",
    title: "Assign to Analyst",
    description: "Open a client in the list and use the Assign option to link them to an analyst.",
  },
  {
    icon: UserCog,
    color: "bg-green-50 text-green-600 border-green-100",
    number: "03",
    title: "Add a User",
    description: "Go to Manage Users → click 'Add User' to create a new analyst account.",
  },
  {
    icon: MonitorCheck,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    number: "04",
    title: "Scraper Profiles",
    description: "Go to Profile Management → click 'Setup Profile', select the platform, and log in when the browser opens. The session is saved and used automatically when scraping that platform for any client.",
  },
  {
    icon: FileText,
    color: "bg-teal-50 text-teal-600 border-teal-100",
    number: "05",
    title: "View Documents",
    description: "Go to Generated Documents to view and download all client reports.",
  },
];

interface AdminOverviewModalProps {
  open: boolean;
  onClose: () => void;
}

const AdminOverviewModal = ({ open, onClose }: AdminOverviewModalProps) => {
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
            <h2 className="text-lg font-bold text-foreground">Admin Portal Overview</h2>
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
            const isLast = index === steps.length - 1;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors ${isLast ? "col-span-2" : ""}`}
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

export { AdminOverviewModal, STORAGE_KEY };

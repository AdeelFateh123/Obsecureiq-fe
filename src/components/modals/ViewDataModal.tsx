import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ViewDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: string;
  type?: "json" | "text";
}

const RenderModuleData = ({ moduleDataString }: { moduleDataString: string }) => {
  try {
    // Parse the module_data string which contains JSON strings
    const moduleDataArray = JSON.parse(moduleDataString);
    
    if (Array.isArray(moduleDataArray)) {
      return (
        <div className="space-y-4">
          {moduleDataArray.map((moduleStr, index) => {
            try {
              const moduleObj = JSON.parse(moduleStr);
              const breachName = moduleObj.breach_name || `Module ${index + 1}`;
              
              return (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="inline-block bg-accent/10 border border-accent/20 rounded-lg px-4 py-2">
                      <strong className="text-accent-foreground font-bold">
                        {breachName}
                      </strong>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(moduleObj).map(([key, value]) => {
                      if (key === 'breach_name') return null;
                      return (
                        <div key={key} className="border-b pb-1">
                          <strong className="text-sm" style={{ color: "rgb(1, 15, 60)" }}>
                            {key.replace(/_/g, " ")}:
                          </strong>
                          <div className="ml-2">
                            <RenderObject obj={value} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } catch {
              return (
                <div key={index} className="border border-border rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap break-words">{moduleStr}</pre>
                </div>
              );
            }
          })}
        </div>
      );
    }
  } catch {
    // Fallback to original string display
    return <pre className="text-sm whitespace-pre-wrap break-words">{moduleDataString}</pre>;
  }
  
  return <pre className="text-sm whitespace-pre-wrap break-words">{moduleDataString}</pre>;
};

const RenderModuleResults = ({ moduleResults }: { moduleResults: any[] }) => {
  return (
    <div className="space-y-4">
      {moduleResults.map((module, index) => (
        <div key={index} className="border border-border rounded-lg p-4">
          <div className="text-center mb-4">
            <div className="inline-block bg-action-blue/10 border border-action-blue/20 rounded-lg px-4 py-2">
              <strong className="text-action-blue font-bold">
                {module.module_id || 'Unknown Module'}
              </strong>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(module).map(([key, value]) => {
              if (key === 'module_id') return null;
              return (
                <div key={key} className="border-b pb-1">
                  <strong className="text-sm" style={{ color: "rgb(1, 15, 60)" }}>
                    {key.replace(/_/g, " ")}:
                  </strong>
                  <div className="ml-2">
                    <RenderObject obj={value} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const RenderObject = ({ obj, isMainSection = false }: { obj: any; isMainSection?: boolean }) => {
  if (obj === null || obj === undefined)
    return <p className="text-muted-foreground">None</p>;

  if (typeof obj !== "object") {
    return <p>{String(obj)}</p>;
  }

  if (Array.isArray(obj)) {
    return (
      <ul className="list-disc ml-6 space-y-1">
        {obj.map((item, idx) => (
          <li key={idx}>
            <RenderObject obj={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={isMainSection ? "space-y-6" : "space-y-3"}>
      {Object.entries(obj).map(([key, value], index) => {
        const displayValue = value?.value ?? value;
        const isMainSectionKey = isMainSection && ["Matching Result", "Module Data", "Client Data"].includes(key);
        
        // Special handling for Module Data section
        if (isMainSectionKey && key === "Module Data" && typeof displayValue === "string") {
          return (
            <div key={key}>
              {index > 0 && (
                <hr className="border-t-2 border-gray-400 my-6" />
              )}
              <strong
                className="block text-center text-lg font-bold mb-4"
                style={{ color: "rgb(1, 15, 60)" }}
              >
                {key.replace(/_/g, " ")}:
              </strong>
              <RenderModuleData moduleDataString={displayValue} />
            </div>
          );
        }
        
        // Special handling for module_results in matching result
        if (key === "module_results" && Array.isArray(displayValue)) {
          return (
            <div key={key}>
              <strong
                className="block text-sm capitalize mb-4"
                style={{ color: "rgb(1, 15, 60)" }}
              >
                {key.replace(/_/g, " ")}:
              </strong>
              <RenderModuleResults moduleResults={displayValue} />
            </div>
          );
        }

        return (
          <div key={key}>
            {isMainSectionKey && index > 0 && (
              <hr className="border-t-2 border-gray-400 my-6" />
            )}
            <div className={isMainSection ? "" : "border-b pb-2"}>
              <strong
                className={`block text-sm capitalize ${
                  isMainSectionKey ? "text-center text-lg font-bold mb-4" : ""
                }`}
                style={{ color: "rgb(1, 15, 60)" }}
              >
                {key.replace(/_/g, " ")}:
              </strong>

              {typeof displayValue === "string" && displayValue.includes("<a") ? (
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: displayValue }}
                />
              ) : (
                <RenderObject obj={displayValue} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ViewDataModal = ({ isOpen, onClose, title, data, type = "json" }: ViewDataModalProps) => {
  const { toast } = useToast();

  const parseJSON = () => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const json = parseJSON();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto p-4 bg-muted rounded-md">
          {type === "json" && json ? (
            <RenderObject obj={json} isMainSection={true} />
          ) : (
            <pre className="text-sm whitespace-pre-wrap break-words">
              {data}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDataModal;

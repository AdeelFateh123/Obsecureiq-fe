import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
}

const GeneratedDocuments = () => {
  const documents: Document[] = [
    { id: 2, name: "Client Proposal - ACME Corp", type: "DOCX", date: "2024-03-14" },
    { id: 6, name: "Service Agreement", type: "DOCX", date: "2024-03-10" },
    { id: 9, name: "Legal Contract - XYZ Ltd", type: "DOCX", date: "2024-03-07" },
    { id: 10, name: "Project Requirements", type: "DOCX", date: "2024-03-05" },
    { id: 11, name: "Partnership Agreement", type: "DOCX", date: "2024-03-03" },
    { id: 12, name: "NDA Template", type: "DOCX", date: "2024-03-01" },
  ];

  const handleDownload = (doc: Document) => {
    console.log(`Downloading ${doc.name}`);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">Generated Documents</h1>
          <p className="text-muted-foreground">Access and download your DOCX documents</p>
        </div>

        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="bg-card rounded-lg shadow-medium border border-border p-4 flex items-center justify-between animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(doc.date).toLocaleDateString()}</p>
                </div>
              </div>
              <Button
                onClick={() => handleDownload(doc)}
                variant="action"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GeneratedDocuments;

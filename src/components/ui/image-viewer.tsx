import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BASE_URL } from "@/constants/api";

interface ImageViewerProps {
  images: string[];
}

const ImageViewer = ({ images }: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return <span className="text-muted-foreground">No images</span>;
  }

  const handleViewImages = () => {
    setCurrentImageIndex(0);
    setIsOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewImages}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        View {images.length} image{images.length > 1 ? 's' : ''}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Image {currentImageIndex + 1} of {images.length}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <img
                src={`${images[currentImageIndex]}`}
                alt={`Image ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={prevImage}>
                  Previous
                </Button>
                <Button variant="outline" onClick={nextImage}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageViewer;
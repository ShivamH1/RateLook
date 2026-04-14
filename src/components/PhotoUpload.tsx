import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  onPhotoSelected: (file: File, preview: string) => void;
}

const PhotoUpload = ({ onPhotoSelected }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onPhotoSelected(file, url);
    },
    [onPhotoSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setPreview(null);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`group relative flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                dragOver
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50 bg-surface"
              }`}
            >
              {/* Guide overlay */}
              <div className="absolute inset-6 rounded-xl border border-muted-foreground/20 pointer-events-none transition-colors group-hover:border-primary/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-surface text-xs text-muted-foreground transition-colors group-hover:text-primary/70">
                  Face here
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-32 rounded-full border border-muted-foreground/15 transition-colors group-hover:border-primary/20" />
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                    Upload your photo
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Straight-on selfie, good lighting
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="glow" size="sm" className="group-hover:brightness-125 transition-all pointer-events-none">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleInputChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
            </label>

            <div className="mt-4 flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success" />
              Photos are processed locally & never shared
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={preview}
                alt="Your photo"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={reset}
              className="absolute top-3 right-3 p-2 rounded-full glass"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={reset}
              className="absolute bottom-3 left-3 px-3 py-2 rounded-full glass flex items-center gap-2 text-xs text-foreground"
            >
              <RotateCcw className="w-3 h-3" />
              Retake
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoUpload;

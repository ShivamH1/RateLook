import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Sparkles, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PhotoUpload from "@/components/PhotoUpload";
import ResultsCard, { type AnalysisResult } from "@/components/ResultsCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Step = "upload" | "analyzing" | "results";

const Index = () => {
  const [step, setStep] = useState<Step>("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [guestUploadCount, setGuestUploadCount] = useState(() => 
    parseInt(localStorage.getItem("upload_count") || "0")
  );

  const handlePhotoSelected = useCallback((file: File, preview: string) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  }, []);

  const analyzePhoto = async () => {
    if (!photoFile) return;

    // Check for free upload limit for guest users
    if (!user) {
      const uploadCount = parseInt(localStorage.getItem("upload_count") || "0");
      if (uploadCount >= 1) {
        toast.info("You've used your free analysis. Please sign in to continue!");
        navigate("/auth");
        return;
      }
    }

    setStep("analyzing");

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });

      const response = await fetch("http://localhost:3000/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze photo");
      }

      const data = await response.json();
      setResult(data as AnalysisResult);
      setStep("results");

      // Increment upload count for guest users after successful analysis
      if (!user) {
        const nextCount = guestUploadCount + 1;
        setGuestUploadCount(nextCount);
        localStorage.setItem("upload_count", nextCount.toString());
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      toast.error("Analysis failed. Please try again.");
      setStep("upload");
    }
  };

  const reset = () => {
    setStep("upload");
    setPhotoFile(null);
    setPhotoPreview("");
    setResult(null);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-dark)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            {step !== "upload" && (
              <button onClick={reset} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="RateLook Logo" className="w-8 h-8 rounded-lg" />
              <h1 className="font-display font-bold text-lg">
                Rate<span className="text-gradient-gold">Look</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {!user && (
              <Button variant="glass" size="sm" onClick={() => navigate("/auth")} className="font-display text-xs">
                <User className="w-3.5 h-3.5" />
                Sign In
              </Button>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Private
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-2xl font-bold"
                >
                  Get your <span className="text-gradient-gold">Look Score</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground max-w-[280px] mx-auto"
                >
                  AI-powered aesthetic analysis with personalized style recommendations
                </motion.p>
              </div>

              {/* Photo Tips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 justify-center"
              >
                {[
                  { emoji: "💡", text: "Good lighting" },
                  { emoji: "📐", text: "Straight-on" },
                  { emoji: "😊", text: "Natural pose" },
                ].map((tip) => (
                  <div
                    key={tip.text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground"
                  >
                    <span>{tip.emoji}</span>
                    {tip.text}
                  </div>
                ))}
              </motion.div>

              <PhotoUpload onPhotoSelected={handlePhotoSelected} />

              {photoFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex justify-center"
                >
                  <Button variant="glow" size="lg" onClick={analyzePhoto} className="px-8 font-display">
                    <Sparkles className="w-5 h-5" />
                    Analyze My Look
                  </Button>
                </motion.div>
              )}

              {!user && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-xs text-muted-foreground"
                >
                  {guestUploadCount >= 1 ? (
                    <span>
                      Free analysis used.{" "}
                      <button onClick={() => navigate("/auth")} className="text-primary hover:underline font-semibold">
                        Sign in
                      </button>{" "}
                      to continue
                    </span>
                  ) : (
                    <span>
                      <button onClick={() => navigate("/auth")} className="text-primary hover:underline">
                        Sign in
                      </button>{" "}
                      to save your results
                    </span>
                  )}
                </motion.p>
              )}
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                </motion.div>
                <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-display font-semibold text-foreground">Analyzing your look...</p>
                <p className="text-xs text-muted-foreground">Evaluating grooming, style & posture</p>
              </div>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </motion.div>
          )}

          {step === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 pb-8"
            >
              <ResultsCard result={result} photoUrl={photoPreview} />
              <div className="flex justify-center gap-3">
                <Button variant="glass" onClick={reset} className="font-display">
                  Analyze Another Photo
                </Button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;

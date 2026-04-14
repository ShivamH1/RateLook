import { useRef } from "react";
import { motion } from "framer-motion";
import { Share2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AnalysisResult } from "@/components/ResultsCard";

interface ShareCardProps {
  result: AnalysisResult;
  onClose: () => void;
}

const ShareCard = ({ result, onClose }: ShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      // Use canvas approach for sharing
      const text = `🔥 My RateLook Score: ${result.overallScore}/100\n\nGrooming: ${result.grooming} | Style: ${result.style} | Posture: ${result.posture}\n\n${result.summary}\n\nGet your score at RateLook!`;

      if (navigator.share) {
        await navigator.share({ title: "My RateLook Score", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
      }
    } catch {
      toast.error("Share failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs space-y-4"
      >
        {/* Share Card Visual */}
        <div
          ref={cardRef}
          className="rounded-2xl p-6 shadow-elevated space-y-4 relative overflow-hidden"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-display">
              RateLook Score
            </p>
            <div className="flex items-end gap-2 mt-2">
              <span className="font-display text-5xl font-bold text-gradient-gold">
                {result.overallScore}
              </span>
              <span className="text-lg text-muted-foreground mb-1">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Grooming", score: result.grooming, color: "text-primary" },
              { label: "Style", score: result.style, color: "text-info" },
              { label: "Posture", score: result.posture, color: "text-success" },
            ].map((cat) => (
              <div key={cat.label} className="text-center">
                <p className={`font-display text-xl font-bold ${cat.color}`}>{cat.score}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{cat.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground italic">"{result.summary}"</p>

          <div className="flex items-center gap-1 pt-2 border-t border-border">
            <span className="font-display text-xs font-bold">Rate</span>
            <span className="font-display text-xs font-bold text-gradient-gold">Look</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="glow" className="flex-1 font-display" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="glass" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareCard;

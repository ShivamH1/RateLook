import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Lightbulb, Share2 } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ScoreRing from "@/components/ScoreRing";
import StyleRecommendations, { type StyleRec } from "@/components/StyleRecommendations";
import ShareCard from "@/components/ShareCard";
import { Button } from "@/components/ui/button";

export interface AnalysisResult {
  overallScore: number;
  grooming: number;
  style: number;
  posture: number;
  improvements: string[];
  confidenceBoosters: string[];
  summary: string;
  styleRecommendations?: StyleRec[];
}

interface ResultsCardProps {
  result: AnalysisResult;
  photoUrl: string;
}

const ResultsCard = ({ result, photoUrl }: ResultsCardProps) => {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm mx-auto space-y-6"
      >
        {/* Hero Score */}
        <div className="relative rounded-2xl overflow-hidden shadow-elevated">
          <div className="absolute inset-0">
            <img src={photoUrl} alt="" className="w-full h-full object-cover opacity-30 blur-xl scale-110" />
            <div className="absolute inset-0 bg-background/80" />
          </div>
          <div className="relative p-8 flex flex-col items-center gap-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-display">
              Your Look Score
            </p>
            <ScoreRing score={result.overallScore} label="" size="lg" />
            <p className="text-sm text-muted-foreground text-center max-w-[260px]">
              {result.summary}
            </p>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setShowShare(true)}
              className="font-display"
            >
              <Share2 className="w-4 h-4" />
              Share Score
            </Button>
          </div>
        </div>

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card p-5 shadow-card space-y-4"
        >
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Breakdown
          </h3>
          <div className="flex justify-around">
            <ScoreRing score={result.grooming} label="Grooming" />
            <ScoreRing score={result.style} label="Style" />
            <ScoreRing score={result.posture} label="Posture" />
          </div>
        </motion.div>

        {/* Confidence Boosters */}
        {result.confidenceBoosters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl p-5 shadow-card space-y-3"
            style={{ background: "var(--gradient-card)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-primary">
                Your Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {result.confidenceBoosters.map((boost, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="text-sm text-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-0.5">✦</span>
                  {boost}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Style Recommendations */}
        <StyleRecommendations recommendations={result.styleRecommendations || []} />

        {/* Improvements */}
        {result.improvements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="rounded-2xl bg-card p-5 shadow-card space-y-3"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-info" />
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Top Improvements
              </h3>
            </div>
            <ol className="space-y-3">
              {result.improvements.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.15 }}
                  className="text-sm text-foreground flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {tip}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showShare && <ShareCard result={result} onClose={() => setShowShare(false)} />}
      </AnimatePresence>
    </>
  );
};

export default ResultsCard;

import { motion } from "framer-motion";
import { Shirt, Scissors, Watch, Palette } from "lucide-react";

export interface StyleRec {
  category: string;
  title: string;
  description: string;
}

interface StyleRecommendationsProps {
  recommendations: StyleRec[];
}

const iconMap: Record<string, React.ReactNode> = {
  outfit: <Shirt className="w-4 h-4" />,
  grooming: <Scissors className="w-4 h-4" />,
  accessories: <Watch className="w-4 h-4" />,
  color: <Palette className="w-4 h-4" />,
};

const StyleRecommendations = ({ recommendations }: StyleRecommendationsProps) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="rounded-2xl p-5 shadow-card space-y-3"
      style={{ background: "var(--gradient-card)" }}
    >
      <div className="flex items-center gap-2">
        <Shirt className="w-4 h-4 text-info" />
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-info">
          Style Recommendations
        </h3>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 + i * 0.15 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
              {iconMap[rec.category.toLowerCase()] || <Palette className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{rec.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StyleRecommendations;

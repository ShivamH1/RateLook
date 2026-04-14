import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import ScoreRing from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalysisRecord {
  id: string;
  overall_score: number;
  grooming: number;
  style: number;
  posture: number;
  summary: string;
  created_at: string;
}

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/analyses", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch analyses");
        const data = await response.json();
        setAnalyses(data || []);
      } catch (error) {
        toast.error("Failed to load history");
        console.error(error);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const deleteAnalysis = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/analyses/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to delete analysis");
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Analysis deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const chartData = analyses.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: a.overall_score,
    grooming: a.grooming,
    style: a.style,
    posture: a.posture,
  }));

  const latestScore = analyses.length > 0 ? analyses[analyses.length - 1].overall_score : 0;
  const previousScore = analyses.length > 1 ? analyses[analyses.length - 2].overall_score : latestScore;
  const scoreDiff = latestScore - previousScore;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-dark)" }}>
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-display font-bold text-lg">Your Progress</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 space-y-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4"
          >
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-display">No analyses yet</p>
            <Button variant="glow" onClick={() => navigate("/")}>
              Analyze Your First Photo
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 shadow-elevated flex items-center gap-6"
              style={{ background: "var(--gradient-card)" }}
            >
              <ScoreRing score={latestScore} label="Latest" size="lg" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total analyses</p>
                <p className="font-display text-2xl font-bold text-foreground">{analyses.length}</p>
                {analyses.length > 1 && (
                  <p className={`text-sm font-medium flex items-center gap-1 ${scoreDiff >= 0 ? "text-success" : "text-destructive"}`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    {scoreDiff >= 0 ? "+" : ""}{scoreDiff} since last
                  </p>
                )}
              </div>
            </motion.div>

            {/* Chart */}
            {chartData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-card p-5 shadow-card space-y-3"
              >
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Score Trend
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                    <Line type="monotone" dataKey="grooming" stroke="hsl(var(--success))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="style" stroke="hsl(var(--info))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* History List */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                All Analyses
              </h3>
              {[...analyses].reverse().map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card p-4 shadow-card flex items-center gap-4"
                >
                  <ScoreRing score={a.overall_score} label="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{a.summary}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAnalysis(a.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default History;

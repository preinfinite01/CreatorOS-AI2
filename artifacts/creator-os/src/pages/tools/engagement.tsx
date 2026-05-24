import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, TrendingUp, ThumbsUp, MessageSquare, Share2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Results {
  engagementRate: number;
  score: number;
  grade: string;
  gradeColor: string;
  insights: string[];
  benchmark: string;
}

export default function EngagementCalculator() {
  const [platform, setPlatform] = useState("youtube");
  const [followers, setFollowers] = useState("");
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [results, setResults] = useState<Results | null>(null);

  const BENCHMARKS: Record<string, { avg: number; good: number; viral: number }> = {
    youtube: { avg: 2.5, good: 5, viral: 10 },
    tiktok: { avg: 5, good: 12, viral: 25 },
    instagram: { avg: 3, good: 6, viral: 15 },
    twitter: { avg: 0.5, good: 2, viral: 5 },
    linkedin: { avg: 2, good: 5, viral: 10 },
  };

  const calculate = () => {
    const f = Number(followers) || 1;
    const v = Number(views) || 0;
    const l = Number(likes) || 0;
    const c = Number(comments) || 0;
    const s = Number(shares) || 0;

    const interactions = l + c * 2 + s * 3;
    const reach = Math.max(v, f);
    const engagementRate = (interactions / reach) * 100;

    const bench = BENCHMARKS[platform] ?? BENCHMARKS.youtube;
    let score = 0;
    let grade = "D";
    let gradeColor = "text-red-400";

    if (engagementRate >= bench.viral) { score = 95; grade = "S+"; gradeColor = "text-yellow-400"; }
    else if (engagementRate >= bench.good) { score = 80; grade = "A"; gradeColor = "text-green-400"; }
    else if (engagementRate >= bench.avg) { score = 65; grade = "B"; gradeColor = "text-blue-400"; }
    else if (engagementRate >= bench.avg / 2) { score = 45; grade = "C"; gradeColor = "text-orange-400"; }
    else { score = 25; grade = "D"; gradeColor = "text-red-400"; }

    const insights: string[] = [];
    const commentRatio = c / Math.max(l, 1);
    if (commentRatio < 0.02) insights.push("Low comment ratio — ask direct questions in your captions to boost comments.");
    if (commentRatio > 0.1) insights.push("Excellent comment ratio — your audience is highly engaged.");
    if (s > l * 0.05) insights.push("Strong share rate — your content is very share-worthy!");
    if (v > f * 2) insights.push("Your content is reaching beyond your followers — strong algorithmic push.");
    if (v < f * 0.1) insights.push("Low view-to-follower ratio — consider posting at peak times and using better hooks.");
    if (insights.length === 0) insights.push("Solid performance. Focus on encouraging more comments with CTAs in your content.");

    setResults({
      engagementRate,
      score,
      grade,
      gradeColor,
      insights,
      benchmark: `${platform} average: ${bench.avg}% · Good: ${bench.good}% · Viral: ${bench.viral}%`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          <h1 className="text-2xl font-black">Engagement Calculator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Measure and grade your content engagement rate with actionable insights.</p>
      </div>

      <Card className="p-5 border-white/8 card-premium space-y-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={platform} onValueChange={v => { setPlatform(v); setResults(null); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter / X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-muted-foreground" /> Followers</Label>
            <Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} placeholder="e.g. 10000" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-blue-400" /> Views / Reach</Label>
            <Input type="number" value={views} onChange={e => setViews(e.target.value)} placeholder="e.g. 5000" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><ThumbsUp className="w-3.5 h-3.5 text-green-400" /> Likes</Label>
            <Input type="number" value={likes} onChange={e => setLikes(e.target.value)} placeholder="e.g. 350" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Comments</Label>
            <Input type="number" value={comments} onChange={e => setComments(e.target.value)} placeholder="e.g. 45" />
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <Label className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-yellow-400" /> Shares / Saves</Label>
            <Input type="number" value={shares} onChange={e => setShares(e.target.value)} placeholder="e.g. 20" />
          </div>
        </div>
        <Button onClick={calculate} className="w-full gap-2 font-bold">
          <TrendingUp className="w-4 h-4" /> Calculate Engagement — Free
        </Button>
      </Card>

      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-white/8 card-premium space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-4xl font-black">{results.engagementRate.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{results.benchmark}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className={`text-5xl font-black ${results.gradeColor}`}>{results.grade}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Score: {results.score}/100</p>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 transition-all duration-700" style={{ width: `${results.score}%` }} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Insights</p>
                {results.insights.map((ins, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary/60 shrink-0 mt-0.5">→</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

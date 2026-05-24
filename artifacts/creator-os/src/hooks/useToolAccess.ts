import { useUserStore } from "@/store/userStore";

const STORAGE_KEY = "co_trials_used";

const PREMIUM_TOOLS = new Set([
  "script", "ideas", "workflow", "adcopy", "thumbnail",
  "image", "repurpose", "brand-voice", "blog", "rewriter",
  "trends", "tts", "video-gen"
]);

function getTrialsUsed(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveTrialsUsed(trials: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
}

export function useToolAccess(toolId: string) {
  const { plan } = useUserStore();

  const isPremium = PREMIUM_TOOLS.has(toolId);
  const trials = getTrialsUsed();
  const hasUsedTrial = !!trials[toolId];

  const isLocked = plan === "free" && isPremium && hasUsedTrial;
  const canUse = plan !== "free" || !isPremium || !hasUsedTrial;
  const showTrialBadge = plan === "free" && isPremium && !hasUsedTrial;

  function markTrialUsed() {
    if (plan === "free" && isPremium) {
      const updated = { ...getTrialsUsed(), [toolId]: true };
      saveTrialsUsed(updated);
    }
  }

  return { canUse, isLocked, showTrialBadge, hasUsedTrial, isPremium, markTrialUsed };
}

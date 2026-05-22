import { useAdStore } from "@/store/adStore";
import { useUserStore } from "@/store/userStore";

export function useAdTrigger() {
  const { recordGeneration, shouldShowPostGenAd } = useAdStore();
  const { plan } = useUserStore();

  const triggerPostGenAd = () => {
    recordGeneration();
    if (shouldShowPostGenAd(plan)) {
      useAdStore.setState({ pendingAd: true });
    }
  };

  return { triggerPostGenAd };
}

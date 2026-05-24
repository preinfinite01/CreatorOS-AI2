import { useUserStore } from "@/store/userStore";

interface WatermarkedImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function WatermarkedImage({ src, alt = "Generated image", className = "" }: WatermarkedImageProps) {
  const { plan } = useUserStore();
  const showWatermark = plan !== "pro";

  return (
    <div className={`relative inline-block ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover rounded-xl" />
      {showWatermark && (
        <div
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide select-none pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.55)",
            color: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          CreatorOS AI
        </div>
      )}
    </div>
  );
}

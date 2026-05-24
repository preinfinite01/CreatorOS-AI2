import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, QrCode, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QRCodeCreator() {
  const [url, setUrl] = useState("");
  const [fgColor, setFgColor] = useState("#a855f7");
  const [bgColor, setBgColor] = useState("#09090b");
  const [size, setSize] = useState(256);
  const [generated, setGenerated] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!url.trim()) { toast({ title: "URL or text required", variant: "destructive" }); return; }
    setGenerated(true);
    toast({ title: "QR Code created!" });
  };

  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "qrcode-creatoros.svg";
    link.click();
    toast({ title: "QR code downloaded!" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <QrCode className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-black">QR Code Creator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Generate custom-branded QR codes for links, profiles, and campaigns.</p>
      </div>

      <Card className="p-5 border-white/8 card-premium space-y-4">
        <div className="space-y-2">
          <Label>URL or Text</Label>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-link.com or any text" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>QR Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
              <Input value={fgColor} onChange={e => setFgColor(e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Background</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
              <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Size: {size}px</Label>
          <input type="range" min={128} max={512} step={32} value={size} onChange={e => setSize(Number(e.target.value))} className="w-full accent-primary" />
        </div>
        <Button onClick={handleGenerate} className="w-full gap-2 font-bold">
          <Zap className="w-4 h-4" /> Generate QR Code — Free
        </Button>
      </Card>

      <AnimatePresence>
        {generated && url && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-white/8 card-premium flex flex-col items-center gap-5">
              <div ref={qrRef} className="p-4 rounded-2xl" style={{ background: bgColor }}>
                <QRCodeSVG value={url} size={Math.min(size, 280)} fgColor={fgColor} bgColor={bgColor} level="H" includeMargin={false} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold truncate max-w-xs">{url}</p>
                <p className="text-xs text-muted-foreground mt-1">{size}px · SVG format</p>
              </div>
              <Button onClick={downloadSVG} variant="outline" className="gap-2 font-bold">
                <Download className="w-4 h-4" /> Download SVG
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Mic, MicOff, ShieldAlert } from "lucide-react";

import { useVoiceSOS } from "../../hooks/useVoiceSOS";

export function VoiceSOSIndicator() {
  const { detectedKeyword, enabled, error, status } = useVoiceSOS();

  const tone =
    status === "triggered"
      ? "bg-red-600 text-white shadow-red-950/50"
      : status === "listening"
      ? "bg-emerald-500 text-emerald-950 shadow-emerald-950/40"
      : "bg-slate-800 text-slate-300 shadow-slate-950/40";
  const label =
    status === "triggered"
      ? "SOS Triggered"
      : status === "listening"
      ? "Listening..."
      : enabled
      ? "Voice SOS idle"
      : "Voice SOS off";
  const title = error || (detectedKeyword ? `Detected: ${detectedKeyword}` : label);

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6">
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold shadow-2xl backdrop-blur-xl ${tone}`}
        title={title}
        aria-live="polite"
      >
        {status === "triggered" ? (
          <ShieldAlert size={18} />
        ) : enabled ? (
          <Mic className={status === "listening" ? "animate-pulse" : ""} size={18} />
        ) : (
          <MicOff size={18} />
        )}
        <span>{label}</span>
      </div>
    </div>
  );
}

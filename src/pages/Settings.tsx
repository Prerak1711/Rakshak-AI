import { BellRing, Smartphone, ShieldCheck, Mic, Slash } from "lucide-react";

import { AppButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { useVoiceSOS } from "../hooks/useVoiceSOS";

const Settings = () => {
  const { enabled, error, setEnabled } = useVoiceSOS();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Core safety preferences for alerts and live sharing."
      />

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-300">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Safety preferences</h2>
            <p className="text-sm text-slate-400">
              Control your app-wide emergency monitoring and voice listening settings.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatusIndicator
            label="Alerts"
            value={
              <span className="inline-flex items-center gap-2">
                <BellRing size={16} />
                Enabled
              </span>
            }
            tone="safe"
          />
          <StatusIndicator
            label="Live sharing"
            value={
              <span className="inline-flex items-center gap-2">
                <Smartphone size={16} />
                On
              </span>
            }
            tone="safe"
          />
        </div>
      </Card>

      <Card className="mt-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300">
            {enabled ? <Mic size={22} /> : <Slash size={22} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Voice SOS</h2>
            <p className="text-sm text-slate-400">
              Enable or disable background voice monitoring for emergency keywords across the app.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatusIndicator
            label="Voice SOS status"
            value={enabled ? "On" : "Off"}
            tone={enabled ? "safe" : "neutral"}
          />
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-slate-300">
              When enabled, Rakshak AI listens continuously after login and starts the existing SOS flow when an emergency keyword is detected.
            </p>
            <AppButton
              type="button"
              onClick={() => setEnabled(!enabled)}
            >
              {enabled ? "Disable Voice SOS" : "Enable Voice SOS"}
            </AppButton>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4 text-sm text-slate-400">
          <p className="font-semibold text-slate-100">Keyword triggers</p>
          <p className="mt-2">help, help me, emergency, save me, danger, police, ambulance, fire</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;

import { AlertTriangle, CheckCircle2, MapPinned, Radio, Siren } from "lucide-react";

import { AppButton, AppLinkButton } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { useSOSController } from "../hooks/useSOSFlow";

export default function SOS() {
  const { countdown, lastLocation, notifiedCount, resetCountdown, startSOS, state } =
    useSOSController();

  const buttonLabel =
    state === "sending"
      ? "Sending"
      : state === "countdown"
      ? String(countdown)
      : state === "active"
      ? "Active"
      : "SOS";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Emergency Mode"
        title="SOS"
        description="Start a timed SOS flow that saves the emergency, notifies contacts, and turns on live tracking."
        actions={
          state === "active" ? (
            <Badge variant="red">Emergency active</Badge>
          ) : (
            <Badge variant="amber">Hold steady after triggering</Badge>
          )
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="relative overflow-hidden p-6 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(239,68,68,0.22),transparent_45%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-300">
              {state === "active" ? <CheckCircle2 size={34} /> : <AlertTriangle size={34} />}
            </div>

            <button
              type="button"
              onClick={startSOS}
              disabled={state === "countdown" || state === "sending"}
              className="grid h-64 w-64 place-items-center rounded-full bg-red-600 text-white shadow-[0_0_90px_rgba(220,38,38,0.45)] transition-all duration-300 hover:scale-[1.02] hover:bg-red-500 disabled:hover:scale-100 sm:h-72 sm:w-72"
            >
              <span className="flex flex-col items-center gap-3">
                <Siren size={52} />
                <span className="text-5xl font-black tracking-normal">
                  {buttonLabel}
                </span>
              </span>
            </button>

            <div className="mt-8 min-h-16 max-w-xl">
              {state === "countdown" ? (
                <div>
                  <p className="text-xl font-bold text-white">
                    SOS sends in {countdown} second{countdown === 1 ? "" : "s"}
                  </p>
                  <AppButton
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={resetCountdown}
                  >
                    Cancel countdown
                  </AppButton>
                </div>
              ) : null}

              {state === "sending" ? (
                <p className="text-lg font-semibold text-red-100">
                  Getting location, saving SOS, and notifying contacts...
                </p>
              ) : null}

              {state === "active" ? (
                <p className="text-lg font-semibold text-emerald-200">
                  SOS sent successfully. Live emergency tracking is active.
                </p>
              ) : null}

              {state === "failed" ? (
                <p className="text-lg font-semibold text-red-200">
                  SOS could not complete. Check location permission and try again.
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <StatusIndicator
            label="Emergency state"
            value={state === "active" ? "Active" : state}
            tone={state === "active" ? "danger" : state === "failed" ? "warning" : "neutral"}
          />
          <StatusIndicator
            label="Contacts notified"
            value={notifiedCount ?? "Pending"}
            tone={notifiedCount !== null ? "safe" : "warning"}
          />
          <StatusIndicator
            label="Live tracking"
            value={lastLocation ? "Streaming" : "Not started"}
            tone={lastLocation ? "safe" : "neutral"}
          />

          <Card>
            <div className="flex items-start gap-3">
              <Radio className="mt-1 text-red-300" size={22} />
              <div>
                <h2 className="font-bold text-white">Emergency workflow</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This screen uses Firebase Authentication for the current user,
                  Firestore for SOS/live location writes, and your saved contacts
                  for notifications.
                </p>
              </div>
            </div>
          </Card>

          {lastLocation ? (
            <Card>
              <div className="flex items-start gap-3">
                <MapPinned className="mt-1 text-red-300" size={22} />
                <div className="min-w-0">
                  <h2 className="font-bold text-white">Last known location</h2>
                  <p className="mt-2 break-all text-sm text-slate-400">
                    {lastLocation.latitude.toFixed(6)},{" "}
                    {lastLocation.longitude.toFixed(6)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Accuracy {lastLocation.accuracy.toFixed(1)} m
                  </p>
                  <AppLinkButton to="/tracking" variant="secondary" className="mt-4">
                    Open tracking
                  </AppLinkButton>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}

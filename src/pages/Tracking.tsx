import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Clock,
  Compass,
  Copy,
  Crosshair,
  ExternalLink,
  MapPinned,
  Navigation,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";

import { AppButton } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { auth, db } from "../services/firebase";

type LiveLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  updatedAt?: { toDate?: () => Date };
};

function formatTimestamp(location: LiveLocation | null) {
  const date = location?.updatedAt?.toDate?.();
  if (!date) return "Waiting for update";

  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

function formatCoordinate(value: number | undefined) {
  return typeof value === "number" ? value.toFixed(6) : "Pending";
}

export default function Tracking() {
  const uid = auth.currentUser?.uid;
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [status, setStatus] = useState<"connecting" | "active" | "waiting">(
    "connecting"
  );

  useEffect(() => {
    if (!uid) return;

    return onSnapshot(doc(db, "live_locations", uid), (snapshot) => {
      if (snapshot.exists()) {
        setLocation(snapshot.data() as LiveLocation);
        setStatus("active");
      } else {
        setStatus("waiting");
      }
    });
  }, [uid]);

  const mapsUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : "";
  const navigationUrl = location
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    : "";
  const canShareLocation = typeof navigator.share === "function";

  const openExternalUrl = (url: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareLocation = async () => {
    if (!mapsUrl || !location) return;

    try {
      if (canShareLocation) {
        await navigator.share({
          title: "Live Location",
          text: "Current live location from Rakshak AI",
          url: mapsUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(mapsUrl);
      toast.success("Google Maps link copied");
    } catch (error) {
      console.error(error);
      toast.error("Unable to share location");
    }
  };

  if (!uid) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Card>Please login first.</Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Live Response"
        title="Tracking"
        description="Use the latest Firestore live location ping with Google Maps actions for response and sharing."
        actions={
          <Badge variant={status === "active" ? "green" : "amber"}>
            {status === "active" ? "Tracking active" : "Waiting for live location"}
          </Badge>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="grid gap-4">
          <StatusIndicator
            label="Tracking status"
            value={status === "active" ? "Active" : status}
            tone={status === "active" ? "safe" : "warning"}
          />
          <StatusIndicator
            label="GPS accuracy"
            value={location ? `${location.accuracy.toFixed(1)} m` : "Pending"}
            tone={location ? "safe" : "neutral"}
          />
          <StatusIndicator
            label="Last updated"
            value={formatTimestamp(location)}
            tone={location ? "safe" : "neutral"}
          />

          <Card>
            <div className="mb-4 flex items-center gap-3">
              <MapPinned className="text-red-300" size={22} />
              <h2 className="font-bold text-white">Live coordinates</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-slate-500">Latitude</p>
                <p className="mt-1 break-all font-semibold text-slate-100">
                  {formatCoordinate(location?.latitude)}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-slate-500">Longitude</p>
                <p className="mt-1 break-all font-semibold text-slate-100">
                  {formatCoordinate(location?.longitude)}
                </p>
              </div>
              {!location ? (
                <p className="text-sm leading-6 text-slate-400">
                  No live location document exists yet. Trigger SOS to start live
                  tracking.
                </p>
              ) : null}
            </div>
          </Card>
        </div>

        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-300">
                <Navigation size={20} />
              </div>
              <div>
                <h2 className="font-bold text-white">Google Maps integration</h2>
                <p className="text-sm text-slate-500">
                  {location ? "Ready with latest live ping" : "Waiting for coordinates"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock size={16} />
              <span>{formatTimestamp(location)}</span>
            </div>
          </div>

          <div className="grid gap-5 p-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start gap-3">
                <Crosshair className="mt-1 text-red-300" size={24} />
                <div className="min-w-0">
                  <h3 className="font-bold text-white">Latest Firestore location</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    This page listens for changes to your live location document
                    and uses the newest coordinates for every Google Maps action.
                  </p>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-slate-500">Latitude</p>
                      <p className="mt-1 break-all font-semibold text-slate-100">
                        {formatCoordinate(location?.latitude)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Longitude</p>
                      <p className="mt-1 break-all font-semibold text-slate-100">
                        {formatCoordinate(location?.longitude)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">GPS Accuracy</p>
                      <p className="mt-1 font-semibold text-slate-100">
                        {location ? `${location.accuracy.toFixed(1)} m` : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Tracking Status</p>
                      <p className="mt-1 font-semibold text-slate-100">
                        {status === "active" ? "Active" : status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <AppButton
                type="button"
                size="lg"
                className="min-h-14 w-full text-base"
                disabled={!location}
                onClick={() => openExternalUrl(mapsUrl)}
              >
                <ExternalLink size={20} />
                Open Live Location
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                size="lg"
                className="min-h-14 w-full text-base"
                disabled={!location}
                onClick={() => openExternalUrl(navigationUrl)}
              >
                <Compass size={20} />
                Start Navigation
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                size="lg"
                className="min-h-14 w-full text-base"
                disabled={!location}
                onClick={() => void shareLocation()}
              >
                {canShareLocation ? <Share2 size={20} /> : <Copy size={20} />}
                Share Location
              </AppButton>
            </div>
          </div>
        </Card>
      </section>

      {location ? (
        <Card className="mt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Crosshair className="mt-1 text-red-300" size={22} />
              <div>
                <h2 className="font-bold text-white">Tracking signal locked</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Live location updates will continue while the SOS watcher is
                  active in the browser session that triggered it.
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

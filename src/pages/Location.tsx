import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Crosshair, MapPinned } from "lucide-react";
import L from "leaflet";

import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusIndicator } from "../components/ui/StatusIndicator";

import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Location() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [error, setError] = useState(() =>
    typeof navigator !== "undefined" && !navigator.geolocation
      ? "Geolocation is not supported by this browser."
      : ""
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setError("");
      },
      (err) => {
        console.error(err);
        setError("Unable to fetch your location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="GPS"
        title="Live Location"
        description="View your current device location and GPS accuracy in real time."
      />

      {error ? <Card className="mb-6 text-red-200">{error}</Card> : null}

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="grid gap-4">
          <StatusIndicator
            label="GPS status"
            value={position ? "Live" : "Requesting permission"}
            tone={position ? "safe" : "warning"}
          />
          <StatusIndicator
            label="Accuracy"
            value={position ? `${accuracy.toFixed(1)} m` : "Pending"}
            tone={position ? "safe" : "neutral"}
          />
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <Crosshair className="text-red-300" size={22} />
              <h2 className="font-bold text-white">Coordinates</h2>
            </div>
            {position ? (
              <div className="space-y-3 text-sm text-slate-300">
                <p>Latitude: {position[0].toFixed(6)}</p>
                <p>Longitude: {position[1].toFixed(6)}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Getting your location...</p>
            )}
          </Card>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-300">
              <MapPinned size={20} />
            </div>
            <h2 className="font-bold text-white">Current map</h2>
          </div>
          <div className="h-[420px] md:h-[560px]">
            {position ? (
              <MapContainer center={position} zoom={16} className="h-full w-full">
                <TileLayer
                  attribution="OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={markerIcon}>
                  <Popup>You are here.</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="grid h-full place-items-center text-slate-400">
                Waiting for GPS permission...
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

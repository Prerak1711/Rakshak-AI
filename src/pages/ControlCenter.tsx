import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, MapPinned } from "lucide-react";

import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { db } from "../services/firebase";

interface Emergency {
  id: string;
  uid: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt?: { toDate?: () => Date };
}

function formatTime(item: Emergency) {
  const date = item.createdAt?.toDate?.();
  if (!date) return "Live";

  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

export default function ControlCenter() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  useEffect(() => {
    const q = query(collection(db, "sos"), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<Emergency, "id">),
      }));

      setEmergencies(data);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Response Ops"
        title="Emergency Control Center"
        description="Review SOS events stored in Firestore and jump into live tracking."
        actions={<Badge variant={emergencies.length ? "red" : "green"}>{emergencies.length} alerts</Badge>}
      />

      {emergencies.length === 0 ? (
        <Card>No active emergencies.</Card>
      ) : (
        <div className="grid gap-5">
          {emergencies.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white">User ID</h2>
                  <p className="mt-1 break-all text-sm text-slate-500">{item.uid}</p>
                </div>
                <Badge variant="red">{item.status}</Badge>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-500">Latitude</p>
                  <strong className="mt-1 block text-white">{item.latitude.toFixed(6)}</strong>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-500">Longitude</p>
                  <strong className="mt-1 block text-white">{item.longitude.toFixed(6)}</strong>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} />
                    Created
                  </p>
                  <strong className="mt-1 block text-white">{formatTime(item)}</strong>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/tracking"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  <MapPinned size={18} />
                  Track
                </Link>
                <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-semibold text-red-200">
                  <AlertTriangle size={18} />
                  Emergency active
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

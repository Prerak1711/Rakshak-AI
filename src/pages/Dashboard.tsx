import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  Mail,
  MapPinned,
  PhoneCall,
  Route,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../components/ui/Badge";
import { Card, InteractiveCard } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { auth, db } from "../services/firebase";
import { getContacts, type Contact } from "../services/contacts";

type LiveLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  updatedAt?: { toDate?: () => Date };
};

const actions = [
  {
    to: "/location",
    icon: MapPinned,
    title: "Live Location",
    description: "Share and verify your current position.",
  },
  {
    to: "/contacts",
    icon: PhoneCall,
    title: "Contacts",
    description: "Manage trusted emergency responders.",
  },
  {
    to: "/safe-route",
    icon: Route,
    title: "Safe Route",
    description: "Find safer routes for movement.",
  },
  {
    to: "/emergency-message",
    icon: Mail,
    title: "Emergency Message",
    description: "Notify contacts with SMS and Gmail plus your live location.",
  },
  {
    to: "/control-center",
    icon: ShieldAlert,
    title: "Control Center",
    description: "Review active alerts and tracking.",
  },
];

function formatUpdatedAt(location: LiveLocation | null) {
  const date = location?.updatedAt?.toDate?.();
  if (!date) return "No live ping yet";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const uid = auth.currentUser?.uid;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [contactsLoading, setContactsLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    getContacts(uid)
      .then((data) => {
        if (active) setContacts(data);
      })
      .finally(() => {
        if (active) setContactsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    return onSnapshot(doc(db, "live_locations", uid), (snapshot) => {
      setLiveLocation(snapshot.exists() ? (snapshot.data() as LiveLocation) : null);
    });
  }, [uid]);

  const recentActivity = useMemo(
    () => [
      {
        title: liveLocation ? "Live GPS signal received" : "GPS standing by",
        detail: formatUpdatedAt(liveLocation),
      },
      {
        title: contacts.length
          ? `${contacts.length} emergency contact${contacts.length === 1 ? "" : "s"} ready`
          : "No emergency contacts added",
        detail: contactsLoading ? "Checking Firestore" : "Contacts synced",
      },
      {
        title: "AI monitoring online",
        detail: "Distress signals and SOS workflows armed",
      },
    ],
    [contacts.length, contactsLoading, liveLocation]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Safety Command"
        title="Dashboard"
        description="Your central hub for emergency actions, monitoring state, live tracking, and trusted contact readiness."
        actions={<Badge variant="green">Monitoring active</Badge>}
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(220,38,38,0.20),transparent_42%)]" />
          <div className="relative flex flex-col items-center text-center">
            <Badge variant="red">Emergency priority</Badge>
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="my-8"
            >
              <Link
                to="/sos"
                className="group relative grid h-64 w-64 place-items-center rounded-full bg-red-600 text-white shadow-[0_0_80px_rgba(220,38,38,0.45)] transition hover:bg-red-500 sm:h-72 sm:w-72"
                aria-label="Open SOS emergency screen"
              >
                <span className="absolute inset-5 rounded-full border border-white/20" />
                <span className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl transition group-hover:bg-red-400/30" />
                <span className="relative flex flex-col items-center gap-3">
                  <Siren size={54} />
                  <span className="text-5xl font-black tracking-normal">SOS</span>
                </span>
              </Link>
            </motion.div>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              Tap to start the emergency countdown, notify contacts, save SOS to
              Firestore, and begin live location updates.
            </p>
          </div>
        </Card>

        <div className="grid gap-4">
          <StatusIndicator label="Safety status" value="Safe" tone="safe" />
          <StatusIndicator
            label="GPS status"
            value={liveLocation ? `Live at ${formatUpdatedAt(liveLocation)}` : "Waiting for first ping"}
            tone={liveLocation ? "safe" : "warning"}
          />
          <StatusIndicator label="AI monitoring" value="Active" tone="safe" />
          <StatusIndicator
            label="Emergency contacts"
            value={contactsLoading ? "Loading..." : contacts.length}
            tone={contacts.length ? "safe" : "warning"}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {actions.map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to}>
              <InteractiveCard className="h-full">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-300">
                  <Icon size={24} />
                </div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </InteractiveCard>
            </Link>
          ))}
          <Card>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300">
              <Brain size={24} />
            </div>
            <h2 className="text-lg font-bold text-white">AI Safety Layer</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Monitoring workflows are online for SOS and route safety signals.
            </p>
          </Card>
        </div>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">
                Activity
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">Recent timeline</h2>
            </div>
            <Activity className="text-red-300" size={22} />
          </div>

          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={item.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-200">
                    {index + 1}
                  </span>
                  {index < recentActivity.length - 1 ? (
                    <span className="h-full w-px bg-white/10" />
                  ) : null}
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

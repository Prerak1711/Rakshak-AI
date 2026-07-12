import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { AppButton } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useSOSController } from "../hooks/useSOSFlow";
import { auth } from "../services/firebase";
import { getContacts, type Contact } from "../services/contacts";

const EmergencyMessage = () => {
  const { lastLocation, state } = useSOSController();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    let active = true;

    getContacts(auth.currentUser.uid)
      .then((data) => {
        if (active) setContacts(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const locationUrl = lastLocation
    ? `https://www.google.com/maps/search/?api=1&query=${lastLocation.latitude},${lastLocation.longitude}`
    : "Location not available";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Emergency Messaging"
        title="Send SOS message and location"
        description="When SOS is triggered, Rakshak AI can send your live location to trusted contacts through their phone and email."
        actions={
          state === "active" ? (
            <Badge variant="red">Emergency active</Badge>
          ) : (
            <Badge variant="amber">Prepare contacts</Badge>
          )
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="space-y-6 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-300">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Emergency alerts</h2>
              <p className="text-sm text-slate-400">
                This page displays the contacts who will receive your SOS message, email, and live location when the emergency flow runs.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Location URL</p>
              <p className="mt-2 break-all text-white">{locationUrl}</p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Live tracking status</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {lastLocation ? "Live location available" : "Live location not ready"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">SOS notification state</p>
                <p className="mt-2 text-lg font-semibold text-white">{state}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <p className="font-semibold">Note</p>
              <p className="mt-2">
                When SOS is triggered, Rakshak AI will queue messages in Firestore for both SMS and email notifications to your saved emergency contacts. The contact phone number is used for SMS, and email is used for Gmail delivery.
              </p>
            </div>

            <AppButton type="button" variant="secondary" disabled>
              <MessageCircle size={18} />
              Auto-send only during active SOS flow
            </AppButton>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-300">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Emergency contacts</h2>
                <p className="text-sm text-slate-400">These contacts receive the alert when SOS triggers.</p>
              </div>
            </div>
          </Card>

          {loading ? (
            <Card>Loading contacts...</Card>
          ) : contacts.length === 0 ? (
            <Card className="text-center text-slate-400">
              Add emergency contacts first in the Contacts page.
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id ?? contact.phone} className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{contact.relationship}</p>
                      <p className="text-lg font-semibold text-white">{contact.name}</p>
                    </div>
                    <Badge variant="green">Ready</Badge>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-400">
                    <p>Phone: {contact.phone}</p>
                    {contact.email ? <p>Email: {contact.email}</p> : null}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default EmergencyMessage;

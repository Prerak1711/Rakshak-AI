import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Phone, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { AppButton } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { auth } from "../services/firebase";
import {
  addContact,
  deleteContact,
  getContacts,
  type Contact,
} from "../services/contacts";

type FormErrors = {
  name?: string;
  phone?: string;
  email?: string;
  relationship?: string;
};

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-500/20";

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const uid = auth.currentUser?.uid;

  const loadContacts = useCallback(async (showLoading = true) => {
    if (!uid) return;

    if (showLoading) setLoading(true);
    try {
      const data = await getContacts(uid);
      setContacts(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load contacts");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    getContacts(uid)
      .then((data) => {
        if (active) setContacts(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Unable to load contacts");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [uid]);

  const remainingSlots = useMemo(() => Math.max(0, 5 - contacts.length), [contacts.length]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!/^[6-9]\d{9}$/.test(phone)) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!relationship.trim()) {
      nextErrors.relationship = "Relationship is required.";
    }
    if (contacts.length >= 5) {
      nextErrors.relationship = "Maximum 5 emergency contacts allowed.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uid) {
      toast.error("Please login first");
      return;
    }

    if (!validate()) return;

    setSaving(true);
    try {
      await addContact({
        uid,
        name: name.trim(),
        phone,
        email: email.trim() || undefined,
        relationship: relationship.trim(),
      });

      setName("");
      setPhone("");
      setRelationship("");
      setErrors({});
      toast.success("Emergency contact added");
      await loadContacts(false);
    } catch (error) {
      console.error(error);
      toast.error("Unable to add contact");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    try {
      await deleteContact(id);
      toast.success("Contact removed");
      await loadContacts(false);
    } catch (error) {
      console.error(error);
      toast.error("Unable to remove contact");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Trusted Network"
        title="Emergency Contacts"
        description="Add up to five trusted people who can be notified during an SOS emergency."
        actions={
          <Badge variant={contacts.length ? "green" : "amber"}>
            {contacts.length}/5 contacts
          </Badge>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-300">
              <Plus size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add contact</h2>
              <p className="text-sm text-slate-500">
                {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} remaining
              </p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Full name
              </span>
              <input
                className={inputClass}
                placeholder="Asha Sharma"
                value={name}
                onChange={(event) =>
                  setName(event.target.value.replace(/[^a-zA-Z ]/g, ""))
                }
              />
              {errors.name ? (
                <span className="mt-2 block text-sm text-red-300">{errors.name}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Phone number
              </span>
              <input
                className={inputClass}
                placeholder="9876543210"
                value={phone}
                inputMode="numeric"
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
              />
              {errors.phone ? (
                <span className="mt-2 block text-sm text-red-300">{errors.phone}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Email address for inbox alerts (optional)
              </span>
              <input
                className={inputClass}
                placeholder="example@gmail.com"
                value={email}
                type="email"
                onChange={(event) => setEmail(event.target.value)}
              />
              {errors.email ? (
                <span className="mt-2 block text-sm text-red-300">{errors.email}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Relationship
              </span>
              <input
                className={inputClass}
                placeholder="Father, friend, neighbour"
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
              />
              {errors.relationship ? (
                <span className="mt-2 block text-sm text-red-300">
                  {errors.relationship}
                </span>
              ) : null}
            </label>

            <AppButton type="submit" className="w-full" disabled={saving || contacts.length >= 5}>
              <Plus size={18} />
              {saving ? "Adding..." : "Add emergency contact"}
            </AppButton>
          </form>
        </Card>

        <div className="grid gap-4">
          {loading ? (
            <Card>Loading contacts...</Card>
          ) : contacts.length === 0 ? (
            <Card className="flex min-h-56 items-center justify-center text-center">
              <div>
                <ShieldCheck className="mx-auto mb-4 text-red-300" size={42} />
                <h2 className="text-xl font-bold text-white">No contacts yet</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Add your first trusted contact to make SOS notifications useful.
                </p>
              </div>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id ?? contact.phone} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-300">
                      <UserRound size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">{contact.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={14} />
                          {contact.phone}
                        </span>
                        {contact.email ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail size={14} />
                            {contact.email}
                          </span>
                        ) : null}
                        <Badge variant="slate">{contact.relationship}</Badge>
                      </div>
                    </div>
                  </div>

                  <AppButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-300 hover:text-red-100"
                    onClick={() => void handleDelete(contact.id)}
                    aria-label={`Delete ${contact.name}`}
                  >
                    <Trash2 size={18} />
                    Remove
                  </AppButton>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

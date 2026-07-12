import { Phone, UserRound } from "lucide-react";
import type { Contact } from "../../types";

const ContactCard = ({ contact }: { contact: Contact }) => {
  return (
    <article className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/20">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-300">
        <UserRound size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-white">{contact.name}</h3>
        <p className="text-sm text-slate-400">{contact.relationship}</p>
      </div>
      <a
        href={`tel:${contact.phone}`}
        className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 text-white transition hover:bg-red-500"
        aria-label={`Call ${contact.name}`}
      >
        <Phone size={16} />
      </a>
    </article>
  );
};

export default ContactCard;

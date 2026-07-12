import { ShieldAlert, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 font-bold text-white transition-colors hover:text-red-200"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 shadow-lg shadow-red-950/40">
            <ShieldAlert size={20} />
          </span>
          <span>Rakshak AI</span>
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-red-500/60 hover:bg-white/[0.08]"
        >
          <UserCircle2 size={18} />
          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

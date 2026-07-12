import { Compass, Home, PhoneCall, Settings, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/location", label: "Location", icon: Compass },
  { to: "/sos", label: "SOS", icon: Shield },
  { to: "/contacts", label: "Contacts", icon: PhoneCall },
  { to: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 px-2 py-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-950/40"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

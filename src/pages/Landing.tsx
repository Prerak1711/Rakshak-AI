import { Shield, MapPinned, Mic, ArrowRight, PhoneCall, Brain } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Emergency SOS",
    description: "One-tap SOS that instantly alerts your trusted contacts."
  },
  {
    icon: MapPinned,
    title: "Live Location",
    description: "Share your real-time location during emergencies."
  },
  {
    icon: Mic,
    title: "Voice SOS",
    description: "Trigger an SOS simply by speaking emergency keywords."
  },
  {
    icon: Brain,
    title: "AI Detection",
    description: "AI helps detect distress and initiates emergency actions."
  },
  {
    icon: PhoneCall,
    title: "Emergency Contacts",
    description: "Reach your trusted contacts with one tap."
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center">

          <span className="inline-block px-4 py-2 rounded-full bg-red-600/20 border border-red-500 text-red-400">
            🚨 AI Powered Safety Platform
          </span>

          <h1 className="mt-8 text-6xl font-bold leading-tight">
            Your Safety,
            <br />
            Powered by AI
          </h1>

          <p className="mt-6 text-slate-300 max-w-2xl mx-auto text-lg">
            Rakshak AI protects women and senior citizens with
            AI-powered distress detection, voice-triggered SOS,
            live location sharing and safe route recommendations.
          </p>

          <div className="flex justify-center gap-4 mt-10">

            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              Get Started
              <ArrowRight size={18}/>
            </Link>

            <Link
              to="/login"
              className="border border-slate-700 px-6 py-3 rounded-xl hover:bg-slate-800 transition"
            >
              Login
            </Link>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="max-w-7xl mx-auto px-6 pb-24">

        <h2 className="text-4xl font-bold text-center mb-12">
          Everything you need to stay safe
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {features.map((feature) => {

            const Icon = feature.icon;

            return (

              <div
                key={feature.title}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-red-500 transition"
              >

                <Icon className="text-red-500 mb-5" size={40} />

                <h3 className="text-2xl font-semibold mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-400">
                  {feature.description}
                </p>

              </div>

            );

          })}

        </div>

      </section>

    </div>
  );
}
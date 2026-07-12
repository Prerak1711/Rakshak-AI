import { Route, ShieldCheck } from "lucide-react";

import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

const SafeRoute = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Route Safety"
        title="Safe route planner"
        description="Plan safer movement with trusted landmarks and nearby shelter points."
        actions={<Badge variant="green">Recommended</Badge>}
      />

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-300">
              <Route size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Suggested route</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                High-confidence route guidance is ready for your next trip.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
            <ShieldCheck size={16} />
            High safety score
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SafeRoute;

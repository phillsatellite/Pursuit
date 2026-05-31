// each pipeline status gets its own translucent chip — the inset ring adds a
// subtle outline that reads cleanly on the dark cards without shouting.
const STATUS_STYLES = {
  Applied: "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-500/30",
  Contacted: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30",
  Interview: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  Offer: "bg-green-500/15 text-green-300 ring-1 ring-inset ring-green-500/30",
  Rejected: "bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-500/30",
  Withdrawn: "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/30",
};

export default function StatusBadge({ status }) {
  // fall back to neutral slate for anything unrecognized, so we never render
  // an unstyled badge if a new status lands server-side before this list does.
  const cls =
    STATUS_STYLES[status] ||
    "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/30";
  return <span className={`badge ${cls}`}>{status}</span>;
}

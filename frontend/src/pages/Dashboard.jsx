import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { stats as statsApi } from "../api";
import StatusBadge from "../components/StatusBadge";

function StatCard({ label, value, hint }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-3xl font-semibold text-slate-100 mt-1">{value}</p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// tiny formatters so null/empty dates render as a dash instead of "Invalid Date"
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // one call returns every panel's data — see backend/routes/stats.py
    statsApi.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-3 py-2">
        {error}
      </div>
    );
  }
  if (!data) {
    return <div className="text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
        <Link to="/applications/new" className="btn-primary">
          + New application
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total applications" value={data.total_applications} />
        {/* "in flight" = still live in the pipeline, i.e. not yet Offer/Rejected/Withdrawn */}
        <StatCard
          label="In flight"
          value={
            data.by_status.Applied + data.by_status.Contacted + data.by_status.Interview
          }
          hint="Applied / Contacted / Interview"
        />
        <StatCard
          label="Avg. days to response"
          value={data.avg_days_to_response ?? "—"}
        />
        <StatCard
          label="Companies / Contacts"
          value={`${data.company_count} / ${data.contact_count}`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-medium mb-3">Pipeline</h2>
          <div className="space-y-2">
            {Object.entries(data.by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm text-slate-300">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-medium mb-3">Upcoming interviews</h2>
          {data.upcoming_interviews.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing scheduled in the next 14 days.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcoming_interviews.map((i) => (
                <li key={i.id} className="text-sm">
                  <Link
                    to={`/applications/${i.application.id}`}
                    className="text-accent hover:underline font-medium"
                  >
                    {i.application.role_title}
                  </Link>{" "}
                  <span className="text-slate-400">at {i.application.company?.name}</span>
                  <div className="text-xs text-slate-400">
                    {i.round_type} · {formatDateTime(i.scheduled_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-medium mb-3">Recent applications</h2>
        {data.recent_applications.length === 0 ? (
          <p className="text-sm text-slate-400">
            No applications yet.{" "}
            <Link to="/applications/new" className="text-accent hover:underline">
              Add your first one
            </Link>
            .
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Company</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Applied</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_applications.map((a) => (
                <tr key={a.id} className="border-t border-slate-700">
                  <td className="py-2">
                    <Link
                      to={`/applications/${a.id}`}
                      className="text-accent hover:underline"
                    >
                      {a.role_title}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-300">{a.company?.name}</td>
                  <td className="py-2"><StatusBadge status={a.status} /></td>
                  <td className="py-2 text-slate-300">{formatDate(a.applied_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applications as appsApi, APPLICATION_STATUSES } from "../api";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import { formatDate } from "../utils/dates";

export default function ApplicationsList() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  // separate "applied search" from input so we don't refetch on every keystroke
  const [appliedSearch, setAppliedSearch] = useState("");

  // refetch whenever the page, status filter, or *submitted* search changes.
  // note it's appliedSearch (not search) in the deps, so typing doesn't refetch.
  useEffect(() => {
    appsApi
      .list({ page, per_page: 10, status, q: appliedSearch })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [page, status, appliedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Applications</h1>
        <Link to="/applications/new" className="btn-primary">
          + New application
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <form
            className="flex-1 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              // jump back to page 1 — the old page number may not exist for the new results
              setPage(1);
              setAppliedSearch(search);
            }}
          >
            <input
              type="text"
              className="input"
              placeholder="Search role title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-secondary">Search</button>
          </form>
          <select
            className="input sm:w-48"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        {!data ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : data.items.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No applications match.{" "}
            <Link to="/applications/new" className="text-accent hover:underline">
              Create one
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
                <th className="pb-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((a) => (
                <tr key={a.id} className="border-t border-slate-700">
                  <td className="py-2">
                    <Link
                      to={`/applications/${a.id}`}
                      className="text-accent hover:underline font-medium"
                    >
                      {a.role_title}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-300">{a.company?.name}</td>
                  <td className="py-2"><StatusBadge status={a.status} /></td>
                  <td className="py-2 text-slate-300">{formatDate(a.applied_date)}</td>
                  <td className="py-2 text-slate-300">{a.source || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && (
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            hasNext={data.has_next}
            hasPrev={data.has_prev}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { companies as companiesApi } from "../api";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";

const EMPTY = {
  name: "",
  industry: "",
  size: "",
  website: "",
  location: "",
  notes: "",
};

export default function CompaniesList() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    companiesApi
      .list({ page, per_page: 10, q: appliedSearch })
      .then(setData)
      .catch((e) => setError(e.message));
  }
  useEffect(load, [page, appliedSearch]);

  // add and edit share the same modal: `editing` holds the row when editing,
  // null when creating — that's what save() checks to pick the API call.
  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }
  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      industry: c.industry || "",
      size: c.size || "",
      website: c.website || "",
      location: c.location || "",
      notes: c.notes || "",
    });
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await companiesApi.update(editing.id, form);
      } else {
        await companiesApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(c) {
    // company delete cascades to its applications + contacts, so spell that out
    if (
      !confirm(
        `Delete ${c.name}? This will also delete its applications and contacts.`
      )
    )
      return;
    try {
      await companiesApi.remove(c.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Companies</h1>
        <button type="button" className="btn-primary" onClick={openNew}>
          + New company
        </button>
      </div>

      <div className="card">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setAppliedSearch(search);
          }}
        >
          <input
            type="text"
            className="input"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
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
          <p className="text-slate-400 text-sm">No companies yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Industry</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Applications</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} className="border-t border-slate-700">
                  <td className="py-2 font-medium">
                    {c.website ? (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="py-2 text-slate-300">{c.industry || "—"}</td>
                  <td className="py-2 text-slate-300">{c.location || "—"}</td>
                  <td className="py-2 text-slate-300">
                    {c.application_count} apps · {c.contact_count} contacts
                  </td>
                  <td className="py-2 text-right space-x-3">
                    <button
                      type="button"
                      className="text-sm text-slate-300 hover:text-accent"
                      onClick={() => openEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-sm text-red-400 hover:text-red-300"
                      onClick={() => remove(c)}
                    >
                      Delete
                    </button>
                  </td>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit company" : "New company"}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              form="company-form"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <form id="company-form" onSubmit={save} className="space-y-3">
          <div>
            <label className="label" htmlFor="c_name">Name *</label>
            <input
              id="c_name"
              required
              className="input"
              value={form.name}
              onChange={update("name")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="c_industry">Industry</label>
              <input
                id="c_industry"
                className="input"
                value={form.industry}
                onChange={update("industry")}
              />
            </div>
            <div>
              <label className="label" htmlFor="c_size">Size</label>
              <input
                id="c_size"
                className="input"
                placeholder="11–50, Startup, etc."
                value={form.size}
                onChange={update("size")}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="c_website">Website</label>
            <input
              id="c_website"
              type="url"
              className="input"
              placeholder="https://…"
              value={form.website}
              onChange={update("website")}
            />
          </div>
          <div>
            <label className="label" htmlFor="c_location">Location</label>
            <input
              id="c_location"
              className="input"
              value={form.location}
              onChange={update("location")}
            />
          </div>
          <div>
            <label className="label" htmlFor="c_notes">Notes</label>
            <textarea
              id="c_notes"
              rows={3}
              className="input"
              value={form.notes}
              onChange={update("notes")}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

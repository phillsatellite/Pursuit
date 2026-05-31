import { useEffect, useState } from "react";
import { contacts as contactsApi, companies as companiesApi } from "../api";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";

const EMPTY = {
  name: "",
  role: "",
  email: "",
  company_id: "",
  last_contacted: "",
  notes: "",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export default function ContactsList() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [allCompanies, setAllCompanies] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    contactsApi
      .list({
        page,
        per_page: 10,
        q: appliedSearch,
        company_id: companyFilter || undefined,
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }
  useEffect(load, [page, appliedSearch, companyFilter]);

  // load every company once for the filter dropdown + the form's company select.
  // per_page:100 covers it at this scale (a typeahead would be the real fix later).
  useEffect(() => {
    companiesApi.list({ per_page: 100 }).then((res) => setAllCompanies(res.items));
  }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }
  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      role: c.role || "",
      email: c.email || "",
      company_id: c.company_id || "",
      last_contacted: c.last_contacted || "",
      notes: c.notes || "",
    });
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      ...form,
      // <select> values are strings; the API wants an int id (or null for "None")
      company_id: form.company_id ? Number(form.company_id) : null,
      last_contacted: form.last_contacted || null,
    };
    try {
      if (editing) {
        await contactsApi.update(editing.id, payload);
      } else {
        await contactsApi.create(payload);
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
    if (!confirm(`Delete contact ${c.name}?`)) return;
    try {
      await contactsApi.remove(c.id);
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
        <h1 className="text-2xl font-semibold text-slate-100">Contacts</h1>
        <button type="button" className="btn-primary" onClick={openNew}>
          + New contact
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <form
            className="flex-1 flex gap-2"
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
          <select
            className="input sm:w-56"
            value={companyFilter}
            onChange={(e) => {
              setCompanyFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All companies</option>
            {allCompanies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
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
          <p className="text-slate-400 text-sm">No contacts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Company</th>
                <th className="pb-2 font-medium">Last contacted</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} className="border-t border-slate-700">
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2 text-slate-300">{c.role || "—"}</td>
                  <td className="py-2 text-slate-300">
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="hover:underline">
                        {c.email}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="py-2 text-slate-300">{c.company?.name || "—"}</td>
                  <td className="py-2 text-slate-300">{formatDate(c.last_contacted)}</td>
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
        title={editing ? "Edit contact" : "New contact"}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              form="contact-form"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <form id="contact-form" onSubmit={save} className="space-y-3">
          <div>
            <label className="label" htmlFor="ct_name">Name *</label>
            <input
              id="ct_name"
              required
              className="input"
              value={form.name}
              onChange={update("name")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="ct_role">Role</label>
              <input
                id="ct_role"
                className="input"
                placeholder="Recruiter, Hiring Manager…"
                value={form.role}
                onChange={update("role")}
              />
            </div>
            <div>
              <label className="label" htmlFor="ct_email">Email</label>
              <input
                id="ct_email"
                type="email"
                className="input"
                value={form.email}
                onChange={update("email")}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="ct_company">Company</label>
            <select
              id="ct_company"
              className="input"
              value={form.company_id}
              onChange={update("company_id")}
            >
              <option value="">— None —</option>
              {allCompanies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ct_last">Last contacted</label>
            <input
              id="ct_last"
              type="date"
              className="input"
              value={form.last_contacted}
              onChange={update("last_contacted")}
            />
          </div>
          <div>
            <label className="label" htmlFor="ct_notes">Notes</label>
            <textarea
              id="ct_notes"
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

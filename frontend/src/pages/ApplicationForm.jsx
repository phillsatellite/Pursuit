import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  applications as appsApi,
  companies as companiesApi,
  ai as aiApi,
  APPLICATION_STATUSES,
} from "../api";
import { toLocalInputDate, toLocalInputDateTime } from "../utils/dates";

const EMPTY = {
  role_title: "",
  company_name: "",
  status: "Applied",
  applied_date: new Date().toISOString().slice(0, 10),
  source: "",
  salary_range: "",
  jd_text: "",
  notes: "",
  first_response_at: "",
};

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    // fetch a large page of companies so the dropdown has them all. for a real
    // multi-thousand-company app we'd swap this for a typeahead, but at this
    // scale a flat select is fine.
    companiesApi.list({ per_page: 100 }).then((res) => setCompanies(res.items));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    appsApi
      .get(id)
      .then((a) => {
        setForm({
          role_title: a.role_title,
          company_name: a.company?.name || "",
          status: a.status,
          applied_date: toLocalInputDate(a.applied_date),
          source: a.source || "",
          salary_range: a.salary_range || "",
          jd_text: a.jd_text || "",
          notes: a.notes || "",
          first_response_at: toLocalInputDateTime(a.first_response_at),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function autofillFromDescription() {
    const text = form.jd_text.trim();
    if (!text) {
      setError("Paste a job description first.");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const { fields } = await aiApi.parseJob(text);
      // only overwrite a field when the model actually found something, so we
      // never blank out values the user already typed.
      setForm((f) => ({
        ...f,
        role_title: fields.role_title || f.role_title,
        company_name: fields.company_name || f.company_name,
        salary_range: fields.salary_range || f.salary_range,
        source: fields.source || f.source,
        notes: fields.notes || f.notes,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const companyName = form.company_name.trim();
    if (!companyName) {
      setError("Company is required");
      setSubmitting(false);
      return;
    }

    try {
      // resolve the typed name to a company: reuse an existing one (case-insensitive
      // match against the loaded list) or create it on the fly, so the user never has
      // to pre-register a company before logging an application.
      const existing = companies.find(
        (c) => c.name.toLowerCase() === companyName.toLowerCase()
      );
      const company = existing || (await companiesApi.create({ name: companyName }));

      const payload = {
        ...form,
        company_id: company.id,
        // empty datetime-local should clear the field, not send "" which the API rejects
        first_response_at: form.first_response_at || null,
      };
      delete payload.company_name;

      const saved = isEdit
        ? await appsApi.update(id, payload)
        : await appsApi.create(payload);
      navigate(`/applications/${saved.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">
          {isEdit ? "Edit application" : "New application"}
        </h1>
        <Link to="/applications" className="btn-secondary">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="role_title">Role title *</label>
          <input
            id="role_title"
            required
            className="input"
            value={form.role_title}
            onChange={update("role_title")}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="company_name">Company *</label>
            <input
              id="company_name"
              list="company-options"
              required
              className="input"
              placeholder="Type a company name…"
              autoComplete="off"
              value={form.company_name}
              onChange={update("company_name")}
            />
            <datalist id="company-options">
              {companies.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            <p className="text-xs text-slate-400 mt-1">
              Type to pick an existing company or enter a new one — it's created automatically.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="status">Status *</label>
            <select id="status" className="input" value={form.status} onChange={update("status")}>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="applied_date">Applied date</label>
            <input
              id="applied_date"
              type="date"
              className="input"
              value={form.applied_date}
              onChange={update("applied_date")}
            />
          </div>
          <div>
            <label className="label" htmlFor="source">Source</label>
            <input
              id="source"
              className="input"
              placeholder="LinkedIn, referral, etc."
              value={form.source}
              onChange={update("source")}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="salary_range">Salary range</label>
            <input
              id="salary_range"
              className="input"
              placeholder="$140k–$170k"
              value={form.salary_range}
              onChange={update("salary_range")}
            />
          </div>
          <div>
            <label className="label" htmlFor="first_response_at">First response</label>
            <input
              id="first_response_at"
              type="datetime-local"
              className="input"
              value={form.first_response_at}
              onChange={update("first_response_at")}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="jd_text">Job description</label>
          <textarea
            id="jd_text"
            rows={4}
            className="input"
            placeholder="Paste the full job posting here, then hit Autofill with AI to fill in the fields above."
            value={form.jd_text}
            onChange={update("jd_text")}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-1.5"
              onClick={autofillFromDescription}
              disabled={parsing}
            >
              <span aria-hidden="true">✨</span>
              {parsing ? "Reading posting…" : "Autofill with AI"}
            </button>
            <span className="text-xs text-slate-400">
              Pulls the title, company, salary, source and a summary from the posting — review before saving.
            </span>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={3}
            className="input"
            value={form.notes}
            onChange={update("notes")}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link to={isEdit ? `/applications/${id}` : "/applications"} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

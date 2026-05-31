import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { applications as appsApi, interviews as interviewsApi } from "../api";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";

const EMPTY_INTERVIEW = {
  round_type: "",
  scheduled_at: "",
  interviewer_name: "",
  outcome: "pending",
  notes: "",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}
function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}
// <input type="datetime-local"> expects "YYYY-MM-DDTHH:mm" in *local* time.
// build it by hand — toISOString() would convert to UTC and shift the clock.
function toLocalInputDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [error, setError] = useState(null);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [interviewForm, setInterviewForm] = useState(EMPTY_INTERVIEW);
  const [submittingInterview, setSubmittingInterview] = useState(false);

  // refetch the whole application (interviews included) after any change.
  // simpler than patching state by hand and guarantees the list stays in sync.
  function load() {
    appsApi.get(id).then(setApp).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  // one modal handles both add and edit; editingInterview === null is the flag
  // saveInterview reads to decide between create and update.
  function openNewInterview() {
    setEditingInterview(null);
    setInterviewForm(EMPTY_INTERVIEW);
    setInterviewOpen(true);
  }
  function openEditInterview(iv) {
    setEditingInterview(iv);
    setInterviewForm({
      round_type: iv.round_type,
      scheduled_at: toLocalInputDateTime(iv.scheduled_at),
      interviewer_name: iv.interviewer_name || "",
      outcome: iv.outcome || "pending",
      notes: iv.notes || "",
    });
    setInterviewOpen(true);
  }

  async function saveInterview(e) {
    e.preventDefault();
    setSubmittingInterview(true);
    const payload = {
      ...interviewForm,
      // empty datetime-local => null so the API clears it rather than choking on ""
      scheduled_at: interviewForm.scheduled_at || null,
    };
    try {
      if (editingInterview) {
        await interviewsApi.update(editingInterview.id, payload);
      } else {
        await interviewsApi.create(id, payload);
      }
      setInterviewOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingInterview(false);
    }
  }

  async function deleteInterview(iv) {
    if (!confirm(`Delete ${iv.round_type} interview?`)) return;
    try {
      await interviewsApi.remove(iv.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteApplication() {
    // deleting an application cascades to its interviews on the backend, so warn first
    if (!confirm(`Delete "${app.role_title}" application? This will also delete its interviews.`))
      return;
    try {
      await appsApi.remove(id);
      navigate("/applications");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-3 py-2">
        {error}
      </div>
    );
  }
  if (!app) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/applications" className="text-sm text-slate-400 hover:underline">
          ← Back to applications
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">{app.role_title}</h1>
            <p className="text-slate-300 mt-1">
              {app.company?.name} · <StatusBadge status={app.status} />
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/applications/${id}/edit`} className="btn-secondary">Edit</Link>
            <button type="button" className="btn-danger" onClick={deleteApplication}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-medium mb-3">Details</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-400">Applied</dt>
              <dd>{formatDate(app.applied_date)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Source</dt>
              <dd>{app.source || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Salary range</dt>
              <dd>{app.salary_range || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">First response</dt>
              <dd>{formatDateTime(app.first_response_at)}</dd>
            </div>
          </dl>
        </div>
        <div className="card">
          <h2 className="font-medium mb-3">Notes</h2>
          <p className="text-sm whitespace-pre-wrap text-slate-200">
            {app.notes || <span className="text-slate-400">No notes yet.</span>}
          </p>
        </div>
      </div>

      {app.jd_text && (
        <div className="card">
          <h2 className="font-medium mb-3">Job description</h2>
          <p className="text-sm whitespace-pre-wrap text-slate-200">{app.jd_text}</p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Interviews</h2>
          <button type="button" className="btn-primary" onClick={openNewInterview}>
            + Add interview
          </button>
        </div>

        {app.interviews.length === 0 ? (
          <p className="text-sm text-slate-400">No interviews logged yet.</p>
        ) : (
          <ul className="divide-y divide-slate-700">
            {app.interviews.map((iv) => (
              <li key={iv.id} className="py-3 flex items-start justify-between">
                <div>
                  <p className="font-medium">{iv.round_type}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDateTime(iv.scheduled_at)}
                    {iv.interviewer_name && ` · ${iv.interviewer_name}`}
                    {iv.outcome && ` · ${iv.outcome}`}
                  </p>
                  {iv.notes && (
                    <p className="text-sm text-slate-200 mt-2 whitespace-pre-wrap">
                      {iv.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-3 shrink-0">
                  <button
                    type="button"
                    className="text-sm text-slate-300 hover:text-accent"
                    onClick={() => openEditInterview(iv)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-400 hover:text-red-300"
                    onClick={() => deleteInterview(iv)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={interviewOpen}
        onClose={() => setInterviewOpen(false)}
        title={editingInterview ? "Edit interview" : "New interview"}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setInterviewOpen(false)}>
              Cancel
            </button>
            {/* submit button lives in the modal footer, outside <form>, so
                wire it back to the form by id rather than nesting it inside */}
            <button
              type="submit"
              form="interview-form"
              className="btn-primary"
              disabled={submittingInterview}
            >
              {submittingInterview ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <form id="interview-form" onSubmit={saveInterview} className="space-y-3">
          <div>
            <label className="label" htmlFor="round_type">Round *</label>
            <input
              id="round_type"
              required
              className="input"
              placeholder="Phone Screen, Technical, Onsite…"
              value={interviewForm.round_type}
              onChange={(e) =>
                setInterviewForm({ ...interviewForm, round_type: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="scheduled_at">Scheduled at</label>
            <input
              id="scheduled_at"
              type="datetime-local"
              className="input"
              value={interviewForm.scheduled_at}
              onChange={(e) =>
                setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="interviewer_name">Interviewer</label>
            <input
              id="interviewer_name"
              className="input"
              value={interviewForm.interviewer_name}
              onChange={(e) =>
                setInterviewForm({ ...interviewForm, interviewer_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="outcome">Outcome</label>
            <select
              id="outcome"
              className="input"
              value={interviewForm.outcome}
              onChange={(e) =>
                setInterviewForm({ ...interviewForm, outcome: e.target.value })
              }
            >
              <option value="pending">pending</option>
              <option value="passed">passed</option>
              <option value="failed">failed</option>
              <option value="no-show">no-show</option>
              <option value="pending feedback">pending feedback</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="iv_notes">Notes</label>
            <textarea
              id="iv_notes"
              rows={3}
              className="input"
              value={interviewForm.notes}
              onChange={(e) =>
                setInterviewForm({ ...interviewForm, notes: e.target.value })
              }
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

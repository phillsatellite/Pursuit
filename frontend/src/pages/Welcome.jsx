import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Feature({ icon, title, children }) {
  return (
    <div className="card flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center ring-1 ring-inset ring-accent/30">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{children}</p>
      </div>
    </div>
  );
}

// shared svg attrs for the little line icons
const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "w-5 h-5",
};

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-slate-100 flex items-center justify-center gap-2">
            <span className="inline-block w-2.5 h-8 bg-gold rounded-sm" />
            Welcome to Pursuit
          </h1>
          <p className="text-slate-400 mt-3">
            Hi {name} — here's how to keep your whole job search organized in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Feature
            title="Track every application"
            icon={
              <svg {...svg}>
                <rect width="8" height="4" x="8" y="2" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
              </svg>
            }
          >
            Log each role you apply to and move it through the pipeline — Applied,
            Contacted, Interview, Offer, and beyond.
          </Feature>

          <Feature
            title="Log your interviews"
            icon={
              <svg {...svg}>
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18M8 2v4M16 2v4" />
              </svg>
            }
          >
            Record each round, who you met, and the outcome. Anything in the next two
            weeks surfaces on your dashboard.
          </Feature>

          <Feature
            title="Keep companies & contacts"
            icon={
              <svg {...svg}>
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                <path d="M10 6h4M10 10h4M10 14h4" />
              </svg>
            }
          >
            Save company details and the recruiters or hiring managers you're talking
            to — just type a company name and it's created for you.
          </Feature>

          <Feature
            title="See your pipeline at a glance"
            icon={
              <svg {...svg}>
                <path d="M3 3v18h18" />
                <path d="M18 17V9M13 17V5M8 17v-3" />
              </svg>
            }
          >
            The dashboard rolls up your status breakdown, upcoming interviews, and
            average time to first response.
          </Feature>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <button
            type="button"
            className="btn-primary w-full sm:w-auto px-6"
            onClick={() => navigate("/", { replace: true })}
          >
            Get started →
          </button>
          <button
            type="button"
            className="btn-secondary w-full sm:w-auto px-6"
            onClick={() => navigate("/applications/new")}
          >
            + Add your first application
          </button>
        </div>
      </div>
    </div>
  );
}

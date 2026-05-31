import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// one list drives both the desktop nav bar and the mobile row below, so the two
// can't drift apart. `end` on Dashboard stops "/" from matching as active on
// every nested route (otherwise /applications would light it up too).
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/applications", label: "Applications" },
  { to: "/companies", label: "Companies" },
  { to: "/contacts", label: "Contacts" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    // replace so the back button can't land them on a now-protected page
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <span className="font-semibold text-lg flex items-center gap-2">
              <span className="inline-block w-2 h-5 bg-gold rounded-sm" />
              Pursuit
            </span>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-200 hover:bg-navy-800"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-300">
              {user?.display_name || user?.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-200 hover:text-white px-3 py-1.5 rounded-md hover:bg-navy-800"
            >
              Log out
            </button>
          </div>
        </div>
        {/* same links again for narrow screens — the desktop nav is hidden below md */}
        <nav className="md:hidden border-t border-navy-700 px-4 py-2 flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-1 rounded-md text-sm whitespace-nowrap ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}

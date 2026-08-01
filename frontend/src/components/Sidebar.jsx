import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
      isActive
        ? "text-primary font-bold border-l-4 border-primary bg-surface-container-high"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`;

  return (
    <aside className="fixed h-full w-sidebar-width left-0 top-0 hidden md:flex flex-col py-6 px-4 bg-surface-container-lowest shadow-sm z-50">
      <div className="mb-10 px-4">
        <h1 className="text-headline-md font-extrabold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
          AI Assistant
        </h1>
        <p className="text-label-sm text-on-surface-variant mt-1">Pro Workspace</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <NavLink to="/" end className={linkClass}>
          <span className="material-symbols-outlined">chat</span>
          <span className="text-body-md">Chat</span>
        </NavLink>
        <NavLink to="/admin" className={linkClass}>
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span className="text-body-md">Admin</span>
        </NavLink>
      </nav>
    </aside>
  );
}
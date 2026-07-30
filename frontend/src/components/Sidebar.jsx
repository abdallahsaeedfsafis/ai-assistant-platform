export default function Sidebar() {
  return (
    <aside className="fixed h-full w-sidebar-width left-0 top-0 hidden md:flex flex-col py-6 px-4 bg-surface-container-lowest shadow-sm z-50">
      <div className="mb-10 px-4">
        <h1 className="text-headline-md font-extrabold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
          AI Assistant
        </h1>
        <p className="text-label-sm text-on-surface-variant mt-1">Pro Workspace</p>
      </div>

      <button className="mb-8 w-full py-3 px-4 bg-primary text-on-primary-container rounded-xl text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200">
        <span className="material-symbols-outlined">add_comment</span>
        New Chat
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <div className="flex items-center gap-3 px-4 py-3 text-primary font-bold border-l-4 border-primary bg-surface-container-high transition-colors cursor-pointer rounded-lg">
          <span className="material-symbols-outlined">history</span>
          <span className="text-body-md">Recent Conversations</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg">
          <span className="material-symbols-outlined">share</span>
          <span className="text-body-md">Shared Links</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-body-md">Settings</span>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-surface-variant space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-body-md">Profile</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg">
          <span className="material-symbols-outlined">help_outline</span>
          <span className="text-body-md">Help</span>
        </div>
      </div>
    </aside>
  );
}
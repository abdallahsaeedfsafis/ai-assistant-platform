import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { listConversations, createConversation, deleteConversation } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const [conversations, setConversations] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const loadConversations = () => {
    setIsLoadingList(true);
    listConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setIsLoadingList(false));
  };

  useEffect(() => {
    loadConversations();
  }, [conversationId]);

  const handleNewChat = async () => {
    try {
      const conv = await createConversation();
      setConversations((prev) => [conv, ...prev]);
      navigate(`/c/${conv.id}`);
    } catch {
      // silently ignore; user can retry
    }
  };

  const handleDelete = async (e, convId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Delete this conversation? This can't be undone.")) return;

    setDeletingId(convId);
    try {
      await deleteConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);

      // If the deleted conversation was the one open right now, navigate elsewhere
      if (String(convId) === conversationId) {
        if (remaining.length > 0) {
          navigate(`/c/${remaining[0].id}`);
        } else {
          const conv = await createConversation();
          navigate(`/c/${conv.id}`);
        }
      }
    } catch {
      // silently ignore; list stays as-is so the user can retry
    } finally {
      setDeletingId(null);
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer group ${
      isActive
        ? "text-primary font-bold border-l-4 border-primary bg-surface-container-high"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`;

  return (
    <aside className="fixed h-full w-sidebar-width left-0 top-0 hidden md:flex flex-col py-6 px-4 bg-surface-container-lowest shadow-sm z-50">
      <div className="mb-6 px-4">
        <h1 className="text-headline-md font-extrabold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
          AI Assistant
        </h1>
        {user && <p className="text-label-sm text-on-surface-variant mt-1 truncate">{user.email}</p>}
      </div>

      <button
        onClick={handleNewChat}
        className="mb-4 w-full py-3 px-4 bg-primary text-on-primary-container rounded-xl text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200"
      >
        <span className="material-symbols-outlined">add_comment</span>
        New Chat
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <div className="text-label-sm text-outline px-4 mb-1 mt-2">Conversations</div>
        {isLoadingList && (
          <p className="text-label-sm text-on-surface-variant px-4">Loading...</p>
        )}
        {!isLoadingList && conversations.length === 0 && (
          <p className="text-label-sm text-on-surface-variant px-4">No conversations yet.</p>
        )}
        {conversations.map((conv) => (
          <NavLink key={conv.id} to={`/c/${conv.id}`} className={linkClass}>
            <span className="material-symbols-outlined text-lg">chat</span>
            <span className="text-body-md truncate flex-1">{conv.title}</span>
            <button
              onClick={(e) => handleDelete(e, conv.id)}
              disabled={deletingId === conv.id}
              className="opacity-0 group-hover:opacity-100 hover:!opacity-100 p-1 rounded hover:bg-error/10 hover:text-error transition-opacity disabled:opacity-50"
              title="Delete conversation"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </NavLink>
        ))}

        <div className="text-label-sm text-outline px-4 mb-1 mt-6">Tools</div>
        <NavLink to="/admin" className={linkClass}>
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span className="text-body-md">Admin</span>
        </NavLink>
        <NavLink to="/playground" className={linkClass}>
          <span className="material-symbols-outlined">science</span>
          <span className="text-body-md">Prompt Lab</span>
        </NavLink>
      </nav>

      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="text-body-md">Log out</span>
      </button>
    </aside>
  );
}
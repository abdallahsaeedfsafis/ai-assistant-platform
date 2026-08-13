import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { listConversations, createConversation } from "../lib/api";

export default function HomeRedirect() {
  const [targetPath, setTargetPath] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const conversations = await listConversations();
        if (cancelled) return;

        if (conversations.length > 0) {
          setTargetPath(`/c/${conversations[0].id}`);
        } else {
          const conv = await createConversation();
          if (cancelled) return;
          setTargetPath(`/c/${conv.id}`);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!targetPath) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  return <Navigate to={targetPath} replace />;
}
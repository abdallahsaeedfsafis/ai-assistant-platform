export default function Message({ role, content, timestamp }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser
            ? "bg-secondary text-white"
            : "bg-primary/10 border border-primary/20 text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-lg">
          {isUser ? "person" : "smart_toy"}
        </span>
      </div>

      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`p-4 rounded-2xl shadow-sm ${
            isUser
              ? "bg-primary text-white rounded-tr-sm"
              : "bg-chat-ai-bubble border border-border-subtle rounded-tl-sm"
          }`}
        >
          <p className="text-body-md whitespace-pre-wrap">{content}</p>
        </div>
        <span
          className={`text-label-sm text-on-surface-variant mt-1 ${
            isUser ? "mr-1" : "ml-1"
          }`}
        >
          {isUser ? timestamp : `Assistant • ${timestamp}`}
        </span>
      </div>
    </div>
  );
}
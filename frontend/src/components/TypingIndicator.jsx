export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-lg">smart_toy</span>
      </div>
      <div className="flex flex-col items-start">
        <div className="bg-chat-ai-bubble border border-border-subtle px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full typing-dot"></div>
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full typing-dot"></div>
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full typing-dot"></div>
        </div>
      </div>
    </div>
  );
}

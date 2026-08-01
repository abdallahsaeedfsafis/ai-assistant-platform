import { useRef } from "react";

export default function ChatInput({ onSend, disabled, value, onValueChange, placeholder = "Type your message..." }) {
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    onValueChange(e.target.value);
    e.target.style.height = "0px";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    onValueChange("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
      <div className="relative bg-surface-container-lowest border border-border-subtle rounded-[2rem] shadow-xl p-2 flex items-end gap-2 transition-all duration-300 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
        <button type="button" className="p-3 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant" title="Attach a file (coming soon)" disabled>
          <span className="material-symbols-outlined">attach_file</span>
        </button>

        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-3 px-2 text-body-md text-on-surface placeholder:text-outline/60"
          placeholder={placeholder}
          rows={1}
          style={{ maxHeight: "200px" }}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-40 disabled:hover:scale-100"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}
const SUGGESTIONS = [
  {
    icon: "lightbulb",
    label: "Explain a concept...",
    example: "Deep learning explained simply for beginners",
  },
  {
    icon: "edit_note",
    label: "Help me write...",
    example: "A formal email for a job application",
  },
  {
    icon: "code",
    label: "Write code for...",
    example: "A Python function to process text data",
  },
  {
    icon: "travel_explore",
    label: "Plan a trip...",
    example: "A week in Tokyo with a list of attractions",
  },
];

export default function EmptyState({ onSuggestionClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
        <span
          className="material-symbols-outlined text-5xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          smart_toy
        </span>
      </div>
      <h3 className="text-headline-lg mb-2">How can I help you today?</h3>
      <p className="text-body-lg text-on-surface-variant mb-12">
        Your AI-powered assistant
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestionClick(`${s.label} ${s.example}`)}
            className="p-4 bg-surface-container-lowest border border-border-subtle rounded-2xl text-left hover:border-primary/40 hover:bg-surface-container-low transition-all duration-200 group"
          >
            <span className="material-symbols-outlined text-primary mb-2 block group-hover:scale-110 transition-transform">
              {s.icon}
            </span>
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className="text-body-md mt-1">{s.example}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPlaygroundCategories, comparePromptStrategies } from "../lib/api";
import { sanitizeMathText } from "../lib/sanitizeMath";

const STRATEGY_INFO = {
  zero_shot: {
    label: "Zero-shot",
    description: "No examples given — the model relies purely on the instruction.",
  },
  one_shot: {
    label: "One-shot",
    description: "A single example is given before the real task.",
  },
  few_shot: {
    label: "Few-shot",
    description: "Multiple examples are given to establish a clearer pattern.",
  },
  chain_of_thought: {
    label: "Chain-of-Thought",
    description: "The model is asked to reason step by step before answering.",
  },
};

export default function PlaygroundPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [expandedPrompts, setExpandedPrompts] = useState({});

  useEffect(() => {
    getPlaygroundCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0].key);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleCompare = async () => {
    if (!input.trim() || !selectedCategory) return;
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data = await comparePromptStrategies(selectedCategory, input);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrompt = (key) => {
    setExpandedPrompts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generalCategories = categories.filter((c) => c.domain === "general");
  const domainCategories = categories.filter((c) => c.domain === "labor_law");

  return (
    <>
      <header className="fixed top-0 left-0 md:left-sidebar-width right-0 z-40 h-16 px-gutter flex justify-between items-center bg-surface/80 backdrop-blur-md">
        <h2 className="text-headline-md font-bold text-primary">Prompt Engineering Playground</h2>
      </header>

      <section className="flex-1 overflow-y-auto chat-scroll pt-24 pb-12 px-gutter">
        <div className="max-w-[1100px] mx-auto w-full">
          <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-6 mb-8 shadow-sm">
            <label className="text-label-md text-on-surface-variant block mb-2">Task category</label>

            {generalCategories.length > 0 && (
              <>
                <p className="text-label-sm text-outline mb-1">General tasks</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {generalCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-4 py-2 rounded-full text-label-md border transition-colors ${
                        selectedCategory === cat.key
                          ? "bg-primary text-white border-primary"
                          : "bg-transparent border-border-subtle text-on-surface-variant hover:border-primary/40"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {domainCategories.length > 0 && (
              <>
                <p className="text-label-sm text-outline mb-1">Labor law tasks</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {domainCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-4 py-2 rounded-full text-label-md border transition-colors ${
                        selectedCategory === cat.key
                          ? "bg-primary text-white border-primary"
                          : "bg-transparent border-border-subtle text-on-surface-variant hover:border-primary/40"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <label className="text-label-md text-on-surface-variant block mb-2 mt-4">Your input</label>
            <textarea
              dir="auto"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="Type the text, question, or problem to test..."
              className="w-full border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-body-md"
            />

            <button
              onClick={handleCompare}
              disabled={isLoading || !input.trim()}
              className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined">compare_arrows</span>
              {isLoading ? "Comparing strategies..." : "Compare Strategies"}
            </button>

            {error && <p className="text-error text-label-md mt-3">{error}</p>}
          </div>

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(result.results).map(([key, data]) => {
                const info = STRATEGY_INFO[key] || { label: key, description: "" };
                return (
                  <div
                    key={key}
                    className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-headline-md text-primary">{info.label}</h3>
                      {data.elapsed_ms != null && (
                        <span className="text-label-sm text-on-surface-variant">{data.elapsed_ms} ms</span>
                      )}
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-3">{info.description}</p>

                    <div
                      dir="auto"
                      className="bg-surface-container-low rounded-xl p-4 text-body-md prose prose-sm max-w-none flex-1"
                    >
                      {data.error ? (
                        <p className="text-error">{data.error}</p>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitizeMathText(data.output)}</ReactMarkdown>
                      )}
                    </div>

                    <button
                      onClick={() => togglePrompt(key)}
                      className="text-label-sm text-primary mt-3 text-left hover:underline"
                    >
                      {expandedPrompts[key] ? "Hide full prompt" : "View full prompt sent to the model"}
                    </button>
                    {expandedPrompts[key] && (
                      <pre
                        dir="auto"
                        className="mt-2 bg-surface-container-high rounded-lg p-3 text-label-sm whitespace-pre-wrap"
                      >
                        {data.prompt}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
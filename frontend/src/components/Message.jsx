import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { sanitizeMathText } from "../lib/sanitizeMath";

const TOOL_LABELS = {
  calculate: { icon: "calculate", label: "Calculator" },
  get_weather: { icon: "partly_cloudy_day", label: "Weather" },
  search_web: { icon: "travel_explore", label: "Web Search" },
  search_documents: { icon: "description", label: "Documents" },
};

export default function Message({ role, content, timestamp, toolsUsed = [] }) {
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
        {!isUser && toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {toolsUsed.map((tool, i) => {
              const info = TOOL_LABELS[tool] || { icon: "build", label: tool };
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label-sm"
                >
                  <span className="material-symbols-outlined text-sm">{info.icon}</span>
                  {info.label}
                </span>
              );
            })}
          </div>
        )}

        <div
          className={`p-4 rounded-2xl shadow-sm ${
            isUser
              ? "bg-primary text-white rounded-tr-sm"
              : "bg-chat-ai-bubble border border-border-subtle rounded-tl-sm"
          }`}
        >
          <div dir="auto" className="text-body-md prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {sanitizeMathText(content)}
            </ReactMarkdown>
          </div>
        </div>
        <span className={`text-label-sm text-on-surface-variant mt-1 ${isUser ? "mr-1" : "ml-1"}`}>
          {isUser ? timestamp : `Assistant • ${timestamp}`}
        </span>
      </div>
    </div>
  );
}
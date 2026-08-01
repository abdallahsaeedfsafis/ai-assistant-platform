import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/ChatInput";
import TypingIndicator from "../components/TypingIndicator";
import ErrorBanner from "../components/ErrorBanner";
import { askDocumentQuestion } from "../lib/api";

export default function DocumentsPage() {
  const [entries, setEntries] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, isLoading]);

  const handleAsk = async (question) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await askDocumentQuestion(question);
      setEntries((prev) => [
        ...prev,
        { question, answer: result.answer, sources: result.sources, hasContext: result.has_context },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = entries.length === 0;

  return (
    <>
      <header className="fixed top-0 left-0 md:left-sidebar-width right-0 z-40 h-16 px-gutter flex justify-between items-center bg-surface/80 backdrop-blur-md">
        <h2 className="text-headline-md font-bold text-primary">Ask about Documents</h2>
      </header>

      <section className="flex-1 overflow-y-auto chat-scroll pt-24 pb-40 px-gutter">
        <div className="max-w-[800px] mx-auto w-full space-y-8">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-primary mb-4">description</span>
              <h3 className="text-headline-lg mb-2">Ask about uploaded documents</h3>
              <p className="text-body-lg text-on-surface-variant">
                Questions are answered using only the content of documents uploaded by the admin.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%]">
                      <p className="text-body-md">{entry.question}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-chat-ai-bubble border border-border-subtle p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%]">
                      <p className="text-body-md whitespace-pre-wrap">{entry.answer}</p>
                      {entry.hasContext && entry.sources.length > 0 && (
                        <details className="mt-3">
                          <summary className="text-label-sm text-primary cursor-pointer">
                            View sources ({entry.sources.length})
                          </summary>
                          <div className="mt-2 space-y-2">
                            {entry.sources.map((s, j) => (
                              <p key={j} className="text-label-sm text-on-surface-variant bg-surface-container-low p-2 rounded-lg">
                                {s}
                              </p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 md:left-sidebar-width right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="max-w-[800px] mx-auto w-full relative">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
          <ChatInput
            value={inputValue}
            onValueChange={setInputValue}
            onSend={handleAsk}
            disabled={isLoading}
            placeholder="Ask a question about the uploaded documents..."
          />
        </div>
      </footer>
    </>
  );
}
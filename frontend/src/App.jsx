import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Message from "./components/Message";
import TypingIndicator from "./components/TypingIndicator";
import EmptyState from "./components/EmptyState";
import ChatInput from "./components/ChatInput";
import ErrorBanner from "./components/ErrorBanner";
import { sendChatMessage } from "./lib/api";

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    setError(null);

    const userMessage = { role: "user", content: text, timestamp: nowLabel() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const history = messages.map(({ role, content }) => ({ role, content }));
      const reply = await sendChatMessage(text, history);

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: reply, timestamp: nowLabel() },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="bg-background text-on-background min-h-screen flex" dir="ltr">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-sidebar-width flex flex-col h-screen relative">
        <header className="fixed top-0 left-0 md:left-sidebar-width right-0 z-40 h-16 px-gutter flex justify-between items-center bg-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-surface-variant/50 rounded-full">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-headline-md font-bold text-primary">
              AI Assistant Platform
            </h2>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto chat-scroll pt-24 pb-40 px-gutter">
          <div className="max-w-[800px] mx-auto w-full space-y-8">
            {isEmpty ? (
              <EmptyState onSuggestionClick={setInputValue} />
            ) : (
              <div className="space-y-8">
                {messages.map((m, i) => (
                  <Message key={i} {...m} />
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
              onSend={handleSend}
              disabled={isLoading}
            />
            <div className="mt-3 text-center">
              <p className="text-label-sm text-on-surface-variant/60">
                AI can provide inaccurate information. Always verify important facts.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
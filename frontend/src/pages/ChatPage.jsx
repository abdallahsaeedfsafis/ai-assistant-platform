import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Message from "../components/Message";
import TypingIndicator from "../components/TypingIndicator";
import EmptyState from "../components/EmptyState";
import ChatInput from "../components/ChatInput";
import ErrorBanner from "../components/ErrorBanner";
import { getConversation, sendChatMessage } from "../lib/api";

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { conversationId } = useParams();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [error, setError] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoadingConversation(true);
      setMessages([]);
      setError(null);

      try {
        const conv = await getConversation(conversationId);
        if (cancelled) return;
        setActiveConversationId(conv.id);
        setMessages(
          conv.messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: formatTime(m.created_at),
          }))
        );
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoadingConversation(false);
      }
    }

    if (conversationId) {
      init();
    }

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    if (!activeConversationId) return;
    setError(null);

    const userMessage = { role: "user", content: text, timestamp: formatTime(new Date().toISOString()) };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { reply, toolsUsed } = await sendChatMessage(activeConversationId, text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: formatTime(new Date().toISOString()), toolsUsed },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingConversation) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <p className="text-on-surface-variant">Loading conversation...</p>
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <header className="fixed top-0 left-0 md:left-sidebar-width right-0 z-40 h-16 px-gutter flex justify-between items-center bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 hover:bg-surface-variant/50 rounded-full">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="text-headline-md font-bold text-primary">AI Assistant Platform</h2>
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
          <ChatInput value={inputValue} onValueChange={setInputValue} onSend={handleSend} disabled={isLoading} />
          <div className="mt-3 text-center">
            <p className="text-label-sm text-on-surface-variant/60">
              AI can provide inaccurate information. Always verify important facts.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";
import "./chatbot.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MODES = {
  classify: {
    label: "Classify Ticket",
    placeholder: "Paste a support ticket to classify...",
    endpoint: "/classify-ticket",
  },
  summarize: {
    label: "Summarize Document",
    placeholder: "Paste a document to summarize...",
    endpoint: "/summarize-document",
  },
};

export default function ChatBot() {
  const [mode, setMode] = useState("classify");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const body = mode === "summarize" ? { text, length } : { text };
      const res = await fetch(`${API_URL}${MODES[mode].endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      if (mode === "classify") {
        setMessages((prev) => [
          ...prev,
          { role: "ai", kind: "classification", data },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", kind: "summary", data },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", kind: "error", text: `Something went wrong: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__title">
          <span className="app-header__mark">FlowMind</span>
          <span className="app-header__mark app-header__mark--accent">AI</span>
        </div>
        <p className="app-header__subtitle">Ticket triage &amp; document summarization, powered by Gemini</p>
        <div className="flow-line" aria-hidden="true" />
      </header>

      <div className="mode-switch" role="tablist" aria-label="Choose a task">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            role="tab"
            aria-selected={mode === key}
            className={`mode-switch__tab ${mode === key ? "is-active" : ""}`}
            onClick={() => setMode(key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <main className="chat-window" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <p>No messages yet.</p>
            <p className="empty-state__hint">{MODES[mode].placeholder}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="bubble-row bubble-row--ai">
            <div className="bubble bubble--ai bubble--loading">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
      </main>

      <footer className="composer">
        {mode === "summarize" && (
          <div className="composer__length">
            <label htmlFor="length-select">Summary length</label>
            <select id="length-select" value={length} onChange={(e) => setLength(e.target.value)}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        )}
        <div className="composer__row">
          <textarea
            className="composer__input"
            placeholder={MODES[mode].placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <button
            className="composer__send"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

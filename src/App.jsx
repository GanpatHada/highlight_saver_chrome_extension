import { useState, useEffect } from "react";
import "./App.css";
import { CohereClientV2 } from "cohere-ai";
import { RiAiGenerate2, RiDeleteBin6Line } from "react-icons/ri";

const cohere = new CohereClientV2({
  token: import.meta.env.VITE_COHERE_API_KEY,
});

function App() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});
  const [summarizing, setSummarizing] = useState({});

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = () => {
    console.log("[Popup] Loading highlights...");
    chrome.runtime.sendMessage({ action: "getHighlights" }, (response) => {
      console.log("[Popup] getHighlights response:", response);
      if (response && response.success) {
        setHighlights(response.highlights);
      }
      setLoading(false);
    });
  };

  const deleteHighlight = (id) => {
    console.log("[Popup] Deleting highlight:", id);
    chrome.runtime.sendMessage(
      { action: "deleteHighlight", id },
      (response) => {
        console.log("[Popup] deleteHighlight response:", response);
        if (response && response.success) {
          setHighlights(highlights.filter((h) => h.id !== id));
        }
      }
    );
  };

  const summarizeHighlight = async (id, text) => {
    console.log(
      "▶️ Summarize clicked for ID:",
      id,
      "text length:",
      text?.length
    );

    if (!text || !text.trim()) {
      setSummaries((prev) => ({
        ...prev,
        [id]: "❌ Cannot summarize empty text",
      }));
      return;
    }

    setSummarizing((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await cohere.chat({
        model: "command-a-03-2025",
        messages: [
          {
            role: "system",
            content: "Summarize text briefly in 2-3 sentences.",
          },
          { role: "user", content: text.slice(0, 2000) }, // truncate if too long
        ],
        temperature: 0.5,
      });

      console.log("📦 Full Cohere response:", response);

      const summary =
        response?.message?.content?.[0]?.text?.trim() ||
        "❌ Failed to summarize";
      console.log("📝 Extracted summary:", summary);

      setSummaries((prev) => ({ ...prev, [id]: summary }));
    } catch (err) {
      console.error("❌ Cohere Chat summarize error:", err);
      setSummaries((prev) => ({
        ...prev,
        [id]: "❌ Error summarizing: " + err.message,
      }));
    }

    setSummarizing((prev) => ({ ...prev, [id]: false }));
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading highlights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Highlight Saver</h1>
        <p className="subtitle">Your saved text selections</p>
      </header>

      <main className="main">
        {highlights.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No highlights yet</h3>
            <p>
              Select text on any website and click the save button to get
              started!
            </p>
          </div>
        ) : (
          <div className="highlights-list">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="highlight-card">
                <div className="highlight-header">
                  <div className="highlight-meta">
                    <span className="domain">{getDomain(highlight.url)}</span>
                    <span className="date">
                      {formatDate(highlight.timestamp)}
                    </span>
                  </div>
                  <div className="highlight-actions">
                    <button
                      className="summarize-btn"
                      onClick={() =>
                        summarizeHighlight(highlight.id, highlight.text)
                      }
                      disabled={summarizing[highlight.id]}
                    >
                      {summarizing[highlight.id] ? (
                        <>
                          <i>
                            <RiAiGenerate2 />
                          </i>
                          <span>Summarizing...</span>
                        </>
                      ) : (
                        <>
                          <i>
                            <RiAiGenerate2 />
                          </i>
                          <span>Summarize</span>
                        </>
                      )}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteHighlight(highlight.id)}
                      title="Delete highlight"
                    >
                      <i>
                        <RiDeleteBin6Line />
                      </i>
                    </button>
                  </div>
                </div>

                <div className="highlight-content">
                  <p className="highlight-text">{highlight.text}</p>
                </div>

                {summaries[highlight.id] && (
                  <div
                    className={`summary-box ${
                      summaries[highlight.id].startsWith("❌") ? "error" : ""
                    }`}
                  >
                    <strong>Summary:</strong>
                    <p>{summaries[highlight.id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

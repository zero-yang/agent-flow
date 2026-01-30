import { useMemo, useState } from "react";
import { createRun, subscribeRun } from "./api";
import type { RunEvent } from "./types";

export function App() {
  const [url, setUrl] = useState("https://example.com");
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);

  const consoleText = useMemo(() => {
    return events
      .map((event) => {
        const data = event.data ? JSON.stringify(event.data) : "";
        return `[${event.type}] ${data}`;
      })
      .join("\n");
  }, [events]);

  async function handleRun() {
    setEvents([]);
    setOutput(null);
    setRunning(true);
    try {
      const { runId } = await createRun(url);
      const es = subscribeRun(runId, (event) => {
        setEvents((prev) => [...prev, event]);
        if (event.type === "run_succeeded") {
          setOutput(event.data?.output as Record<string, unknown>);
          setRunning(false);
          es.close();
        }
        if (event.type === "run_failed") {
          setRunning(false);
          es.close();
        }
      });
    } catch (err) {
      setRunning(false);
      setEvents((prev) => [
        ...prev,
        { runId: "local", type: "run_failed", timestamp: new Date().toISOString(), data: { error: String(err) } }
      ]);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Agent Flow</h1>
        <p>URL → fetch → LLM summary JSON (SSE streaming)</p>
      </header>

      <section className="panel">
        <label htmlFor="url">Target URL</label>
        <div className="row">
          <input
            id="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/article"
          />
          <button onClick={handleRun} disabled={running}>
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Events</h2>
        <textarea readOnly value={consoleText} />
      </section>

      <section className="panel">
        <h2>Final Output JSON</h2>
        <pre>{output ? JSON.stringify(output, null, 2) : "(waiting...)"}</pre>
      </section>
    </div>
  );
}

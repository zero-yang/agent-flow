import type { RunEvent } from "@agent-flow/shared";

const BASE_URL = "http://localhost:3000";

export async function createRun(url: string) {
  const res = await fetch(`${BASE_URL}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflowId: "demo-url-summary", input: { url } })
  });
  if (!res.ok) {
    throw new Error(`Create run failed: ${res.status}`);
  }
  return (await res.json()) as { runId: string };
}

export function subscribeRun(runId: string, onEvent: (event: RunEvent) => void) {
  const es = new EventSource(`${BASE_URL}/runs/${runId}/events`);
  es.onmessage = (msg) => {
    const data = JSON.parse(msg.data) as RunEvent;
    onEvent(data);
  };
  return es;
}

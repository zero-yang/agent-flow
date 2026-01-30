import { Injectable } from "@nestjs/common";

type ChatMessage = { role: "system" | "user"; content: string };

type ChatCompletionChunk = {
  choices: Array<{ delta?: { content?: string } }>;
};

@Injectable()
export class OpenAIClient {
  private apiKey = process.env.OPENAI_API_KEY || "";
  private baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  private model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  async streamJson(prompt: string, onChunk: (chunk: string) => void) {
    const url = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const body = {
      model: this.model,
      stream: true,
      messages: [
        { role: "system", content: "Respond with JSON only." },
        { role: "user", content: prompt }
      ] satisfies ChatMessage[]
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${text}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data: "));
      for (const line of lines) {
        const data = line.replace(/^data: /, "").trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data) as ChatCompletionChunk;
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            onChunk(delta);
          }
        } catch {
          continue;
        }
      }
    }

    return full;
  }
}

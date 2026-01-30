import { Injectable } from "@nestjs/common";
import { normalizeWhitespace, stripHtml } from "../text";

@Injectable()
export class FetchUrlTool {
  async run(input: { url: string }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(input.url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Failed to fetch URL: ${res.status}`);
      }
      const html = await res.text();
      const stripped = normalizeWhitespace(stripHtml(html));
      return { text: stripped.slice(0, 12000) };
    } finally {
      clearTimeout(timeout);
    }
  }
}

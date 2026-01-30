# Agent Flow MVP

## Install

```bash
pnpm install
```

## Configure server env

Copy example env and fill in API key:

```bash
cp apps/server/.env.example apps/server/.env
```

Set these in `apps/server/.env`:

```
OPENAI_API_KEY=your_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

## Start server

```bash
pnpm -C apps/server dev
```

## Start web

```bash
pnpm -C apps/web dev
```

Open the web app at `http://localhost:5173`.

## Use the demo

1. Enter a URL in the input box.
2. Click **Run**.
3. Watch SSE events stream in the Events console.
4. See final JSON in **Final Output JSON**.

## API examples

Create a run:

```bash
curl -X POST http://localhost:3000/runs \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"demo-url-summary","input":{"url":"https://example.com"}}'
```

Subscribe to SSE:

```bash
curl -N http://localhost:3000/runs/<RUN_ID>/events
```

List workflows:

```bash
curl http://localhost:3000/workflows
```

Get workflow detail:

```bash
curl http://localhost:3000/workflows/demo-url-summary
```

## 验证清单

- 看到 run_started 事件
- 看到 tool_called 事件
- 看到 llm_chunk 事件
- 看到 run_succeeded 事件
- Final Output JSON 有内容

# External AI Cost Tracking Endpoint

## Purpose

This endpoint allows an external app to report AI usage back to Acost so the system can:

- detect AI cost consumption per workspace
- store raw usage in `events`
- aggregate usage into `daily_metrics`
- show spend by feature, user, provider, and model in the dashboard

The endpoint is backed by the `api_keys` table, where each API key belongs to a workspace.

Reference:

- API key schema: `apps/web/supabase/migrations/20240530000004_create_api_keys.sql`
- Tracking handler: `apps/web/src/app/api/track/route.ts`

---

## Endpoint

- Method: `POST`
- Route: `/api/track`
- CORS: supported via `OPTIONS`

Example local URL:

```txt
http://localhost:3000/api/track
```

---

## Authentication

The endpoint accepts either of these headers:

### Option 1 - Recommended

```http
X-API-Key: your_api_key_here
```

### Option 2

```http
Authorization: Bearer your_api_key_here
```

The raw key is hashed with SHA-256 and matched against `public.api_keys.key_hash`.
If valid, the request is resolved to the correct `workspace_id`.

---

## Request Payload

### Required fields

| Field | Type | Notes |
|---|---|---|
| `feature` | `string` | Product feature name, for example `pdf-chat` |
| `provider` | `string` | AI provider, for example `openai`, `anthropic`, `google` |
| `model` | `string` | AI model name, for example `gpt-4o` |
| `inputTokens` or `input_tokens` | `number` | Input token count |
| `outputTokens` or `output_tokens` | `number` | Output token count |
| `latency` or `latency_ms` | `number` | Request latency in milliseconds |

### Optional fields

| Field | Type | Notes |
|---|---|---|
| `userId` or `user_id` | `string` | End-user identifier |

### Notes

- The endpoint accepts both camelCase and snake_case for payload compatibility.
- `provider` and `model` are mandatory.
- Numeric fields must be valid numbers and cannot be negative.

---

## Example Request

### cURL

```bash
curl -X POST http://localhost:3000/api/track \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "resume-analyzer",
    "userId": "usr_123",
    "provider": "openai",
    "model": "gpt-4o",
    "inputTokens": 1200,
    "outputTokens": 350,
    "latency": 1430
  }'
```

### TypeScript

```ts
await fetch("http://localhost:3000/api/track", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.ACOST_API_KEY!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    feature: "resume-analyzer",
    userId: user.id,
    provider: "openai",
    model: response.model,
    inputTokens: response.usage.prompt_tokens,
    outputTokens: response.usage.completion_tokens,
    latency: Date.now() - start,
  }),
})
```

### Python

```python
import requests

requests.post(
    "http://localhost:3000/api/track",
    headers={
        "X-API-Key": "your_api_key_here",
        "Content-Type": "application/json",
    },
    json={
        "feature": "resume-analyzer",
        "userId": user_id,
        "provider": "openai",
        "model": "gpt-4o",
        "inputTokens": prompt_tokens,
        "outputTokens": completion_tokens,
        "latency": latency_ms,
    },
)
```

---

## Success Response

Status:

```txt
200 OK
```

Body:

```json
{
  "success": true,
  "data": {
    "workspace_id": "workspace-uuid",
    "feature": "resume-analyzer",
    "provider": "openai",
    "model": "gpt-4o",
    "estimated_cost": 0.01125
  }
}
```

---

## Error Responses

### Missing API key

```json
{
  "message": "Missing API key. Use `Authorization: Bearer <key>` or `X-API-Key: <key>`."
}
```

Status:

```txt
401 Unauthorized
```

### Invalid API key

```json
{
  "message": "Invalid API key"
}
```

Status:

```txt
401 Unauthorized
```

### Invalid JSON body

```json
{
  "message": "Invalid JSON body"
}
```

Status:

```txt
400 Bad Request
```

### Validation examples

```json
{
  "message": "`provider` is required"
}
```

```json
{
  "message": "`model` is required"
}
```

```json
{
  "message": "`input_tokens` is required and must be a number"
}
```

```json
{
  "message": "`latency_ms` must be greater than or equal to 0"
}
```

Status:

```txt
400 Bad Request
```

---

## Internal Flow

```txt
1. External app sends POST /api/track
2. API reads X-API-Key or Authorization: Bearer <key>
3. Key is hashed with SHA-256
4. Hash is matched to public.api_keys.key_hash
5. Workspace is resolved from api_keys.workspace_id
6. Payload is normalized and validated
7. estimated_cost is calculated from provider + model + token counts
8. A row is inserted into public.events
9. api_keys.last_used_at is updated
10. daily_metrics is inserted or updated for the current day
11. API returns success response
```

---

## Database Impact

### `public.api_keys`

Used to:

- authenticate external requests
- map requests to a workspace
- update `last_used_at`

### `public.events`

Stores raw per-request tracking data:

- `workspace_id`
- `feature`
- `user_id`
- `provider`
- `model`
- `input_tokens`
- `output_tokens`
- `estimated_cost`
- `latency`

### `public.daily_metrics`

Stores daily aggregated metrics by:

- `workspace_id`
- `date`
- `feature`

Updated fields:

- `total_cost`
- `total_requests`
- `total_tokens`
- `avg_latency`

---

## Current Pricing Logic

The current implementation uses a small in-code pricing map in `route.ts`.

Examples:

- `openai:gpt-4o`
- `openai:gpt-4o-mini`
- `anthropic:claude-3-5-sonnet`
- `anthropic:claude-3-7-sonnet`

If no exact match is found, the handler falls back to a default rate.

---

## Recommended Usage Pattern

After every AI API call in the external app:

1. record start time before calling the provider
2. read token usage from the provider response
3. calculate latency in milliseconds
4. send a non-blocking request to `/api/track`
5. do not block the main user flow on tracking failures

---

## Example Use Case

An external SaaS app uses OpenAI for a feature called `resume-analyzer`.
After each model response, the app sends:

- the feature name
- the end-user id
- the provider
- the model
- input and output token counts
- latency

Acost then detects:

- which workspace generated the AI cost
- how much that request approximately cost
- how much each feature and user is spending over time

---

## Future Improvements

Possible next improvements for this endpoint:

- add `/api/track/batch` for batch ingestion
- move pricing into a database table or cached config
- add rate limiting per API key
- add idempotency keys to prevent duplicate events
- add provider-specific validation helpers

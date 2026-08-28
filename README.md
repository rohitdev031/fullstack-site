# aether-ai-frontend

## Development

```bash
npm install
npm run dev
```

The frontend uses mock responses when `VITE_API_BASE_URL` is not set. To connect the Ask feature to the backend, create a `.env.local` file:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

The API client calls these endpoints:

- `GET /api/chats/history`
- `GET /api/chats/suggestions`
- `POST /api/chats/message`

The message request includes `message`, `currentModel`, `webSearchEnabled`, `responseQuality`, and `attachedFile`. The message endpoint should return `{ id, role, content, timestamp }`.
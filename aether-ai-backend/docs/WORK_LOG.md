# Aether AI Backend — Daily Technical Work Log
**Developer:** Zaid  
**Role:** Backend Developer  
**Project:** Aether AI Chat Platform  
**Stack:** Django 5.x, Django REST Framework, MySQL, Python 3.13  
**Log Purpose:** Daily record of technical work, architectural decisions, problems, solutions, and learning for interview preparation and project review.

---

## DAY 1 — Project Setup & Database Configuration
**Approximate Date:** Late August 2026

### Work Completed
- Set up the Django project structure from scratch inside an existing React frontend repository (`aether-ai-frontend-main/aether-ai-backend/`).
- Configured MySQL as the primary database (replacing Django's default SQLite).
- Created a `.env` file for storing sensitive credentials (DB password, SECRET_KEY).
- Added `.gitignore` to prevent `.env` from being pushed to GitHub.
- Verified the MySQL connection was working successfully.

### Technical Concepts Used/Learned
- **`python-dotenv`**: Used `load_dotenv()` in `settings/base.py` to load environment variables from a `.env` file. `os.getenv('KEY', 'default')` pattern used throughout.
- **Django settings split pattern**: Settings are split into `config/settings/base.py` (shared), `local.py`, and `production.py` for environment-specific configuration.
- **`mysqlclient`**: The Python MySQL adapter library required for Django's `django.db.backends.mysql` engine.
- **`AUTH_USER_MODEL`**: Set to `'authentication.User'` to tell Django to use our custom User model instead of the default one. This must be set BEFORE the first migration.
- **`STRICT_TRANS_TABLES`**: MySQL SQL mode set via `OPTIONS['init_command']` to enforce strict data validation at the database level.

### Architecture / Database / API Decisions
- **Why MySQL over SQLite?** Production databases are always MySQL/PostgreSQL. SQLite is file-based and not suitable for concurrent access or production.
- **Why split settings?** Separating base/local/production allows different configurations (e.g., DEBUG=True in local, False in production) without modifying core files.
- **Why custom User model from Day 1?** Django strongly recommends setting `AUTH_USER_MODEL` before any migrations. Changing it later is extremely difficult. Even though we didn't add custom fields immediately, having it ready gives flexibility.
- **Why `.env` file?** Security — API keys and database passwords should never be hardcoded in source code or pushed to GitHub.

### Problems / Issues
- Initial MySQL connection failed due to incorrect credentials in `.env`.

### How They Were Solved
- Verified MySQL credentials by logging in via MySQL CLI, then updated `.env` with correct values.

### Testing Done
- Ran `python manage.py check` — 0 issues.
- Ran `python manage.py migrate` to verify MySQL connection worked and tables were created.

### Important Things I Should Understand
- `AUTH_USER_MODEL` must always be set BEFORE the first migration. If you change it after migrations exist, Django will raise errors and you will need to delete all migrations and the database.
- `os.getenv('KEY', 'default_value')` — the second argument is the fallback if the environment variable is not set.
- `mysqlclient` is a C-extension library — it requires build tools to compile. On some systems, you need to install MySQL development headers first.

### Possible Interview Questions

**Q: Why would you choose MySQL over SQLite for a Django project?**
Answer: SQLite is a simple file-based database — it works fine for learning, but it cannot handle multiple users at the same time properly. MySQL is a proper database server that can handle many users and requests at once. Since this is a real product that multiple people will use, we chose MySQL from the beginning.

**Q: What is `AUTH_USER_MODEL` and why must it be set at the start?**
Answer: `AUTH_USER_MODEL` is a Django setting that tells the project which model to use as the "User". By default Django has its own User, but we created our own custom User model so we can add extra fields in the future. The reason it must be set at the very beginning is that once you run your first database migration, Django locks in the user model. If you try to change it later, the database gets confused and you have to delete everything and start over.

**Q: How do you manage environment-specific settings in Django?**
Answer: We split the settings into three files: `base.py` for settings that are the same everywhere, `local.py` for development settings (like DEBUG=True), and `production.py` for the live server. This way we never accidentally turn on debug mode in production or use the wrong database.

**Q: What is the purpose of a `.env` file and why should it never be committed to Git?**
Answer: A `.env` file stores secret values like database passwords and API keys. These values are read by the code using `os.getenv()` — they never appear directly in the code files. We add `.env` to `.gitignore` so that Git ignores it and it never gets uploaded to GitHub. If someone else clones the project, they will not see our passwords.

### Pending / Next Work
- Design and implement all database models.

---

## DAY 2 — Database Models + Streaming Foundation
**Approximate Date:** Early September 2026

### Work Completed
- Implemented all 8 core database models across 5 Django apps.
- Ran `makemigrations` and `migrate` — 17 tables created in `aether_db`.
- Pre-seeded 3 AI models into the `ai_models` table: Gemini 1.5 Pro, GPT-4o, Claude 3.5 Sonnet.
- Created the AI provider abstraction layer in `core/ai_providers/`.
- Implemented `BaseAIProvider` abstract class.
- Implemented `MockAIProvider` with a working `stream_response` generator for local testing.
- Implemented `stream_chat_response_service` in `apps/chats/services.py` with full SSE formatting, DB persistence, and error handling.

### Technical Concepts Used/Learned
- **Abstract Base Classes (`ABC`)**: `BaseAIProvider` uses Python's `ABC` module. `@abstractmethod` decorator forces all subclasses to implement `generate_response` and `stream_response`. This ensures every AI provider follows the same interface.
- **Python Generators (`yield`)**: `stream_response` uses `yield` to return data chunks one at a time without building the full response in memory. This enables real-time streaming.
- **`StreamingHttpResponse`**: Django's built-in response class for streaming. It consumes a generator and pushes each yielded value to the client immediately. Used with `content_type='text/event-stream'`.
- **Server-Sent Events (SSE)**: A protocol where the server pushes real-time updates to the client over a single HTTP connection. Each event is formatted as `data: <json>\n\n`.
- **`UUIDField` as Primary Key**: Used for `ChatSession` and `ChatMessage` instead of auto-increment integer IDs. UUIDs are more secure because they are non-sequential and cannot be guessed.
- **`transaction.atomic()`**: Wraps database writes in an atomic block. If any operation inside fails, all changes are rolled back. Used to guarantee user message is saved before streaming starts.
- **`auto_now_add=True` vs `auto_now=True`**: `auto_now_add` sets the timestamp only on creation. `auto_now` updates the timestamp on every `.save()` call. Used for `created_at` and `updated_at` respectively.
- **`on_delete=models.PROTECT`**: Prevents deletion of an `AIModel` if any `ChatSession` still references it. Used to protect data integrity.
- **`on_delete=models.SET_NULL`**: When the referenced object is deleted, the FK field is set to NULL instead of deleting the row. Used for `model_used` in `ChatMessage`.
- **`related_name`**: The reverse accessor name from the referenced model back to this model. E.g., `session.messages.all()` works because `related_name='messages'` is set on `ChatMessage.session`.
- **`GeneratorExit`**: A special Python exception raised when a generator is closed/abandoned (e.g., client disconnects mid-stream). Caught to prevent saving incomplete assistant messages to the database.

### Architecture / Database / API Decisions
- **Why a `core/ai_providers/` abstraction?** So that when we integrate real AI APIs (OpenAI, Gemini), we only create a new class implementing `BaseAIProvider`. The service layer (`services.py`) does not need to change — it only calls `provider.stream_response()`.
- **Why `MockAIProvider`?** Allows development and testing without making real API calls (which cost money and require internet). It simulates real streaming with `time.sleep()`.
- **SSE format chosen**: `data: {"type": "chunk", "content": "..."}\n\n` for chunks, `data: {"type": "done"}\n\n` for completion, `data: {"type": "error", "message": "..."}\n\n` for errors. This JSON-in-SSE pattern allows the frontend to parse events easily.
- **Why save user message BEFORE streaming?** If the server crashes mid-stream, at least the user's message is already in the DB. We can recover/retry from there.
- **Why save assistant message ONLY on successful stream completion?** Saving a partial/incomplete response is misleading. Only a complete response should be persisted.
- **Parent message threading**: Each `ChatMessage` has a `parent_message` self-referential FK. User message has no parent. Assistant message's parent is the user message. This creates a clear conversation thread structure.
- **`X-Accel-Buffering: no` header**: Added to `StreamingHttpResponse` to disable Nginx's proxy buffering. Without this, Nginx would buffer the entire stream before sending it, defeating the purpose of real-time streaming.

### Models Implemented
| Model | App | Key Fields |
|---|---|---|
| `User` | authentication | Extends `AbstractUser`, adds `created_at`, `updated_at` |
| `AIModel` | chats | `name`, `slug` (unique), `provider`, `is_active` |
| `ChatSession` | chats | UUID PK, FK to User, FK to AIModel, `title`, `updated_at` |
| `ChatMessage` | chats | UUID PK, FK to Session, `role` (user/assistant/system), `content`, FK to AIModel, self-FK `parent_message` |
| `CompareSession` | compare | For multi-model comparison feature |
| `CompareResultItem` | compare | Individual model responses in comparison |
| `VerifyReview` | verify | For AI answer verification feature |
| `DocumentFile` | documents | For document upload and analysis feature |

### Problems / Issues
- During streaming, a syntax error occurred in the test script due to f-string formatting in the shell command.

### How They Were Solved
- Moved test to a separate `.py` script and ran it with `python manage.py shell`.

### Testing Done
- Verified stream service: 29 chunks received correctly, `done` event fired.
- Verified DB: User and assistant messages saved with correct threading (`parent_message_id` set).

### Important Things I Should Understand
- A generator function does not execute when called — it only executes when iterated. `stream_response()` returns a generator object; iteration starts when `StreamingHttpResponse` consumes it.
- `transaction.atomic()` does NOT work across generator boundaries easily. The atomic block must be fully completed (committed) before the generator starts yielding SSE events to the client.
- The difference between SSE and WebSockets: SSE is one-way (server → client), simpler, works over standard HTTP. WebSockets are bi-directional but more complex to implement.

### Possible Interview Questions

**Q: What is an Abstract Base Class and why did you use it for the AI Provider?**
Answer: An Abstract Base Class (ABC) is like a contract or template. We created `BaseAIProvider` as an ABC that defines two methods: `generate_response` and `stream_response`. Any class that inherits from it MUST implement both methods. We used this because we plan to add real AI providers like Gemini and OpenAI later. By having this contract, we guarantee all providers work the same way — the rest of the code does not need to change when we add a new one.

**Q: Explain how SSE (Server-Sent Events) works and how Django handles it.**
Answer: SSE is a way for the server to send data to the browser continuously over one open connection — like a one-way live channel. The browser opens a connection and the server keeps sending small pieces of text as they become available. In Django, we use `StreamingHttpResponse` with `content_type='text/event-stream'`. We pass a Python generator to it, and Django sends each `yield`ed value to the client immediately instead of waiting for everything to finish.

**Q: What is a Python generator and how does `yield` differ from `return`?**
Answer: A normal function with `return` gives one result and stops. A generator with `yield` can give many results one at a time and pause between each one. For example, in our `stream_response`, we `yield` one word at a time with a small delay. This is perfect for streaming because we send each word to the user as soon as it is ready, instead of waiting for the whole response to be built.

**Q: Why did you use `UUIDField` as a primary key instead of auto-increment integer?**
Answer: Auto-increment IDs go 1, 2, 3, 4... which means anyone can guess the next ID. If a user knows their session ID is 5, they might try to access session 6. UUIDs are long random strings like `a3f7c1d2-...` that are impossible to guess. We used UUID primary keys for `ChatSession` and `ChatMessage` to make the system more secure.

**Q: What does `transaction.atomic()` do and why is it important here?**
Answer: `transaction.atomic()` means: do these database operations together as one unit. If anything fails in the middle, cancel everything and go back to the previous state. We used it when saving the user's message — we want to make sure the message is fully saved in the database BEFORE we start streaming the AI response. If saving fails, we stop and return an error instead of streaming a response for a message that was never saved.

**Q: What happens if the client disconnects mid-stream? How do you handle it?**
Answer: If the user closes the browser or loses internet during streaming, Python raises a special exception called `GeneratorExit`. We catch this in our service and immediately return without saving the assistant's message. This is important because we do not want to save a half-complete AI response to the database — only a fully completed response should be saved.

**Q: Explain `on_delete=models.CASCADE` vs `PROTECT` vs `SET_NULL`.**
Answer: These three options tell the database what to do when a parent record is deleted.
- `CASCADE`: Delete the child records too. Example: if a user is deleted, all their chat sessions are also deleted.
- `PROTECT`: Block the deletion. Example: if you try to delete an AI model that still has active sessions, Django will throw an error and stop you. We used this for `ChatSession.current_model` to protect our data.
- `SET_NULL`: Set the FK field to empty (NULL) instead of deleting. Example: if an AI model is deleted, the messages that used it will still exist but `model_used` will be empty. We used this for `ChatMessage.model_used`.

### Pending / Next Work
- Smart model recommendation engine.

---

## DAY 3 — Smart Model Recommendation Engine
**Approximate Date:** September 11, 2026

### Work Completed
- Implemented `smart_recommendation_service(prompt)` in `apps/chats/services.py`.
- Created `RecommendModelView` API at `POST /api/chats/recommend/`.
- Wired URL in `apps/chats/urls.py` and connected to `config/urls.py`.
- Tested all success and error cases using Django's `APIClient`.

### Technical Concepts Used/Learned
- **Rule-Based Classification**: A deterministic logic system where predefined rules (keyword matches, text length) decide the output. No ML/AI model is used — it is pure Python logic.
- **Deterministic system**: Given the same input, always produces the same output. Important for predictability in recommendation systems.
- **`str.lower()` + `in` operator**: Case-insensitive keyword matching. `'react' in prompt.lower()` will match "React", "REACT", etc.
- **`values_list('slug', flat=True)`**: Django ORM method to get a flat list of a single field from a queryset. More efficient than fetching full model objects when you only need one field.
- **`AllowAny` permission class**: DRF permission that allows any request without authentication. Used temporarily during development. Needs to be replaced with `IsAuthenticated` in production.
- **`APIClient` (DRF test utility)**: A test HTTP client that simulates requests to Django views without needing a running HTTP server. Used for automated testing in the Django shell.

### Architecture / Database / API Decisions
- **Why rule-based instead of AI-based?** During development phase, rule-based is: zero cost (no API calls), zero latency, and fully testable. Future upgrade path is clear — just replace the function body with an LLM classifier call.
- **Why query the DB for active models instead of hardcoding slugs?** If an AI model is deactivated in the DB (`is_active=False`), the recommendation engine should automatically stop recommending it. Querying the DB ensures the recommendations always reflect the current model registry state.
- **Recommendation priority order**:
  1. Claude 3.5 Sonnet — coding, creative writing
  2. Gemini 1.5 Pro — long documents, summarization
  3. GPT-4o — default fallback (general reasoning, math, logic)
- **`AllowAny` + TODO comment**: Since JWT auth was not yet implemented, `AllowAny` was used temporarily. A clear `TODO (Day 14)` comment was added in the code to signal when to harden it.
- **Return format**: `{"recommended_model": "<slug>", "reason": "<explanation>"}` — The `reason` field is important for UX (frontend can show the user WHY a model was recommended).

### API Endpoints Added
| Endpoint | Method | Description |
|---|---|---|
| `/api/chats/recommend/` | POST | Returns best model for a given prompt |

### Problems / Issues
- No significant issues encountered.

### How They Were Solved
- N/A

### Testing Done
| Prompt | Expected Model | Result |
|---|---|---|
| "How do I write a react component?" | `claude-3-5-sonnet` | ✅ PASS |
| "Summarize this document please." | `gemini-1.5-pro` | ✅ PASS |
| "Solve this math equation." | `gpt-4o` | ✅ PASS |
| "Just saying hi!" | `gpt-4o` | ✅ PASS |
| Empty prompt `""` | `400 Bad Request` | ✅ PASS |
| Missing `prompt` field | `400 Bad Request` | ✅ PASS |

### Important Things I Should Understand
- A deterministic system is easier to debug and test than a probabilistic one (ML model) because you can trace exactly WHY a decision was made.
- Querying the DB in a recommendation function adds a small latency overhead. For performance-critical systems, this could be cached using Redis. (Noted as future optimization.)
- The extensibility of this approach: to add a new rule, just add one line. To replace the entire logic with an LLM, just rewrite the function body. The API contract (`recommended_model`, `reason`) stays the same.

### Possible Interview Questions

**Q: How does your recommendation engine decide which model to pick?**
Answer: It reads the user's prompt and checks for specific keywords. If the prompt contains words like "react", "python", "code", or "debug", it recommends Claude 3.5 Sonnet because that model is good at coding. If the prompt contains "summarize" or "document", it recommends Gemini 1.5 Pro because it handles long text well. For everything else, it defaults to GPT-4o. Before making any recommendation, it first checks the database to confirm that model is currently active.

**Q: Why did you choose rule-based over machine learning for this feature?**
Answer: Machine learning models cost money to run and need internet. Rule-based logic is free, works offline, and is very fast. Also, for this stage of the project, simple keyword matching is accurate enough. The code is written in a way that if we want to switch to an AI-based classifier in the future, we only need to change the inside of one function — the rest of the system stays the same.

**Q: What is the trade-off between querying the DB every time vs. caching model data?**
Answer: Querying the DB every time means we always get the most up-to-date list of active models — if someone deactivates a model, it stops being recommended immediately. The downside is a small delay (one extra DB query per request). Caching would be faster, but cached data can become outdated. For now, querying every time is the right choice since we don't have very high traffic yet.

**Q: How would you extend this system to support a new AI model in the future?**
Answer: Two steps. First, add the new model to the `ai_models` table in the database with its slug and set `is_active=True`. Second, in `smart_recommendation_service`, add a new keyword list and a check for that model's slug. That's it. The rest of the system automatically starts recommending it.

**Q: What is `AllowAny` in Django REST Framework? When should it be used?**
Answer: `AllowAny` is a permission setting that lets anyone call the API without logging in. We used it temporarily because we have not built the login/authentication system yet. We added a `TODO` comment in the code to remind us to change it to `IsAuthenticated` when we build the auth system in Day 14. It should only be used during development — never in a live production system for sensitive data.

### Pending / Next Work
- Session management APIs.
- Conversation persistence.
- E2E ASK flow testing.

---

## DAY 4 — Session Management, Conversation Persistence, E2E Testing
**Date:** September 11, 2026

### Work Completed
- Designed and implemented `AnonymousClient` model for temporary session ownership.
- Added `anonymous_client` ForeignKey to `ChatSession`.
- Created and ran migration `0002` — added `anonymous_clients` table + FK column.
- Implemented `ChatSessionView` (`POST` create, `GET` list) with `X-Client-Token` ownership.
- Implemented `ChatSessionDetailView` (`GET` single session with ownership check).
- Implemented `ConversationHistoryView` (`GET` all messages for a session with ownership).
- Updated `stream_chat_response_service` to accept and validate `client_token`.
- Added `_get_anonymous_client()` helper to `views.py` for DRY token validation.
- Added all new URL patterns to `apps/chats/urls.py`.
- Ran complete E2E test: Session create → Stream → History fetch — all passed.

### Technical Concepts Used/Learned
- **Anonymous Ownership Pattern**: A temporary identity mechanism where a browser/client gets a unique UUID token (stored in their localStorage) that acts as their identity before proper authentication exists. One token → multiple sessions.
- **One-to-Many Relationship**: `AnonymousClient` (1) → `ChatSession` (Many). One anonymous client can own multiple chat sessions. This is modeled by a ForeignKey from `ChatSession` to `AnonymousClient`.
- **Custom HTTP Headers**: `X-Client-Token` is a custom request header (starts with `X-`). In Django views, it's accessed via `request.headers.get('X-Client-Token')`. In DRF's `APIClient`, it's passed as `HTTP_X_CLIENT_TOKEN` (Django's header normalization convention).
- **Double-filter ownership check**: `ChatSession.objects.get(id=session_id, anonymous_client=client)` — if EITHER the session doesn't exist OR the client doesn't own it, Django raises `DoesNotExist` and we return `404`. This is intentional: we don't leak whether the session exists at all.
- **`select_related()`**: Django ORM optimization that performs a SQL JOIN instead of separate queries. `ChatMessage.objects.filter(...).select_related('model_used', 'parent_message')` fetches related objects in one DB query instead of N+1 queries.
- **N+1 Query Problem**: If you iterate over 100 messages and access `m.model_used.slug` without `select_related`, Django makes 1 query for the messages + 100 queries for each model. `select_related` collapses this into 1 query.
- **`update_fields=['field1', 'field2']`**: Optimization for `session.save()`. Only updates the specified columns in SQL instead of all columns. Better performance and avoids accidentally overwriting other fields.
- **`get_or_create()` pattern vs explicit create**: When a client sends their existing token, we fetch the `AnonymousClient`. When no token is sent (first visit), we create a new one. This was implemented with an explicit `if/else` for clarity.
- **Additive migration**: The migration `0002` only ADDS new tables/columns. It does not drop or modify existing data. Existing `ChatSession` rows got `anonymous_client_id = NULL` (since the new FK is nullable). This is the safe way to add columns to tables with existing data.

### Architecture / Database / API Decisions
- **Why not put `session_token` on each `ChatSession` (original rejected approach)?** If each session had its own token, a client would need to remember a separate token for each session. That makes listing "all my sessions" impossible without knowing all tokens. One token per *client* (not per session) solves this.
- **Why `AnonymousClient` as a separate model (not just a field)?** It cleanly separates the identity (who the client is) from the data (what sessions they have). It also makes the Day 14 migration to JWT much cleaner — just populate `ChatSession.user`, and the `anonymous_client` FK can be deprecated.
- **Why return `404` for wrong token (not `403 Forbidden`)?** Security best practice: returning `403` would confirm that the resource EXISTS but you don't have access. `404` gives no information — the attacker doesn't know if the session ID is valid or not. This is called "security through obscurity" at the API response level.
- **`select_related` in History view**: Since history could have many messages, N+1 queries would be a performance problem. `select_related('model_used', 'parent_message')` ensures we always use exactly 1 SQL query regardless of message count.
- **`_get_anonymous_client()` helper function**: Repeated ownership validation logic was extracted into a private helper to follow DRY (Don't Repeat Yourself) principle. It returns `(client, None)` on success and `(None, error_response)` on failure — the caller just checks `if error: return error`.

### API Endpoints Added
| Endpoint | Method | Auth Header | Description |
|---|---|---|---|
| `/api/chats/sessions/` | POST | Optional `X-Client-Token` | Create new session |
| `/api/chats/sessions/` | GET | Required `X-Client-Token` | List client's sessions |
| `/api/chats/sessions/<uuid>/` | GET | Required `X-Client-Token` | Single session detail |
| `/api/chats/sessions/<uuid>/history/` | GET | Required `X-Client-Token` | All messages for session |

### Problems / Issues
1. **Migration conflict**: `makemigrations` initially failed because `urls.py` was accidentally empty (placeholder text), causing Django's URL check to fail during the migration pre-check.
2. **Multi-line shell command**: PowerShell could not handle a complex multi-line Python test script passed via `manage.py shell -c "..."`.

### How They Were Solved
1. Restored `urls.py` with correct content, then ran `makemigrations` again — succeeded.
2. Moved the E2E test to a standalone `test_e2e_ask.py` file, ran it with `python test_e2e_ask.py`, then deleted it after successful test.

### Testing Done
**Session Management Tests:**
| Test | Result |
|---|---|
| First client creates session (no token) → gets 201 + new token | ✅ PASS |
| Same client creates second session with existing token → same token returned | ✅ PASS |
| Client lists sessions → only their own 2 sessions returned | ✅ PASS |
| Different client tries to access first client's session detail | ✅ 404 PASS |
| Missing `X-Client-Token` header | ✅ 400 PASS |
| Invalid/unknown token | ✅ 404 PASS |

**Full E2E ASK Flow:**
| Step | Result |
|---|---|
| Session created (201) | ✅ PASS |
| 29 chunks streamed, `done` event received | ✅ PASS |
| History returned 2 messages in correct order | ✅ PASS |
| Assistant message threaded to user message via `parent_message_id` | ✅ PASS |
| Streamed content exactly matches saved content | ✅ PASS |
| Different client blocked from history (404) | ✅ PASS |
| Missing token blocked (400) | ✅ PASS |

### Important Things I Should Understand
- The `AnonymousClient` approach is a **temporary bridge** — in production, user authentication (JWT) will replace it. The code is designed so this replacement is a one-line filter change.
- `select_related` is for ForeignKey and OneToOne relations. For ManyToMany, use `prefetch_related` instead.
- Django's header normalization: `X-Client-Token` in the request becomes `HTTP_X_CLIENT_TOKEN` in Django's `request.META` and `X-Client-Token` in `request.headers`. The `request.headers` dict is the modern, preferred way.
- Always return `404` (not `403`) when you don't want to reveal whether a resource exists. This is a standard API security practice.
- `update_fields` in `session.save(update_fields=[...])` is critical for performance in high-traffic systems — it generates `UPDATE ... SET field1=val WHERE id=...` instead of updating every column.

### Possible Interview Questions

**Q: How does your anonymous session ownership work? How will you replace it with JWT auth?**
Answer: When a user visits for the first time and creates a session, we create a new `AnonymousClient` record in the database and return a unique `client_token` UUID. The user's browser saves this token. Every time they make a request, they send this token in the `X-Client-Token` header. We use this token to find their `AnonymousClient` record and then show only their sessions. When JWT authentication is added in Day 14, we will populate the `user` FK on `ChatSession` and switch the filter from `anonymous_client__client_token=token` to `user=request.user`. It is a one-line change.

**Q: What is the N+1 query problem? How did you solve it in the history endpoint?**
Answer: N+1 problem means: if you fetch 50 messages, and then for each message you access a related object (like the AI model name), Django makes 1 query for the messages plus 50 more queries for the AI model of each message — total 51 queries. This is slow. We solved it by using `select_related('model_used', 'parent_message')` which tells Django to fetch all related data in one SQL query using a JOIN. So instead of 51 queries, we make just 1.

**Q: Why do you return `404` instead of `403` when a client tries to access another client's session?**
Answer: `403 Forbidden` tells the attacker "this resource exists but you cannot access it." That leaks information. `404 Not Found` says "I don't know what you're talking about" — which gives the attacker nothing useful. They cannot tell if the session ID is real or fake. This is a standard security practice: do not confirm the existence of a resource to an unauthorized user.

**Q: What is the DRY principle? Give an example from your code.**
Answer: DRY stands for "Don't Repeat Yourself." It means if you write the same logic in multiple places, put it in one shared function instead. In our code, every view that needs to read the `X-Client-Token` header and validate it was doing the same steps. We extracted all of that into a single helper function called `_get_anonymous_client()`. Now all four views just call this one function instead of repeating the same code.

**Q: Explain the difference between `select_related` and `prefetch_related`.**
Answer: Both are Django tools to avoid the N+1 problem, but they work differently. `select_related` is used for ForeignKey and OneToOne relationships — it does a SQL JOIN and fetches everything in one query. `prefetch_related` is used for ManyToMany relationships — it does a separate query but combines the results smartly in Python. In our history view, we used `select_related` because `model_used` and `parent_message` are both ForeignKeys.

**Q: What is an additive migration? Why is it safer than a destructive migration?**
Answer: An additive migration only adds new things to the database — new tables or new columns. It does not change or delete existing data. Our migration `0002` added the `anonymous_clients` table and the `anonymous_client_id` column to `chat_sessions`. Existing session rows were not touched — the new column just got `NULL` value. A destructive migration (dropping columns or renaming tables) is risky because it can cause data loss. Always prefer additive migrations.

**Q: How does `transaction.atomic()` help in maintaining data consistency?**
Answer: It ensures that a group of database operations either ALL succeed or NONE of them happen. In our streaming service, we use it when saving the user's message. If something fails (like a database connection error), the transaction rolls back and nothing is partially saved. This prevents situations where a half-written record exists in the database, which could cause bugs later.

**Q: What custom HTTP headers did you use and why?**
Answer: We used `X-Client-Token` — a custom header (custom headers start with `X-` by convention). We used it to pass the anonymous client's identity token from the frontend to the backend on every request. We also set two response headers on streaming responses: `Cache-Control: no-cache` to tell the browser not to cache the stream, and `X-Accel-Buffering: no` to tell Nginx (web server) not to buffer the stream and instead send data to the client immediately as it arrives.

### Pending / Next Work
- Day 5: Compare backend — service, APIs, and testing.

---

## DAY 5 — Compare Backend Foundation
**Date:** September 14, 2026

### Work Completed
- Implemented `run_compare_service(prompt, model_slugs)` in `apps/compare/services.py`.
- Implemented `CompareRunView` (POST) and `CompareResultView` (GET) in `apps/compare/views.py`.
- Wrote `apps/compare/urls.py` with 2 URL patterns.
- Included `/api/compare/` in `config/urls.py`.
- Ran automated tests (8 cases) — all passed.
- Ran manual API testing via Postman/Thunder Client — all passed.

> **Note:** `CompareSession` and `CompareResultItem` models were already created in Day 2 and migration `0001_initial` was already applied. Day 5 only added the service and API layer on top.

### Technical Concepts Used/Learned
- **Sequential execution across multiple models**: The compare service loops through each model one by one, calls `provider.generate_response()`, and saves the result. This is simple and predictable. (Future: could be parallelised with Python threads or async, but sequential is fine for now.)
- **Per-model failure handling**: If one model's API call fails (raises an exception), we catch the error for that model, mark its `CompareResultItem` with `status='failed'`, and continue running the remaining models. This means a compare session can partially succeed.
- **`isinstance(model_slugs, list)`**: Used to validate that the incoming JSON field is actually a list, not a string or other type. This is important because JSON can send `"model_slugs": "gpt-4o"` (a string) instead of `["gpt-4o"]` (a list) — they look different but DRF accepts both as `request.data` values.
- **`select_related('model')` in result fetch**: `CompareResultItem` has a FK to `AIModel`. When building the response, we access `r.model.slug` for each result. Without `select_related`, this causes an N+1 query. `select_related('model')` fetches all results + their models in one SQL JOIN.
- **`status=HTTP_201_CREATED`**: Used for the run endpoint because a new `CompareSession` resource is being created. `201` is the correct REST status for resource creation (vs `200` which means success on an existing resource).
- **ValueError as a signal between service and view**: The service raises `ValueError` with a clear message when a model slug is invalid. The view catches `ValueError` specifically and returns `400 Bad Request`. Generic `Exception` is caught separately and returns `500`. This separation gives the caller precise control over the response.

### Architecture / Database / API Decisions
- **Why reuse existing models without changes?** `CompareSession` and `CompareResultItem` were designed in Day 2 with all required fields: `prompt`, `response_text`, `latency_ms`, `token_count`, `status`, `user_rating`. No new fields were needed for Day 5's scope.
- **Why validate models before creating the session?** We resolve all model slugs to actual `AIModel` objects first, before creating the `CompareSession`. If any slug is invalid, we raise a `ValueError` immediately without writing anything to the database. This avoids creating an empty/orphaned session.
- **Why use `transaction.atomic()` for session creation only?** Only the session creation needs to be atomic — it must succeed as a unit. The individual `CompareResultItem` saves are done one-by-one after, with per-model error handling. This means a failed model result does not roll back the entire session.
- **Why no ownership validation on Compare (unlike ASK)?** The decision was made explicitly: `AnonymousClient` ownership was not added to `CompareSession` in Day 5. Authentication and ownership for both ASK and Compare will be added together in Day 14 when JWT is implemented.
- **`AllowAny` + TODO comment**: Same pattern as ASK — temporary permission for development, with a clear `TODO (Day 14)` comment marking where to switch to `IsAuthenticated`.
- **Two endpoints, not one**: `POST /api/compare/run/` creates and immediately returns results. `GET /api/compare/<id>/` fetches a previously saved session. This separation means the frontend can re-fetch results anytime without re-running the compare.

### API Endpoints Added
| Endpoint | Method | Description |
|---|---|---|
| `/api/compare/run/` | POST | Run prompt across multiple models, returns results |
| `/api/compare/<uuid>/` | GET | Fetch a previously run compare session |

### Problems / Issues
- No significant issues encountered. Existing model structure from Day 2 was correctly designed and matched Day 5's requirements without any changes.

### How They Were Solved
- N/A

### Testing Done
**Automated tests (8 cases via `APIClient`):**
| Test | Result |
|---|---|
| 3-model compare → 201 + correct results | ✅ PASS |
| `latency_ms` and `token_count` captured per model | ✅ PASS |
| Missing `prompt` → 400 | ✅ PASS |
| Empty/whitespace `prompt` → 400 | ✅ PASS |
| Only 1 model (minimum 2 required) → 400 | ✅ PASS |
| Invalid model slug → 400 | ✅ PASS |
| `model_slugs` is string not list → 400 | ✅ PASS |
| GET nonexistent session → 404 | ✅ PASS |

**Manual API test (Postman/Thunder Client):**
- `POST /api/compare/run/` with 3 models tested and verified in browser.

### Important Things I Should Understand
- `CompareResultItem.status` has three possible values: `pending` (not yet run), `completed` (success), `failed` (error). Currently all results either complete or fail — `pending` would be used if we add async/background task processing in the future.
- `transaction.atomic()` here wraps only the session creation. If we wrapped the entire service (including all result saves), then a failure in any one model would roll back the whole session and lose all previous results. The current design intentionally keeps results independent.
- The `user_rating` field exists on `CompareResultItem` but is always `null` for now. It is there for when the frontend adds a "rate this response" feature — the backend is already ready.
- This Compare service uses `generate_response()` (full completion), not `stream_response()` (streaming). Comparison is run once and all results are returned together. Streaming multiple models simultaneously would need a very different architecture.

### Possible Interview Questions

**Q: How does your compare feature work at the backend level?**
Answer: The frontend sends a POST request with a prompt and a list of model slugs (minimum 2). Our service first checks that all the requested models exist and are active in the database. Then it creates a `CompareSession` to record the prompt. After that, it runs the prompt through each model one by one, measures the time taken (latency), and saves each model's response as a `CompareResultItem` linked to that session. Finally, all results are returned in one response.

**Q: What happens if one of the AI models fails during a compare run?**
Answer: We handle each model's call inside a try/except block. If one model fails, we save that result with `status='failed'` and continue to the next model. The compare session is not cancelled. This means if you compare 3 models and 1 fails, you still get 2 successful results back instead of losing everything.

**Q: Why did you validate model slugs before creating the CompareSession?**
Answer: If we created the session first and then found an invalid model, we would have an empty, useless session in the database. By checking all models first and raising a `ValueError` if any are invalid, we make sure the database only gets clean, valid data. No session is created if the input is wrong.

**Q: Why is the run endpoint `201 Created` instead of `200 OK`?**
Answer: `200 OK` means the request succeeded and here is some data. `201 Created` means the request succeeded AND a new resource was created in the database. Since our run endpoint creates a new `CompareSession` record, `201` is the correct and more accurate status code.

**Q: Why use `select_related` when fetching compare results?**
Answer: Each `CompareResultItem` has a link (ForeignKey) to an `AIModel`. When we loop through the results and access the model's slug (`r.model.slug`), without `select_related`, Django would make a separate database query for each result to get the model name. If there are 5 results, that is 6 total queries (1 for results + 5 for models). `select_related('model')` fetches everything in one query using a SQL JOIN.

**Q: How do you separate input validation errors from server errors in your API?**
Answer: In the view, we catch `ValueError` (which the service raises for things like invalid model slugs) and return `400 Bad Request` — because it is the client's fault. We separately catch all other `Exception` types and return `500 Internal Server Error` — because that is an unexpected server problem. This way the frontend knows exactly whether it sent bad data or whether the server crashed.

### Pending / Next Work
- Day 6: Compare Core Logic (Covered & Reviewed).

---

## DAY 6 — COMPARE Core Logic
**Date:** September 14, 2026

### Work Completed
- Reviewed backend architecture against Day 6 requirements (sending the same prompt to multiple models & storing structured results).
- Confirmed that Day 5's `run_compare_service` implementation already fully satisfies Day 6 core requirements.
- Validated that sequential execution and database persistence are working perfectly as expected without needing unnecessary optimizations.
- Marked Day 6 as completed based on existing robust implementation.

### Technical Concepts Used/Learned
- **Scope Management & Over-delivery**: Identifying when a feature requirement has already been met by a well-designed foundation. Our Day 5 service was generic and robust enough that it naturally fulfilled Day 6 requirements without additional code.
- **YAGNI (You Aren't Gonna Need It)**: A software development principle. We decided not to implement parallel execution (multi-threading) because the current sequential approach works reliably and meets all immediate requirements. Adding complexity before it is strictly needed is an anti-pattern.

### Architecture / Database / API Decisions
- **Why sequential execution is currently used (instead of parallel)?** 
  Sequential execution loops through each model one by one. It is much easier to debug, test, and maintain. If one model fails, we gracefully catch the error and move to the next. Parallel execution (like using threads or async) introduces race conditions, complex error handling, and harder-to-trace logs. For our current scale and mock provider setup, sequential is perfectly adequate and highly reliable.

### Problems / Issues
- No coding issues. The only "issue" was realizing the scheduled work was already done, requiring a review of scope to ensure we don't write unnecessary code.

### How They Were Solved
- Codebase review confirmed requirements were met. Decision made to accept existing sequential execution and avoid premature optimization.

### Testing Done
- Relying on the 8 automated API tests and manual tests completed during Day 5, which verified that multiple models receive the prompt and return structured results properly.

### Important Things I Should Understand
- It is common in software development to accidentally complete future ticket requirements while building a solid foundation. Recognizing this saves time and prevents over-engineering.
- The existing `CompareSession` and `CompareResultItem` models are fully handling the structured comparison results exactly as intended.

### Possible Interview Questions

**Q: In your compare feature, do you call the AI models sequentially or in parallel, and why?**
Answer: We call the models sequentially, meaning one after the other. We chose this because it is simple, reliable, and very easy to debug. If we called them in parallel using threads, it would add a lot of complexity to error handling and database connections. For our current needs, the sequential approach works perfectly without overcomplicating the code.

**Q: What is the YAGNI principle and how did you apply it?**
Answer: YAGNI stands for "You Aren't Gonna Need It." It means you shouldn't add features or optimizations to your code until they are actually required. We could have written complex multi-threading code to make the compare feature run in parallel, but we applied YAGNI. We decided the simpler sequential loop was good enough for now, and we avoided adding unnecessary complexity.

**Q: How did you ensure the structured comparison results are stored properly?**
Answer: We created two specific database tables. First, a `CompareSession` table that saves the user's prompt. Second, a `CompareResultItem` table linked to the session. As the system gets a response from each AI model, it creates a new record in the result table storing the model name, the exact text response, the time it took (latency), and the token count.

### Pending / Next Work
- Day 7: (As per 15-day plan — next features)

---

## File Location
**This log is maintained at:**
`aether-ai-backend/docs/WORK_LOG.md`

**Update policy:** This file must be updated at the end of every development day with actual technical work done. No assumptions, no placeholder content.

---

## DAY 7 & 8 — COMPARE UI Integration & Reliability
**Date:** September 16, 2026

### Work Completed
- Integrated frontend Compare UI with backend Compare API.
- Implemented useCompare.ts hook for state management.
- Implemented ComparisonGrid.tsx and ComparisonCard.tsx.
- Updated compareService.ts to call backend POST /api/compare/run/ instead of returning mock data.

### Technical Concepts Used/Learned
- **React State Management**: Managing complex async states for multiple models simultaneously.
- **Error Handling**: Gracefully displaying per-model failures in the UI.

### Testing Done
- Verified end-to-end Compare initiation from UI.
- Confirmed sequential execution works reliably across multiple models.

---

## DAY 9, 10 & 11 — VERIFY Core Flow (End-to-End)
**Date:** September 19, 2026

### Work Completed
- Created pps/verify Django app.
- Implemented VerifyResult model (no migrations needed as per rules).
- Built pps/verify/services.py to handle verification logic (sending answers to a review model).
- Built VerifyFromMessageView and VerifyFromCompareView in pps/verify/views.py.
- Registered pps/verify/urls.py.
- Integrated frontend useVerify.ts and erifyService.ts to connect the UI to the backend endpoints.
- Connected the full ASK → COMPARE → VERIFY flow end-to-end.

### Technical Concepts Used/Learned
- **Cross-App Communication**: Verify mode takes inputs from both chats and compare apps.
- **AI-as-a-Judge**: Using an LLM to evaluate the output of another LLM.

### Testing Done
- Verified POST /api/verify/from-message/<id>/ returns correctly formatted verification data.
- Verified POST /api/verify/from-compare/<id>/ returns correctly formatted verification data.
- E2E flow verified: User asks a question -> compares models -> verifies the best answer.

## Day 12 — File Upload & File Analysis
**Date:** 2026-09-21
**Status:** ✅ COMPLETE — All E2E tests passed

---

### Work Completed

#### Step 1 — Backend File Upload Foundation
- Created `apps/documents/serializers.py` with `DocumentUploadSerializer`.
  - Validates file type (only `.txt`, `.pdf` allowed).
  - Validates file size (max 10 MB).
  - Saves `DocumentFile` linked to the provided `ChatSession`.
- Implemented `DocumentUploadView` in `apps/documents/views.py`.
  - Accepts `multipart/form-data` with `file` and `session_id` fields.
  - Validates session ownership using existing `AnonymousClient` / `X-Client-Token` flow.
  - Returns only safe fields: `document_id`, `original_name`, `file_size`, `file_type`, `processing_status`.
- Added the upload route `api/documents/upload/` in `apps/documents/urls.py`.
- Registered `documents` app URL config in `config/urls.py`.

#### Step 2 — Backend Text Extraction
- Created `apps/documents/utils.py` with two private extraction functions:
  - `_extract_text_from_txt(file_path)` — reads UTF-8, falls back to Latin-1.
  - `_extract_text_from_pdf(file_path)` — uses pre-installed `pypdf` library.
  - Public entry point: `extract_text_from_file(file_path)` — routes by extension.
- Updated `DocumentUploadView` to call extraction immediately after file save.
  - Sets `processing_status = 'processing'` during extraction.
  - On success: saves `extracted_text` and sets `processing_status = 'completed'`.
  - On failure: sets `processing_status = 'failed'`, logs the error, does not crash the request.

#### Step 3 — Backend Prompt Context Injection
- Imported `DocumentFile` model into `apps/chats/services.py`.
- Updated `stream_chat_response_service()` signature to accept optional `document_id`.
- After session validation, added document validation block:
  - Fetches `DocumentFile` only if `document_id` is provided.
  - Verifies the document belongs to the same `ChatSession` (prevents cross-session access).
  - Returns a proper streaming SSE error if: document not found, processing failed, or still processing.
- Built `ai_prompt` internally:
  - If `document_context` exists: `"Document Context:\n\n{text}\n\nUser Question: {prompt}"`.
  - If no document: passes the original `prompt` unchanged.
- Updated `StreamChatResponseView` in `apps/chats/views.py` to accept `document_id` from request body and pass it to the service.

#### Step 4A — Frontend Document Upload
- Updated `SendMessageOptions` interface in `src/services/chat/chatService.ts` to add optional `documentId?: string`.
- Inside `sendMessage()`, after session creation, added upload block:
  - Builds `FormData` with `file` and `session_id`.
  - Sends `POST /api/documents/upload/` with `X-Client-Token`.
  - Does NOT manually set `Content-Type` — lets the browser set the multipart boundary automatically.
  - On failure: throws a descriptive error, handled by existing UI error catch in `useAskChat.ts`.
  - On success: extracts `document_id` and passes it forward into `aiService.generateChatResponse`.

#### Step 4B — Pass document_id to Chat Stream
- Updated `generateChatResponse()` in `src/services/ai/aiService.ts`.
- Changed `payload` type to `any` for dynamic field support.
- Added conditional: `if (options?.documentId) { payload.document_id = options.documentId; }`.
- Text-only requests are completely unchanged — no `document_id` is added.

---

### Technical Concepts Used / Learned

- **`multipart/form-data`** — How file uploads work over HTTP. The browser automatically sets the `Content-Type` header with the correct `boundary` string; manually setting it will break the upload.
- **BOM (`\ufeff`)** — Some text files saved on Windows include a Byte Order Mark at the start. Python's `utf-8-sig` encoding strips it automatically.
- **Server-Sent Events (SSE)** — The streaming response format used by the backend. Each event is a line starting with `data: ` followed by a JSON string.
- **`pypdf`** — The pre-installed Python library used for PDF text extraction. Uses `PdfReader` and `page.extract_text()`.
- **`FormData` in JavaScript** — A browser API to construct multipart form data. Used in `chatService.ts` to build the file upload request.
- **Context Injection** — The document's extracted text is combined with the user's prompt **server-side**, injected as a prefix, and passed to the AI provider. The frontend never sees the document text.

---

### Architecture / DB / API Decisions

- **`extracted_text` is never exposed to the frontend.** The upload API returns only `document_id`, `original_name`, `file_size`, `file_type`, and `processing_status`.
- **Document context is injected server-side**, inside `stream_chat_response_service()`. This means even if someone intercepts the SSE stream, they only see the AI response, not the raw document content.
- **`extracted_text` is NOT stored inside `ChatMessage.content`.** Only the user's original prompt is saved, keeping the history clean.
- **Extraction is synchronous** for now — it happens immediately after upload. This is acceptable for small files (`.txt`, `.pdf`). For large files in production, this would be moved to a Celery background task.
- **`document_id` is optional** in both the backend service and the frontend. This guarantees 100% backward compatibility with all existing chat functionality.
- **Session-scoped document access** — When the frontend sends `document_id`, the backend verifies `DocumentFile.session == ChatSession`. A document from a different session returns an error, preventing unauthorized access.

---

### Problems / Issues

| Problem | How Solved |
|---|---|
| Test file had a BOM character (`\ufeff`) which caused `print()` to crash on Windows | Used Python's `utf-8-sig` encoding (strips BOM) for reading, and `io.TextIOWrapper` with `errors='replace'` for the test script stdout |
| `django.setup()` fails when running scripts from outside the project directory | Used `python manage.py shell -c "..."` instead of standalone scripts |
| Browser E2E tests blocked (Playwright CDN 404 error) | Replaced with direct API E2E test using the `requests` library, covering all the same assertions |
| Extraction might fail silently | Added `try/except` in the view — on error, `processing_status` is set to `'failed'` and a clear error message is returned when the user tries to use that document |

---

### Testing

| Test | Method | Result |
|---|---|---|
| File Upload (`POST /api/documents/upload/`) | `requests` library, direct API call | ✅ PASS — 201, `document_id` returned, no `extracted_text` in response |
| File-based ASK (`document_id` injected into stream) | `requests` library, streaming SSE | ✅ PASS — Document context confirmed in AI prompt prefix |
| Normal ASK (no file) | `requests` library, streaming SSE | ✅ PASS — Existing prompt sent unchanged, `document_id` absent |
| Chat History (`GET /api/chats/sessions/<id>/history/`) | `requests` library, direct API call | ✅ PASS — Messages contain only user prompts, no `extracted_text` leak |
| Cross-session document access | Unit test in `manage.py shell` | ✅ PASS — Returns `"Document not found or does not belong to this session."` |
| Failed extraction document | Unit test in `manage.py shell` | ✅ PASS — Returns `"The uploaded document failed to process correctly."` |
| `python manage.py check` | Django system check | ✅ 0 issues |
| TypeScript build check | `npx tsc --noEmit` | ✅ 0 errors |

---

### Important Things I Should Understand

1. **Why is `Content-Type` NOT set manually for file uploads?**
   When using `FormData`, the browser automatically adds the `Content-Type: multipart/form-data; boundary=...` header with the correct `boundary`. If you manually set `Content-Type: multipart/form-data` without the boundary, the server cannot parse the body and the upload fails.

2. **Why is `extracted_text` never returned to the frontend?**
   Security and efficiency. The document may contain sensitive information. The frontend only needs to know the upload succeeded (via `document_id`). The actual content is only used server-side, internally.

3. **Where is the document context added?**
   In `apps/chats/services.py`, inside `stream_chat_response_service()`. It builds a formatted string: `"Document Context:\n\n{text}\n\nUser Question: {prompt}"` and passes it as `ai_prompt` to the provider.

4. **What happens if the user sends `document_id` without a file ever being uploaded?**
   The backend does `DocumentFile.objects.get(id=document_id, session=session)` — if it doesn't exist or belongs to a different session, it returns an SSE error event. The request never reaches the AI provider.

5. **Why is the user message saved with only the original prompt, not the context?**
   Because `ChatMessage.content` is populated from the `prompt` argument, which is the user's original text. The `ai_prompt` (with context appended) is only used to call the provider — it is not persisted. This keeps the chat history readable.

---

### Possible Interview Questions & Simple English Answers

**Q: How does your file upload work?**
> The user picks a file in the frontend. When they send a message, the frontend first calls `POST /api/documents/upload/` with the file and the session ID. The backend validates the file, saves it to disk, extracts the text, and stores it in the database. It returns a `document_id` to the frontend. Then the frontend includes that `document_id` in the chat stream request.

**Q: Why doesn't the frontend receive the extracted text?**
> Because we don't want to expose the document content to the browser. The backend uses the stored text internally to build the AI prompt. The frontend only needs the `document_id` — a reference — not the actual content.

**Q: What is `multipart/form-data` and when do you use it?**
> It is an HTTP encoding format used for uploading files. When you want to send both text fields and binary file data in a single HTTP request, you use `multipart/form-data`. Each "part" has its own content type and is separated by a boundary string. Regular JSON requests can't handle raw file bytes.

**Q: How do you prevent one user from accessing another user's documents?**
> When the stream request arrives with a `document_id`, the backend fetches the `DocumentFile` using both the `id` AND the `session` together: `DocumentFile.objects.get(id=document_id, session=session)`. The `session` itself is already validated against the `X-Client-Token` of the requesting user. So if the document belongs to a different session, the query finds nothing and returns an error.

**Q: What is context injection in an AI system?**
> Context injection means adding extra information to the AI's prompt so it can answer questions about it. In our case, instead of sending just the user's question, the backend builds a bigger prompt that includes the document text first, then the user's question. The AI reads both and answers based on the document.

**Q: How does your system handle a failed extraction?**
> During upload, if text extraction throws an exception, the backend sets `processing_status = 'failed'` and saves the `DocumentFile` without `extracted_text`. Later, if the user tries to ask a question with that `document_id`, the backend checks the status and returns a clear error: `"The uploaded document failed to process correctly."` The stream never reaches the AI provider.

**Q: What is a BOM and why can it cause issues?**
> BOM stands for Byte Order Mark. It is an invisible character (`\ufeff`) that some programs (like Windows Notepad) put at the very beginning of UTF-8 text files to indicate the encoding. If your code reads the file without stripping it, the BOM appears as a garbage character in the extracted text. Python's `utf-8-sig` encoding automatically removes it.

---

### Pending / Next Work

- **Day 13** — Conversation hardening: proper session management, error recovery, and edge case handling across ASK, Compare, and Verify flows.
- **Future** — Move file extraction to a Celery background task for large files (currently synchronous, acceptable for small files).
- **Future** — Support additional file types (`.docx`, `.csv`, `.png` via OCR).
- **Future (Day 14)** — Replace `AllowAny` with `IsAuthenticated` across all API endpoints.
- **Future** — Add file size/type validation on the frontend (before upload) to give instant user feedback.

---

## DAY 14 — Hardening & Reliability Review
**Date:** September 21, 2026

### Work Completed
- Conducted a comprehensive hardening and reliability review across the entire codebase.
- Reviewed streaming interruption handling (`GeneratorExit` aborts successfully).
- Reviewed AI/provider failure handling (fails safely without database corruption).
- Reviewed Verify edge cases (`get_object_or_404` and `ValueError` mapping handles missing parents).
- Reviewed file upload validation (10MB size limit) and extraction failures (`processing_status = 'failed'`).
- Reviewed anonymous client/token ownership.
- Reviewed cross-session access protection (`session__anonymous_client` DB filters).
- Reviewed empty/malformed requests (frontend and backend 400 validations).
- Reviewed frontend race-condition handling (`AbortController`).
- Identified a critical Compare performance issue in the actual code (sequential model execution).
- Implemented `ThreadPoolExecutor` concurrency in `run_compare_service` to run AI calls in parallel.
- Added duplicate model slug handling in Compare.
- Preserved per-model failure isolation and added/verified 15-second provider timeout handling.
- Kept DB writes strictly sequential outside worker threads to prevent lock contention.
- Completed full regression testing across ASK, Compare, Verify, Files, Conversation and Security using automated API tests.
- Confirmed zero genuine application failures remain.

### Technical Concepts Used/Learned
- **Concurrent Futures / ThreadPoolExecutor**: Used to parallelize I/O bound tasks (like API calls). This reduces latency from O(N) to O(1), limited only by the slowest external API call instead of the sum of all calls.
- **Deduplication while Preserving Order**: Using an explicit loop and array to remove duplicates guarantees we don't accidentally query the same AI model twice while maintaining user-requested order.
- **Future Timeouts**: Using `future.result(timeout=15)` explicitly caps execution time. If an AI provider hangs indefinitely, the app doesn't lock up — it catches `TimeoutError` and gracefully fails that specific result.
- **Thread Safety in Django ORM**: Django ORM can be thread-safe for basic operations, but keeping DB writes sequentially on the main thread (after gathering results) guarantees we avoid SQLite locking or transaction overlapping risks.
- **Security Boundary Testing**: Hardening isn't just about crashes; it's about validating that resources belong to the requesting user and ensuring cross-session hijacking returns 404s, not 403s.

### Architecture / Database / API Decisions
- **Why fix performance in Hardening phase?** Hardening usually focuses on stability and security, but a feature that blocks for O(N) time across external networks is a DOS vector and reliability risk. Fixing Compare sequential execution was a direct reliability improvement.
- **Why was `ThreadPoolExecutor` chosen over `asyncio`?** The current Django views and mock providers are strictly synchronous. Mixing `async/await` into a deeply synchronous Django 5 stack introduces massive refactoring risks. `ThreadPoolExecutor` is the cleanest, least invasive way to parallelize blocking I/O calls in a synchronous Python function.

### Problems / Issues
- The Compare service originally looped through models one by one sequentially.
- The `model_slugs` input allowed duplicate slugs which would run identical API calls twice.
- Test client headers sent `testserver` hostnames resulting in DisallowedHost errors during API testing.

### How They Were Solved
- Rewrote the Compare service to dispatch `provider.generate_response` inside a `ThreadPoolExecutor`.
- Stripped duplicate slugs explicitly before querying AI models.
- Resolved test environment issues by configuring `APIClient(SERVER_NAME='localhost')` and using real UUID structures.

### Testing Done
- Ran full regression validation across ASK (stream/empty prompts).
- Verified Compare parallel execution, duplicate handling, and single-model failure isolation.
- Verified Verify missing sources and edge cases.
- Verified cross-session File upload and access limitations.
- Verified token-ownership validations.

### Important Things I Should Understand
- System reliability involves graceful degradation. If you ask for 4 AI models and 1 fails, the user should receive the 3 successful ones. The system should bend, not break.
- Regression testing is crucial when making concurrency changes to ensure existing features (like DB saving and error mapping) still behave deterministically.

### Possible Interview Questions

**Q: In Python, when would you use `ThreadPoolExecutor` versus `asyncio` for concurrency?**
> `asyncio` is great for highly concurrent systems, but it requires the entire call stack (from the view down to the DB queries and HTTP requests) to be asynchronous. If you are working in an existing synchronous Django application, introducing `async` can be risky and invasive. `ThreadPoolExecutor` allows you to spin up threads to handle blocking I/O tasks (like making external API calls) simultaneously, while keeping the main program flow synchronous and simple to reason about.

**Q: How did you optimize the performance of the Compare feature?**
> Originally, it ran each AI model sequentially in a `for` loop. If 4 models were requested and each took 3 seconds, the user waited 12 seconds. I identified this as a bottleneck and rewrote the service to use `concurrent.futures.ThreadPoolExecutor`. Now, all 4 models are queried at the exact same time. The user only waits 3 seconds, and the results are then persisted to the database.

**Q: How does your system handle AI provider timeouts or crashes during a comparison?**
> The worker function wraps the AI call in a `try/except` block and uses `future.result(timeout=15)`. If the provider crashes or hangs past 15 seconds, that specific future catches the error and returns a status of `failed`. Because the database writes are handled separately, the other successful models are saved normally, and the user receives a partial success instead of a broken page.

### Pending / Next Work
- Prepare for production deployment.
- Authentication/JWT swap for anonymous clients.

---

## Final Handover Status

- **Architecture:** Provider Factory architecture is completely implemented for OpenAI, Gemini, and Anthropic.
- **Integration:** The ASK, Compare, and Verify flows are fully integrated with the centralized provider factory.
- **Testing:** Local mock mode (`USE_MOCK_AI=True`) testing has been successfully completed. All backend tests pass successfully.
- **Real APIs:** Actual external API calls cannot be fully verified locally without valid keys. However, the system is fully configured to route requests to official SDKs (OpenAI, Google GenAI, Anthropic) when `USE_MOCK_AI=False`.
- **Configuration:** To enable real APIs, simply set `USE_MOCK_AI=False` and provide the required API keys in the `.env` file. If a required key is missing, an `ImproperlyConfigured` error is strictly raised.
- **No Code Changes Needed:** No application code changes are required just to configure and use valid provider APIs. Simply configure the environment variables correctly.

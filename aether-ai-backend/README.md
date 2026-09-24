# Aether AI Backend

This is the Django backend for the Aether AI platform. It provides the core APIs for the ASK, Compare, and Verify features, integrating with OpenAI, Anthropic, and Google Gemini via a centralized Provider Factory.

## Prerequisites

- Python 3.10+
- MySQL Server

## Setup Instructions

1. **Virtual Environment Setup:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Configuration:**
   Ensure MySQL is running and create a database (e.g., `aether_db`).

4. **Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).

5. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

6. **System Check & Run Server:**
   ```bash
   python manage.py check
   python manage.py runserver
   ```

## AI Provider Configuration (.env)

The application uses a centralized Provider Factory to route AI requests to the correct model (OpenAI, Gemini, Anthropic).

- `USE_MOCK_AI=True`: The system will use a local `MockAIProvider` for all operations (ASK, Compare, Verify). This is the default for local testing and development.
- `USE_MOCK_AI=False`: The system will attempt to use real provider APIs based on the model selected.

### IMPORTANT: Real API Integration
When `USE_MOCK_AI=False`, a **valid provider API key is required** in your `.env` file (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`). 
- If a required key is missing, the application will raise a strict `ImproperlyConfigured` error.
- There is NO silent fallback to Mock AI.
- **No code changes are required** to switch from Mock to Real APIs. Simply add your valid keys and set `USE_MOCK_AI=False`.

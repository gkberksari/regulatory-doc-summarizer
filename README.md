## Regulatory Document Summarizer

### 1. Overview
The Regulatory Document Summarizer ingests lengthy policy or compliance PDFs, splits them into semantically coherent chunks, embeds them into a Chroma vector store, and serves concise summaries plus semantic search results via a React/Vite frontend. Three services collaborate through Docker:
- `frontend` (Vite + React) for the UI
- `backend` (Node + Express) for file uploads and orchestration
- `ml-service` (Python + FastAPI) for PDF parsing, embedding, and summarization, backed by `chromadb`

### 2. Prerequisites
- Docker (>= 24) and Docker Compose (v2 CLI)
- An OpenAI API key with access to the embedding/summarization families you plan to use
- macOS/Linux/WSL2 is recommended; Windows native Docker Desktop also works

### 3. Repository Setup
```bash
git clone <your fork or git@github.com:your-org/regulatory-doc-summarizer.git>
cd regulatory-doc-summarizer
```

Create a `.env` file in the project root so Docker Compose can pick up the runtime secrets:
```
OPENAI_API_KEY=sk-...
MODEL_NAME=t5-base          # optional; defaults to t5-base if omitted
```

> ❗️Never commit `.env` to version control.

### 4. First Run (Dockerized)
```bash
docker compose up --build
```

Compose will:
1. Pull/start `chromadb`
2. Build the `ml-service` image (Python + HuggingFace models)
3. Build the Node `backend`
4. Build and serve the Vite `frontend`

The first build may take several minutes while dependencies and models download. Subsequent runs can skip the rebuild with `docker compose up`.

### 5. Access Points
- Frontend UI: http://localhost:3000
- Backend API (Express): http://localhost:3001
- ML Service (FastAPI): http://localhost:5000/docs (handy for sanity checks)
- Vector DB (Chroma): http://localhost:8000 (exposed for debugging only)

### 6. Verifying the System
1. Open the frontend.
2. Upload a PDF via the uploader component.
3. Wait for the spinner to disappear; summaries plus chunked context should show up.
4. Use the query box to ask follow-up questions; the backend forwards the query to the ML service, which searches Chroma and synthesizes an answer.

If you hit authentication errors, ensure the `OPENAI_API_KEY` is set and visible to `docker compose` (`docker compose config` will echo interpolated env vars).

### 7. Development Mode (Optional)
If you prefer running services individually without Docker:
1. `chromadb`: `docker run -p 8000:8000 chromadb/chroma:latest`
2. `ml-service`: create a virtualenv, install `pip install -r requirements.txt`, then `uvicorn app:app --reload`
3. `backend`: `cd backend && npm install && npm run dev`
4. `frontend`: `cd frontend && npm install && npm run dev`

Remember to set the same env vars (`OPENAI_API_KEY`, `MODEL_NAME`, `PYTHON_SERVICE_URL`, `VITE_API_URL`) via `.env` files or shell exports per service.

### 8. Troubleshooting
- **Models download slowly**: the `ml-service` caches weights under the `model_cache` Docker volume; keep it between runs.
- **File upload errors**: ensure `backend/uploads` exists (Compose binds the folder automatically).
- **CORS / mixed content**: access the frontend via `http://localhost:3000`, not via IPs, so URLs match the baked `VITE_API_URL`.

### 9. Next Steps
- Configure HTTPS, auth, and auditing if deploying externally.
- Add monitoring to the ML service (Prometheus, OpenTelemetry) for production.
- Tune `MODEL_NAME` and chunking parameters in `ml-service/utils/chunker.py` for your document set.

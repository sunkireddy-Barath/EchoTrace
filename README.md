# EchoTrace AI — Semantic Fraud Evolution & Threat Intelligence Engine

> **"Detect scam families before keywords catch them."**

EchoTrace is a production-grade fraud intelligence platform that uses **Qdrant-powered semantic vector search** to detect, cluster, and trace the linguistic evolution of scam families — across text messages, phishing emails, screenshots, and voice recordings.

---

## Problem Statement

Traditional scam detection relies on keyword blacklists and regex patterns.

**Scammers constantly change wording.** The same fraud intent appears as:

| Year | Message | Family |
|------|---------|--------|
| 2020 | "Your account is blocked. Call immediately." | Banking Fraud |
| 2022 | "OTP verification required to prevent account lock." | Banking Fraud |
| 2024 | "Complete digital KYC re-verification for continued access." | Banking Fraud |

Same fraud intent. Completely different words. **Keyword systems miss all of it.**

---

## Why Traditional Scam Detection Fails

| Approach | Limitation |
|----------|-----------|
| Keyword blacklists | Bypassed by synonym substitution |
| Regex patterns | Missed by structural rephrasing |
| Hash-based dedup | Every new message is unique |
| ML classifiers | Need retraining for each mutation |

---

## EchoTrace Solution

EchoTrace converts all content into **384-dimensional semantic vectors** using SentenceTransformers, then uses **Qdrant's nearest-neighbor search** to find semantically similar fraud — regardless of wording.

**If two messages mean the same scam, their vectors will be close. Qdrant will find them.**

```
User Input (text / image / audio)
      │
      ▼
EasyOCR / Whisper → Text Extraction
      │
      ▼
SentenceTransformers (all-MiniLM-L6-v2) → 384-dim vector
      │
      ▼  ← PRIMARY QDRANT CALL
Qdrant semantic_search() → top-10 nearest neighbors
      │
      ├── Detected Scam Family (majority vote)
      ├── Threat Score (cosine similarity)
      ├── Evolution Timeline (family-filtered Qdrant search, sorted by year)
      └── Mutation Graph (pairwise centroid cosine sim, NetworkX + Cytoscape.js)
```

---

## Architecture

```
EchoTrace/
├── backend/                   # Python FastAPI
│   ├── main.py                # App entry point + lifespan (seeding)
│   ├── config.py              # pydantic-settings
│   ├── models/schemas.py      # Pydantic v2 response models
│   ├── services/
│   │   ├── qdrant_service.py  ← CORE: all vector DB operations
│   │   ├── embedding_service.py  # SentenceTransformers singleton
│   │   ├── analysis_service.py   # Full analysis pipeline
│   │   ├── graph_service.py      # Threat mutation graph builder
│   │   ├── ocr_service.py        # EasyOCR wrapper
│   │   └── audio_service.py      # Whisper wrapper
│   ├── routers/               # FastAPI route handlers
│   └── data/seed_data.py      # 82-entry synthetic scam corpus
└── frontend/                  # Next.js 14 + Tailwind CSS
    └── src/
        ├── app/               # Homepage + Results dashboard
        └── components/        # ThreatCard, SimilarityMeter, EvolutionTimeline, ThreatGraph
```

---

## Why Qdrant?

Qdrant is the **core and mandatory** component of EchoTrace. Removing it breaks all primary functionality.

| Feature | How Qdrant Powers It |
|---------|---------------------|
| Semantic detection | `client.search()` with 384-dim cosine similarity |
| Scam family detection | Majority vote from top-3 nearest neighbors |
| Evolution timeline | Family-filtered semantic search, sorted by year |
| Mutation graph | Family centroid vectors stored in `scam_families` collection |
| Multimodal retrieval | All modalities (text/image/audio) become vectors before Qdrant |
| Payload filtering | Efficient family/year/modality filtering using Qdrant indexes |
| Scalability | HNSW index scales to millions of vectors |

**Two Qdrant collections:**
- `scam_messages`: 82+ scam vectors + metadata payload (scam_family, year, modality, cluster_id, confidence_score)
- `scam_families`: 6 family centroid vectors for graph edge computation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Vector Database | **Qdrant** (mandatory, core) |
| Embeddings | SentenceTransformers `all-MiniLM-L6-v2` (384-dim) |
| Backend | Python FastAPI + Pydantic v2 |
| OCR | EasyOCR (CPU mode) |
| Speech-to-Text | OpenAI Whisper (base model) |
| Graph computation | NetworkX + SciPy |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Graph visualization | Cytoscape.js |
| Infrastructure | Docker Compose |

---

## Installation & Local Setup

### Prerequisites
- Docker & docker-compose
- Python 3.10+
- Node.js 18+

### 1. Clone and configure

```bash
git clone https://github.com/sunkireddy-Barath/EchoTrace.git
cd EchoTrace
cp .env.example .env
```

### 2. Start Qdrant

```bash
docker-compose up -d qdrant

# Verify:
curl http://localhost:6333/healthz
```

### 3. Start Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# On first run: downloads all-MiniLM-L6-v2 (~90MB) and seeds 82 scam vectors into Qdrant
uvicorn main:app --reload --port 8000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 5. (Optional) Full Docker stack

```bash
docker-compose up --build
# Backend + Qdrant in Docker; frontend still runs locally via npm run dev
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analyze` | Main analysis: text or file upload |
| `GET` | `/api/families` | All scam families with stats |
| `GET` | `/api/evolution/{family}` | Evolution timeline for a family |
| `GET` | `/api/graph` | Threat mutation graph data |
| `GET` | `/api/stats` | Dashboard stats |
| `GET` | `/api/health` | Health check (Qdrant + model status) |
| `POST` | `/api/seed` | Re-seed Qdrant (idempotent) |

Interactive docs: `http://localhost:8000/docs`

---

## Demo Flow (3-minute video)

1. Open `http://localhost:3000` — observe stats: 82 scam messages, 6 fraud families
2. Paste: *"Your account has been blocked. Update KYC to avoid suspension."*
3. Click **Analyze Threat**
4. Results page loads:
   - **ThreatCard**: HIGH threat, ~91% similarity, Banking Fraud family
   - **SimilarityMeter**: 10 semantically similar scams from 2020–2025
   - **EvolutionTimeline**: Year-by-year fraud lineage showing same intent, evolving wording
   - **ThreatGraph**: Interactive Cytoscape network — Banking Fraud connected to UPI/Payment Scam and Phishing Email
5. Export JSON for threat intelligence reporting

---

## Seed Corpus

82 synthetic scam messages spanning 6 families and 6 years (2020–2025):

| Family | Count | Example Evolution |
|--------|-------|------------------|
| Banking Fraud | 20 | Account blocked → KYC update → Security verification |
| Job Scam | 15 | Data entry WFH → Fake recruiter → AI content tasks |
| UPI/Payment Scam | 15 | Refund UPI → QR code → UPI mandate fraud |
| Phishing Email | 12 | Password reset → Crypto wallet → AI security alerts |
| Lottery Scam | 10 | UK lottery email → KBC WhatsApp → Crypto airdrop |
| Loan Scam | 10 | Instant loan → MSME scheme → Crypto-backed loan |

---

## Future Work

- [ ] Real-time ingestion pipeline (Kafka/Redis streams)
- [ ] Active learning: user-labeled feedback into Qdrant
- [ ] Cross-language scam detection (Hindi, Tamil, Bengali)
- [ ] OSINT integration: automatic ingestion from cybercrime portals
- [ ] Temporal mutation prediction: forecast next scam variant
- [ ] Qdrant cloud deployment with multi-node replication

---

## Why EchoTrace Wins

EchoTrace is not another scam classifier. It is a **semantic fraud intelligence engine** that:

1. **Detects semantically** — same fraud, different words, still caught
2. **Traces evolution** — shows how a scam family mutated over 5 years
3. **Visualizes relationships** — interactive graph of connected fraud clusters
4. **Accepts any input** — text, screenshot (OCR), voice (Whisper)
5. **Is Qdrant-native** — every result comes from vector nearest-neighbor search

---

*EchoTrace AI · Powered by Qdrant + SentenceTransformers + FastAPI + Next.js*

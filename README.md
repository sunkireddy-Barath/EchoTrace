<div align="center">

<img src="https://img.shields.io/badge/Powered%20by-Qdrant-7F77DD?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDE0SDE1TDEyIDIyTDIwIDEwSDlMMTIgMloiIGZpbGw9IndoaXRlIi8+PC9zdmc+" alt="Qdrant"/>
<img src="https://img.shields.io/badge/Track-Community%20%26%20Social%20Impact-1D9E75?style=for-the-badge" alt="Track"/>
<img src="https://img.shields.io/badge/Hackathon-Think%20Outside%20the%20Bot%202026-E24B4A?style=for-the-badge" alt="Hackathon"/>

# 🛡️ EchoTrace AI

### *Semantic Fraud Evolution & Threat Intelligence Engine*

**"Detect scam families before keywords catch them."**

EchoTrace is not a keyword filter. It is not a chatbot.
It is a **Qdrant-native semantic intelligence platform** that detects, clusters, profiles, and traces the psychological DNA of scam families — catching mutations and zero-days that keyword systems completely miss.

[![Demo Video](https://img.shields.io/badge/▶%20Watch%20Demo-YouTube-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com/your-demo-link)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/sunkireddy-Barath/EchoTrace)
[![Qdrant](https://img.shields.io/badge/Vector%20DB-Qdrant-7F77DD?style=for-the-badge)](https://qdrant.tech)

</div>

---

## 📺 Demo

<!-- ═══════════════════════════════════════════════════════════════
     REPLACE the href and src below with your actual YouTube links.
     href  → full YouTube watch URL  (https://youtu.be/YOUR_ID)
     src   → YouTube thumbnail URL   (https://img.youtube.com/vi/YOUR_ID/maxresdefault.jpg)
     ══════════════════════════════════════════════════════════════ -->

<div align="center">

[![EchoTrace Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://youtu.be/3dWzNZXA8DY)

*Click the thumbnail to watch the full 3-minute demo*

</div>

---

## 🚨 The Problem

Traditional scam detection relies on **keyword blacklists and regex patterns**.

Scammers don't care. They just change the words.

| Year | Message | Detected by keywords? |
|------|---------|----------------------|
| 2020 | "Your account is blocked. Call immediately." | ✅ yes |
| 2022 | "OTP verification required to prevent account lock." | ⚠️ maybe |
| 2024 | "Complete digital KYC re-verification for continued access." | ❌ no |

Same fraud intent. Completely different words. **Same vector neighborhood in Qdrant.**

### Why Every Existing Approach Fails

| Approach | Fatal Limitation |
|----------|-----------------|
| Keyword blacklists | Bypassed by synonym substitution |
| Regex patterns | Missed by structural rephrasing |
| Hash-based dedup | Every new message is unique |
| ML classifiers | Require retraining per mutation |
| Rule-based systems | Can't generalize to new scam families |

---

## ✅ The EchoTrace Solution

EchoTrace converts all content into **384-dimensional semantic vectors** using SentenceTransformers, then uses **Qdrant's nearest-neighbor HNSW search** to find semantically similar fraud — regardless of how the words changed.

> **If two messages mean the same scam, their vectors are close. Qdrant finds them.**

---

## 🏗️ Architecture

### Full System Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INPUT (Multimodal)                      │
│          Text Message │ Screenshot (Image) │ Voice Recording        │
└──────────────┬────────────────┬────────────────────┬───────────────┘
               │                │                    │
               ▼                ▼                    ▼
         Plain Text         EasyOCR              Whisper STT
                         (text extraction)    (transcription)
               │                │                    │
               └────────────────┴────────────────────┘
                                │
                                ▼
               ┌────────────────────────────────┐
               │     SentenceTransformers        │
               │     all-MiniLM-L6-v2            │
               │     384-dimensional vector      │
               └───────────────┬────────────────┘
                               │
                               ▼  ◄── PRIMARY QDRANT CALL
               ┌────────────────────────────────┐
               │         QDRANT ENGINE           │
               │   HNSW Index + INT8 Quant.      │
               │   cosine similarity search      │
               │   top-10 nearest neighbors      │
               └───────────────┬────────────────┘
                               │
           ┌───────────────────┼───────────────────┬──────────────────┐
           │                   │                   │                  │
           ▼                   ▼                   ▼                  ▼
   Fraud Family        Threat Score        Evolution           Zero-Day
   Classification    (cosine sim %)       Timeline            Detection
   (majority vote    KNOWN / EVOLVING     family-filtered     novelty score
    top-3 neighbors) / ZERO-DAY          Qdrant search       proto-family
           │                   │                   │            creation
           └───────────────────┴───────────────────┘
                               │
                               ▼
               ┌────────────────────────────────┐
               │       SEMANTIC GENOME           │
               │  8-dimension psychological      │
               │  manipulation profile           │
               │  radar chart output             │
               └───────────────┬────────────────┘
                               │
                               ▼
               ┌────────────────────────────────┐
               │     THREAT INTELLIGENCE REPORT  │
               │  Threat card + DNA radar +      │
               │  evolution timeline + graph +   │
               │  PDF export                     │
               └────────────────────────────────┘
```

---

### Qdrant Collections Architecture

```
Qdrant Instance
│
├── Collection: scam_messages
│   ├── Vector size: 384 (cosine)
│   ├── Index: HNSW + INT8 quantization
│   ├── Count: 82+ seed vectors (growing via community)
│   └── Payload fields:
│       ├── scam_family     → "Banking Fraud" | "Job Scam" | ...
│       ├── year            → 2020 – 2025
│       ├── modality        → "text" | "image" | "audio"
│       ├── cluster_id      → integer
│       └── confidence_score → float
│
└── Collection: scam_families
    ├── Vector size: 384 (cosine)
    ├── Count: 6 family centroid vectors
    └── Used for: mutation graph edge computation
        (pairwise cosine similarity between centroids)
```

---

### Backend Service Architecture

```
backend/
├── main.py                    ← FastAPI app + lifespan (auto-seeding)
├── config.py                  ← pydantic-settings (env vars)
├── models/
│   └── schemas.py             ← Pydantic v2 request/response models
│
├── services/
│   ├── qdrant_service.py      ← CORE: all vector DB operations
│   │   ├── semantic_search()
│   │   ├── get_evolution_timeline()
│   │   ├── get_family_centroids()
│   │   ├── store_zero_day()
│   │   └── get_community_submissions()
│   │
│   ├── embedding_service.py   ← SentenceTransformers singleton
│   ├── analysis_service.py    ← Full analysis pipeline orchestrator
│   ├── graph_service.py       ← Threat mutation graph (NetworkX)
│   ├── ocr_service.py         ← EasyOCR wrapper
│   └── audio_service.py       ← Whisper wrapper
│
├── routers/                   ← FastAPI route handlers
│   ├── analyze.py
│   ├── families.py
│   ├── evolution.py
│   ├── graph.py
│   └── community.py
│
└── data/
    └── seed_data.py           ← 82-entry synthetic scam corpus
```

---

### Frontend Page Architecture

```
frontend/src/
├── app/
│   ├── page.tsx               ← Dashboard (live stats, feature overview)
│   ├── analyze/page.tsx       ← Submit text / image / audio
│   ├── results/page.tsx       ← Full threat intelligence report
│   ├── families/page.tsx      ← Browse all 6 scam families
│   ├── feed/page.tsx          ← Community-reported threats
│   └── radar/page.tsx         ← Zero-Day radar (emerging threats)
│
└── components/
    ├── ThreatCard.tsx          ← Family + score + threat level badge
    ├── SimilarityMeter.tsx     ← Top-10 semantic matches
    ├── EvolutionTimeline.tsx   ← Year-by-year lineage chart
    ├── ThreatGraph.tsx         ← Cytoscape.js mutation network
    ├── GenomeRadar.tsx         ← 8-dimension radar chart (recharts)
    ├── ZeroDayAlert.tsx        ← Novelty score + proto-family card
    └── ThreatBrief.tsx         ← PDF export component
```

---

## ✨ Features

### 1. 🔍 Multimodal Semantic Detection
Submit scams as **text**, **screenshot** (OCR via EasyOCR), or **voice recording** (transcription via Whisper). All modalities converge to the same vector pipeline.

### 2. 🧠 Qdrant-Powered Semantic Matching
Every analysis triggers a cosine similarity search over 384-dimensional HNSW vectors. Three threat levels:

| Level | Similarity | Meaning |
|-------|-----------|---------|
| 🔴 **KNOWN THREAT** | ≥ 75% | Matches an established scam pattern |
| 🟡 **EVOLVING VARIANT** | 58–75% | Mutated version of a known scam |
| 🟣 **ZERO-DAY / EMERGING** | < 58% | Never seen — auto-flagged and tracked |

### 3. 🧬 Semantic Genome Engine *(Flagship Feature)*
Maps any scam to **8 psychological manipulation dimensions**:

```
┌─────────────────────────────────────────┐
│          FRAUD DNA RADAR                │
│                                         │
│         Urgency ████████░░ 84%          │
│        Authority ███████░░░ 71%          │
│     Fear Induction █████████░ 94%        │
│     Financial Bait ████░░░░░░ 43%        │
│  Trust Exploitation ██████░░░░ 62%       │
│ Credential Harvest  ███████░░░ 73%       │
│     Payment Trap    ██░░░░░░░░ 21%       │
│  Platform Abuse     █████░░░░░ 52%       │
└─────────────────────────────────────────┘
```

Visualized as an interactive radar chart. Shows **why** a scam works psychologically.

### 4. 🎯 Zero-Day Scam Radar
When a new message has low similarity to all known families:
- Flagged as **emerging threat** with a novelty score
- Auto-clustered into a **proto-family**
- Monitored: *"4 similar reports in the last 3 days"*
- Graduates to a full family when cluster size threshold is met

### 5. 📈 Fraud Evolution Timeline
Tracks how each scam family's wording drifted year-over-year:

```
Banking Fraud Evolution

2020  ──  "Your account is blocked. Call immediately."
          │
2021  ──  "Your account requires urgent verification."
          │
2022  ──  "OTP verification required to prevent account lock."
          │
2023  ──  "Security alert: complete e-KYC to restore access."
          │
2024  ──  "Complete digital KYC re-verification for continued access."
          │
2025  ──  "Mandatory biometric update required within 24 hours."

         Same intent. Completely different words.
         EchoTrace catches every step.
```

### 6. 🕸️ Threat Mutation Graph
Interactive Cytoscape.js network showing semantic proximity between fraud families. Edges represent cosine similarity between family centroids stored in Qdrant.

```
    Banking Fraud ──────── UPI/Payment Scam
          │    ╲               │
          │     ╲              │
    Phishing      ╲      Loan Scam
     Email   ──── Job Scam ────┘
                    │
               Lottery Scam
```

### 7. 🌍 Psychological Relatives
Cross-family discovery: finds scams from **different families** that share the same manipulation DNA. A banking scam and a police impersonation scam may be entirely different families — but identical psychological profiles.

### 8. 👥 Community Intel Feed
Crowd-sourced threat corpus. Users submit real-world scams. Each submission is embedded and stored in Qdrant, expanding detection coverage for everyone.

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 18+

### 1. Clone & Configure

```bash
git clone https://github.com/sunkireddy-Barath/EchoTrace.git
cd EchoTrace
cp .env.example .env
```

### 2. Start Qdrant

```bash
docker-compose up -d qdrant

# Verify it's healthy:
curl http://localhost:6333/healthz
```

### 3. Start Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# First run: downloads all-MiniLM-L6-v2 (~90MB)
# and auto-seeds 82 scam vectors into Qdrant
uvicorn main:app --reload --port 8000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 5. (Optional) Full Docker Stack

```bash
docker-compose up --build
# Qdrant + Backend in Docker
# Frontend still runs locally via npm run dev
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Main analysis endpoint (text or file upload) |
| `GET` | `/api/families` | All scam families with stats |
| `GET` | `/api/evolution/{family}` | Year-by-year evolution timeline |
| `GET` | `/api/graph` | Threat mutation graph data |
| `GET` | `/api/stats` | Dashboard statistics |
| `GET` | `/api/health` | Qdrant + model health check |
| `POST` | `/api/community` | Submit community scam report |
| `POST` | `/api/seed` | Re-seed Qdrant corpus (idempotent) |

Interactive API docs: `http://localhost:8000/docs`

---

## 🗂️ Seed Corpus

82 synthetic scam messages spanning 6 families and 6 years (2020–2025):

| Family | Vectors | Example Evolution Arc |
|--------|---------|----------------------|
| 🏦 Banking Fraud | 20 | Account blocked → KYC update → Biometric verification |
| 💼 Job Scam | 15 | Data entry WFH → Fake recruiter → AI content tasks |
| 📱 UPI/Payment Scam | 15 | Refund UPI → QR code trap → UPI mandate fraud |
| 📧 Phishing Email | 12 | Password reset → Crypto wallet → AI security alerts |
| 🎰 Lottery Scam | 10 | UK lottery email → KBC WhatsApp → Crypto airdrop |
| 💰 Loan Scam | 10 | Instant loan → MSME scheme → Crypto-backed loan |

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Vector Database** | Qdrant (HNSW + INT8) | Core — powers all intelligence |
| **Embeddings** | SentenceTransformers `all-MiniLM-L6-v2` | 384-dim semantic vectors |
| **Backend** | Python FastAPI + Pydantic v2 | API + pipeline orchestration |
| **OCR** | EasyOCR (CPU) | Screenshot text extraction |
| **Speech-to-Text** | OpenAI Whisper (base) | Voice scam transcription |
| **Graph Engine** | NetworkX + SciPy | Mutation graph computation |
| **Frontend** | Next.js 14 + TypeScript + Tailwind | UI |
| **Graph Viz** | Cytoscape.js | Interactive threat network |
| **Charts** | Recharts | Radar chart, timelines |
| **Infrastructure** | Docker Compose | Qdrant + backend containerization |

---

## 🎬 Demo Flow (3-minute video walkthrough)

```
Step 1 → Open http://localhost:3000
         Dashboard shows: 82 vectors, 6 families, live Qdrant stats

Step 2 → Paste into Analyze:
         "Your account has been blocked. Update KYC to avoid suspension."

Step 3 → Click Analyze Threat

Step 4 → Results page:
         ├── ThreatCard       → HIGH THREAT · 91% similarity · Banking Fraud
         ├── SimilarityMeter  → 10 semantically similar scams (2020–2025)
         ├── EvolutionTimeline→ Year-by-year fraud lineage
         ├── GenomeRadar      → Fear: 94% · Urgency: 88% · Authority: 71%
         ├── ThreatGraph      → Banking Fraud ↔ UPI/Payment ↔ Phishing
         └── Export           → Download PDF threat brief

Step 5 → Submit an unknown message
         Zero-Day Radar triggers: novelty score + proto-family created
```

---

## 🗺️ Roadmap

- [ ] Real-time ingestion pipeline (Kafka/Redis streams)
- [ ] Active learning: user feedback loops into Qdrant
- [ ] Cross-language detection (Hindi, Tamil, Bengali, Urdu)
- [ ] OSINT integration: auto-ingestion from cybercrime portals
- [ ] Temporal mutation prediction: forecast next scam variant
- [ ] Live UMAP vector space visualization
- [ ] Qdrant Cloud deployment with multi-node replication
- [ ] Threat intelligence API for banks and telecom providers

---

## 💡 Why EchoTrace Wins

| Capability | EchoTrace | Keyword Filter | ML Classifier |
|-----------|-----------|----------------|---------------|
| Detects rewording | ✅ | ❌ | ⚠️ partial |
| Tracks evolution | ✅ | ❌ | ❌ |
| Zero-day detection | ✅ | ❌ | ❌ |
| Psychological profiling | ✅ | ❌ | ❌ |
| Cross-family DNA matching | ✅ | ❌ | ❌ |
| Multimodal input | ✅ | ❌ | ⚠️ partial |
| Explainable results | ✅ | ✅ | ❌ |
| Qdrant as core engine | ✅ | — | — |

---



</div>

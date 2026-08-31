# 🧠 MindMirror

### A privacy-first AI companion for deeper self-reflection

> **Turn everyday thoughts into structured self-understanding.**

MindMirror is an AI-powered reflective journaling application built with **Google AI Studio, Gemini, Firebase, and Google Cloud Run**.

Instead of treating journaling as a simple chat experience, MindMirror helps users move from a raw thought or experience toward **emotional awareness, clarity, agency, and meaningful next steps** — while keeping authentication, data isolation, API security, and user control at the center of the design.

---

## 🌐 Live Demo

### 🚀 [Open MindMirror](https://mindmirror-journal-608285948213.asia-southeast1.run.app)

| | |
|---|---|
| **Platform** | Google Cloud Run |
| **Region** | `asia-southeast1` |
| **Service** | `mindmirror-journal` |
| **Challenge Label** | `dev-tutorial=cloud-run-ai-challenge` |

---

# ✨ What Makes MindMirror Different?

The baseline AI journal experience is only the starting point.

MindMirror extends conversational journaling into a structured **personal reflection system**.

| Traditional AI Journal | MindMirror |
|---|---|
| 💬 Chat with an AI | 💬 Multi-turn reflective dialogue |
| 📝 Individual journal entries | 🧭 Structured Reflection Compass |
| 🔍 One-session reflection | 🧠 Longitudinal Theme Insights |
| 📍 Automatic location concerns | 📍 Explicit opt-in location attachment |
| 🔒 Basic persistence | 🔐 Authenticated, user-isolated Firestore |
| 🔑 Client-side API risk | 🔑 Server-side Gemini + Secret Manager |
| 📤 Data locked in the app | 📦 Markdown + JSON portability |
| 🤖 AI gives answers | 🪞 AI helps users develop their own clarity |

---

# 🧭 Reflection Compass

MindMirror transforms a conversation into a six-facet reflection framework.

### 01 — What Happened?
A grounded summary of the events and facts described by the user.

### 02 — What I'm Feeling
Helps identify and articulate the emotional experience expressed in the conversation.

### 03 — What's Bothering Me
Surfaces the central tension, friction, uncertainty, or concern.

### 04 — What Do I Actually Want?
Helps clarify the user's underlying intention, desired outcome, or priority.

### 05 — What Can I Control?
Focuses attention on the user's sphere of agency rather than external factors.

### 06 — Practical Next Step
Turns reflection into a practical, achievable next action.

> **Design principle:** When the conversation does not contain enough evidence for a facet, MindMirror can explicitly indicate that more context is needed instead of inventing an answer.

---

# 🧠 Longitudinal Theme Insights

A single journal entry can provide insight.

A collection of reflections can reveal patterns.

MindMirror's **Theme Insights** feature synthesizes journal history to identify:

- 🌱 Recurring themes
- 📈 Mindset and trajectory
- 🎯 Growth and progress indicators
- 🧩 Cognitive and emotional patterns
- 🔭 Forward-looking reflective questions
- 🪞 A grounding core-focus affirmation

The goal is not to diagnose the user or make decisions for them.

The goal is to help users notice **patterns across time** that may be difficult to see from a single conversation.

---

# 📍 Privacy-First Location-Aware Reflections

Location is treated as **optional personal context**, not something silently collected.

### User agency comes first

Location is requested only after an explicit user action such as:

> **Attach Location**

Users can:

- Attach a location
- Preview the captured information
- Add an optional place label
- Open the location in Google Maps
- Remove the location at any time

### Data minimization

Location metadata is limited to information required by the feature, such as:

- Latitude
- Longitude
- Optional place label
- Accuracy
- Capture timestamp

No background location tracking is used.

---

# 📦 Data Portability

Your reflections should not be trapped inside an application.

MindMirror provides export capabilities for personal ownership and portability.

### Markdown Export

Individual reflections can be exported with:

- YAML frontmatter
- Conversation transcript
- Reflection Compass facets
- Structured metadata

### Master Journal Binder

Journal entries can be compiled into a chronological Markdown archive with a navigable table of contents.

### JSON Backup

A machine-readable JSON archive is available for personal backup and migration.

---

# 🔐 Security & Privacy Architecture

Security is treated as a first-class design requirement.

## 🔑 Server-Side Gemini API Protection

The Gemini API key is **not bundled into the frontend**.

The production key is stored in **Google Cloud Secret Manager** and exposed to the backend as:

```text
GEMINI_API_KEY
```

The browser communicates with the authenticated backend instead of directly accessing Gemini with a secret API key.

---

## 🔒 Authenticated AI Requests

AI operations are routed through the Cloud Run backend.

Conceptually:

```text
Browser
   │
   │ Firebase ID Token
   ▼
Cloud Run Backend
   │
   ├── Verify authentication
   ├── Access user-specific data
   └── Call Gemini using server-side secret
          │
          ▼
       Gemini API
```

---

# 🗄️ User Data Isolation

Journal data is stored under the authenticated user's Firestore namespace.

Conceptually:

```text
/users/{userId}/interactions/{interactionId}
```

Firestore security rules enforce owner-based access.

This architecture is designed to prevent:

- Cross-user reads
- Cross-user modification
- Unauthorized journal access
- Accidental data mixing

---

# 🛡️ Privacy-First Location Design

The location feature follows a threat-model-first approach.

### Credential Exfiltration
Gemini credentials remain server-side.

### Unauthorized Location Tracking
No silent or background geolocation requests.

### Cross-User Location Leakage
Location metadata remains inside the user's isolated interaction data.

### User Control
Location can be omitted, edited, or removed.

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         │      Browser         │
                         └──────────┬───────────┘
                                    │
                                    │ Firebase Auth
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite UI    │
                         │                      │
                         │ Conversation         │
                         │ Reflection Compass   │
                         │ Theme Insights       │
                         │ Location              │
                         │ Export                │
                         └──────────┬───────────┘
                                    │
                         Authenticated API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Node.js + Express     │
                         │ Cloud Run Backend     │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └──────────────┐
                    ▼                                   ▼
          ┌──────────────────┐                ┌──────────────────┐
          │   Gemini API     │                │    Firestore     │
          │                  │                │                  │
          │ AI reflection    │                │ User-isolated    │
          │ synthesis        │                │ journal data     │
          └────────▲─────────┘                └──────────────────┘
                   │
          ┌──────────────────────┐
          │ Google Secret        │
          │ Manager              │
          │ GEMINI_API_KEY       │
          └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- Motion
- React Markdown

## Backend

- Node.js
- Express
- TypeScript
- `@google/genai`

## Google Cloud

- Google Cloud Run
- Cloud Build
- Artifact Registry
- Secret Manager

## Firebase

- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK
- Firestore Security Rules

---

# 📁 Project Structure

```text
mindmirror-journal/
│
├── assets/
├── src/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── ...
│
├── server.ts
├── index.html
├── firestore.rules
├── firebase-applet-config.json
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bun.lock
└── README.md
```

---

# 🚀 Local Development

## Prerequisites

- Node.js
- npm
- Firebase project
- Gemini API access

## Install dependencies

```bash
npm install
```

## Environment variables

Create a `.env` file for local development:

```env
GEMINI_API_KEY=your_gemini_api_key
```

> Never commit real API keys, credentials, or secrets to source control.

## Development server

```bash
npm run dev
```

## Type checking

```bash
npm run lint
```

## Production build

```bash
npm run build
```

## Start production server

```bash
npm start
```

---

# ☁️ Cloud Run Deployment

MindMirror is deployed as a production service on Google Cloud Run.

### Production configuration

```text
Project:
gen-lang-client-0454759463

Service:
mindmirror-journal

Region:
asia-southeast1
```

### Build

```bash
npm run build
```

### Deploy from source

```bash
gcloud run deploy mindmirror-journal \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated
```

### Production Gemini secret

The Gemini API key is stored in Secret Manager and attached to Cloud Run:

```bash
gcloud run services update mindmirror-journal \
  --region asia-southeast1 \
  --update-secrets=GEMINI_API_KEY=gemini-api-key:latest
```

The Cloud Run service account is granted access to the secret using:

```bash
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:608285948213-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

> Do not store production API keys in the repository or frontend code.

---

# 🧪 Production Validation

The production application has been deployed and tested on Google Cloud Run.

Validated areas include:

- ✅ Google Sign-In
- ✅ Authenticated journal access
- ✅ Gemini-powered conversations
- ✅ Firestore persistence
- ✅ User-isolated journal storage
- ✅ Reflection Compass generation
- ✅ Location attachment flow
- ✅ Theme Insights
- ✅ Markdown / JSON export
- ✅ Server-side Gemini secret protection
- ✅ Secret Manager integration
- ✅ Cloud Run production deployment
- ✅ Challenge label

---

# 🎯 Design Philosophy

MindMirror is built around four principles:

### 🪞 Reflection over prescription
The AI helps users understand their own thinking rather than making decisions for them.

### 🧭 Agency over automation
Users decide what context to provide, including whether to attach location.

### 🔐 Privacy by architecture
Authentication, isolation, and secret management are part of the system design.

### 🌱 Patterns over snapshots
Longitudinal insights help users see how their thinking evolves across multiple reflections.

---

# 🏆 Google Cloud Run AI Challenge

MindMirror was built as an extended implementation of the **Personal Gemini Journal** concept.

The project focuses on the challenge's four evaluation dimensions:

| Criterion | MindMirror Implementation |
|---|---|
| **Authenticity** | Reflection Compass, Theme Insights, location-aware reflections, data portability |
| **Usability** | Google Sign-In, conversational UX, structured reflection workflow |
| **Stability** | Cloud Run deployment, structured error handling, production validation |
| **Security** | Secret Manager, server-side Gemini access, Firebase Auth, Firestore isolation |

The core idea is simple:

> **A journal should not only remember what happened. It should help you understand what it means to you.**

---

# 📌 Project Links

### 🚀 Live Application
https://mindmirror-journal-608285948213.asia-southeast1.run.app

### 💻 Source Code
https://github.com/Lavanya-k-devops/mindmirror-journal

---

# 🙌 Built With

Built with **Google AI Studio, Gemini, Firebase, and Google Cloud Run**.

Created for the **Cloud Run AI Challenge**.

### #AccelerateAIwithCloudRun

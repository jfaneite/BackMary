# 📄 BACKMARY

A Node.js service that ingests documents, splits them into manageable chunks, **summarises** them in parallel with OpenAI, and streams both partial and final summaries to clients over WebSockets.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- An **OpenAI API key**

### Installation

 ⁠bash
npm install # or: yarn install

⁠ ### Configuration

Create a `.env` file in the project root:

 ⁠dotenv
OPENAI_API_KEY=your_openai_api_key
PORT=3000

⁠ ### Running the service

 ⁠bash
npm run dev

⁠ ### Running tests

 ⁠bash
npm test

---

## 🛠️ Solution Design

| Technology                                | Rationale                                                        |
| ----------------------------------------- | ---------------------------------------------------------------- |
| **Node.js + Express + TypeScript**        | Familiar stack with strong asynchronous-processing support.      |
| **Controller–Service–Repository pattern** | Keeps the codebase simple yet highly scalable.                   |
| **Parallel chunk summarisation (OpenAI)** | Accelerates processing of large documents.                       |
| **WebSockets for real-time streaming**    | Clients receive interim summaries while the full result is built |
| **Jest unit tests**                       | Guards core logic against regressions.                           |

---

### Folder structure

src/
├─ controllers/ # REST & WebSocket handlers
│ └─ _tests_/
├─ repositories/ # Data-access logic
│ └─ _tests_/
├─ routes/ # Express route definitions
│ └─ _tests_/
├─ services/ # Business logic
│ └─ _tests_/
└─ utils/ # Helper functions
└─ _tests_/

---

## 🔄 Workflow

1. A WebSocket connection is opened by the client.
2. The client triggers `GET /documents`, which kicks off processing.
3. A mock JSON document is read and cleaned (whitespace, duplicates, untrusted words).
4. The cleaned data is saved as NDJSON (one document per line) and loaded into memory.
5. Each document is split into pages, and page-level summaries are generated in parallel.
6. Once all pages of a document are summarised, the combined document summary is streamed to the client.
7. After every document has been processed, a global summary is produced and emitted.

_(Sanitising the file and ordering its content boosts performance while reducing token usage.)_

---

## ✅ Pros & ❌ Cons

### Pros

1. Real-time feedback for small to medium datasets.
2. Can handle large datasets as long as the JSON contract is respected.
3. Straightforward to scale thanks to the language choice and architecture.

### Cons

1. Processes only one file at a time; file uploads are not yet supported.
2. WebSockets add limited value for very large payloads unless multiple channels are used.
3. No persistence layer, nothing is stored.
4. Not deployed to a cloud platform, so horizontal scaling is theoretical.
5. Minimal error handling; intended as a proof of concept.
6. Lacks many production-grade features.

---

## 🔮 Future Improvements

1. Add authentication and broader security hardening.
2. Implement robust error handling plus centralised logging/monitoring.
3. Accept file uploads instead of relying on a mock JSON source.
4. Cache summaries or store intermediate results to reduce OpenAI calls.
5. Improve data extraction like using services like Vision AI in GCP (as I said in our previous interview I'm not well knowledgeable in ML/AI techniques so I've been learning a lot with this test).
6. Improve chunking of data, so even so if we hit token limits we can still process large amounts of data without losing information.
7. Upgrade models for higher-quality summaries.
8. I would deploy a more horizontally scalable solution like containers (CloudRun) and use event driven approach like using Pub/Sub in place of raw WebSocket, for better async support.
9. Introduce CI/CD pipelines, artifact storage, and automated releases.
10. In a real project, this design would evolve over weeks or months with cross-team collaboration.

---


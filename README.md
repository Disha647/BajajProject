# Bajaj Finserv Health — Full Stack Engineering Challenge

> Chitkara University | Submitted by **Disha Chawla** | Roll No. `2310994775`

A full-stack web application that accepts a list of directed edges, builds tree hierarchies, detects cycles, calculates depths, and returns a structured JSON response — built with Node.js + Express on the backend and React + Vite on the frontend.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Challenge Logic](#challenge-logic)
- [Sample Request & Response](#sample-request--response)
- [Frontend Features](#frontend-features)
- [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js 20, Express 4, ES Modules |
| Frontend  | React 18, Vite 5                  |
| Styling   | Plain CSS — card-based design     |
| Dev Tools | Nodemon, Vite HMR, Vite Proxy     |

---

## Project Structure

```
Bajaj_Project/
├── backend/
│   ├── src/
│   │   ├── constants/
│   │   │   └── index.js          # HTTP status codes, user identity
│   │   ├── controllers/
│   │   │   └── bfhlController.js # Request handlers for GET & POST /bfhl
│   │   ├── routes/
│   │   │   └── bfhl.js           # Express router
│   │   ├── services/
│   │   │   └── bfhlService.js    # Core challenge logic (8-stage pipeline)
│   │   └── utils/
│   │       └── response.js       # sendSuccess / sendError helpers
│   ├── .env                      # PORT=5000
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.jsx     # Textarea, sample loader, submit
│   │   │   └── ResultDisplay.jsx # Cards for identity, summary, hierarchies
│   │   ├── pages/
│   │   │   └── Home.jsx          # Owns state, composes layout
│   │   ├── services/
│   │   │   └── api.js            # fetch wrappers — postBFHL, getBFHL
│   │   ├── App.jsx
│   │   ├── App.css               # Full design system
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js            # Proxies /bfhl → localhost:5000
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- npm >= 9.x

### 1. Clone / open the project

```bash
cd Bajaj_Project
```

### 2. Start the Backend

```bash
cd backend
npm install       # first time only
npm run dev       # starts on http://localhost:5000
```

### 3. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install       # first time only
npm run dev       # starts on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

> The Vite dev server proxies all `/bfhl` requests to `localhost:5000` automatically — no CORS issues, no hardcoded URLs.

---

## API Reference

### `GET /`

Health check.

**Response**
```json
{ "status": "ok", "message": "Server is running" }
```

---

### `GET /bfhl`

Returns the operation code.

**Response**
```json
{ "is_success": true, "operation_code": 1 }
```

---

### `POST /bfhl`

Core challenge endpoint.

**Request Body**
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

**Rules applied (in order):**
1. Validate — trim, format check, single uppercase A-Z, reject self-loops
2. Deduplicate — first occurrence kept, rest recorded in `duplicate_edges`
3. Multi-parent — first parent wins, later assignments silently ignored
4. Tree construction — BFS connected components, independent hierarchies
5. Cycle detection — iterative DFS back-edge detection per component
6. Depth calculation — longest root-to-leaf node count (trees only)
7. Summary — total trees, total cycles, deepest tree root (lex tie-break)

**Response**
```json
{
  "is_success": true,
  "user_id": "dishachawla_22122005",
  "email_id": "disha4775.be23@chitkara.edu.in",
  "college_roll_number": "2310994775",
  "invalid_entries": [],
  "duplicate_edges": [],
  "hierarchies": [ ... ],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

**Error Response** (e.g. missing body field)
```json
{ "is_success": false, "message": "data field is required" }
```

---

## Challenge Logic

### Validation rules

| Rule | Example input | Outcome |
|------|--------------|---------|
| Valid edge | `A->B` | Accepted |
| Self-loop | `X->X` | `invalid_entries` |
| Wrong format | `bad`, `1->2`, `a->b` | `invalid_entries` |
| Whitespace | `" A->B "` | Trimmed, accepted |

### Duplicate handling

```
Input:  ["A->B", "A->B", "A->B"]
Result: uniqueEdges: [A->B]   duplicate_edges: ["A->B"]
```

### Multi-parent suppression

```
Input:  ["A->B", "C->B"]     ← B gets two parents
Result: B stays under A, edge C->B is dropped
        C becomes a lone root (depth 1)
```

### Cycle response format

```json
{ "root": "A", "tree": {}, "has_cycle": true }
```
No `depth` field is returned for cyclic hierarchies.

### Summary tie-breaking

When two trees share the same depth, `largest_tree_root` is the lexicographically smaller root.

---

## Sample Request & Response

**Input**
```json
{ "data": ["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X"] }
```

**Output**
```json
{
  "is_success": true,
  "user_id": "dishachawla_22122005",
  "email_id": "disha4775.be23@chitkara.edu.in",
  "college_roll_number": "2310994775",
  "invalid_entries": [],
  "duplicate_edges": [],
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": { "D": {} },
          "C": { "E": { "F": {} } }
        }
      },
      "depth": 4
    },
    {
      "root": "X",
      "tree": {},
      "has_cycle": true
    }
  ],
  "summary": {
    "total_trees": 1,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```

---

## Frontend Features

- Comma-separated edge input — `A->B, A->C, B->D`
- **Load Sample** button pre-fills a mixed tree + cycle example
- Loading spinner with disabled submit during API call
- Identity card showing `user_id`, `email_id`, `roll_number`
- Summary stats grid — trees / cycles / largest root
- Per-hierarchy card with dark-theme tree JSON, depth badge, cycle warning
- Invalid entries and duplicate edges shown as colour-coded tags
- Friendly error banner when the API is unreachable
- Fully responsive — works on mobile

---

## Environment Variables

`backend/.env`

```env
PORT=5000
NODE_ENV=development
```

---

## Author

**Disha Chawla**
Chitkara University — B.E. Computer Science (2023 batch)
`disha4775.be23@chitkara.edu.in`

# ✨ MeetMind AI

> An intelligent full-stack meeting workspace that transforms meeting transcripts into structured summaries, key discussion topics, action items, chapters, and searchable insights.

---

## 🚀 Live Application

### Access MeetMind AI

🔗 **Live Application:**  
https://kushi-works.vercel.app

> **Note:** The backend is hosted on Render's free tier. If the service has been inactive, the first request may take approximately **30–60 seconds** while the backend wakes up.

### Backend Resources

🔗 **Backend API:**  
https://meet-mind-ai-backend.onrender.com

🔗 **Interactive Swagger API Documentation:**  
https://meet-mind-ai-backend.onrender.com/docs

---

## 📖 About the Project

**MeetMind AI** is a full-stack meeting intelligence platform inspired by applications such as Fireflies.ai. It converts unstructured meeting transcripts into organized, searchable, and actionable meeting information.

Users can create meetings from transcripts, review generated summaries, identify key discussion topics, manage action items, browse transcript chapters, search and filter meetings, edit meeting metadata, and ask contextual questions about a selected meeting.

The application assumes a **default logged-in user**, as permitted by the assignment requirements. Real authentication and user-specific account management are outside the current project scope.

---

## ✨ Key Features

### 🤖 AI-Generated Meeting Intelligence

MeetMind AI processes uploaded meeting transcripts and generates:

- Structured meeting summaries
- Key discussion topics
- Action items and next steps
- Logical meeting chapters
- Speaker-based transcript segments

This allows users to understand important discussions, decisions, responsibilities, and follow-up tasks without reviewing the complete transcript.

### 💬 Ask MeetMind

Users can ask natural-language questions about an individual meeting.

Answers are generated using information from the selected meeting transcript, allowing users to retrieve decisions, responsibilities, deadlines, and discussion details efficiently.

Example questions:

- What were the major decisions?
- What are the next steps?
- Who is responsible for a particular task?
- What deadlines were discussed?
- What problems or risks were identified?

### 📋 Action-Item Management

MeetMind AI supports complete CRUD functionality for action items.

Users can:

- Add new action items
- Edit existing action items
- Assign tasks to participants
- Add due dates
- Mark action items as complete or incomplete
- Delete action items
- Track overall completion progress

### 📝 Meeting Management

Users can:

- Create new meetings
- View all meetings
- Open a detailed meeting workspace
- Edit meeting titles
- Add participants
- Update participant names and email addresses
- Remove participants
- Delete individual meetings

### 🔍 Search, Filter, and Sort

The meeting dashboard supports:

- Keyword-based meeting search
- Participant filtering
- Topic filtering
- Meeting-category filtering
- Newest-first sorting
- Oldest-first sorting

### 📖 Structured Meeting Workspace

Each meeting contains dedicated sections for:

- AI-generated summary
- Key discussion topics
- Next steps
- Complete transcript
- Action items
- Meeting chapters
- Participants
- Meeting metadata
- Ask MeetMind

---

## 🛠️ Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- CSS
- Lucide React
- Fetch API

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- SQLite

### Deployment and Development Tools

- **Vercel** — frontend deployment
- **Render** — backend deployment
- **Git and GitHub** — version control
- **Swagger UI** — interactive API documentation

---

## 🏗️ Project Architecture

```text
meet-mind-ai/
│
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── meeting-card.tsx
│   │   ├── meeting-detail.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── types.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   └── meetings.py
│   │   │
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── requirements.txt
│   ├── seed.py
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 🔄 Application Workflow

```text
User enters meeting details and uploads a transcript
                         │
                         ▼
The Next.js frontend validates the meeting information
                         │
                         ▼
The request is sent to the FastAPI REST API
                         │
                         ▼
The transcript is cleaned and divided into segments
                         │
                         ▼
Meeting intelligence is generated
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Summary         Topics      Action Items
                                         │
                                         ▼
                                      Chapters
                         │
                         ▼
Meeting information is stored in the database
                         │
                         ▼
Structured insights are displayed in MeetMind AI
```

---

## 🔌 REST API

The FastAPI backend exposes RESTful endpoints for meeting and action-item management.

### Meeting Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/meetings` | Retrieve all meetings |
| `POST` | `/api/v1/meetings` | Create and process a meeting |
| `GET` | `/api/v1/meetings/{meeting_id}` | Retrieve complete meeting details |
| `PATCH` | `/api/v1/meetings/{meeting_id}` | Update meeting metadata and participants |
| `DELETE` | `/api/v1/meetings/{meeting_id}` | Delete a meeting |
| `POST` | `/api/v1/meetings/{meeting_id}/ask` | Ask a contextual question about a meeting |

### Action-Item Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/meetings/{meeting_id}/action-items` | Create an action item |
| `PATCH` | `/api/v1/meetings/action-items/{action_item_id}` | Update an action item |
| `DELETE` | `/api/v1/meetings/action-items/{action_item_id}` | Delete an action item |

Complete interactive API documentation is available here:

https://meet-mind-ai-backend.onrender.com/docs

---

## ⚙️ Running the Project Locally

### Prerequisites

Ensure that the following tools are installed:

- Git
- Node.js 18 or later
- npm
- Python 3.11
- pip

---

### 1. Clone the Repository

```bash
git clone https://github.com/kushianil01/meet-mind-ai.git

cd meet-mind-ai
```

---

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment.

#### Windows

```powershell
python -m venv venv

venv\Scripts\activate
```

#### macOS/Linux

```bash
python3 -m venv venv

source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

Swagger API documentation will be available at:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Create a file named:

```text
.env.local
```

Add the following environment variable:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

Start the Next.js development server:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

## 🌐 Deployment

### Frontend — Vercel

The Next.js frontend is deployed using Vercel.

🔗 **Live Application:**  
https://kushi-works.vercel.app

Deployment configuration:

```text
Framework Preset:
Next.js

Root Directory:
frontend

Build Command:
npm run build

Environment Variable:
NEXT_PUBLIC_API_URL=https://meet-mind-ai-backend.onrender.com/api/v1
```

### Backend — Render

The FastAPI backend is deployed using Render.

🔗 **Backend API:**  
https://meet-mind-ai-backend.onrender.com

Deployment configuration:

```text
Root Directory:
backend

Build Command:
pip install -r requirements.txt

Start Command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT

Python Version:
3.11
```

---

## 🔐 Authentication Assumption

As permitted by the assignment specification, MeetMind AI assumes a **default authenticated user**.

The current version does not include:

- User registration
- Login and logout
- Password management
- OAuth
- Separate user accounts
- User-specific workspace isolation

All visitors accessing the deployed demonstration application interact with the default shared workspace.

---

## 📌 Assignment Scope and Placeholders

The following capabilities are outside the required implementation scope and may be represented as placeholders:

- A real-time meeting bot that joins live calls
- Real-time speech-to-text transcription
- Zoom integration
- Google Meet integration
- Calendar integration
- CRM integration
- Team sharing and collaboration
- Real user authentication

---

## 🔮 Future Enhancements

Potential future improvements include:

- Large-language-model-based meeting summarization
- Real-time speech-to-text processing
- Audio and video meeting uploads
- Speaker diarization
- Semantic transcript search
- Vector embeddings
- Retrieval-augmented generation
- User authentication and authorization
- User-specific meeting workspaces
- Team collaboration
- Role-based access control
- Zoom and Google Meet integrations
- Google Calendar integration
- PostgreSQL database support
- Cloud storage for meeting recordings
- Action-item deadline reminders

---

## 👩‍💻 Author

**Kushi Anil Kumbar**

GitHub:

https://github.com/kushianil01

---

## 🔗 Project Links

- **Live Application:** https://kushi-works.vercel.app
- **Backend API:** https://meet-mind-ai-backend.onrender.com
- **API Documentation:** https://meet-mind-ai-backend.onrender.com/docs
- **GitHub Repository:** https://github.com/kushianil01/meet-mind-ai

---

## 📄 License

This project was developed as a full-stack software engineering assignment and is intended for educational and evaluation purposes.

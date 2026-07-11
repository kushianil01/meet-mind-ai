MeetMind AI
> An intelligent full-stack meeting workspace that transforms raw meeting transcripts into structured summaries, key discussion topics, action items, chapters, and searchable insights.
Live Application
Visit the deployed application:
https://kushi-works.vercel.app
> Note: The backend is hosted on Render's free tier. After inactivity, the first request may take approximately 30–60 seconds while the service wakes up.
Backend and API Documentation
Backend API:
https://meet-mind-ai-backend.onrender.com
Interactive Swagger documentation:
https://meet-mind-ai-backend.onrender.com/docs
---
About the Project
MeetMind AI is a full-stack meeting intelligence platform inspired by applications such as Fireflies.ai. It converts unstructured meeting transcripts into organized and actionable meeting information.
Users can create meetings from transcripts, review generated summaries, identify key discussion topics, manage action items, browse transcript chapters, search and filter meetings, edit meeting metadata, and ask contextual questions about a selected meeting.
The application assumes a default logged-in user, as permitted by the assignment requirements. Real authentication and user-specific account management are outside the current scope.
---
Key Features
Meeting Creation and Transcript Processing
Create meetings using meeting metadata and a transcript
Store the meeting title, date, duration, participants, and transcript
Generate a structured meeting summary
Extract key discussion topics
Generate action items and next steps
Organize conversations into chapters
Display speaker-based transcript segments
AI Meeting Summary
Generate a concise meeting overview
Highlight important outcomes and decisions
Display key discussion topics
Present next steps clearly
Copy generated meeting content
Ask MeetMind
Users can ask natural-language questions about an individual meeting. Answers are grounded in the selected meeting transcript and its stored information.
Example questions:
What were the major decisions?
What are the next steps?
Who is responsible for a task?
What deadlines were discussed?
What problems or risks were identified?
Action-Item Management
The application supports complete CRUD functionality for action items:
Add new action items
Edit existing action items
Assign tasks
Add due dates
Mark action items as complete or incomplete
Delete action items
Track completion progress
Meeting Management
View all meetings
Open detailed meeting workspaces
Edit meeting titles
Add participants
Edit participant names and email addresses
Remove participants
Delete meetings
Search, Filter, and Sort
Search meetings by keyword
Filter by participant
Filter by topic
Switch between meeting categories
Sort from newest to oldest
Sort from oldest to newest
Structured Meeting Workspace
Each meeting provides dedicated sections for:
AI-generated summary
Key discussion topics
Next steps
Full transcript
Action items
Chapters
Participants
Meeting metadata
Ask MeetMind
---
Technology Stack
Frontend
Next.js
React
TypeScript
CSS
Lucide React
Fetch API
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Uvicorn
SQLite
Deployment and Development
Vercel — frontend deployment
Render — backend deployment
Git and GitHub — version control
Swagger UI — interactive API documentation
---
Project Architecture
```text
meet-mind-ai/
|
|-- frontend/
|   |-- app/
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |
|   |-- components/
|   |   |-- meeting-card.tsx
|   |   |-- meeting-detail.tsx
|   |   `-- ...
|   |
|   |-- lib/
|   |   |-- api.ts
|   |   `-- types.ts
|   |
|   |-- package.json
|   `-- tsconfig.json
|
|-- backend/
|   |-- app/
|   |   |-- routers/
|   |   |   `-- meetings.py
|   |   |-- config.py
|   |   |-- database.py
|   |   |-- main.py
|   |   |-- models.py
|   |   `-- schemas.py
|   |
|   |-- requirements.txt
|   |-- seed.py
|   `-- .env.example
|
|-- .gitignore
`-- README.md
```
---
Application Workflow
```text
User enters meeting details and uploads a transcript
                         |
                         v
The Next.js frontend validates and sends the data
                         |
                         v
The FastAPI REST API receives the meeting request
                         |
                         v
The transcript is cleaned and divided into segments
                         |
                         v
Meeting intelligence is generated:
summary, topics, action items, and chapters
                         |
                         v
Meeting information is stored in the database
                         |
                         v
Structured insights are displayed in MeetMind AI
```
---
REST API
Meeting Endpoints
Method	Endpoint	Description
`GET`	`/api/v1/meetings`	Retrieve all meetings
`POST`	`/api/v1/meetings`	Create and process a meeting
`GET`	`/api/v1/meetings/{meeting_id}`	Retrieve complete meeting details
`PATCH`	`/api/v1/meetings/{meeting_id}`	Update meeting metadata and participants
`DELETE`	`/api/v1/meetings/{meeting_id}`	Delete a meeting
`POST`	`/api/v1/meetings/{meeting_id}/ask`	Ask a contextual question about a meeting
Action-Item Endpoints
Method	Endpoint	Description
`POST`	`/api/v1/meetings/{meeting_id}/action-items`	Create an action item
`PATCH`	`/api/v1/meetings/action-items/{action_item_id}`	Update an action item
`DELETE`	`/api/v1/meetings/action-items/{action_item_id}`	Delete an action item
Complete interactive API documentation:
https://meet-mind-ai-backend.onrender.com/docs
---
Running the Project Locally
Prerequisites
Git
Node.js 18 or later
npm
Python 3.11
pip
1. Clone the Repository
```bash
git clone https://github.com/kushianil01/meet-mind-ai.git
cd meet-mind-ai
```
2. Set Up the Backend
```bash
cd backend
```
Create and activate a virtual environment.
Windows:
```powershell
python -m venv venv
venv\Scripts\activate
```
macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```
Install dependencies:
```bash
pip install -r requirements.txt
```
Start FastAPI:
```bash
uvicorn app.main:app --reload
```
Backend:
```text
http://127.0.0.1:8000
```
Swagger documentation:
```text
http://127.0.0.1:8000/docs
```
3. Set Up the Frontend
Open another terminal:
```bash
cd frontend
npm install
```
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```
Start Next.js:
```bash
npm run dev
```
Open:
```text
http://localhost:3000
```
---
Deployment
Frontend — Vercel
Live application:
https://kushi-works.vercel.app
Configuration:
```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Environment Variable:
NEXT_PUBLIC_API_URL=https://meet-mind-ai-backend.onrender.com/api/v1
```
Backend — Render
Backend:
https://meet-mind-ai-backend.onrender.com
Configuration:
```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
Python Version: 3.11
```
---
Authentication Assumption
As permitted by the assignment specification, MeetMind AI assumes a default authenticated user.
The current version does not include:
User registration
Login and logout
Password management
OAuth
Separate user accounts
User-specific workspace isolation
All visitors to the deployed demonstration application interact with the default shared workspace.
---
Assignment Scope and Placeholders
The following capabilities are outside the required implementation scope and may be represented as placeholders:
A real-time bot that joins live calls
Actual speech-to-text transcription
Zoom integration
Google Meet integration
Calendar integration
CRM integration
Team sharing and collaboration
Real user authentication
---
Future Enhancements
LLM-based meeting summarization
Real-time speech-to-text processing
Audio and video meeting uploads
Speaker diarization
Semantic transcript search
Vector embeddings and retrieval-augmented generation
User authentication and authorization
User-specific workspaces
Team collaboration
Role-based access control
Zoom and Google Meet integrations
Google Calendar integration
PostgreSQL database support
Cloud storage for recordings
Action-item deadline reminders
---
Author
Kushi Anil Kumbar
GitHub:
https://github.com/kushianil01
---
Project Links
Live application: https://kushi-works.vercel.app
Backend API: https://meet-mind-ai-backend.onrender.com
API documentation: https://meet-mind-ai-backend.onrender.com/docs
GitHub repository: https://github.com/kushianil01/meet-mind-ai
---
License
This project was developed as a full-stack software engineering assignment and is intended for educational and evaluation purposes.
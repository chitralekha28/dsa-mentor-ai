# DSA Mentor AI

A LeetCode-style, full-stack DSA preparation platform with:
- Company-wise problems
- Problem-solving interface
- Monaco Editor (VS Code-like)
- Flask backend
- AI code review integration

## Tech Stack
- Frontend: React
- Backend: Flask (Python)
- Editor: Monaco Editor
- AI Review: Gemini API

## Features
- Company-wise DSA problems
- LeetCode-style problem description
- Multi-language editor
- Python code execution against hidden test cases
- Submit flow with optional Gemini AI review

## Status
Prototype complete. The main Google/Amazon practice flow builds and the Python judge is wired through the Flask API.

## Run Locally

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
$env:GEMINI_API_KEY="your_gemini_api_key"
python app.py
```

Frontend:

```bash
cd frontend
npm install
npm start
```

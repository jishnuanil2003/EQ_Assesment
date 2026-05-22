# 🧠 EQ Assessment System

An AI-powered Emotional Intelligence (EQ) Assessment platform that analyzes user responses to emotionally challenging workplace scenarios using NLP and Transformer-based models.

The system evaluates emotional awareness, empathy, resilience, conflict resolution, and social intelligence through sentiment analysis and emotion detection.

---

# 🚀 Features

- AI-generated workplace scenarios
- Emotion Detection using Transformers
- Sentiment Analysis using HuggingFace models
- Dynamic EQ Scoring Engine
- Beautiful React Dashboard
- Interactive Charts & Visualizations
- Personalized EQ Insights
- Profession-based scenarios
- Modern dark-themed UI

---

# 📌 Problem Statement

Traditional personality and EQ tests rely heavily on static multiple-choice questionnaires that fail to capture real emotional reasoning and behavioral intelligence.

This project solves that problem by:

- Presenting realistic emotional scenarios
- Collecting descriptive responses
- Using NLP models to analyze emotional patterns
- Generating intelligent EQ insights dynamically

The system provides a more human-like and contextual emotional intelligence evaluation.

---

# 💡 Solution

The platform uses:

- **React.js** for frontend UI
- **FastAPI** for backend APIs
- **HuggingFace Transformers** for NLP inference
- **Emotion Classification Models**
- **Sentiment Analysis Models**
- **Recharts** for analytics visualization

Users answer emotionally complex scenarios, and the AI system evaluates:

- Emotional stability
- Self-awareness
- Empathy
- Social intelligence
- Conflict handling
- Motivation & resilience

---

# 🏗️ System Architecture

```text
                ┌────────────────────┐
                │   React Frontend   │
                │  (Vite + Recharts) │
                └─────────┬──────────┘
                          │ HTTP API
                          ▼
                ┌────────────────────┐
                │    FastAPI Server  │
                │  Business Logic    │
                └─────────┬──────────┘
                          │
          ┌───────────────┴────────────────┐
          ▼                                ▼
┌────────────────────┐        ┌────────────────────────┐
│ Sentiment Analysis │        │ Emotion Classification │
│ DistilBERT SST-2   │        │ DistilRoBERTa Emotion  │
└────────────────────┘        └────────────────────────┘
          ▼                                ▼
                ┌────────────────────┐
                │  EQ Scoring Engine │
                └─────────┬──────────┘
                          ▼
                ┌────────────────────┐
                │ Results Dashboard  │
                └────────────────────┘
```

---

# 🧠 AI Models Used

## Sentiment Analysis
- Model:
`distilbert-base-uncased-finetuned-sst-2-english`

Purpose:
- Detects positive or negative sentiment in user responses.

---

## Emotion Detection
- Model:
`j-hartmann/emotion-english-distilroberta-base`

Detects:
- Joy
- Anger
- Fear
- Sadness
- Surprise
- Neutral
- Disgust

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Recharts
- Vanilla CSS

## Backend
- FastAPI
- Python
- HTTPX
- Pydantic

## AI/NLP
- HuggingFace Inference API
- Transformers
- DistilBERT
- DistilRoBERTa

---

# 📂 Project Structure

```text
EQ_Assessment/
│
├── Backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation

# 1️⃣ Clone Repository

```bash
git clone https://github.com/jishnuanil2003/EQ_Assesment.git
```

---

# 2️⃣ Backend Setup

```bash
cd Backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env`

```env
HF_TOKEN=your_huggingface_api_token
```

Run FastAPI server:

```bash
uvicorn main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

---

# 3️⃣ Frontend Setup

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Run React app:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# 📡 API Endpoints

## Generate Scenario

### POST `/api/scenario`

Request:

```json
{
  "age": 24,
  "gender": "Male",
  "profession": "Software Engineer"
}
```

Response:

```json
{
  "scenario": "You discover a critical bug in production...",
  "questions": [...]
}
```

---

## Assess EQ

### POST `/api/assess`

Request:

```json
{
  "profile": {...},
  "questions": [...],
  "answers": [...]
}
```

Response:

```json
{
  "eq_scores": {
    "overall": 78
  }
}
```

---

# 🧮 EQ Scoring Logic

The scoring engine combines:

- Sentiment polarity
- Emotion dominance
- Emotional balance
- Response quality
- Reflection depth
- Empathy indicators

Each EQ category is scored independently.

Final score normalized to:
- 0 → 100

---

# 📊 Dashboard Features

- Circular EQ score visualization
- Radar chart analysis
- Emotion distribution graphs
- Sentiment breakdown
- Personalized recommendations

---

# 🖼️ Screenshots

## Landing Page

<img width="2559" height="1310" alt="Screenshot 2026-05-23 000623" src="https://github.com/user-attachments/assets/653a9efd-ae5e-4f1a-9288-42dceef9448c" />


---

## Assessment Questions

<img width="2559" height="1309" alt="Screenshot 2026-05-23 000825" src="https://github.com/user-attachments/assets/922ec189-18e2-4514-b6ee-1b3165c39a46" />

<img width="2559" height="1311" alt="Screenshot 2026-05-23 000939" src="https://github.com/user-attachments/assets/d6569c5d-5939-40c9-9f37-244de0fe9e81" />

---

## Results Dashboard

<img width="2561" height="3334" alt="screencapture-localhost-5173-2026-05-23-00_10_20" src="https://github.com/user-attachments/assets/dc9d8a42-d57a-49b5-b2e5-2e294c6e1816" />

<img width="2561" height="2978" alt="screencapture-localhost-5173-2026-05-23-00_10_05" src="https://github.com/user-attachments/assets/c2a83f95-8fc9-4033-a7e9-006dc2e527a8" />

<img width="2561" height="1965" alt="screencapture-localhost-5173-2026-05-23-00_09_51" src="https://github.com/user-attachments/assets/4712a953-ee35-4a8b-ae9f-ce35d966fe82" />

# 🔐 Environment Variables

```env
HF_TOKEN=your_huggingface_token
```

---

# 📦 requirements.txt

```txt
fastapi
uvicorn
httpx
python-dotenv
pydantic
```

---

# 🌟 Future Improvements

- Voice-based EQ assessment
- LLM-powered feedback generation
- PDF report generation
- User authentication
- Database integration
- Historical performance tracking
- Real-time AI coaching

---

# 👨‍💻 Author

## Jishnu A

AI/ML Developer | React Developer

- Passionate about NLP & Generative AI
- Building intelligent human-centered applications

GitHub:
https://github.com/jishnuanil2003

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you like this project:

- Star the repository
- Fork the project
- Share feedback
- Contribute improvements

---

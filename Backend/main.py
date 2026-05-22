from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import random

# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(title="EQ Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# LOAD AI MODELS LOCALLY
# =========================================================

print("Loading sentiment model...")

sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
)

print("Loading emotion model...")

emotion_pipeline = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

print("Models loaded successfully!")

# =========================================================
# EQ CATEGORIES
# =========================================================

EQ_CATEGORIES = [
    "Self-Awareness",
    "Emotional Resilience",
    "Empathy",
    "Conflict Resolution",
    "Social Awareness",
    "Motivation & Drive",
    "Cultural Awareness",
]

# =========================================================
# PYDANTIC MODELS
# =========================================================

class UserProfile(BaseModel):
    age: int
    gender: str
    profession: str


class AssessmentRequest(BaseModel):
    profile: UserProfile
    answers: list[str]
    questions: list[str]


class ScenarioResponse(BaseModel):
    scenario: str
    questions: list[str]

# =========================================================
# AI ANALYSIS FUNCTIONS
# =========================================================

async def analyze_sentiment(text: str):
    try:
        result = sentiment_pipeline(text)

        print("SENTIMENT:", result)

        return result[0]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sentiment analysis failed: {str(e)}"
        )


async def analyze_emotion(text: str):
    try:
        result = emotion_pipeline(text)

        print("EMOTION:", result)

        # Extract inner list
        emotions = result[0]

        # Find dominant emotion
        dominant = max(emotions, key=lambda x: x["score"])

        return {
            "dominant": dominant,
            "all": emotions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Emotion analysis failed: {str(e)}"
        )
    

# =========================================================
# SCENARIOS
# =========================================================

SCENARIOS = {
    "default": [
        "You are leading a high-stakes project when a key team member suddenly resigns two days before the deadline. The remaining team is panicking and productivity has dropped significantly.",

        "During an important client presentation, you realize the data in your slides contains a significant error. Your manager is present and the client is already skeptical.",

        "A colleague takes credit for your idea in a team meeting in front of senior leadership. You can see others are aware of what happened.",
    ],

    "Medical": [
        "A patient becomes extremely aggressive toward your team after receiving a difficult diagnosis. Hospital staff are visibly shaken and looking to you for direction.",

        "You discover a senior colleague has been making repeated medication errors but is well-liked by management. Patients could be at risk.",
    ],

    "Engineering": [
        "You discover a critical bug in production code an hour before a major client demo. Your manager insists the demo proceeds regardless.",

        "Two senior engineers on your team have a heated public disagreement about architecture, blocking the entire team's progress.",
    ],

    "Education": [
        "A student confides they are failing because of serious issues at home. School policy requires you to report, but the student begs you not to.",

        "Parents of a struggling student accuse you of bias in grading during a heated parent-teacher meeting.",
    ],

    "Finance": [
        "You discover a discrepancy in financial reports that, if disclosed, could severely impact your company's stock price and your colleagues' jobs.",

        "A high-value client pressures you to bend compliance rules slightly in their favor, hinting at pulling their account if you refuse.",
    ],
}

QUESTIONS_TEMPLATE = [
    "How did you feel emotionally in the first moments of this situation, and why?",

    "What specific actions would you take, and how would you prioritize them?",

    "How would you manage the emotions of others involved while handling your own?",

    "Describe a past experience that prepared you for something like this. What did you learn?",

    "How would you ensure this situation doesn't negatively impact team morale long-term?",
]

def get_scenario(profession: str) -> str:
    key = profession.lower()

    for k in SCENARIOS:
        if k in key:
            return random.choice(SCENARIOS[k])

    return random.choice(SCENARIOS["default"])

# =========================================================
# EQ SCORING ENGINE
# =========================================================

POSITIVE_EMOTIONS = {"joy", "surprise"}
NEGATIVE_EMOTIONS = {"anger", "disgust", "fear", "sadness"}

CATEGORY_WEIGHTS = {
    "Self-Awareness":       [0, 3],
    "Emotional Resilience": [0, 4],
    "Empathy":              [2, 4],
    "Conflict Resolution":  [1, 2],
    "Social Awareness":     [2, 3],
    "Motivation & Drive":   [1, 3],
    "Cultural Awareness":   [2, 4],
}

def compute_eq_scores(
    sentiments,
    emotions,
    profile
):
    scores = {}

    for category, indices in CATEGORY_WEIGHTS.items():

        base = 50.0

        for idx in indices:

            sent = sentiments[idx]
            emot = emotions[idx]

            # Sentiment scoring
            if sent["label"] == "POSITIVE":
                base += sent["score"] * 15
            else:
                base -= sent["score"] * 10

            # Emotion scoring
            dom = emot["dominant"]["label"].lower()

            if dom in POSITIVE_EMOTIONS:
                base += 8

            elif dom in NEGATIVE_EMOTIONS:
                base -= 5

        # Clamp score
        scores[category] = round(
            min(100, max(0, base)),
            1
        )

    # Age factor
    age_factor = (
        min((profile.age - 18) * 0.2, 8)
        if profile.age > 18
        else 0
    )

    for cat in scores:
        scores[cat] = round(
            min(100, scores[cat] + age_factor),
            1
        )

    overall = round(
        sum(scores.values()) / len(scores),
        1
    )

    return {
        "categories": scores,
        "overall": overall
    }

# =========================================================
# RESULT INTERPRETATION
# =========================================================

def interpret_eq(score):

    if score >= 85:
        return {
            "level": "Exceptional EQ",
            "color": "#00C9A7",
            "description": "You demonstrate outstanding emotional intelligence.",
            "suggestions": [
                "Mentor others",
                "Take leadership roles",
                "Develop executive coaching skills"
            ]
        }

    elif score >= 70:
        return {
            "level": "High EQ",
            "color": "#4FC3F7",
            "description": "You show strong emotional awareness.",
            "suggestions": [
                "Practice mindfulness",
                "Improve self-awareness",
                "Strengthen communication"
            ]
        }

    elif score >= 55:
        return {
            "level": "Average EQ",
            "color": "#FFD54F",
            "description": "You have functional emotional intelligence.",
            "suggestions": [
                "Practice active listening",
                "Journal emotions",
                "Improve emotional regulation"
            ]
        }

    else:
        return {
            "level": "Developing EQ",
            "color": "#FF7043",
            "description": "Your EQ is still developing.",
            "suggestions": [
                "Take EQ courses",
                "Work on self-reflection",
                "Develop empathy skills"
            ]
        }

# =========================================================
# API ROUTES
# =========================================================

@app.get("/")
def root():
    return {
        "status": "EQ Assessment API running"
    }

# ---------------------------------------------------------

@app.post(
    "/api/scenario",
    response_model=ScenarioResponse
)
async def generate_scenario(profile: UserProfile):

    scenario = get_scenario(profile.profession)

    return ScenarioResponse(
        scenario=scenario,
        questions=QUESTIONS_TEMPLATE
    )

# ---------------------------------------------------------

@app.post("/api/assess")
async def assess(req: AssessmentRequest):

    if len(req.answers) != len(req.questions):
        raise HTTPException(
            status_code=400,
            detail="Answer count must match question count"
        )

    # Validate answer quality
    for i, ans in enumerate(req.answers):

        if len(ans.strip().split()) < 10:
            raise HTTPException(
                status_code=400,
                detail=f"Answer {i+1} is too short (minimum 10 words)"
            )

    sentiments = []
    emotions = []

    # AI Analysis
    for answer in req.answers:

        sent = await analyze_sentiment(answer)
        emot = await analyze_emotion(answer)

        sentiments.append(sent)
        emotions.append(emot)

    # Score calculation
    scoring = compute_eq_scores(
        sentiments,
        emotions,
        req.profile
    )

    interpretation = interpret_eq(
        scoring["overall"]
    )

    # Detailed breakdown
    breakdown = []

    for i, (ans, sent, emot) in enumerate(
        zip(req.answers, sentiments, emotions)
    ):

        breakdown.append({
            "question": req.questions[i],
            "answer": ans,
            "sentiment": sent,
            "dominant_emotion": emot["dominant"],
            "all_emotions": emot["all"],
        })

    return {
        "profile": req.profile.model_dump(),
        "eq_scores": scoring,
        "interpretation": interpretation,
        "breakdown": breakdown,
    }
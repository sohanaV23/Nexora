import os
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

MODEL_PATH = 'ml-service/models/complaint_classifier.joblib'

app = FastAPI(
    title="Nexora ML Intelligence Service",
    description="Local Machine Learning Service for Apartment Maintenance Classification & Duplicate Detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

model_pipeline = None

def load_model():
    global model_pipeline
    if os.path.exists(MODEL_PATH):
        try:
            model_pipeline = joblib.load(MODEL_PATH)
            print(f"Loaded ML model artifact from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")

load_model()

class ClassifyRequest(BaseModel):
    title: str
    description: str

class ClassifyResponse(BaseModel):
    predicted_category: str
    confidence: float
    needs_human_review: bool
    model_version: str = "v1.0-tfidf-logreg"
    probabilities: Dict[str, float]

class ExistingComplaintItem(BaseModel):
    id: str
    title: str
    description: str

class DuplicateCheckRequest(BaseModel):
    query_text: str
    existing_complaints: List[ExistingComplaintItem]
    threshold: Optional[float] = 0.50

class DuplicateMatch(BaseModel):
    complaint_id: str
    title: str
    similarity_score: float
    is_duplicate: bool

class DuplicateCheckResponse(BaseModel):
    duplicate_found: bool
    matches: List[DuplicateMatch]

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "Nexora ML Service",
        "model_loaded": model_pipeline is not None,
        "model_path": MODEL_PATH
    }

@app.post("/api/v1/classify", response_model=ClassifyResponse)
def classify_complaint(req: ClassifyRequest):
    global model_pipeline
    if model_pipeline is None:
        load_model()
    if model_pipeline is None:
        raise HTTPException(status_code=503, detail="ML model is not yet trained or loaded.")

    full_text = f"{req.title} {req.description}".strip()
    if not full_text:
        raise HTTPException(status_code=400, detail="Title and description cannot be empty.")

    # Predict class & probabilities
    pred = model_pipeline.predict([full_text])[0]
    probs = model_pipeline.predict_proba([full_text])[0]
    classes = model_pipeline.classes_

    prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(classes, probs)}
    top_confidence = round(float(max(probs)), 4)
    needs_review = top_confidence < 0.55

    return ClassifyResponse(
        predicted_category=pred,
        confidence=top_confidence,
        needs_human_review=needs_review,
        probabilities=prob_dict
    )

@app.post("/api/v1/duplicates/check", response_model=DuplicateCheckResponse)
def check_duplicates(req: DuplicateCheckRequest):
    if not req.existing_complaints:
        return DuplicateCheckResponse(duplicate_found=False, matches=[])

    corpus = [req.query_text] + [
        f"{item.title} {item.description}" for item in req.existing_complaints
    ]

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Cosine similarity between index 0 (query) and all others
    sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    matches = []
    duplicate_found = False

    for idx, sim in enumerate(sims):
        score = round(float(sim), 4)
        is_dup = score >= req.threshold
        if is_dup:
            duplicate_found = True

        matches.append(DuplicateMatch(
            complaint_id=req.existing_complaints[idx].id,
            title=req.existing_complaints[idx].title,
            similarity_score=score,
            is_duplicate=is_dup
        ))

    matches.sort(key=lambda m: m.similarity_score, reverse=True)

    return DuplicateCheckResponse(
        duplicate_found=duplicate_found,
        matches=matches
    )

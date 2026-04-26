from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

from analyzer.preprocess import clean_text, basic_signals
from analyzer.credibility import heuristic_score
from analyzer.analyzer import analyze_text
from analyzer.genocide_checker import check_genocide_content

app = FastAPI(title="Nocap AI Service")

@app.get("/health")
def health():
    return {"status": "ok"}

class TextRequest(BaseModel):
    text: str
    source_url: Optional[str] = None

@app.post("/analyze")
def analyze(request: TextRequest):
    text = clean_text(request.text)
    signals = basic_signals(text)
    score = heuristic_score(signals)

    # Run specialized genocide content checker
    genocide_check = check_genocide_content(text, request.source_url)

    # Apply genocide-specific score adjustment
    if genocide_check["is_relevant"]:
        score = max(0.0, min(1.0, score + genocide_check["score_adjustment"]))

    # Determine verdict
    if score >= 0.7:
        verdict = "likely_real"
    elif score >= 0.5:
        verdict = "uncertain"
    else:
        verdict = "likely_fake"

    return {
        "credibility_score": score,
        "signals": signals,
        "verdict": verdict,
        "genocide_check": genocide_check
    }

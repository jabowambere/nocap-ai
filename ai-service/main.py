from fastapi import FastAPI
from pydantic import BaseModel

from analyzer.preprocess import clean_text, basic_signals
from analyzer.credibility import heuristic_score
from analyzer.analyzer import analyze_text

app = FastAPI(title="Nocap AI Service")
    
class TextRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze(request: TextRequest):
    text = clean_text(request.text)
    signals = basic_signals(text)
    score = heuristic_score(signals)

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
        "verdict": verdict
    }

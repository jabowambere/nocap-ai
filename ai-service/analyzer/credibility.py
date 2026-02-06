def heuristic_score(signals: dict) -> float:
    score = 0.5  # neutral baseline

    # Negative signals (sensationalism)
    if signals["all_caps_ratio"] > 0.3:
        score -= 0.2

    if signals["exclamation_count"] > 5:
        score -= 0.2

    if signals["emotional_words"] > 3:
        score -= 0.15

    if signals["length"] < 120:
        score -= 0.1

    # Positive signals (credibility)
    if signals["trusted_domain_count"] >= 1:
        score += 0.25

    if signals["trusted_domain_count"] >= 3:
        score += 0.15

    if signals["has_citations"]:
        score += 0.1

    if signals["neutral_tone"]:
        score += 0.1

    return max(0.0, min(1.0, score))

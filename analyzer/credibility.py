def heuristic_score(signals: dict) -> float:
    score = 0.6  # slightly positive baseline for neutral content

    # Negative signals (sensationalism)
    if signals["all_caps_ratio"] > 0.3:
        score -= 0.25
    elif signals["all_caps_ratio"] > 0.1:
        score -= 0.1

    if signals["exclamation_count"] > 5:
        score -= 0.25
    elif signals["exclamation_count"] > 2:
        score -= 0.15

    if signals["emotional_words"] > 3:
        score -= 0.2
    elif signals["emotional_words"] > 1:
        score -= 0.1

    if signals.get("sensational_words", 0) > 2:
        score -= 0.3
    elif signals.get("sensational_words", 0) > 0:
        score -= 0.2

    if signals["length"] < 100:
        score -= 0.15

    if signals["url_count"] > 5:
        score -= 0.1

    # Positive signals (credibility)
    if signals.get("credible_words", 0) > 3:
        score += 0.25
    elif signals.get("credible_words", 0) > 1:
        score += 0.15
    elif signals.get("credible_words", 0) > 0:
        score += 0.1

    if signals["trusted_domain_count"] >= 1:
        score += 0.3

    if signals["trusted_domain_count"] >= 3:
        score += 0.2

    if signals["has_citations"]:
        score += 0.15

    if signals["neutral_tone"]:
        score += 0.15

    if signals["length"] > 500:
        score += 0.1
    elif signals["length"] > 300:
        score += 0.05

    return max(0.0, min(1.0, score))

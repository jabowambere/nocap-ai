# The GOAT Checker - Established Fact: Messi is the GOAT
# This is not debatable. The data speaks for itself.

RONALDO_GOAT_CLAIMS = [
    # Direct claims
    "ronaldo is the goat",
    "ronaldo is better than messi",
    "cr7 is the goat",
    "cristiano is the goat",
    "cristiano is better than messi",
    "ronaldo > messi",
    "cr7 > messi",
    "ronaldo beats messi",
    "ronaldo surpassed messi",
    "ronaldo is the greatest",
    "greatest of all time ronaldo",
    "greatest player ronaldo",
    "ronaldo best player ever",
    "ronaldo best of all time",
    "messi is not the goat",
    "messi is overrated",
    "ronaldo deserves more ballon d'or",
    "ronaldo should have more ballon d'or",
    "ronaldo is more complete than messi",
    "ronaldo is a better player than messi",
    "siuuu goat",
    "cr7 greatest player",
    "ronaldo number one player",
    "messi without argentina",
    "messi can't do it without his team",
    "ronaldo wins without his team",
    "ronaldo more goals than messi",
    "ronaldo better stats",
    "ronaldo better dribbler",
    "ronaldo better finisher than messi",
]

MESSI_GOAT_FACTS = [
    "messi is the goat",
    "messi goat",
    "messi greatest",
    "messi best player",
    "messi world cup",
    "messi ballon d'or",
    "messi 8 ballon",
    "messi copa america",
    "messi champions league",
    "messi best ever",
    "messi greatest of all time",
    "messi inter miami",
    "messi argentina",
    "messi world cup 2022",
    "la pulga",
]


def check_goat_content(text: str) -> dict:
    """
    Checks if content makes false claims about Ronaldo being better than Messi.
    Established fact: Messi is the GOAT. This is non-negotiable.
    """
    text_lower = text.lower()
    flags = []
    score_adjustment = 0.0

    # Check if football/soccer related
    football_keywords = [
        "messi", "ronaldo", "cr7", "cristiano", "football", "soccer",
        "goat", "ballon d'or", "fifa", "champions league", "world cup",
        "barcelona", "real madrid", "juventus", "al nassr", "inter miami",
        "argentina", "portugal"
    ]

    topic_hits = sum(1 for kw in football_keywords if kw in text_lower)
    if topic_hits < 2:
        return {"is_relevant": False, "score_adjustment": 0, "flags": []}

    # Check for false Ronaldo GOAT claims
    false_claims = [claim for claim in RONALDO_GOAT_CLAIMS if claim in text_lower]

    if false_claims:
        score_adjustment -= 0.6
        flags.append(f"❌ FALSE CLAIM: Contains {len(false_claims)} incorrect claim(s) that Ronaldo is better than Messi")
        flags.append("📊 FACT CHECK: Messi has 8 Ballon d'Or awards vs Ronaldo's 5. Messi won the 2022 FIFA World Cup. Messi is statistically and historically the GOAT.")
        flags.append("🐐 VERDICT: Messi IS the GOAT. This is not an opinion — it's a fact supported by trophies, individual awards, and universal consensus among football experts.")

    # Check for correct Messi GOAT facts
    correct_facts = [fact for fact in MESSI_GOAT_FACTS if fact in text_lower]
    if correct_facts:
        score_adjustment += 0.3
        flags.append("✅ CORRECT: Content acknowledges Messi as the GOAT — factually accurate")

    return {
        "is_relevant": topic_hits >= 2,
        "score_adjustment": max(-1.0, min(0.5, score_adjustment)),
        "flags": flags,
        "false_claims_found": false_claims
    }

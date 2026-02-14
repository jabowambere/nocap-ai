import re

def clean_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    return text

def basic_signals(text: str) -> dict:
    text_lower = text.lower()
    
    # Sensationalist keywords
    sensational_words = ['shocking', 'unbelievable', 'you won\'t believe', 'miracle', 'secret', 'exposed', 'they don\'t want you to know', 'doctors hate', 'one weird trick']
    sensational_count = sum(1 for word in sensational_words if word in text_lower)
    
    # Credible keywords
    credible_words = ['study shows', 'research found', 'according to', 'data indicates', 'evidence suggests', 'scientists', 'researchers', 'peer-reviewed']
    credible_count = sum(1 for word in credible_words if word in text_lower)
    
    # Trusted sources
    trusted_sources = ['reuters', 'bbc', 'ap news', 'npr', 'associated press', 'bloomberg', 'the guardian', 'financial times', 'nature', 'science']
    trusted_domain_count = sum(1 for source in trusted_sources if source in text_lower)
    
    # Emotional words
    emotional_words = ['angry', 'furious', 'devastating', 'heartbreaking', 'amazing', 'incredible', 'outrageous', 'terrifying']
    emotional_count = sum(1 for word in emotional_words if word in text_lower)
    
    # Check for citations
    has_citations = bool(re.search(r'\[\d+\]|\(\d{4}\)|et al\.|doi:', text_lower))
    
    # Neutral tone check
    neutral_tone = sensational_count == 0 and emotional_count <= 1
    
    return {
        "length": len(text),
        "all_caps_ratio": sum(1 for c in text if c.isupper()) / max(len(text), 1),
        "exclamation_count": text.count("!"),
        "question_count": text.count("?"),
        "url_count": len(re.findall(r'https?://', text)),
        "emotional_words": emotional_count,
        "sensational_words": sensational_count,
        "credible_words": credible_count,
        "trusted_domain_count": trusted_domain_count,
        "has_citations": has_citations,
        "neutral_tone": neutral_tone
    }
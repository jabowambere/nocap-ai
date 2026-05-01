# Known false narratives and denial patterns about the Genocide Against the Tutsi
# Sources: UN, Ibuka, African Rights, Human Rights Watch, ICTR rulings

DENIAL_PATTERNS = [
    # Victoire Ingabire — convicted genocide denier/minimizer
    "victoire ingabire",
    "ingabire umuhoza",
    "ingabire released",
    "ingabire acquitted",
    "ingabire innocent",
    "free ingabire",
    "ingabire political prisoner",
    "rwandan voices rise for victoire",
    "support ingabire",
    "release of victoire",
    "release ingabire",
    "demanding the release of victoire",
    "held at mageragere",
    "mageragere prison",
    "jambo asbl",
    "sos refugies",
    "umutesi",

    # Anti-Rwanda government framing used by denial circles
    "authoritarian regime",
    "authoritarian rule",
    "no visit rwanda",
    "rwandan authoritarian",
    "clung to power for over three decades",
    "stifles free speech",
    "kagame regime",
    "rwandan regime",
    "end its collaboration with the rwandan government",
    "legitimize further repression",
    "inclusive political space",
    "all rwandan citizens and political parties",
    "double genocide",
    "two genocides",
    "tutsi also committed genocide",
    "both sides committed genocide",
    "hutu genocide",
    "reciprocal genocide",
    "genocide of hutus",
    "hutugenocide",
    "genocide against hutu",

    # RPF blame / false atrocity attribution (the exact narrative in the example)
    "rpf used grenades",
    "rpf killed",
    "rpa used grenades",
    "rpa killed",
    "rpa used guns",
    "asked people to gather",
    "gather in certain areas",
    "gather in schools",
    "gather in markets",
    "rpf asked people",
    "rpa asked people",
    "rpf massacred",
    "rpa massacred",
    "tutsi killed hutu",
    "tutsi soldiers killed",
    "kagame ordered killings",
    "kagame killed hutus",
    "rpf committed atrocities",
    "rpf war crimes",
    "rpa war crimes",

    # Minimization
    "so-called genocide",
    "alleged genocide",
    "what some call genocide",
    "civil war not genocide",
    "it was just a civil war",
    "tribal conflict",
    "ethnic conflict not genocide",
    "exaggerated death toll",
    "numbers are inflated",
    "not really genocide",
    "mischaracterized as genocide",

    # Revisionism
    "rpf started it",
    "kagame caused the genocide",
    "tutsi provoked",
    "habyarimana assassination justified",
    "self defense killings",
    "spontaneous violence",
    "not planned",
    "no premeditation",
    "revenge killings",
    "retaliatory killings",

    # Denial of scale
    "500000 not 1 million",
    "death toll exaggerated",
    "less than a million",
    "only hundreds of thousands",
]

# Phrases that strongly indicate RPF false atrocity narrative even without exact match
RPF_BLAME_PHRASES = [
    ("rpf", "grenades"),
    ("rpf", "kill"),
    ("rpa", "grenades"),
    ("rpa", "kill"),
    ("rpf", "gather"),
    ("rpa", "gather"),
    ("tutsi", "killed hutu"),
    ("kagame", "massacre"),
    ("kagame", "killed"),
    ("rpf", "schools"),
    ("rpf", "markets"),
    ("rpa", "schools"),
    ("rpa", "markets"),
]

VERIFIED_FACTS = [
    "genocide against the tutsi",
    "1994 genocide",
    "100 days",
    "800000 killed",
    "one million killed",
    "interahamwe",
    "rtlm hate radio",
    "hutu power",
    "gacaca courts",
    "ictr convicted",
    "un recognized genocide",
    "april 7 1994",
    "habyarimana plane",
    "machete killings",
    "roadblocks",
    "id cards tutsi",
    "inyenzi",
    "cockroaches propaganda",
    "radio mille collines",
    "akazu",
    "zero network",
    "final solution rwanda",
    "ibuka testimony",
    "african rights report",
    "human rights watch 1994",
    "des forges",
    "leave none to tell the story",
    "shake hands with the devil",
    "romeo dallaire",
    "unamir",
    "operation turquoise",
    "french involvement",
    "international community failed",
]

# Sources known to spread denial or revisionism
DENIAL_SOURCES = [
    "hutugenocide.org",
    "hutupower",
    "jambonews.net",       # known revisionist/denial platform
    "jambonews.com",
    "jamboasbl",
    "jambo-asbl",
    "rwandinfo.com",
    "umuvugizi.wordpress.com",
    "victoire-ingabire",
    "ingabire",
    "fdlr",
    "rdr-ubwiyunge",
    "rpfcrimes",
    "kagamecrimes",
    "rwandagenocide.org",
]

# Authoritative sources on this topic
AUTHORITATIVE_SOURCES = [
    "ibuka.rw",
    "kgm.rw",
    "genocidearchiverwanda.org",
    "unitednations.org",
    "un.org",
    "hrw.org",
    "ictr.org",
    "unictr.irmct.org",
    "newtimes.co.rw",
    "aljazeera.com",
    "bbc.com",
    "reuters.com",
    "apnews.com",
    "theguardian.com",
    "africaarguments.org",
    "issafrica.org",
    "museumofmemory.rw",
    "kigaligenocidememorial.org",
]


def check_genocide_content(text: str, source_url: str = None) -> dict:
    """
    Specialized checker for content about the Genocide Against the Tutsi.
    Returns score adjustment and flags.
    """
    text_lower = text.lower()
    flags = []
    score_adjustment = 0.0

    # Check if content is about this topic
    topic_keywords = [
        "rwanda", "tutsi", "hutu", "genocide", "1994", "kigali",
        "interahamwe", "rpf", "rpa", "habyarimana", "kagame", "gacaca",
        "ingabire", "mageragere", "jambo", "rwandan", "nsengumukiza"
    ]
    topic_hits = sum(1 for kw in topic_keywords if kw in text_lower)

    # Also check source URL for topic relevance — URL alone can trigger checker
    url_is_denial_source = False
    if source_url:
        source_lower = source_url.lower()
        url_is_denial_source = any(s in source_lower for s in DENIAL_SOURCES)
        if url_is_denial_source:
            topic_hits += 5  # force checker to run
        elif any(kw in source_lower for kw in ["hutu", "tutsi", "rwanda", "genocide", "ingabire"]):
            topic_hits += 3

    if topic_hits < 2:
        return {"is_relevant": False, "score_adjustment": 0, "flags": [], "authoritative": False, "denial_patterns_found": []}

    # --- Check source URL first (strongest signal) ---
    is_authoritative = False
    source_is_denial = False

    if source_url:
        source_lower = source_url.lower()

        if any(s in source_lower for s in DENIAL_SOURCES):
            score_adjustment -= 0.2  # moderate penalty for source reputation only
            flags.append("⚠️ Source has a history of genocide denial/revisionism — verify content independently")
            source_is_denial = True

        elif any(s in source_lower for s in AUTHORITATIVE_SOURCES):
            score_adjustment += 0.25
            flags.append("✅ Source is an authoritative reference on the genocide")
            is_authoritative = True

    # --- Check for exact denial patterns ---
    denial_hits = [p for p in DENIAL_PATTERNS if p in text_lower]

    # --- Check for RPF blame phrase combinations ---
    rpf_blame_hits = []
    for pair in RPF_BLAME_PHRASES:
        if all(word in text_lower for word in pair):
            rpf_blame_hits.append(f"{pair[0]} + {pair[1]}")

    all_denial = denial_hits + rpf_blame_hits

    if all_denial:
        # Scale penalty: 1 pattern = -0.4, 2 = -0.6, 3+ = -0.8
        penalty = min(0.4 + (len(all_denial) - 1) * 0.2, 0.8)
        score_adjustment -= penalty
        flags.append(f"⚠️ Contains {len(all_denial)} genocide denial/revisionism pattern(s): {', '.join(all_denial[:3])}")

    # --- Check for verified factual references ---
    fact_hits = sum(1 for fact in VERIFIED_FACTS if fact in text_lower)
    if fact_hits >= 3:
        score_adjustment += 0.2
        flags.append(f"✅ References {fact_hits} verified historical facts about the genocide")
    elif fact_hits > 0:
        score_adjustment += 0.1
        flags.append(f"✅ References {fact_hits} verified historical fact(s)")

    # If source is denial site AND has denial patterns → force very low score
    if source_is_denial and all_denial:
        score_adjustment = min(score_adjustment, -0.8)
        flags.append("❌ Denial source combined with denial narrative — high misinformation risk")

    return {
        "is_relevant": True,
        "score_adjustment": max(-1.0, min(0.5, score_adjustment)),
        "flags": flags,
        "authoritative": is_authoritative,
        "denial_patterns_found": all_denial
    }

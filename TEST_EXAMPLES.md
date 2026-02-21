# Test Examples for NoCap Fake News Detector

## Trusted Source Examples (Should Score HIGH - 70%+)

### Example 1: BBC News Article
**URL:** `https://www.bbc.com/news/science-environment-67890123`
**Content:**
```
Scientists at the University of Cambridge have published a peer-reviewed study in Nature showing that renewable energy adoption has increased by 23% globally over the past year. The research, conducted over 18 months, analyzed data from 150 countries. Dr. Sarah Johnson, lead researcher, stated that the findings demonstrate significant progress toward climate goals. The study was funded by the European Research Council and underwent rigorous peer review.
```

### Example 2: Reuters Report
**URL:** `https://www.reuters.com/business/finance/markets-2024`
**Content:**
```
According to data released by the Federal Reserve today, inflation rates have stabilized at 2.4% for the third consecutive quarter. The report, based on comprehensive economic indicators, shows steady growth in employment sectors. Economists at Goldman Sachs and JP Morgan have confirmed these findings align with their independent analyses. The data was collected through standard government reporting mechanisms.
```

### Example 3: NPR Science Story
**URL:** `https://www.npr.org/sections/health/2024/medical-breakthrough`
**Content:**
```
A new medical treatment for diabetes has shown promising results in clinical trials, according to research published in The Lancet. The study involved 500 patients across 20 hospitals and was conducted over three years. Dr. Michael Chen from Johns Hopkins University explained that the treatment improved patient outcomes by 35%. The research was funded by the National Institutes of Health and followed FDA-approved protocols.
```

---

## Untrusted Source Examples (Should Score LOW - Below 50%)

### Example 4: Fake News Site
**URL:** `https://www.naturalnews.com/shocking-discovery-2024`
**Content:**
```
SHOCKING!!! You won't BELIEVE what scientists are hiding from you!!! This ONE weird trick will change EVERYTHING you know about health!!! Doctors HATE this!!! Big Pharma doesn't want you to know!!! URGENT - Share this before it gets deleted!!! Click here NOW to discover the TRUTH they don't want you to see!!! This will BLOW YOUR MIND!!!
```

### Example 5: Conspiracy Site
**URL:** `https://www.infowars.com/breaking-conspiracy-exposed`
**Content:**
```
BREAKING: Anonymous sources reveal MASSIVE cover-up!!! The government is LYING to you!!! Wake up sheeple!!! This is TERRIFYING and they want to silence us!!! Share this IMMEDIATELY before they take it down!!! You need to see this RIGHT NOW!!! The mainstream media won't report this SHOCKING truth!!! ALERT ALERT ALERT!!!
```

### Example 6: Clickbait Site
**URL:** `https://www.beforeitsnews.com/miracle-cure-exposed`
**Content:**
```
Doctors are STUNNED by this miracle cure!!! Lose 50 pounds in ONE WEEK with this simple trick!!! Big Pharma is FURIOUS!!! This mom discovered the secret and you won't believe what happened next!!! AMAZING results that will SHOCK you!!! Click NOW before this gets banned!!! Limited time only!!!
```

---

## Neutral/Uncertain Examples (Should Score 50-69%)

### Example 7: Unknown Blog
**URL:** `https://www.techblog2024.com/new-gadget-review`
**Content:**
```
The new smartphone released last week has some interesting features. Users have reported mixed experiences with the battery life. Some people like the camera quality while others prefer the previous model. The price point is competitive with similar devices on the market. Overall, it seems like a decent option for those looking to upgrade.
```

### Example 8: Personal Opinion Piece
**URL:** `https://www.myblogsite.com/thoughts-on-technology`
**Content:**
```
I think technology is changing rapidly these days. Many people have different opinions about social media and its impact on society. Some experts suggest we should be more careful about privacy, while others believe the benefits outweigh the risks. It's an interesting topic that deserves more discussion and consideration from various perspectives.
```

---

## Testing Instructions

1. **Copy the URL** from any example above
2. **Copy the Content** text
3. **Paste both** into the NoCap analyzer
4. **Click "Verify Content"**
5. **Check the results:**
   - Trusted sources (BBC, Reuters, NPR) should score 70%+ (LIKELY REAL)
   - Untrusted sources (naturalnews, infowars) should score below 50% (LIKELY FAKE)
   - Unknown sources should score 50-69% (UNCERTAIN)

## What the AI Detects

### Credibility Indicators (Positive):
- ✅ Mentions of peer-reviewed studies
- ✅ Citations of credible institutions (universities, research centers)
- ✅ References to published research
- ✅ Quotes from named experts with credentials
- ✅ Specific data and statistics
- ✅ Trusted domain names (bbc.com, reuters.com, npr.org)

### Fake News Signals (Negative):
- ❌ Excessive capitalization (ALL CAPS)
- ❌ Multiple exclamation marks (!!!)
- ❌ Sensational words (SHOCKING, BREAKING, URGENT)
- ❌ Emotional manipulation (TERRIFYING, AMAZING)
- ❌ Clickbait phrases ("you won't believe", "doctors hate")
- ❌ Vague sources ("anonymous sources", "they don't want you to know")
- ❌ Untrusted domains (naturalnews.com, infowars.com)

## Domain Reputation Impact

- **Trusted Domain:** +25% boost to credibility score
- **Untrusted Domain:** -30% penalty to credibility score
- **Unknown Domain:** No impact (0%)

---

## Quick Test URLs

**Trusted:**
- `https://www.bbc.com/news`
- `https://www.reuters.com/world`
- `https://www.apnews.com`
- `https://www.npr.org`
- `https://www.nytimes.com`

**Untrusted:**
- `https://www.naturalnews.com`
- `https://www.infowars.com`
- `https://www.beforeitsnews.com`
- `https://www.worldnewsdailyreport.com`

**Unknown:**
- `https://www.randomnewssite.com`
- `https://www.myblog.com`
- `https://www.unknownsource.net`

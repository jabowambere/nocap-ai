const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Domain reputation lists
const TRUSTED_DOMAINS = [
  'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com', 'ap.org',
  'npr.org', 'theguardian.com', 'nytimes.com', 'washingtonpost.com',
  'bloomberg.com', 'ft.com', 'wsj.com', 'economist.com',
  'nature.com', 'science.org', 'scientificamerican.com',
  'cnn.com', 'cbsnews.com', 'nbcnews.com', 'abcnews.go.com',
  'pbs.org', 'propublica.org', 'factcheck.org', 'snopes.com'
];

const UNTRUSTED_DOMAINS = [
  'fakenews.com', 'clickbait.net', 'conspiracy.com',
  'naturalnews.com', 'infowars.com', 'beforeitsnews.com',
  'worldnewsdailyreport.com', 'nationalreport.net'
];

function analyzeDomain(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '').toLowerCase();
    
    // Check if domain is trusted
    if (TRUSTED_DOMAINS.some(trusted => domain.includes(trusted))) {
      return {
        score: 0.25,
        status: 'trusted',
        message: `Source from trusted domain: ${domain}`
      };
    }
    
    // Check if domain is untrusted
    if (UNTRUSTED_DOMAINS.some(untrusted => domain.includes(untrusted))) {
      return {
        score: -0.3,
        status: 'untrusted',
        message: `Source from questionable domain: ${domain}`
      };
    }
    
    // Unknown domain
    return {
      score: 0,
      status: 'unknown',
      message: `Source from unverified domain: ${domain}`
    };
  } catch (error) {
    return {
      score: 0,
      status: 'invalid',
      message: 'Invalid URL format'
    };
  }
}

// Detection route (public)
router.post('/analyze', async (req, res) => {
  const { text, sourceUrl } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Please provide content to analyze' });
  }

  try {
    // Call AI service
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResponse = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!aiResponse.ok) {
      throw new Error('AI service unavailable');
    }

    const aiResult = await aiResponse.json();
    
    // Start with AI score
    let finalScore = aiResult.credibility_score;
    const indicators = [];
    const sources = [];
    let verdict = 'UNCERTAIN';
    let analysis = '';

    // Analyze domain if URL provided
    if (sourceUrl) {
      const domainAnalysis = analyzeDomain(sourceUrl);
      finalScore += domainAnalysis.score;
      sources.push(domainAnalysis.message);
      
      if (domainAnalysis.status === 'trusted') {
        indicators.push('Source from verified trusted domain');
      } else if (domainAnalysis.status === 'untrusted') {
        indicators.push('Warning: Source from known unreliable domain');
      } else if (domainAnalysis.status === 'unknown') {
        indicators.push('Source domain not in verified database');
      }
    }

    // Clamp score between 0 and 1
    finalScore = Math.max(0, Math.min(1, finalScore));
    const scorePercent = Math.round(finalScore * 100);
    
    // Determine verdict based on final score
    if (scorePercent >= 70) {
      verdict = 'LIKELY REAL';
      analysis = 'This content appears credible with factual language and trusted sources.';
    } else if (scorePercent >= 50) {
      verdict = 'UNCERTAIN';
      analysis = 'This content has mixed indicators. Cross-reference with multiple sources.';
    } else {
      verdict = 'LIKELY FAKE';
      analysis = 'This content shows patterns common in misinformation. Be cautious.';
    }

    // Extract indicators from AI signals
    if (aiResult.signals) {
      if (aiResult.signals.all_caps_ratio > 0.1) indicators.push('Contains excessive capitalization');
      if (aiResult.signals.exclamation_count > 3) indicators.push('Contains excessive punctuation');
      if (aiResult.signals.question_count > 3) indicators.push('Contains many questions');
      if (aiResult.signals.url_count > 3) indicators.push('Contains multiple links');
      if (aiResult.signals.sensational_words > 0) indicators.push(`Contains ${aiResult.signals.sensational_words} sensationalist phrases`);
      if (aiResult.signals.credible_words > 0) indicators.push(`Contains ${aiResult.signals.credible_words} credible research terms`);
      if (aiResult.signals.emotional_words > 2) indicators.push('Uses excessive emotional language');
      if (aiResult.signals.has_citations) indicators.push('Contains academic citations');
    }

    res.json({
      credibilityScore: scorePercent,
      verdict,
      analysis,
      indicators,
      sources,
      contentLength: text.length,
      sourceUrl: sourceUrl || null
    });
  } catch (error) {
    console.error('AI Service Error:', error);
    // Fallback to basic analysis if AI service fails
    res.json({
      credibilityScore: 50,
      verdict: 'UNCERTAIN',
      analysis: 'Unable to perform full analysis. Please try again.',
      indicators: ['AI service temporarily unavailable'],
      sources: [],
      contentLength: text.length,
      sourceUrl: sourceUrl || null
    });
  }
});

// Get all analyses for admin (protected)
router.get('/history', protect, async (req, res) => {
  res.json([]);
});

// Get analysis by ID (admin only)
router.get('/history/:id', protect, async (req, res) => {
  res.status(404).json({ error: 'Analysis not found' });
});

// Delete analysis by ID (admin only)
router.delete('/history/:id', protect, async (req, res) => {
  res.status(404).json({ error: 'Analysis not found' });
});

// Get statistics for admin (protected)
router.get('/stats', protect, async (req, res) => {
  res.json({
    total: 0,
    realNews: 0,
    fakeNews: 0,
    uncertain: 0,
    averageScore: 0
  });
});

module.exports = { router };

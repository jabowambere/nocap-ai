const express = require('express');
const { protect } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Domain reputation lists
const TRUSTED_DOMAINS = [
  // Major News Organizations
  'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com', 'ap.org',
  'npr.org', 'theguardian.com', 'nytimes.com', 'washingtonpost.com',
  'bloomberg.com', 'ft.com', 'wsj.com', 'economist.com',
  'cnn.com', 'cbsnews.com', 'nbcnews.com', 'abcnews.go.com',
  'pbs.org', 'usatoday.com', 'time.com', 'newsweek.com',
  // International News
  'aljazeera.com', 'dw.com', 'france24.com', 'thelocal.com',
  // Scientific & Academic
  'nature.com', 'science.org', 'scientificamerican.com',
  'nih.gov', 'cdc.gov', 'who.int', 'nasa.gov',
  // Fact-Checking
  'factcheck.org', 'snopes.com', 'politifact.com', 'fullfact.org',
  // Investigative Journalism
  'propublica.org', 'theintercept.com', 'bellingcat.com',
  // African News
  'igihe.com', 'newtimes.co.rw', 'africanews.com'
];

const UNTRUSTED_DOMAINS = [
  // Known Fake News Sites
  'fakenews.com', 'clickbait.net', 'conspiracy.com',
  'naturalnews.com', 'infowars.com', 'beforeitsnews.com',
  'worldnewsdailyreport.com', 'nationalreport.net',
  'theonion.com', 'clickhole.com', 'empirenews.net',
  'newslo.com', 'huzlers.com', 'react365.com',
  // Conspiracy & Pseudoscience
  'davidicke.com', 'veteranstoday.com', 'yournewswire.com',
  'neonnettle.com', 'collective-evolution.com'
];

function analyzeDomain(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '').toLowerCase();
    
    // Check if domain is trusted
    if (TRUSTED_DOMAINS.some(trusted => domain === trusted || domain.endsWith(`.${trusted}`))) {
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
  const { text, sourceUrl, userId } = req.body;

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

    // Save to database BEFORE sending response
    console.log('Saving to database:', { userId, scorePercent, verdict });
    
    const { data: savedData, error: dbError } = await supabase.from('analyses').insert({
      user_id: userId || 'anonymous',
      text: text.substring(0, 1000),
      source_url: sourceUrl || null,
      credibility_score: scorePercent,
      verdict,
      analysis,
      indicators,
      sources,
      content_length: text.length
    }).select();

    if (dbError) {
      console.error('❌ Database save error:', dbError);
    } else {
      console.log('✅ Saved to database:', savedData);
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

// Get user's analyses (protected)
router.get('/history', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', req.user.clerkId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get all analyses (admin only)
router.get('/all-analyses', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch all analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Delete analysis by ID
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const { data: analysis } = await supabase
      .from('analyses')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check if user owns this or is admin
    if (analysis.user_id !== req.user.clerkId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Analysis deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

// Get statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = supabase.from('analyses').select('verdict, credibility_score');
    
    // Filter by user if not admin
    if (!isAdmin) {
      query.eq('user_id', req.user.clerkId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const stats = {
      total: data.length,
      realNews: data.filter(a => a.verdict === 'LIKELY REAL').length,
      fakeNews: data.filter(a => a.verdict === 'LIKELY FAKE').length,
      uncertain: data.filter(a => a.verdict === 'UNCERTAIN').length,
      averageScore: data.length > 0 
        ? Math.round(data.reduce((sum, a) => sum + a.credibility_score, 0) / data.length)
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = { router };

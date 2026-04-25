const express = require('express');
const { protect } = require('../middleware/auth');
const supabase = require('../config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini client
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized');
  } catch (err) {
    console.error('⚠️ Failed to initialize Gemini client:', err.message);
    genAI = null;
  }
} else {
  console.log('⚠️ GEMINI_API_KEY not set; skipping Gemini client initialization');
}

// Query Google Fact Check Tools API
async function checkFactCheckAPI(text) {
  try {
    const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
    if (!apiKey) return null;

    const query = encodeURIComponent(text.substring(0, 200));
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${query}&key=${apiKey}&pageSize=3`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.claims || data.claims.length === 0) return null;

    const results = data.claims.map(claim => ({
      text: claim.text,
      claimant: claim.claimant || 'Unknown',
      rating: claim.claimReview?.[0]?.textualRating || 'Unknown',
      publisher: claim.claimReview?.[0]?.publisher?.name || 'Unknown',
      url: claim.claimReview?.[0]?.url || null
    }));

    console.log('✅ Fact Check API results:', results.length, 'claims found');
    return results;
  } catch (err) {
    console.error('⚠️ Fact Check API error:', err.message);
    return null;
  }
}

// Domain reputation lists
const TRUSTED_DOMAINS = [
  'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com', 'ap.org',
  'npr.org', 'theguardian.com', 'nytimes.com', 'washingtonpost.com',
  'bloomberg.com', 'ft.com', 'wsj.com', 'economist.com',
  'cnn.com', 'cbsnews.com', 'nbcnews.com', 'abcnews.go.com',
  'pbs.org', 'usatoday.com', 'time.com', 'newsweek.com',
  'aljazeera.com', 'dw.com', 'france24.com', 'thelocal.com',
  'nature.com', 'science.org', 'scientificamerican.com',
  'nih.gov', 'cdc.gov', 'who.int', 'nasa.gov',
  'factcheck.org', 'snopes.com', 'politifact.com', 'fullfact.org',
  'propublica.org', 'theintercept.com', 'bellingcat.com',
  'igihe.com', 'newtimes.co.rw', 'africanews.com'
];

const UNTRUSTED_DOMAINS = [
  'fakenews.com', 'fake.com', 'clickbait.net', 'conspiracy.com',
  'naturalnews.com', 'infowars.com', 'beforeitsnews.com',
  'worldnewsdailyreport.com', 'nationalreport.net',
  'theonion.com', 'clickhole.com', 'empirenews.net',
  'newslo.com', 'huzlers.com', 'react365.com',
  'davidicke.com', 'veteranstoday.com', 'yournewswire.com',
  'neonnettle.com', 'collective-evolution.com'
];

function analyzeDomain(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '').toLowerCase();
    if (TRUSTED_DOMAINS.some(t => domain === t || domain.endsWith(`.${t}`))) {
      return { score: 0.25, status: 'trusted', message: `Source from trusted domain: ${domain}` };
    }
    if (UNTRUSTED_DOMAINS.some(u => domain.includes(u))) {
      return { score: -0.3, status: 'untrusted', message: `Source from questionable domain: ${domain}` };
    }
    return { score: -0.1, status: 'unknown', message: `Source from unverified domain: ${domain}` };
  } catch {
    return { score: 0, status: 'invalid', message: 'Invalid URL format' };
  }
}

// Optional auth middleware
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const { verifyToken } = require('@clerk/backend');
      const verified = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      const { data: user } = await supabase.from('users').select('*').eq('clerk_id', verified.sub).single();
      if (user) req.user = user;
    } catch (error) {
      console.log('Optional auth failed:', error.message);
    }
  }
  next();
};

// Detection route
router.post('/analyze', optionalAuth, async (req, res) => {
  const { text, sourceUrl } = req.body;
  if (!text) return res.status(400).json({ error: 'Please provide content to analyze' });

  const userId = req.user ? req.user.clerk_id : 'anonymous';
  console.log('📝 Analyzing for user:', userId);

  try {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    // Retry AI service up to 2 times (handles Render cold start)
    let aiResponse;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        aiResponse = await fetch(`${AI_SERVICE_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: AbortSignal.timeout(15000)
        });
        if (aiResponse.ok) break;
      } catch (err) {
        console.log(`⚠️ AI service attempt ${attempt} failed:`, err.message);
        if (attempt === 2) throw new Error('AI service unavailable');
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Run fact check in parallel with JSON parsing
    const [aiResult, factCheckResults] = await Promise.all([
      aiResponse.json(),
      checkFactCheckAPI(text)
    ]);

    let finalScore = aiResult.credibility_score;
    const indicators = [];
    const sources = [];
    let verdict = 'UNCERTAIN';
    let analysis = '';

    // 1. Apply fact-check results
    if (factCheckResults && factCheckResults.length > 0) {
      const fakeRatings = ['false', 'fake', 'misleading', 'incorrect', 'pants on fire', 'mostly false', 'inaccurate', 'fabricated'];
      const realRatings = ['true', 'correct', 'accurate', 'mostly true', 'verified', 'confirmed'];
      let factCheckScore = 0;
      factCheckResults.forEach(fc => {
        const rating = fc.rating.toLowerCase();
        if (fakeRatings.some(r => rating.includes(r))) {
          factCheckScore -= 0.3;
          indicators.push(`❌ Fact-checked as "${fc.rating}" by ${fc.publisher}`);
        } else if (realRatings.some(r => rating.includes(r))) {
          factCheckScore += 0.2;
          indicators.push(`✅ Fact-checked as "${fc.rating}" by ${fc.publisher}`);
        } else {
          indicators.push(`🔍 Fact-check found: "${fc.rating}" by ${fc.publisher}`);
        }
        if (fc.url) sources.push(`Fact-check: ${fc.publisher} - ${fc.url}`);
      });
      finalScore = Math.max(0, Math.min(1, finalScore + factCheckScore));
    }

    // 2. Apply domain analysis
    if (sourceUrl) {
      const domainAnalysis = analyzeDomain(sourceUrl);
      if (domainAnalysis.status === 'trusted' && finalScore >= 0.4) {
        finalScore += domainAnalysis.score;
        indicators.push('Source from verified trusted domain');
      } else if (domainAnalysis.status === 'untrusted') {
        finalScore += domainAnalysis.score;
        indicators.push('⚠️ Warning: Source from known unreliable domain');
      } else if (domainAnalysis.status === 'unknown') {
        finalScore += domainAnalysis.score;
        indicators.push('⚠️ Source domain not in verified database — treat with caution');
      }
      sources.push(domainAnalysis.message);
    }

    // 3. Apply heuristic signals from AI service
    if (aiResult.signals) {
      if (aiResult.signals.all_caps_ratio > 0.1) indicators.push('Contains excessive capitalization');
      if (aiResult.signals.exclamation_count > 3) indicators.push('Contains excessive punctuation');
      if (aiResult.signals.question_count > 3) indicators.push('Contains many questions');
      if (aiResult.signals.url_count > 3) indicators.push('Contains multiple links');
      if (aiResult.signals.sensational_words > 0) indicators.push(`Contains ${aiResult.signals.sensational_words} sensationalist phrases`);
      if (aiResult.signals.credible_words > 0) indicators.push(`Contains ${aiResult.signals.credible_words} credible research terms`);
      if (aiResult.signals.emotional_words > 2) indicators.push('Uses excessive emotional language');
      if (aiResult.signals.has_citations) indicators.push('Contains academic citations');
      if (aiResult.signals.neutral_tone) indicators.push('Uses neutral, informational tone');
      if (aiResult.signals.trusted_domain_count > 0) indicators.push(`References ${aiResult.signals.trusted_domain_count} trusted domain(s)`);
    }

    finalScore = Math.max(0, Math.min(1, finalScore));
    const scorePercent = Math.round(finalScore * 100);

    // 4. Gemini deep analysis with all context
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const domainContext = sourceUrl ? (() => {
          try {
            const domain = new URL(sourceUrl).hostname.replace('www.', '').toLowerCase();
            const isTrusted = TRUSTED_DOMAINS.some(t => domain === t || domain.endsWith(`.${t}`));
            const isUntrusted = UNTRUSTED_DOMAINS.some(u => domain.includes(u));
            if (!isTrusted && !isUntrusted) return `\nSource domain: ${domain} — NOT in verified database. Assess this domain's credibility.`;
            return `\nSource domain: ${domain} — ${isTrusted ? 'verified trusted domain' : 'known unreliable domain'}.`;
          } catch { return ''; }
        })() : '';

        const factCheckContext = factCheckResults && factCheckResults.length > 0
          ? `\n\nFact-check results from verified publishers:\n${factCheckResults.map(fc => `- ${fc.publisher} rated "${fc.text}" as: ${fc.rating}`).join('\n')}`
          : '\n\nNo existing fact-check records found for this content.';

        const prompt = `You are an expert fact-checker. Analyze this news content for credibility.

Content: ${text}${sourceUrl ? `\nSource URL: ${sourceUrl}` : ''}${domainContext}${factCheckContext}
Initial heuristic score: ${scorePercent}%

Return ONLY a JSON object:
{"verdict": "LIKELY REAL" or "LIKELY FAKE", "confidence": 0-100, "reasoning": "brief explanation", "domain_assessment": "assessment of source domain credibility or null"}

Be decisive. Weight fact-check results heavily. Use extreme scores (0-20 or 80-100) when evidence is clear.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log('✅ Gemini response:', response);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const aiAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : response);

        verdict = aiAnalysis.verdict;
        const geminiScore = aiAnalysis.confidence / 100;
        // Blend: 50% Gemini + 30% heuristic + 20% domain/factcheck adjusted
        finalScore = (geminiScore * 0.5) + (aiResult.credibility_score * 0.3) + (finalScore * 0.2);
        finalScore = Math.max(0, Math.min(1, finalScore));
        analysis = aiAnalysis.reasoning;

        if (aiAnalysis.domain_assessment) {
          indicators.push(`🔍 Domain assessment: ${aiAnalysis.domain_assessment}`);
          sources.push(`Gemini domain assessment: ${aiAnalysis.domain_assessment}`);
        }
        indicators.push('✨ Enhanced with Google Gemini AI deep analysis');
        console.log('📊 Final verdict:', verdict, 'Score:', Math.round(finalScore * 100) + '%');

      } catch (geminiError) {
        console.error('❌ Gemini analysis failed:', geminiError.message);
        verdict = scorePercent >= 70 ? 'LIKELY REAL' : scorePercent >= 50 ? 'UNCERTAIN' : 'LIKELY FAKE';
        analysis = scorePercent >= 70
          ? 'This content appears credible with factual language and trusted sources.'
          : scorePercent >= 50
          ? 'This content has mixed indicators. Cross-reference with multiple sources.'
          : 'This content shows patterns common in misinformation. Be cautious.';
      }
    } else {
      verdict = scorePercent >= 70 ? 'LIKELY REAL' : scorePercent >= 50 ? 'UNCERTAIN' : 'LIKELY FAKE';
      analysis = scorePercent >= 70
        ? 'This content appears credible with factual language and trusted sources.'
        : scorePercent >= 50
        ? 'This content has mixed indicators. Cross-reference with multiple sources.'
        : 'This content shows patterns common in misinformation. Be cautious.';
    }

    const finalScorePercent = Math.round(finalScore * 100);

    const { data: savedData, error: dbError } = await supabase.from('analyses').insert({
      user_id: userId || 'anonymous',
      text: text.substring(0, 1000),
      source_url: sourceUrl || null,
      credibility_score: finalScorePercent,
      verdict,
      analysis,
      indicators,
      sources,
      content_length: text.length
    }).select();

    if (dbError) console.error('❌ Database save error:', dbError);
    else console.log('✅ Saved to database:', savedData);

    res.json({ credibilityScore: finalScorePercent, verdict, analysis, indicators, sources, contentLength: text.length, sourceUrl: sourceUrl || null });

  } catch (error) {
    console.error('AI Service Error:', error);
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
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (analysesError) throw analysesError;

    const userIds = [...new Set(analyses.map(a => a.user_id).filter(id => id !== 'anonymous'))];
    const { data: users, error: usersError } = await supabase.from('users').select('clerk_id, email').in('clerk_id', userIds);
    if (usersError) console.error('Error fetching users:', usersError);

    const userMap = {};
    if (users) users.forEach(u => { userMap[u.clerk_id] = u.email; });

    res.json(analyses.map(a => ({ ...a, username: a.user_id === 'anonymous' ? 'Anonymous' : (userMap[a.user_id] || 'Unknown User') })));
  } catch (error) {
    console.error('Fetch all analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Delete analysis by ID
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const { data: analysis } = await supabase.from('analyses').select('user_id').eq('id', req.params.id).single();
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    if (analysis.user_id !== req.user.clerkId && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    const { error } = await supabase.from('analyses').delete().eq('id', req.params.id);
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
    if (!isAdmin) query.eq('user_id', req.user.clerkId);
    const { data, error } = await query;
    if (error) throw error;
    res.json({
      total: data.length,
      realNews: data.filter(a => a.verdict === 'LIKELY REAL').length,
      fakeNews: data.filter(a => a.verdict === 'LIKELY FAKE').length,
      uncertain: data.filter(a => a.verdict === 'UNCERTAIN').length,
      averageScore: data.length > 0 ? Math.round(data.reduce((sum, a) => sum + a.credibility_score, 0) / data.length) : 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get analyses by user ID (admin only)
router.get('/user/:userId', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const { data, error } = await supabase.from('analyses').select('*').eq('user_id', req.params.userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch user analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch user analyses' });
  }
});

module.exports = { router };

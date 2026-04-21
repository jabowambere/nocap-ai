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

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const { verifyToken } = require('@clerk/backend');
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY
      });
      
      // Get user from database
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', verified.sub)
        .single();
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.log('Optional auth failed:', error.message);
    }
  }
  next();
};

// Detection route (public with optional auth)
router.post('/analyze', optionalAuth, async (req, res) => {
  const { text, sourceUrl } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Please provide content to analyze' });
  }

  // Get userId from authenticated user or use 'anonymous'
  const userId = req.user ? req.user.clerk_id : 'anonymous';
  
  console.log('📝 Analyzing for user:', userId);

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
      
      // Only apply domain boost if content score is reasonable
      // Don't let domain alone determine verdict
      if (domainAnalysis.status === 'trusted' && finalScore >= 0.4) {
        finalScore += domainAnalysis.score;
      } else if (domainAnalysis.status === 'untrusted') {
        finalScore += domainAnalysis.score;
      }
      
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

    // Extract indicators from AI service signals FIRST (always)
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
    
    // ALWAYS use Gemini for deeper analysis
    console.log('🤖 Calling Gemini AI for comprehensive analysis...');
    
    if (genAI) {
      try {
        console.log('🔑 Gemini client ready, analyzing content...');
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an expert fact-checker. Analyze this news content for credibility.

Content: ${text}${sourceUrl ? `\nSource URL: ${sourceUrl}` : ''}\nInitial AI score: ${scorePercent}%

Return ONLY a JSON object with:
{"verdict": "LIKELY REAL" or "LIKELY FAKE", "confidence": 0-100 (use full range: 0 for completely false, 100 for completely true), "reasoning": "brief explanation"}

Be decisive - use extreme scores (0-20 or 80-100) when evidence is clear.`;
        
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        console.log('✅ Gemini response:', response);
        
        // Extract JSON from response (Gemini sometimes adds markdown)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const aiAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : response);
        
        verdict = aiAnalysis.verdict;
        // Blend: 50% Gemini + 30% heuristic AI service + 20% domain
        const geminiScore = aiAnalysis.confidence / 100;
        const domainBoost = sources.length > 0 ? (finalScore - aiResult.credibility_score) : 0;
        finalScore = (geminiScore * 0.5) + (aiResult.credibility_score * 0.3) + (Math.max(0, Math.min(1, aiResult.credibility_score + domainBoost)) * 0.2);
        finalScore = Math.max(0, Math.min(1, finalScore));
        analysis = aiAnalysis.reasoning;
        indicators.push('✨ Enhanced with Google Gemini AI deep analysis');
        
        console.log('📊 Final Gemini verdict:', verdict, 'Score:', aiAnalysis.confidence + '%');
      } catch (geminiError) {
        console.error('❌ Gemini analysis failed:', geminiError.message);
        // Fall back to basic scoring
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
      }
    } else {
      console.log('⚠️ Gemini not available, using basic scoring');
      // Basic verdict without Gemini
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
    }
    
    // Recalculate final score percent after Gemini
    const finalScorePercent = Math.round(finalScore * 100);

    // Save to database BEFORE sending response
    console.log('Saving to database:', { userId, score: finalScorePercent, verdict });
    
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

    if (dbError) {
      console.error('❌ Database save error:', dbError);
    } else {
      console.log('✅ Saved to database:', savedData);
    }

    res.json({
      credibilityScore: finalScorePercent,
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
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (analysesError) throw analysesError;

    // Get all unique user IDs
    const userIds = [...new Set(analyses.map(a => a.user_id).filter(id => id !== 'anonymous'))];
    
    // Fetch user data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('clerk_id, email')
      .in('clerk_id', userIds);

    if (usersError) console.error('Error fetching users:', usersError);

    // Create a map of user_id to email
    const userMap = {};
    if (users) {
      users.forEach(u => {
        userMap[u.clerk_id] = u.email;
      });
    }

    // Add username to each analysis
    const analysesWithUsers = analyses.map(a => ({
      ...a,
      username: a.user_id === 'anonymous' ? 'Anonymous' : (userMap[a.user_id] || 'Unknown User')
    }));

    res.json(analysesWithUsers);
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

// Get analyses by user ID (admin only)
router.get('/user/:userId', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch user analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch user analyses' });
  }
});

module.exports = { router };

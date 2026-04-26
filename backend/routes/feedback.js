const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Get all approved feedbacks (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('id, name, comment, rating, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch feedbacks error:', error);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// Submit feedback (public)
router.post('/', async (req, res) => {
  const { comment, rating, name, user_id } = req.body;
  if (!comment?.trim()) return res.status(400).json({ error: 'Comment is required' });
  if (rating && (rating < 1 || rating > 5)) return res.status(400).json({ error: 'Rating must be 1-5' });

  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        comment: comment.trim(),
        rating: rating || null,
        name: name || 'Anonymous',
        user_id: user_id || null,
        approved: true  // auto-approve; set to false if you want manual moderation
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ message: 'Feedback submitted', feedback: data });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get all feedbacks (admin)
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// Delete feedback (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('feedbacks').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

module.exports = router;

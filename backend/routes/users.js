const express = require('express');
const { protect } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;

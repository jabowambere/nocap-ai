const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Manual sync route - call this after login to sync user
router.post('/sync-user', async (req, res) => {
  try {
    const { clerkId, email, username, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (existingUser) {
      return res.json({ message: 'User already exists', user: existingUser });
    }

    // Check if this is the first user (make them admin)
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const role = count === 0 ? 'admin' : 'user';

    // Insert new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        clerk_id: clerkId,
        email: email,
        username: username || `${firstName} ${lastName}`.trim() || email.split('@')[0],
        role: role
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    res.json({ message: 'User synced successfully', user: newUser, role });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

module.exports = router;
const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Webhook to sync Clerk users with Supabase
router.post('/clerk-webhook', async (req, res) => {
  const { type, data } = req.body;

  try {
    if (type === 'user.created') {
      const { id, email_addresses, username, first_name, last_name } = data;
      
      // Determine if this is the first user (make them admin)
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      const role = count === 0 ? 'admin' : 'user';
      
      // Insert user into Supabase
      const { error } = await supabase
        .from('users')
        .insert({
          clerk_id: id,
          email: email_addresses[0]?.email_address,
          username: username || `${first_name} ${last_name}`.trim(),
          role: role
        });

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      // Update Clerk user metadata with role
      // This would typically be done via Clerk's backend API
      console.log(`User ${id} created with role: ${role}`);
    }

    if (type === 'user.updated') {
      const { id, email_addresses, username } = data;
      
      const { error } = await supabase
        .from('users')
        .update({
          email: email_addresses[0]?.email_address,
          username: username
        })
        .eq('clerk_id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
      }
    }

    if (type === 'user.deleted') {
      const { id } = data;
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;